from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime

@dataclass
class DocumentProcessingRequest:
    file_path: str
    filename: str
    user_id: Optional[str] = None
    processing_options: Dict[str, Any] = None

@dataclass 
class ContractExtractionResult:
    contract_data: Dict[str, Any]
    confidence_score: float
    validation_errors: List[str]
    requires_human_review: bool
    extracted_text: str = ""

# Domain interfaces (Interface Segregation Principle)
class ITextExtractor(ABC):
    @abstractmethod
    def extract_text(self, file_path: str) -> str:
        pass

class IContractAnalyzer(ABC):
    @abstractmethod
    async def analyze_contract(self, text: str) -> Dict[str, Any]:
        pass

class IContractRepository(ABC):
    @abstractmethod
    async def store_contract(self, contract_data: Dict[str, Any]) -> str:
        pass

class IDocumentProcessor(ABC):
    @abstractmethod
    async def process_document(self, request: DocumentProcessingRequest) -> ContractExtractionResult:
        pass