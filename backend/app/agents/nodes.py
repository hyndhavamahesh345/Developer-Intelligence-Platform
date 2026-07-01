import json
import logging
import time
from typing import Dict, Any, List
from app.agents.state import AgentState
from app.agents.tools import vector_search_tool, contact_info_tool, resume_download_tool
from app.services.llm import get_llm_client

logger = logging.getLogger(__name__)

# System instructions for specialized roles
AGENT_PROMPTS = {
    "projects_agent": (
        "You are the Projects Agent. Answer the user's query about software projects, features, or roadmap. "
        "Base your answer strictly on the retrieved database context. If details are not in the context, do not make them up."
    ),
    "resume_agent": (
        "You are the Resume Agent. Answer the user's query about education, GPA, courses, and certifications. "
        "Base your answer strictly on the retrieved database context."
    ),
    "experience_agent": (
        "You are the Experience Agent. Answer the user's query about previous internships, responsibilities, and dates. "
        "Base your answer strictly on the retrieved database context."
    ),
    "skills_agent": (
        "You are the Skills Agent. Answer the user's query about programming languages, frameworks, and proficiencies. "
        "Base your answer strictly on the retrieved database context."
    ),
    "architecture_agent": (
        "You are the Architecture Agent. Answer the user's query about the technical systems design, database schemas, "
        "Docker configuration, and the Multi-Agent RAG pipeline of this platform. Base your answer strictly on the context."
    ),
    "recruiter_agent": (
        "You are the Recruiter Agent. Answer candidate queries as a strategic, professional hiring manager recruiter. "
        "Emphasize technical depth, commercial readiness, and culture fit based strictly on the retrieved context."
    ),
    "blog_agent": (
        "You are the Blog Agent. Retrieve and summarize relevant technical articles from the knowledge base based strictly on the context."
    ),
    "contact_agent": (
        "You are the Contact Agent. Provide contact info, GitHub, LinkedIn links, or resume downloads. "
        "Use retrieved context or tools details. Emphasize how to reach out."
    )
}

async def planner_node(state: AgentState) -> Dict[str, Any]:
    """Node that evaluates user query intent and lists specialized agents to coordinate."""
    logger.info("Entering Planner Node...")
    llm_client = get_llm_client()
    
    last_message = state["messages"][-1]["content"] if state["messages"] else ""
    
    system_prompt = (
        "You are the System Planner for the Developer Intelligence Platform. "
        "Your task is to analyze the user's query and decide which specialized agent(s) need to participate "
        "to formulate a complete response.\n\n"
        "Available Agents:\n"
        "- `projects_agent`: Deals with projects, features, architecture details, and project roadmap.\n"
        "- `resume_agent`: Deals with education, certifications, and high-level resume details.\n"
        "- `experience_agent`: Deals with corporate internships, timelines, and past roles.\n"
        "- `skills_agent`: Deals with programming languages, frameworks, and technical toolsets.\n"
        "- `architecture_agent`: Deals with how this portfolio application is built (FastAPI, React, LangGraph, ChromaDB).\n"
        "- `recruiter_agent`: Deals with hiring questions (salary suitability, culture fit, availability).\n"
        "- `blog_agent`: Deals with technical blog posts or articles.\n"
        "- `contact_agent`: Deals with contact info, links (GitHub, LinkedIn), and scheduling.\n\n"
        "Return ONLY a JSON object containing the list of target agents, like: "
        "{\"agents\": [\"projects_agent\", \"skills_agent\"]}. "
        "If it is a general chat greeting (like 'hi', 'who are you'), return an empty list: {\"agents\": []}."
    )
    
    try:
        response_text = await llm_client.generate(system_prompt, f"User Query: {last_message}", json_mode=True)
        data = json.loads(response_text)
        plan = data.get("agents", [])
    except Exception as e:
        logger.error(f"Planner generation failed: {e}. Defaulting to generic routing.")
        plan = ["projects_agent"]  # Fallback
        
    logger.info(f"Generated resolution plan: {plan}")
    
    # Track node transitions in metrics
    metrics = state.get("metrics", {})
    metrics["node_sequence"] = metrics.get("node_sequence", []) + ["Planner"]
    
    return {
        "plan": plan,
        "current_step": 0,
        "agent_responses": {},
        "retrieved_context": [],
        "metrics": metrics
    }

