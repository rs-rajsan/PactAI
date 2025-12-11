from backend.domain.entities import DocumentProcessingRequest
from backend.agents.pdf_processing_agent import PDFAgentFactory
from backend.domain.value_objects import ProcessingResult, ProcessingStatus
import os
import logging

logger = logging.getLogger(__name__)

class DocumentProcessingService:
    """
    Application Service for document processing
    Follows Single Responsibility Principle with structured output
    """
    
    def __init__(self, agent_manager):
        self.agent_manager = agent_manager
        self.pdf_agent_factory = PDFAgentFactory()
    
    def process_pdf_upload(self, request: DocumentProcessingRequest) -> dict:
        """
        Process uploaded PDF using agent-based workflow with structured output
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
            
            # 4. Process document using agent with structured state
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
        """Get LLM instance - DRY principle"""
        if model_name == "gpt-4o":
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(model="gpt-4o", temperature=0)
        elif model_name in ["gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-2.0-flash"]:
            from langchain_google_genai import ChatGoogleGenerativeAI
            # Fix model name mapping
            actual_model = "gemini-2.0-flash-exp" if model_name == "gemini-2.0-flash" else model_name
            return ChatGoogleGenerativeAI(model=actual_model, temperature=0)
        elif model_name == "sonnet-3.5":
            from langchain_anthropic import ChatAnthropic
            return ChatAnthropic(model="claude-3-5-sonnet-latest", temperature=0)
        else:
            raise ValueError(f"Unknown model: {model_name}")
    
    def _process_with_agent(self, pdf_agent, request: DocumentProcessingRequest) -> dict:
        """Process document using PDF agent with structured output"""
        
        # Create initial state
        initial_state = {
            "file_path": request.file_path,
            "extracted_text": None,
            "contract_data": None,
            "processing_result": None,
            "messages": []
        }
        
        logger.info("Starting PDF agent processing with structured state")
        
        try:
            # Run the agent workflow
            final_state = pdf_agent.invoke(initial_state)
            processing_result = final_state.get("processing_result")
            
            if not processing_result:
                # Fallback: check if we have contract_data but no result
                contract_data = final_state.get("contract_data")
                if contract_data and contract_data.is_contract:
                    return {
                        "status": "error",
                        "filename": request.filename,
                        "final_result": "Processing completed but storage failed",
                        "contract_id": None
                    }
                return {
                    "status": "error",
                    "filename": request.filename,
                    "final_result": "No processing result returned",
                    "contract_id": None
                }
            
            # Convert structured result to response format
            return {
                "status": processing_result.status.value,
                "filename": request.filename,
                "final_result": processing_result.message or f"Processing {processing_result.status.value}",
                "contract_id": processing_result.contract_id,
                "error": processing_result.error
            }
            
        except Exception as e:
            logger.error(f"Agent processing failed: {e}")
            return {
                "status": "error",
                "filename": request.filename,
                "final_result": f"Processing failed: {str(e)}",
                "contract_id": None
            }
    
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