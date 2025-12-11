from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from backend.agents.intelligence_state import IntelligenceState
from backend.agents.intelligence_tools import (
    ClauseDetectorTool, PolicyCheckerTool, 
    RiskCalculatorTool, RedlineGeneratorTool
)
# ProcessingResult and ProcessingStatus not needed - remove dependency
import json
import logging

logger = logging.getLogger(__name__)

class IntelligenceOrchestrator:
    """Proper multi-agent orchestrator following SOLID principles"""
    
    def __init__(self, llm):
        self.llm = llm
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Build workflow with proper state management"""
        
        workflow = StateGraph(IntelligenceState)
        
        # Add nodes with descriptive names (no conflicts)
        workflow.add_node("clause_extraction", self._extract_clauses)
        workflow.add_node("policy_checking", self._check_policies)
        workflow.add_node("risk_calculation", self._calculate_risks)
        workflow.add_node("redline_generation", self._generate_redlines)
        
        # Define workflow
        workflow.set_entry_point("clause_extraction")
        workflow.add_edge("clause_extraction", "policy_checking")
        workflow.add_edge("policy_checking", "risk_calculation")
        workflow.add_edge("risk_calculation", "redline_generation")
        workflow.add_edge("redline_generation", END)
        
        return workflow.compile()
    
    def _extract_clauses(self, state: IntelligenceState) -> IntelligenceState:
        """Extract clauses - Single Responsibility"""
        try:
            tool = ClauseDetectorTool()
            clauses_json = tool._run(state["contract_text"])
            clauses_list = json.loads(clauses_json)
            
            return {**state, 
                "extracted_clauses": clauses_list,
                "current_step": "clause_extraction"
            }
        except Exception as e:
            return {**state,
                "extracted_clauses": [],
                "processing_result": {"status": "error", "error": f"Clause extraction failed: {e}"}
            }
    
    def _check_policies(self, state: IntelligenceState) -> IntelligenceState:
        """Check policy compliance - Single Responsibility"""
        try:
            tool = PolicyCheckerTool()
            clauses_json = json.dumps(state["extracted_clauses"])
            violations_json = tool._run(clauses_json)
            violations_list = json.loads(violations_json)
            
            return {**state,
                "policy_violations": violations_list,
                "current_step": "policy_checking"
            }
        except Exception as e:
            return {**state, "policy_violations": []}
    
    def _calculate_risks(self, state: IntelligenceState) -> IntelligenceState:
        """Calculate risks - Single Responsibility"""
        try:
            tool = RiskCalculatorTool()
            clauses_json = json.dumps(state["extracted_clauses"])
            violations_json = json.dumps(state["policy_violations"])
            risk_json = tool._run(clauses_json, violations_json)
            risk_dict = json.loads(risk_json)
            
            return {**state,
                "risk_data": risk_dict,
                "current_step": "risk_calculation"
            }
        except Exception as e:
            return {**state, "risk_data": {"overall_risk_score": 50.0, "risk_level": "MEDIUM"}}
    
    def _generate_redlines(self, state: IntelligenceState) -> IntelligenceState:
        """Generate redlines - Single Responsibility"""
        try:
            tool = RedlineGeneratorTool()
            violations_json = json.dumps(state["policy_violations"])
            redlines_json = tool._run(violations_json)
            redlines_list = json.loads(redlines_json)
            
            return {**state,
                "redline_suggestions": redlines_list,
                "is_complete": True,
                "processing_result": {"status": "success", "message": "Intelligence analysis completed"}
            }
        except Exception as e:
            return {**state, "redline_suggestions": [], "is_complete": True}
    
    def analyze_contract(self, contract_text: str) -> dict:
        """Run analysis with proper state management"""
        try:
            # Initialize proper state
            initial_state = {
                "contract_text": contract_text,
                "extracted_clauses": [],
                "policy_violations": [],
                "risk_data": {},
                "redline_suggestions": [],
                "messages": [],
                "current_step": "",
                "processing_result": None,
                "is_complete": False
            }
            
            # Run workflow
            final_state = self.workflow.invoke(initial_state)
            
            # Return structured results (no JSON parsing)
            return {
                "clauses": final_state["extracted_clauses"],
                "violations": final_state["policy_violations"],
                "risk_assessment": final_state["risk_data"],
                "redlines": final_state["redline_suggestions"],
                "processing_complete": final_state["is_complete"]
            }
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return {
                "clauses": [],
                "violations": [],
                "risk_assessment": {"overall_risk_score": 0, "risk_level": "UNKNOWN"},
                "redlines": [],
                "processing_complete": False
            }

class ContractIntelligenceAgentFactory:
    """Factory following proper design patterns"""
    
    @staticmethod
    def create_orchestrator(llm):
        """Create orchestrator with proper architecture"""
        return IntelligenceOrchestrator(llm)