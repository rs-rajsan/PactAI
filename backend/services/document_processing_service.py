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
            elif model_name in ["gemini-2.5-pro", "gemini-2.0-flash"]:
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
        
        # Get full text from processing options if available
        full_text = request.processing_options.get("full_text", "")
        
        # Create processing message for agent
        processing_message = HumanMessage(content=f"""
        Process this PDF contract document:
        
        File path: {request.file_path}
        Filename: {request.filename}
        
        You must call these tools in order:
        1. pdf_text_extractor - Extract text from the PDF
        2. contract_analyzer - Analyze the extracted text  
        3. contract_storage - Store the analyzed contract data
        
        Call each tool and use the output from one as input to the next.
        """)
        
        messages = [processing_message]
        
        # Stream processing results
        processing_results = []
        final_result = None
        tool_calls_made = []
        
        logger.info("Starting PDF agent processing stream")
        
        for chunk in pdf_agent.stream({"messages": messages}, stream_mode=["messages", "updates"]):
            logger.debug(f"Processing chunk: {chunk[0]}")
            
            if chunk[0] == "messages":
                message = chunk[1]
                if hasattr(message[0], 'content'):
                    processing_results.append(message[0].content)
                    logger.info(f"Agent message: {message[0].content[:100]}...")
                
                # Track tool calls
                if hasattr(message[0], 'tool_calls') and message[0].tool_calls:
                    for tool_call in message[0].tool_calls:
                        tool_name = tool_call.get('name', 'unknown')
                        tool_calls_made.append(tool_name)
                        logger.info(f"Tool called: {tool_name}")
                        
            elif chunk[0] == "updates":
                if "assistant" in chunk[1]:
                    for msg in chunk[1]["assistant"]["messages"]:
                        if hasattr(msg, 'content'):
                            final_result = msg.content
                            logger.info(f"Final result updated: {msg.content[:100]}...")
                elif "tools" in chunk[1]:
                    for msg in chunk[1]["tools"]["messages"]:
                        if hasattr(msg, 'content'):
                            processing_results.append(msg.content)
                            logger.info(f"Tool result: {msg.content[:100]}...")
        
        logger.info(f"Processing completed. Tools called: {tool_calls_made}")
        logger.info(f"Final result: {final_result}")
        
        # Parse final result
        result = {
            "status": "completed",
            "filename": request.filename,
            "processing_log": processing_results,
            "final_result": final_result or "Processing completed",
            "contract_id": None
        }
        
        # Try to extract contract ID from all results (including tool results)
        all_results = processing_results + ([final_result] if final_result else [])
        logger.info(f"Extracting contract ID from {len(all_results)} result messages")
        
        for result_text in all_results:
            if result_text and "SUCCESS: Contract stored with ID:" in result_text:
                contract_id = result_text.split("SUCCESS: Contract stored with ID:")[-1].strip()
                result["contract_id"] = contract_id
                result["status"] = "success"
                logger.info(f"Contract stored successfully with ID: {contract_id}")
                break
            elif result_text and "REVIEW_REQUIRED" in result_text:
                result["status"] = "review_required"
            elif result_text and "SKIPPED" in result_text:
                result["status"] = "skipped"
            elif result_text and "ERROR" in result_text:
                result["status"] = "error"
                logger.error(f"Contract processing error: {result_text}")
        
        # Check if storage was successful (either via tool calls or deterministic workflow)
        storage_attempted = "contract_storage" in tool_calls_made or "Storage Result:" in (final_result or "")
        if not storage_attempted:
            logger.warning("Storage was not attempted during processing")
            result["status"] = "incomplete"
            result["final_result"] = f"Processing incomplete - storage not attempted. Tools called: {tool_calls_made}"
        
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