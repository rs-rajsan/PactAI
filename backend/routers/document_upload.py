from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from backend.services.document_processing_service_v2 import DocumentServiceFactory
from backend.domain.entities import DocumentProcessingRequest
from backend.agent_manager import AgentManager
import os
import uuid
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/documents", tags=["documents"])

# Initialize services (reuse existing agent manager)
agent_manager = AgentManager()
document_service = DocumentServiceFactory.create_service(agent_manager)

@router.post("/upload")
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    model: str = Query(default="gemini-2.0-flash", description="LLM model to use for processing")
):
    """
    Upload and process PDF contract
    - Validates file type and size
    - Processes using PDF processing agent
    - Returns processing status
    """
    
    try:
        # Input validation
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Check file size (50MB limit)
        file_content = await file.read()
        if len(file_content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 50MB)")
        
        # Check for duplicate by filename
        duplicate_check = agent_manager.agents["gemini-2.0-flash"]._llm if hasattr(agent_manager.agents["gemini-2.0-flash"], '_llm') else agent_manager.agents["gemini-2.0-flash"]
        from backend.infrastructure.contract_repository import Neo4jContractRepository
        repo = Neo4jContractRepository()
        
        # Simple duplicate check by filename
        existing_query = "MATCH (c:Contract) WHERE c.file_id CONTAINS $filename RETURN c.file_id LIMIT 1"
        existing = repo.graph.query(existing_query, {"filename": file.filename.replace(".pdf", "")})
        
        if existing:
            return {
                "message": "Duplicate file detected",
                "filename": file.filename,
                "status": "duplicate",
                "existing_contract_id": existing[0]["file_id"],
                "action": "skipped"
            }
        
        # Save file temporarily
        temp_filename = f"{uuid.uuid4().hex}_{file.filename}"
        temp_path = f"/tmp/{temp_filename}"
        
        with open(temp_path, "wb") as temp_file:
            temp_file.write(file_content)
        
        logger.info(f"Saved uploaded file: {file.filename} -> {temp_path}")
        
        # Extract full text for storage
        from backend.infrastructure.text_extractors import TextExtractionService
        text_extractor = TextExtractionService()
        full_text = text_extractor.extract_with_fallback(temp_path)
        
        # Create processing request
        processing_request = DocumentProcessingRequest(
            file_path=temp_path,
            filename=file.filename,
            processing_options={"model": model, "full_text": full_text}
        )
        
        # Process synchronously with error handling
        logger.info(f"Starting document processing for: {file.filename}")
        try:
            result = document_service.process_pdf_upload(processing_request)
            logger.info(f"Document processing result: {result}")
        except Exception as proc_error:
            logger.error(f"Document processing failed: {str(proc_error)}")
            logger.error(f"Processing error type: {type(proc_error).__name__}")
            import traceback
            logger.error(f"Processing traceback: {traceback.format_exc()}")
            
            # Return error as JSON instead of raising exception
            return {
                "message": "PDF processing failed",
                "filename": file.filename,
                "status": "error",
                "contract_id": None,
                "details": f"Processing error: {str(proc_error)}",
                "model_used": model,
                "error_type": type(proc_error).__name__
            }
        
        logger.info(f"PDF processing completed for {file.filename}: {result['status']}")
        
        # Extract contract ID from result details if not directly available
        contract_id = result.get("contract_id")
        if not contract_id and "SUCCESS: Contract stored with ID:" in result.get("final_result", ""):
            contract_id = result["final_result"].split("SUCCESS: Contract stored with ID:")[-1].strip()
        
        return {
            "message": "PDF processing completed",
            "filename": file.filename,
            "status": result["status"],
            "contract_id": contract_id,
            "details": result.get("final_result", ""),
            "model_used": model
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF upload failed for {file.filename if file else 'unknown'}: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        
        # Cleanup temp file if it exists
        if 'temp_path' in locals() and temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass
                
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.post("/upload-stream")
async def upload_pdf_stream(
    file: UploadFile = File(...),
    model: str = Query(default="gemini-2.0-flash", description="LLM model to use for processing")
):
    """
    Upload and process PDF with streaming response
    Similar to existing /run/ endpoint pattern
    """
    
    try:
        # Validation (same as above)
        if not file.filename or not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Invalid file")
        
        file_content = await file.read()
        if len(file_content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large")
        
        # Save file temporarily
        temp_filename = f"{uuid.uuid4().hex}_{file.filename}"
        temp_path = f"/tmp/{temp_filename}"
        
        with open(temp_path, "wb") as temp_file:
            temp_file.write(file_content)
        
        # Create processing request
        processing_request = DocumentProcessingRequest(
            file_path=temp_path,
            filename=file.filename,
            processing_options={"model": model}
        )
        
        # Stream processing results (similar to existing /run/ endpoint)
        async def stream_processing():
            try:
                # Get LLM and create agent
                llm = document_service._get_llm_for_model(model)
                from backend.agents.pdf_processing_agent import PDFAgentFactory
                pdf_agent = PDFAgentFactory.create_agent(llm)
                
                # Create processing message
                from langchain_core.messages import HumanMessage
                processing_message = HumanMessage(content=f"""
                Process this PDF contract document:
                
                File path: {temp_path}
                Filename: {file.filename}
                
                Please:
                1. Extract text from the PDF
                2. Analyze if it's a valid contract
                3. Extract structured contract information
                4. Validate the data quality
                5. Store the contract if validation passes
                """)
                
                messages = [processing_message]
                
                # Stream results (same pattern as existing system)
                async for chunk in pdf_agent.astream({"messages": messages}, stream_mode=["messages", "updates"]):
                    if chunk[0] == "messages":
                        message = chunk[1]
                        if hasattr(message[0], 'tool_calls') and len(message[0].tool_calls) > 0:
                            for tool in message[0].tool_calls:
                                if tool.get('name'):
                                    tool_calls_content = json.dumps(tool)
                                    yield f"data: {json.dumps({'content': tool_calls_content, 'type': 'tool_call'})}\n\n"
                        
                        if hasattr(message[0], 'content') and message[0].content:
                            yield f"data: {json.dumps({'content': message[0].content, 'type': 'ai_message'})}\n\n"
                
                # Final completion message
                yield f"data: {json.dumps({'content': f'PDF processing completed for {file.filename}', 'type': 'completion'})}\n\n"
                yield f"data: {json.dumps({'content': '', 'type': 'end'})}\n\n"
                
            except Exception as e:
                error_msg = f"Processing failed: {str(e)}"
                yield f"data: {json.dumps({'content': error_msg, 'type': 'error'})}\n\n"
                yield f"data: {json.dumps({'content': '', 'type': 'end'})}\n\n"
            finally:
                # Cleanup
                document_service._cleanup_file(temp_path)
        
        return StreamingResponse(
            stream_processing(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Streaming PDF upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_upload_status():
    """Get system status for document uploads"""
    return {
        "status": "operational",
        "supported_formats": ["pdf"],
        "max_file_size": "50MB",
        "available_models": list(agent_manager.agents.keys())
    }