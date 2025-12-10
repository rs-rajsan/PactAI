from langchain_core.messages import SystemMessage
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from backend.agents.pdf_tools import (
    PDFTextExtractorTool,
    ContractAnalyzerTool, 
    ContractStorageTool,
    DataValidatorTool
)
from datetime import date
import logging

logger = logging.getLogger(__name__)

def get_pdf_processing_agent(llm):
    """
    Create PDF processing agent using existing LangGraph pattern
    Reuses the same architecture as the main contract agent
    """
    
    # Define specialized tools for PDF processing
    tools = [
        PDFTextExtractorTool(),
        ContractAnalyzerTool(llm),
        DataValidatorTool(),
        ContractStorageTool()
    ]
    
    llm_with_tools = llm.bind_tools(tools)
    
    # System message for PDF processing agent
    sys_msg = SystemMessage(
        content=f"""You are a PDF contract processing agent. Your job is to:

1. Extract text from uploaded PDF files
2. Analyze the text to determine if it's a valid contract
3. Extract structured contract information (parties, dates, amounts, etc.)
4. Validate the extracted data for completeness and accuracy
5. Store valid contracts in the database

WORKFLOW:
1. Use pdf_text_extractor to extract text from the PDF file
2. Use contract_analyzer to analyze the extracted text
3. Use data_validator to check the quality of extracted data
4. Use contract_storage to store the contract if validation passes

IMPORTANT GUIDELINES:
- Always extract text first before analyzing
- Only store contracts with confidence score > 0.7
- If validation fails, explain what's missing or unclear
- Be thorough but efficient in your analysis
- Provide clear feedback about the processing status

Today is {date.today()}
"""
    )
    
    # Node function (same pattern as existing agent)
    def assistant(state: MessagesState):
        return {"messages": [llm_with_tools.invoke([sys_msg] + state["messages"])]}
    
    # Build graph (same pattern as existing agent)
    builder = StateGraph(MessagesState)
    
    # Define nodes
    builder.add_node("assistant", assistant)
    builder.add_node("tools", ToolNode(tools))
    
    # Define edges (same pattern as existing agent)
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges(
        "assistant",
        tools_condition,  # Reuse existing condition logic
    )
    builder.add_edge("tools", "assistant")
    
    logger.info("PDF processing agent created successfully")
    return builder.compile()

class PDFAgentFactory:
    """Factory for creating PDF processing agents - Factory Pattern"""
    
    @staticmethod
    def create_agent(llm, agent_type: str = "standard"):
        """Create PDF processing agent based on type"""
        
        if agent_type == "standard":
            return get_pdf_processing_agent(llm)
        else:
            raise ValueError(f"Unknown agent type: {agent_type}")
    
    @staticmethod
    def get_available_types():
        """Get list of available agent types"""
        return ["standard"]