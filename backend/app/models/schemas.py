from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ChatRequest(BaseModel):
    message: str = Field(..., description="The query string submitted by the visitor.")
    session_id: Optional[str] = Field(None, description="The UUID session identifier for state retention.")

class ChatResponse(BaseModel):
    response: str = Field(..., description="The final compiled markdown response.")
    session_id: str = Field(..., description="The session identifier linked to this query.")
    routing_path: List[str] = Field(default_factory=list, description="The graph node sequence executed.")
    latency_ms: int = Field(..., description="Total pipeline latency in milliseconds.")

class FeedbackRequest(BaseModel):
    message_id: int = Field(..., description="The database primary key of the target message.")
    rating: int = Field(..., description="1 for thumbs-up, -1 for thumbs-down.")
    comment: Optional[str] = Field(None, description="Optional textual developer feedback.")

class SystemMetricsResponse(BaseModel):
    cpu_utilization: str
    vram_allocation: str
    active_llm: str
    active_vector_store: str
    active_broker: str
