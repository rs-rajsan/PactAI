from backend.domain.entities import DocumentProcessingRequest, ContractExtractionResult
from backend.agents.pdf_processing_agent import PDFAgentFactory
from langchain_core.messages import HumanMessage
import os
import logging
import json

logger = logging.getLogger(__name__)

class DocumentProcessingService:
    """
    Application Service for document processing
    Follows Single Responsibility Principle
    """
    
    def __init__(self, agent_manager):
        self.agent_manager = agent_manager
        self.pdf_agent_factory = PDFAgentFactory()
    
    def process_pdf_upload(self, request: DocumentProcessingRequest) -> dict:
        """
        Process uploaded PDF using agent-based workflow
        Template Method Pattern implementation
        """
        
        try:
            logger.info(f"Starting PDF processing for: {request.filename}")
            
            # 1. Validate file exists
            if not os.path.exists(request.file_path):
                raise FileNotFoundError(f"File not found: {request.file_path}")
            
            # 2. Get appropriate LLM model
            model_name = request.processing_options.get("model", "gemini-2.0-flash")
            llm = self._get_llm_for_model(model_name)
            
            # 3. Create PDF processing agent
            pdf_agent = self.pdf_agent_factory.create_agent(llm)
            
            # 4. Process document using agent
            result = self._process_with_agent(pdf_agent, request)
            
            # 5. Clean up temporary file
            self._cleanup_file(request.file_path)
            
            logger.info(f"PDF processing completed for: {request.filename}")
            return result
            
        except Exception as e:
            logger.error(f"PDF processing failed for {request.filename}: {e}")
            self._cleanup_file(request.file_path)
            raise
    
    def _get_llm_for_model(self, model_name: str):
        """Get LLM instance from existing agent manager - DRY principle"""
        try:
            # Reuse existing agent manager infrastructure
            agent = self.agent_manager.get_model_by_name(model_name)
            
            # Extract LLM from existing agent (accessing internal structure)
            # This reuses the existing LLM instances and configurations
            if hasattr(agent, 'nodes') and 'assistant' in agent.nodes:
                assistant_node = agent.nodes['assistant']
                if hasattr(assistant_node, 'func'):
                    # Try to extract LLM from the assistant function
                    import inspect
                    if hasattr(assistant_node.func, '__closure__') and assistant_node.func.__closure__:
                        for cell in assistant_node.func.__closure__:
                            if hasattr(cell.cell_contents, 'bind_tools'):
                                # Found the LLM with tools, get the base LLM
                                llm_with_tools = cell.cell_contents
                                if hasattr(llm_with_tools, 'llm'):
                                    return llm_with_tools.llm
                                elif hasattr(llm_with_tools, 'bound'):
                                    return llm_with_tools.bound
            
            # Fallback: create new LLM instance using same pattern as agent_manager
            if model_name == "gpt-4o":
                from langchain_openai import ChatOpenAI
                return ChatOpenAI(model="gpt-4o", temperature=0)
            elif model_name in ["gemini-1.5-pro", "gemini-2.0-flash"]:
                from langchain_google_genai import ChatGoogleGenerativeAI
                return ChatGoogleGenerativeAI(model=model_name, temperature=0)
            elif model_name == "sonnet-3.5":
                from langchain_anthropic import ChatAnthropic
                return ChatAnthropic(model="claude-3-5-sonnet-latest", temperature=0)
            elif model_name == "mistral-large":
                from langchain_mistralai import ChatMistralAI
                return ChatMistralAI(model="mistral-large-latest")
            else:
                raise ValueError(f"Unknown model: {model_name}")
                
        except Exception as e:
            logger.error(f"Failed to get LLM for model {model_name}: {e}")
            raise
    
    def _process_with_agent(self, pdf_agent, request: DocumentProcessingRequest) -> dict:
        """Process document using PDF agent"""
        
        # Create processing message for agent
        processing_message = HumanMessage(content=f"""
        Process this PDF contract document:
        
        File path: {request.file_path}
        Filename: {request.filename}
        
        Please:
        1. Extract text from the PDF
        2. Analyze if it's a valid contract
        3. Extract structured contract information
        4. Validate the data quality
        5. Store the contract if validation passes
        
        Provide a summary of the processing results.
        """)
        
        # Process with agent (same pattern as existing system)
        messages = [processing_message]
        
        # Stream processing results
        processing_results = []
        final_result = None
        
        for chunk in pdf_agent.stream({"messages": messages}, stream_mode=["messages", "updates"]):
            if chunk[0] == "messages":
                message = chunk[1]
                if hasattr(message[0], 'content'):
                    processing_results.append(message[0].content)
            elif chunk[0] == "updates":
                if "assistant" in chunk[1]:
                    for msg in chunk[1]["assistant"]["messages"]:
                        if hasattr(msg, 'content'):
                            final_result = msg.content
        
        # Parse final result
        result = {
            "status": "completed",
            "filename": request.filename,
            "processing_log": processing_results,
            "final_result": final_result or "Processing completed",
            "contract_id": None
        }
        
        # Try to extract contract ID from results
        if final_result:
            if "SUCCESS: Contract stored with ID:" in final_result:
                contract_id = final_result.split("SUCCESS: Contract stored with ID:")[-1].strip()
                result["contract_id"] = contract_id
                result["status"] = "success"
            elif "REVIEW_REQUIRED" in final_result:
                result["status"] = "review_required"
            elif "SKIPPED" in final_result:
                result["status"] = "skipped"
            elif "ERROR" in final_result:
                result["status"] = "error"
        
        return result
    
    def _cleanup_file(self, file_path: str):
        """Clean up temporary uploaded file"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to cleanup file {file_path}: {e}")

class DocumentServiceFactory:
    """Factory for creating document processing services"""
    
    @staticmethod
    def create_service(agent_manager):
        """Create document processing service with dependencies"""
        return DocumentProcessingService(agent_manager)