async def specialized_agent_node(state: AgentState, agent_name: str) -> Dict[str, Any]:
    """Generic node function executing specialized agent vector retrieval and draft synthesis."""
    logger.info(f"Entering Specialized Agent Node: {agent_name}")
    llm_client = get_llm_client()
    
    last_message = state["messages"][-1]["content"] if state["messages"] else ""
    
    # Step 1: Map agent name to ChromaDB search filter categories
    category_map = {
        "projects_agent": "projects",
        "resume_agent": "resume",
        "experience_agent": "experience",
        "skills_agent": "skills",
        "architecture_agent": "projects", # Architecture details are under projects
        "recruiter_agent": "resume",
        "blog_agent": "blogs",
        "contact_agent": "resume"
    }
    
    category = category_map.get(agent_name)
    
    # Step 2: Query vector store
    retrieved_docs = vector_search_tool(query=last_message, category=category)
    context_str = "\n\n".join([f"--- Source: {doc['metadata'].get('title', 'Unknown')} ---\n{doc['document']}" for doc in retrieved_docs])
    
    # Step 3: Inject custom tool information if running contact agent
    if agent_name == "contact_agent":
        contact_details = contact_info_tool()
        resume_link = resume_download_tool()
        context_str += f"\n\n--- Contact Details Tool ---\n{json.dumps(contact_details)}\nResume download link: {resume_link}"
        
    # Step 4: Run inference for draft answer
    system_prompt = AGENT_PROMPTS.get(agent_name, "You are a helpful assistant.")
    user_prompt = f"Context from Knowledge Base:\n{context_str}\n\nUser Query: {last_message}\n\nDraft a factual response answering this query based ONLY on the context above."
    
    try:
        draft = await llm_client.generate(system_prompt, user_prompt)
    except Exception as e:
        logger.error(f"Agent {agent_name} inference failed: {e}")
        draft = f"Failed to retrieve details from the {agent_name} database store."
        
    # Append to existing graph state variables
    agent_responses = state.get("agent_responses", {})
    agent_responses[agent_name] = draft
    
    retrieved_context = state.get("retrieved_context", [])
    retrieved_context.extend(retrieved_docs)
    
    metrics = state.get("metrics", {})
    metrics["node_sequence"] = metrics.get("node_sequence", []) + [agent_name]
    
    return {
        "agent_responses": agent_responses,
        "retrieved_context": retrieved_context,
        "current_step": state.get("current_step", 0) + 1,
        "metrics": metrics
    }

async def response_aggregator_node(state: AgentState) -> Dict[str, Any]:
    """Node that aggregates intermediate drafts and formats the final verified response."""
    logger.info("Entering Response Aggregator Node...")
    llm_client = get_llm_client()
    
    last_message = state["messages"][-1]["content"] if state["messages"] else ""
    agent_responses = state.get("agent_responses", {})
    retrieved_context = state.get("retrieved_context", [])
    
    # If no specialized agent ran (e.g. general chit-chat), compile answer directly from context
    if not agent_responses:
        logger.info("No intermediate agent drafts found. Resolving general conversational query.")
        system_prompt = (
            "You are the Conversational Host for the Developer Intelligence Platform (AI Portfolio OS). "
            "Greet the user, explain your capabilities as an agent orchestrator, or answer friendly questions. "
            "Maintain a highly technical, professional developer persona."
        )
        try:
            final_ans = await llm_client.generate(system_prompt, f"User Query: {last_message}")
        except Exception as e:
            final_ans = "System ready. Ask me any question about N Hyndhava Mahesh's engineering background."
            
        metrics = state.get("metrics", {})
        metrics["node_sequence"] = metrics.get("node_sequence", []) + ["Aggregator"]
        
        return {
            "response": final_ans,
            "metrics": metrics
        }
        
    # Compile drafts
    drafts_summary = "\n\n".join([f"=== Draft from {agent} ===\n{draft}" for agent, draft in agent_responses.items()])
    
    system_prompt = (
        "You are the Response Aggregator for the Developer Intelligence Platform. "
        "Your task is to merge several intermediate agent drafts into a single, cohesive, premium markdown response. "
        "Ensure transitions are fluid, professional, and directly address the user query.\n\n"
        "Anti-Hallucination Guardrail:\n"
        "Double-check that all facts stated in the response correspond to the source documents. "
        "If draft statements contain contradictions, prioritize the most factual source."
    )
    
    user_prompt = f"User Query: {last_message}\n\nDraft Responses:\n{drafts_summary}\n\nAggregate into a cohesive markdown response."
    
    try:
        final_ans = await llm_client.generate(system_prompt, user_prompt)
    except Exception as e:
        logger.error(f"Aggregator synthesis failed: {e}")
        final_ans = "\n\n".join(agent_responses.values())
        
    # Format references
    sources = set()
    for doc in retrieved_context:
        src = doc.get("metadata", {}).get("title")
        if src:
            sources.add(src)
            
    if sources:
        final_ans += "\n\n---\n*Sources consulted: " + ", ".join(sources) + "*"
        
    metrics = state.get("metrics", {})
    metrics["node_sequence"] = metrics.get("node_sequence", []) + ["Aggregator"]
    
    return {
        "response": final_ans,
        "metrics": metrics
    }
