from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from backend.agents.intelligence_state import IntelligenceState
from backend.agents.intelligence_tools import (
    ClauseDetectorTool, PolicyCheckerTool, 
    RiskCalculatorTool, RedlineGeneratorTool
)
from backend.agents.agent_workflow_tracker import workflow_tracker
from backend.agents.planning.planning_agent import PlanningAgentFactory
from backend.agents.planning.execution_engine import PlanExecutionEngine
import json
import logging

logger = logging.getLogger(__name__)

class IntelligenceOrchestrator:
    """Proper multi-agent orchestrator following SOLID principles"""
    
    def __init__(self, llm):
        self.llm = llm
        self.workflow = self._build_workflow()
        self.planning_agent = PlanningAgentFactory.create_planning_agent()
        self.execution_engine = PlanExecutionEngine()
    
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
        text_len = len(state["contract_text"])
        execution = workflow_tracker.start_agent(
            "Clause Extraction Agent", 
            "Extract key contract clauses (Payment, Liability, IP, etc.)",
            f"Contract text ({text_len:,} characters)"
        )
        
        try:
            tool = ClauseDetectorTool()
            clauses_json = tool._run(state["contract_text"])
            clauses_list = json.loads(clauses_json)
            
            workflow_tracker.complete_agent(execution, f"Extracted {len(clauses_list)} clauses")
            
            return {**state, 
                "extracted_clauses": clauses_list,
                "current_step": "clause_extraction"
            }
        except Exception as e:
            workflow_tracker.error_agent(execution, f"Clause extraction failed: {e}")
            return {**state,
                "extracted_clauses": [],
                "processing_result": {"status": "error", "error": f"Clause extraction failed: {e}"}
            }
    
    def _check_policies(self, state: IntelligenceState) -> IntelligenceState:
        """Check policy compliance - Single Responsibility"""
        clause_count = len(state["extracted_clauses"])
        execution = workflow_tracker.start_agent(
            "Policy Compliance Agent",
            "Check clauses against company policies (Payment, Liability, IP, etc.)",
            f"{clause_count} extracted clauses"
        )
        
        try:
            tool = PolicyCheckerTool()
            clauses_json = json.dumps(state["extracted_clauses"])
            violations_json = tool._run(clauses_json)
            violations_list = json.loads(violations_json)
            
            critical_count = len([v for v in violations_list if v.get("severity") == "CRITICAL"])
            workflow_tracker.complete_agent(execution, f"Found {len(violations_list)} violations ({critical_count} critical)")
            
            return {**state,
                "policy_violations": violations_list,
                "current_step": "policy_checking"
            }
        except Exception as e:
            workflow_tracker.error_agent(execution, f"Policy checking failed: {e}")
            return {**state, "policy_violations": []}
    
    def _calculate_risks(self, state: IntelligenceState) -> IntelligenceState:
        """Calculate risks - Single Responsibility"""
        violation_count = len(state["policy_violations"])
        execution = workflow_tracker.start_agent(
            "Risk Assessment Agent",
            "Calculate overall contract risk score and recommendations",
            f"{len(state['extracted_clauses'])} clauses + {violation_count} violations"
        )
        
        try:
            tool = RiskCalculatorTool()
            clauses_json = json.dumps(state["extracted_clauses"])
            violations_json = json.dumps(state["policy_violations"])
            risk_json = tool._run(clauses_json, violations_json)
            risk_dict = json.loads(risk_json)
            
            risk_score = risk_dict.get("overall_risk_score", 0)
            risk_level = risk_dict.get("risk_level", "UNKNOWN")
            workflow_tracker.complete_agent(execution, f"Risk Score: {risk_score}/100 ({risk_level})")
            
            return {**state,
                "risk_data": risk_dict,
                "current_step": "risk_calculation"
            }
        except Exception as e:
            workflow_tracker.error_agent(execution, f"Risk calculation failed: {e}")
            return {**state, "risk_data": {"overall_risk_score": 50.0, "risk_level": "MEDIUM"}}
    
    def _generate_redlines(self, state: IntelligenceState) -> IntelligenceState:
        """Generate redlines - Single Responsibility"""
        violation_count = len(state["policy_violations"])
        execution = workflow_tracker.start_agent(
            "Redline Generation Agent",
            "Generate contract redline suggestions for policy violations",
            f"{violation_count} policy violations"
        )
        
        try:
            tool = RedlineGeneratorTool()
            violations_json = json.dumps(state["policy_violations"])
            redlines_json = tool._run(violations_json)
            redlines_list = json.loads(redlines_json)
            
            critical_redlines = len([r for r in redlines_list if r.get("priority") == "CRITICAL"])
            workflow_tracker.complete_agent(execution, f"Generated {len(redlines_list)} redlines ({critical_redlines} critical)")
            
            return {**state,
                "redline_suggestions": redlines_list,
                "is_complete": True,
                "processing_result": {"status": "success", "message": "Intelligence analysis completed"}
            }
        except Exception as e:
            workflow_tracker.error_agent(execution, f"Redline generation failed: {e}")
            return {**state, "redline_suggestions": [], "is_complete": True}
    
    def analyze_contract(self, contract_text: str, use_planning: bool = True) -> dict:
        """Run analysis with optional autonomous planning"""
        try:
            if use_planning:
                try:
                    return self._analyze_with_planning(contract_text)
                except Exception as planning_error:
                    logger.error(f"Planning agent failed: {planning_error}, falling back to traditional workflow")
                    return self._analyze_traditional(contract_text)
            else:
                return self._analyze_traditional(contract_text)
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return {
                "clauses": [],
                "violations": [],
                "risk_assessment": {"overall_risk_score": 0, "risk_level": "UNKNOWN"},
                "redlines": [],
                "processing_complete": False
            }
    
    def _analyze_with_planning(self, contract_text: str) -> dict:
        """Analyze contract using autonomous planning agent"""
        logger.info("🧠 Using Autonomous Planning & Reasoning Agent")
        
        # Create execution plan based on contract analysis requirements
        query = "Perform comprehensive contract analysis including clause extraction, policy compliance, risk assessment, and redline generation"
        execution_plan = self.planning_agent.create_execution_plan(query)
        
        # Execute the planned workflow
        import asyncio
        results = asyncio.run(self.execution_engine.execute_plan(execution_plan, contract_text))
        
        # Provide feedback to planning agent for learning
        success_rate = 1.0 if results.get("processing_complete") else 0.0
        self.planning_agent.adapt_plan_from_feedback(execution_plan.plan_id, {"success_rate": success_rate})
        
        return results
    
    def _analyze_traditional(self, contract_text: str) -> dict:
        """Traditional workflow analysis (fallback)"""
        # Start workflow tracking
        workflow_tracker.start_workflow()
        
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
        
        # Complete workflow tracking
        workflow_tracker.complete_workflow()
        
        # Return structured results (no JSON parsing)
        return {
            "clauses": final_state["extracted_clauses"],
            "violations": final_state["policy_violations"],
            "risk_assessment": final_state["risk_data"],
            "redlines": final_state["redline_suggestions"],
            "processing_complete": final_state["is_complete"]
        }

class ContractIntelligenceAgentFactory:
    """Factory following proper design patterns"""
    
    @staticmethod
    def create_orchestrator(llm):
        """Create orchestrator with proper architecture"""
        return IntelligenceOrchestrator(llm)