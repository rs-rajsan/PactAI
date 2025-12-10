from backend.domain.entities import IContractRepository
from backend.tools.contract_search_tool import graph, embedding
from typing import Dict, Any
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class Neo4jContractRepository(IContractRepository):
    """Repository implementation using existing Neo4j infrastructure - DRY principle"""
    
    def __init__(self):
        self.graph = graph  # Reuse existing connection
        self.embedding_service = embedding  # Reuse existing embedding service
    
    def store_contract(self, contract_data: Dict[str, Any]) -> str:
        """Store contract in Neo4j using existing schema"""
        
        try:
            # Generate unique contract ID
            contract_id = f"UPLOADED_{uuid.uuid4().hex[:8].upper()}_{datetime.now().strftime('%Y%m%d')}"
            
            # Generate embedding for the contract summary
            summary_text = contract_data.get("summary", "")
            contract_embedding = []
            
            if summary_text:
                try:
                    contract_embedding = self.embedding_service.embed_query(summary_text)
                except Exception as e:
                    logger.warning(f"Failed to generate embedding: {e}")
            
            # Create contract node using existing schema
            contract_query = """
            CREATE (c:Contract {
                file_id: $file_id,
                summary: $summary,
                contract_type: $contract_type,
                contract_scope: $contract_scope,
                effective_date: CASE WHEN $effective_date IS NOT NULL THEN date($effective_date) ELSE NULL END,
                end_date: CASE WHEN $end_date IS NOT NULL THEN date($end_date) ELSE NULL END,
                total_amount: $total_amount,
                embedding: $embedding,
                upload_date: datetime(),
                source: 'PDF_UPLOAD'
            })
            RETURN c.file_id as contract_id
            """
            
            contract_params = {
                "file_id": contract_id,
                "summary": contract_data.get("summary", ""),
                "contract_type": contract_data.get("contract_type", "Unknown"),
                "contract_scope": ", ".join(contract_data.get("key_terms", [])),
                "effective_date": contract_data.get("effective_date"),
                "end_date": contract_data.get("end_date"),
                "total_amount": contract_data.get("total_amount"),
                "embedding": contract_embedding
            }
            
            # Execute contract creation
            result = self.graph.query(contract_query, contract_params)
            
            if not result:
                raise Exception("Failed to create contract node")
            
            created_contract_id = result[0]["contract_id"]
            
            # Create party relationships
            self._create_party_relationships(created_contract_id, contract_data.get("parties", []))
            
            # Create governing law relationship
            governing_law = contract_data.get("governing_law")
            if governing_law:
                self._create_governing_law_relationship(created_contract_id, governing_law)
            
            logger.info(f"Successfully stored contract: {created_contract_id}")
            return created_contract_id
            
        except Exception as e:
            logger.error(f"Failed to store contract: {e}")
            raise
    
    def _create_party_relationships(self, contract_id: str, parties: list):
        """Create party nodes and relationships"""
        
        for party_data in parties:
            if not party_data.get("name"):
                continue
                
            party_query = """
            MATCH (c:Contract {file_id: $contract_id})
            MERGE (p:Party {name: $party_name})
            MERGE (p)-[:PARTY_TO {role: $role}]->(c)
            """
            
            party_params = {
                "contract_id": contract_id,
                "party_name": party_data["name"],
                "role": party_data.get("role", "Unknown")
            }
            
            self.graph.query(party_query, party_params)
    
    def _create_governing_law_relationship(self, contract_id: str, governing_law: str):
        """Create governing law relationship"""
        
        gov_law_query = """
        MATCH (c:Contract {file_id: $contract_id})
        MERGE (country:Country {name: $country_name})
        MERGE (c)-[:HAS_GOVERNING_LAW]->(country)
        """
        
        gov_law_params = {
            "contract_id": contract_id,
            "country_name": governing_law
        }
        
        self.graph.query(gov_law_query, gov_law_params)