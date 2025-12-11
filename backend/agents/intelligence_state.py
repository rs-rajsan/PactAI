from typing import TypedDict, List, Any
from backend.domain.value_objects import ProcessingResult

class IntelligenceState(TypedDict):
    """Properly designed state following SRP - data separate from workflow"""
    
    # Input data
    contract_text: str
    
    # Processing results (structured data, not strings)
    extracted_clauses: List[dict]
    policy_violations: List[dict] 
    risk_data: dict
    redline_suggestions: List[dict]
    
    # Workflow metadata
    messages: List[Any]
    current_step: str
    processing_result: ProcessingResult
    is_complete: bool