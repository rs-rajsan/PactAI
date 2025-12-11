from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage
from typing import TypedDict, List, Dict, Any
from backend.agents.intelligence_tools import (
    ClauseDetectorTool, PolicyCheckerTool, 
    RiskCalculatorTool, RedlineGeneratorTool
)
import json
import logging

logger = logging.getLogger(__name__)

# Shared state for multi-agent workflow
class ContractIntelligenceState(TypedDict):
    messages: List[Any]
    contract_text: str
    clauses: str  # JSON string
    violations: str  # JSON string
    risk_assessment: str  # JSON string
    redlines: str  # JSON string
    current_agent: str
    processing_complete: bool

# Individual Specialized Agents
class ClauseExtractionAgent:
    """Agent specialized in clause detection and extraction"""
    
    def __init__(self, llm):
        self.llm = llm
        self.tools = [ClauseDetectorTool()]
        self.tool_node = ToolNode(self.tools)
    
    def extract_clauses(self, state: ContractIntelligenceState) -> ContractIntelligenceState:
        """Extract clauses from contract text"""
        try:
            logger.info("Clause Extraction Agent: Starting clause extraction")
            
            # Use the tool to extract clauses
            clause_tool = ClauseDetectorTool()
            clauses_result = clause_tool._run(state["contract_text"])
            
            state["clauses"] = clauses_result
            state["current_agent"] = "clause_extraction"
            
            # Add message for tracking
            state["messages"].append(AIMessage(
                content=f"Clause Extraction Agent: Extracted clauses from contract. Found {len(json.loads(clauses_result))} clauses."
            ))
            
            logger.info(f"Clause extraction completed: {len(json.loads(clauses_result))} clauses found")
            return state
            
        except Exception as e:
            logger.error(f"Clause extraction failed: {e}")
            state["clauses"] = "[]"
            return state

class PolicyComplianceAgent:
    """Agent specialized in policy compliance checking"""
    
    def __init__(self, llm):
        self.llm = llm
        self.tools = [PolicyCheckerTool()]
        self.tool_node = ToolNode(self.tools)
    
    def check_compliance(self, state: ContractIntelligenceState) -> ContractIntelligenceState:
        """Check clauses against company policies"""
        try:
            logger.info("Policy Compliance Agent: Starting compliance check")
            
            # Use the tool to check policy compliance
            policy_tool = PolicyCheckerTool()
            violations_result = policy_tool._run(state["clauses"])
            
            state["violations"] = violations_result
            state["current_agent"] = "policy_compliance"
            
            # Add message for tracking
            violations_count = len(json.loads(violations_result))
            state["messages"].append(AIMessage(
                content=f"Policy Compliance Agent: Completed policy check. Found {violations_count} violations."
            ))
            
            logger.info(f"Policy compliance check completed: {violations_count} violations found")
            return state
            
        except Exception as e:
            logger.error(f"Policy compliance check failed: {e}")
            state["violations"] = "[]"
            return state

class RiskAssessmentAgent:
    """Agent specialized in risk assessment and scoring"""
    
    def __init__(self, llm):
        self.llm = llm
        self.tools = [RiskCalculatorTool()]
        self.tool_node = ToolNode(self.tools)
    
    def assess_risks(self, state: ContractIntelligenceState) -> ContractIntelligenceState:
        """Assess contract risks based on clauses and violations"""
        try:
            logger.info("Risk Assessment Agent: Starting risk assessment")
            
            # Use the tool to calculate risks
            risk_tool = RiskCalculatorTool()
            risk_result = risk_tool._run(state["clauses"], state["violations"])
            
            state["risk_assessment"] = risk_result
            state["current_agent"] = "risk_assessment"
            
            # Add message for tracking
            risk_data = json.loads(risk_result)
            risk_score = risk_data.get("overall_risk_score", 0)
            risk_level = risk_data.get("risk_level", "UNKNOWN")
            
            state["messages"].append(AIMessage(
                content=f"Risk Assessment Agent: Risk analysis complete. Overall risk: {risk_level} ({risk_score}/100)"
            ))
            
            logger.info(f"Risk assessment completed: {risk_level} ({risk_score}/100)")
            return state
            
        except Exception as e:
            logger.error(f"Risk assessment failed: {e}")
            state["risk_assessment"] = json.dumps({"overall_risk_score": 50.0, "risk_level": "MEDIUM", "critical_issues": [], "recommendations": []})
            return state

