import os
import time
import uuid
import json
import logging
from typing import Dict, Any, List
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db.session import init_db, get_db
from app.db.models import SessionModel, MessageModel, FeedbackModel
from app.models.schemas import ChatRequest, ChatResponse, FeedbackRequest, SystemMetricsResponse
from app.agents.graph import agent_graph
from app.agents.tools import system_metrics_tool
from app.services.vision import VisionService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Developer Intelligence Platform API",
    description="Orchestrator backend handling multi-agent workflows, vector search, and observability telemetry.",
    version="1.0"
)

# Enable CORS for frontend Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to portfolio domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Initialize DB tables
    init_db()

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """Submits user queries to the LangGraph orchestration engine with database memory retrieval."""
    session_id = request.session_id
    
    # 1. Resolve or create visitor session
    if not session_id:
        session_id = str(uuid.uuid4())
        session = SessionModel(id=session_id)
        db.add(session)
        db.commit()
    else:
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            session = SessionModel(id=session_id)
            db.add(session)
            db.commit()
            
    # 2. Retrieve history for stateful memory
    db_history = db.query(MessageModel).filter(MessageModel.session_id == session_id).order_by(MessageModel.created_at.asc()).all()
    history = [{"role": msg.sender, "content": msg.content} for msg in db_history]
    
    # Append the new user message
    history.append({"role": "user", "content": request.message})
    
    # 3. Log user query
    user_msg_record = MessageModel(
        session_id=session_id,
        sender="visitor",
        content=request.message,
        routed_to="Router"
    )
    db.add(user_msg_record)
    db.commit()
    db.refresh(user_msg_record)
    
    # 4. Invoke LangGraph Orchestrator
    start_time = time.time()
    
    initial_state = {
        "messages": history,
        "session_id": session_id,
        "plan": [],
        "current_step": 0,
        "retrieved_context": [],
        "agent_responses": {},
        "response": "",
        "metrics": {"start_time": start_time}
    }
    
    try:
        final_state = await agent_graph.ainvoke(initial_state)
    except Exception as e:
        logger.error(f"LangGraph execution failed: {e}")
        raise HTTPException(status_code=500, detail=f"Agent workflow compilation failed: {e}")
        
    latency_ms = int((time.time() - start_time) * 1000)
    
    # 5. Save agent final response and telemetry metrics
    routing_path = final_state["metrics"].get("node_sequence", [])
    last_node = routing_path[-2] if len(routing_path) > 1 else "Aggregator"
    
    agent_msg_record = MessageModel(
        session_id=session_id,
        sender="agent",
        content=final_state["response"],
        routed_to=last_node,
        latency_ms=latency_ms
    )
    db.add(agent_msg_record)
    db.commit()
    
    return ChatResponse(
        response=final_state["response"],
        session_id=session_id,
        routing_path=routing_path,
        latency_ms=latency_ms
    )

