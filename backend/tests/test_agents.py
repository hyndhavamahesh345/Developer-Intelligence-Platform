import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.agents.state import AgentState
from app.agents.nodes import planner_node, specialized_agent_node, response_aggregator_node
from app.agents.graph import route_intent

# Mock LLM Client wrapper for testing routing nodes
class MockLLMClient:
    def __init__(self, mock_response: str):
        self.mock_response = mock_response
        
    async def generate(self, system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
        return self.mock_response

@pytest.mark.asyncio
@patch('app.agents.nodes.get_llm_client')
async def test_planner_node(mock_get_client):
    # Setup mock LLM return value for planning (JSON format)
    mock_client = MockLLMClient('{"agents": ["projects_agent", "skills_agent"]}')
    mock_get_client.return_value = mock_client
    
    state: AgentState = {
        "messages": [{"role": "user", "content": "Explain the skills utilized in building VisionVault."}],
        "session_id": "session-123",
        "plan": [],
        "current_step": 0,
        "retrieved_context": [],
        "agent_responses": {},
        "response": "",
        "metrics": {}
    }
    
    result = await planner_node(state)
    
    assert "projects_agent" in result["plan"]
    assert "skills_agent" in result["plan"]
    assert result["current_step"] == 0
    assert "Planner" in result["metrics"]["node_sequence"]

@pytest.mark.asyncio
@patch('app.agents.nodes.get_llm_client')
@patch('app.agents.nodes.vector_search_tool')
async def test_specialized_agent_node(mock_search_tool, mock_get_client):
    # Setup mock vector results and LLM outputs
    mock_search_tool.return_value = [{"document": "VisionVault uses Florence-2.", "metadata": {"title": "VisionVault"}, "score": 0.9}]
    mock_client = MockLLMClient("VisionVault uses the Florence-2 model for dense captions.")
    mock_get_client.return_value = mock_client
    
    state: AgentState = {
        "messages": [{"role": "user", "content": "What is VisionVault?"}],
        "session_id": "session-123",
        "plan": ["projects_agent"],
        "current_step": 0,
        "retrieved_context": [],
        "agent_responses": {},
        "response": "",
        "metrics": {}
    }
    
    result = await specialized_agent_node(state, "projects_agent")
    
    assert result["current_step"] == 1
    assert "projects_agent" in result["agent_responses"]
    assert "VisionVault uses the Florence-2 model" in result["agent_responses"]["projects_agent"]
    assert len(result["retrieved_context"]) == 1
    assert "projects_agent" in result["metrics"]["node_sequence"]

def test_route_intent_logic():
    state_routing: AgentState = {
        "messages": [],
        "session_id": "123",
        "plan": ["projects_agent", "skills_agent"],
        "current_step": 0,
        "retrieved_context": [],
        "agent_responses": {},
        "response": "",
        "metrics": {}
    }
    
    # First step: Route to projects_agent
    next_node = route_intent(state_routing)
    assert next_node == "projects_agent"
    
    # Second step: Route to skills_agent
    state_routing["current_step"] = 1
    next_node = route_intent(state_routing)
    assert next_node == "skills_agent"
    
    # Completed: Route to aggregator
    state_routing["current_step"] = 2
    next_node = route_intent(state_routing)
    assert next_node == "response_aggregator"

@pytest.mark.asyncio
@patch('app.agents.nodes.get_llm_client')
async def test_response_aggregator_node(mock_get_client):
    mock_client = MockLLMClient("Final aggregated markdown answer.")
    mock_get_client.return_value = mock_client
    
    state: AgentState = {
        "messages": [{"role": "user", "content": "Query"}],
        "session_id": "123",
        "plan": ["projects_agent"],
        "current_step": 1,
        "retrieved_context": [{"document": "Doc content", "metadata": {"title": "Source Document"}, "score": 0.95}],
        "agent_responses": {"projects_agent": "Draft text"},
        "response": "",
        "metrics": {}
    }
    
    result = await response_aggregator_node(state)
    
    assert "Final aggregated markdown answer." in result["response"]
    assert "Source Document" in result["response"]
    assert "Aggregator" in result["metrics"]["node_sequence"]