class RedlineGenerationAgent:
    """Agent specialized in generating redline recommendations"""
    
    def __init__(self, llm):
        self.llm = llm
        self.tools = [RedlineGeneratorTool()]
        self.tool_node = ToolNode(self.tools)
    
    def generate_redlines(self, state: ContractIntelligenceState) -> ContractIntelligenceState:
        """Generate redline recommendations based on violations"""
        try:
            logger.info("Redline Generation Agent: Starting redline generation")
            
            # Use the tool to generate redlines
            redline_tool = RedlineGeneratorTool()
            redlines_result = redline_tool._run(state["violations"])
            
            state["redlines"] = redlines_result
            state["current_agent"] = "redline_generation"
            state["processing_complete"] = True
            
            # Add message for tracking
            redlines_count = len(json.loads(redlines_result))
            state["messages"].append(AIMessage(
                content=f"Redline Generation Agent: Generated {redlines_count} redline recommendations. Analysis complete."
            ))
            
            logger.info(f"Redline generation completed: {redlines_count} recommendations generated")
            return state
            
        except Exception as e:
            logger.error(f"Redline generation failed: {e}")
            state["redlines"] = "[]"
            state["processing_complete"] = True
            return state

# Multi-Agent Orchestrator
class ContractIntelligenceOrchestrator:
    """Orchestrates the multi-agent contract intelligence workflow"""
    
    def __init__(self, llm):
        self.llm = llm
        
        # Initialize specialized agents
        self.clause_agent = ClauseExtractionAgent(llm)
        self.policy_agent = PolicyComplianceAgent(llm)
        self.risk_agent = RiskAssessmentAgent(llm)
        self.redline_agent = RedlineGenerationAgent(llm)
        
        # Build the workflow graph
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build the multi-agent workflow graph"""
        
        workflow = StateGraph(ContractIntelligenceState)
        
        # Add agent nodes (avoid state key conflicts)
        workflow.add_node("extract_clauses", self.clause_agent.extract_clauses)
        workflow.add_node("check_policies", self.policy_agent.check_compliance)
        workflow.add_node("assess_risks", self.risk_agent.assess_risks)
        workflow.add_node("generate_redlines", self.redline_agent.generate_redlines)
        
        # Define the workflow sequence
        workflow.set_entry_point("extract_clauses")
        workflow.add_edge("extract_clauses", "check_policies")
        workflow.add_edge("check_policies", "assess_risks")
        workflow.add_edge("assess_risks", "generate_redlines")
        workflow.add_edge("generate_redlines", END)
        
        return workflow.compile()
    
    def analyze_contract(self, contract_text: str) -> Dict[str, Any]:
        """Run the complete multi-agent analysis workflow"""
        try:
            logger.info("Starting multi-agent contract intelligence analysis")
            
            # Initialize state
            initial_state = ContractIntelligenceState(
                messages=[HumanMessage(content=f"Analyze this contract: {contract_text[:200]}...")],
                contract_text=contract_text,
                clauses="[]",
                violations="[]", 
                risk_assessment="{}",
                redlines="[]",
                current_agent="",
                processing_complete=False
            )
            
            # Run the workflow
            final_state = self.workflow.invoke(initial_state)
            
            # Parse results
            clauses = json.loads(final_state["clauses"])
            violations = json.loads(final_state["violations"])
            risk_assessment = json.loads(final_state["risk_assessment"])
            redlines = json.loads(final_state["redlines"])
            
            # Store full contract text for future intelligence analysis
            full_text = final_state["contract_text"]
            
            result = {
                "clauses": clauses,
                "violations": violations,
                "risk_assessment": risk_assessment,
                "redlines": redlines,
                "full_text": full_text,
                "messages": [msg.content for msg in final_state["messages"] if hasattr(msg, 'content')],
                "processing_complete": final_state["processing_complete"]
            }
            
            logger.info("Multi-agent analysis completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Multi-agent analysis failed: {e}")
            return {
                "clauses": [],
                "violations": [],
                "risk_assessment": {"overall_risk_score": 0, "risk_level": "UNKNOWN", "critical_issues": [], "recommendations": []},
                "redlines": [],
                "messages": [f"Analysis failed: {str(e)}"],
                "processing_complete": False
            }

# Factory for creating the orchestrator
class ContractIntelligenceAgentFactory:
    """Factory for creating contract intelligence agents"""
    
    @staticmethod
    def create_orchestrator(llm) -> ContractIntelligenceOrchestrator:
        """Create a new contract intelligence orchestrator"""
        return ContractIntelligenceOrchestrator(llm)