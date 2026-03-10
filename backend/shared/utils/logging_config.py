import logging
import uuid
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware

# Context variable to store the correlation ID for the current request context
correlation_id_ctx_var: ContextVar[str] = ContextVar("correlation_id", default="no-id")

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Middleware to inject/extract correlation IDs for request tracing."""
    async def dispatch(self, request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        token = correlation_id_ctx_var.set(correlation_id)
        try:
            response = await call_next(request)
            response.headers["X-Correlation-ID"] = correlation_id
            return response
        finally:
            correlation_id_ctx_var.reset(token)

class CorrelationIdFilter(logging.Filter):
    """Filter to add correlation ID to log records."""
    def filter(self, record):
        record.correlation_id = correlation_id_ctx_var.get()
        return True

def setup_logging():
    """Configure centralized logging with request tracing support."""
    log_format = (
        "%(asctime)s - %(name)s - %(levelname)s - [%(correlation_id)s] - %(message)s"
    )
    
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(log_format))
    handler.addFilter(CorrelationIdFilter())
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove existing handlers to avoid duplicates
    for h in root_logger.handlers[:]:
        root_logger.removeHandler(h)
    
    root_logger.addHandler(handler)
    
    # Minimize noise from third-party loggers while keeping our format
    for logger_name in ["uvicorn.access", "uvicorn.error", "backend"]:
        l = logging.getLogger(logger_name)
        l.handlers = []
        l.addHandler(handler)
        l.propagate = False

    logging.info("Centralized logging and request tracing initialized")
