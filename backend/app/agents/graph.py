import logging
from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes import planner_node, specialized_agent_node, response_aggregator_node

logger = logging.getLogger(__name__)

# Compile wrapper nodes for specialized agents
async def run_projects_agent(state: AgentState):
    return await specialized_agent_node(state, "projects_agent")

async def run_resume_agent(state: AgentState):
    return await specialized_agent_node(state, "resume_agent")

async def run_experience_agent(state: AgentState):
    return await specialized_agent_node(state, "experience_agent")

async def run_skills_agent(state: AgentState):
    return await specialized_agent_node(state, "skills_agent")

async def run_architecture_agent(state: AgentState):
    return await specialized_agent_node(state, "architecture_agent")

async def run_recruiter_agent(state: AgentState):
    return await specialized_agent_node(state, "recruiter_agent")

async def run_blog_agent(state: AgentState):
    return await specialized_agent_node(state, "blog_agent")

async def run_contact_agent(state: AgentState):
    return await specialized_agent_node(state, "contact_agent")

def route_intent(state: AgentState) -> str:
    """Conditional routing edge that reads the plan list and selects the next node."""
    plan = state.get("plan", [])
    current_step = state.get("current_step", 0)
    
    if current_step < len(plan):
        target_node = plan[current_step]
        logger.info(f"Router routing to next task node: {target_node} (Step {current_step+1}/{len(plan)})")
        return target_node
    
    logger.info("Plan completed. Routing to Response Aggregator...")
    return "response_aggregator"

# Initialize state graph compilation
workflow = StateGraph(AgentState)

# Add processing nodes
workflow.add_node("planner", planner_node)
workflow.add_node("projects_agent", run_projects_agent)
workflow.add_node("resume_agent", run_resume_agent)
workflow.add_node("experience_agent", run_experience_agent)
workflow.add_node("skills_agent", run_skills_agent)
workflow.add_node("architecture_agent", run_architecture_agent)
workflow.add_node("recruiter_agent", run_recruiter_agent)
workflow.add_node("blog_agent", run_blog_agent)
workflow.add_node("contact_agent", run_contact_agent)
workflow.add_node("response_aggregator", response_aggregator_node)

# Set starting point
workflow.set_entry_point("planner")

# Define conditional transitions from the planner and all agents
routing_map = {
    "projects_agent": "projects_agent",
    "resume_agent": "resume_agent",
    "experience_agent": "experience_agent",
    "skills_agent": "skills_agent",
    "architecture_agent": "architecture_agent",
    "recruiter_agent": "recruiter_agent",
    "blog_agent": "blog_agent",
    "contact_agent": "contact_agent",
    "response_aggregator": "response_aggregator"
}

workflow.add_conditional_edges("planner", route_intent, routing_map)

# Every agent directs back to the router to check the next plan step
for agent_node in [
    "projects_agent", "resume_agent", "experience_agent", 
    "skills_agent", "architecture_agent", "recruiter_agent", 
    "blog_agent", "contact_agent"
]:
    workflow.add_conditional_edges(agent_node, route_intent, routing_map)

# Aggregator exits to the end node
workflow.add_edge("response_aggregator", END)

# Compile the graph
agent_graph = workflow.compile()