@app.post("/feedback")
def feedback_endpoint(request: FeedbackRequest, db: Session = Depends(get_db)):
    """Logs upvotes, downvotes, and textual comments for observability telemetry."""
    # Verify target message exists
    msg = db.query(MessageModel).filter(MessageModel.id == request.message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Target message identifier not found in registry.")
        
    feedback = FeedbackModel(
        message_id=request.message_id,
        rating=request.rating,
        comment=request.comment
    )
    db.add(feedback)
    db.commit()
    
    return {"status": "success", "message": "Feedback recorded."}

@app.get("/metrics", response_model=SystemMetricsResponse)
def metrics_endpoint():
    """Exposes real-time system performance and GPU metrics."""
    return system_metrics_tool()

@app.get("/projects")
def projects_list_endpoint():
    """Exposes details of system projects dynamically parsed from knowledge JSON templates."""
    import glob
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    projects_pattern = os.path.join(base_dir, 'knowledge-base', 'projects', '*', 'overview.json')
    
    projects = []
    for file_path in glob.glob(projects_pattern):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                projects.append({
                    "id": data.get("project_id"),
                    "title": data.get("title"),
                    "summary": data.get("summary"),
                    "tech_stack": data.get("tech_stack", [])
                })
        except Exception:
            continue
            
    return projects

@app.websocket("/chat/stream")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket connection allowing streaming of intermediate graph execution steps."""
    await websocket.accept()
    logger.info("WebSocket chat connection established.")
    
    session_id = None
    
    try:
        while True:
            # Receive text payload from user
            data_raw = await websocket.receive_text()
            data = json.loads(data_raw)
            message = data.get("message", "")
            session_id = data.get("session_id")
            
            if not message:
                continue
                
            if not session_id:
                session_id = str(uuid.uuid4())
                
            # Log visitor message
            user_msg = MessageModel(session_id=session_id, sender="visitor", content=message, routed_to="Router")
            db.add(user_msg)
            db.commit()
            
            # Send initial session confirmation
            await websocket.send_json({"type": "session", "session_id": session_id})
            
            # Run Graph execution, printing state transitions
            start_time = time.time()
            
            # Retrieve memory
            db_history = db.query(MessageModel).filter(MessageModel.session_id == session_id).order_by(MessageModel.created_at.asc()).all()
            history = [{"role": m.sender, "content": m.content} for m in db_history]
            
            initial_state = {
                "messages": history,
                "session_id": session_id,
                "plan": [],
                "current_step": 0,
                "retrieved_context": [],
                "agent_responses": {},
                "response": "",
                "metrics": {"start_time": start_time}
            }
            
            # Stream nodes steps as they run
            # In LangGraph, .astream yields chunk events representing which node just executed!
            async for event in agent_graph.astream(initial_state):
                for node_name, state_update in event.items():
                    # Notify frontend which agent node has completed processing
                    await websocket.send_json({
                        "type": "node_complete", 
                        "node": node_name,
                        "plan": state_update.get("plan", [])
                    })
            
            # Final output aggregation
            final_state = await agent_graph.ainvoke(initial_state)
            latency_ms = int((time.time() - start_time) * 1000)
            
            # Log final response
            agent_msg = MessageModel(
                session_id=session_id, 
                sender="agent", 
                content=final_state["response"], 
                routed_to="Aggregator", 
                latency_ms=latency_ms
            )
            db.add(agent_msg)
            db.commit()
            
            # Return final payload
            await websocket.send_json({
                "type": "response",
                "content": final_state["response"],
                "latency_ms": latency_ms,
                "node_sequence": final_state["metrics"].get("node_sequence", [])
            })
            
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected.")
    except Exception as e:
        logger.error(f"WebSocket execution error: {e}")
        try:
            await websocket.send_json({"type": "error", "message": f"Connection error: {e}"})
        except:
            pass

@app.post("/playground/analyze-resume")
async def analyze_resume_endpoint(file: UploadFile = File(...)):
    """Parses and computes matching keywords for uploaded resume documents."""
    logger.info(f"Analyzing resume file: {file.filename}")
    try:
        content = await file.read()
        text = content.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file contents: {e}")
        
    text_lower = text.lower()
    score = 65
    matched_skills = []
    missing_skills = ["LangGraph", "ChromaDB", "FastAPI"]
    
    for skill in ["python", "react", "typescript", "docker", "redis", "postgresql"]:
        if skill in text_lower:
            score += 5
            matched_skills.append(skill)
            if skill in missing_skills:
                missing_skills.remove(skill)
                
    score = min(score, 100)
    
    return {
        "score": score,
        "match_rate": f"{int((len(matched_skills)/(len(matched_skills)+len(missing_skills)))*100) if (matched_skills or missing_skills) else 100}% Core Skills Matched",
        "missing_keywords": missing_skills,
        "suggestions": [
            "Detail local TensorRT model compile speeds.",
            "Quantify edge server costs saved during previous internships."
        ]
    }

@app.post("/playground/vision-detect")
async def vision_detect_endpoint(file: UploadFile = File(...), task: str = Form("all")):
    """Executes computer vision object detection and captioning over uploaded images."""
    logger.info(f"Vision detection triggered on file: {file.filename} with task: {task}")
    
    temp_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
    try:
        with open(temp_path, "wb") as f:
            f.write(await file.read())
            
        vision_service = VisionService()
        result = vision_service.detect_objects(temp_path, task)
    except Exception as e:
        logger.error(f"Vision processing endpoint failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {e}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    return result

