"""
Migration: Multi-Level Embeddings Schema
Adds support for document, section, clause, and relationship embeddings
"""

from langchain_neo4j import Neo4jGraph
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

def get_neo4j_connection():
    """Get Neo4j connection"""
    return Neo4jGraph(
        refresh_schema=False, 
        driver_config={"notifications_min_severity": "OFF"}
    )

def upgrade_schema():
    """Upgrade database schema to support multi-level embeddings"""
    graph = get_neo4j_connection()
    
    # 1. Add new embedding properties to Contract nodes
    print("Adding new embedding properties to Contract nodes...")
    graph.query("""
        MATCH (c:Contract)
        WHERE c.document_embedding IS NULL
        SET c.document_embedding = c.embedding,
            c.summary_embedding = c.embedding
    """)
    
    # 2. Create Section nodes and relationships
    print("Creating Section node constraints and indexes...")
    graph.query("""
        CREATE CONSTRAINT section_id IF NOT EXISTS
        FOR (s:Section) REQUIRE s.id IS UNIQUE
    """)
    
    graph.query("""
        CREATE INDEX section_embedding IF NOT EXISTS
        FOR (s:Section) ON (s.embedding)
    """)
    
    # 3. Create enhanced Clause nodes
    print("Creating Clause node constraints and indexes...")
    graph.query("""
        CREATE CONSTRAINT clause_id IF NOT EXISTS
        FOR (c:Clause) REQUIRE c.id IS UNIQUE
    """)
    
    graph.query("""
        CREATE INDEX clause_embedding IF NOT EXISTS
        FOR (c:Clause) ON (c.embedding)
    """)
    
    graph.query("""
        CREATE INDEX clause_type IF NOT EXISTS
        FOR (c:Clause) ON (c.clause_type)
    """)
    
    # 4. Add embedding properties to relationships
    print("Adding embedding properties to PARTY_TO relationships...")
    graph.query("""
        MATCH ()-[r:PARTY_TO]->()
        WHERE r.embedding IS NULL
        SET r.embedding = []
    """)
    
    # 5. Create indexes for new embedding properties
    print("Creating indexes for new embedding properties...")
    graph.query("""
        CREATE INDEX contract_document_embedding IF NOT EXISTS
        FOR (c:Contract) ON (c.document_embedding)
    """)
    
    graph.query("""
        CREATE INDEX contract_summary_embedding IF NOT EXISTS
        FOR (c:Contract) ON (c.summary_embedding)
    """)
    
    print("Schema upgrade completed successfully!")

def downgrade_schema():
    """Downgrade schema (remove multi-level embedding support)"""
    graph = get_neo4j_connection()
    
    print("Removing multi-level embedding schema...")
    
    # Remove Section nodes
    graph.query("MATCH (s:Section) DETACH DELETE s")
    
    # Remove Clause nodes
    graph.query("MATCH (c:Clause) DETACH DELETE c")
    
    # Remove new embedding properties
    graph.query("""
        MATCH (c:Contract)
        REMOVE c.document_embedding, c.summary_embedding
    """)
    
    # Remove embedding from relationships
    graph.query("""
        MATCH ()-[r:PARTY_TO]->()
        REMOVE r.embedding
    """)
    
    print("Schema downgrade completed!")

def create_sample_data():
    """Create sample multi-level embedding data for testing"""
    graph = get_neo4j_connection()
    
    print("Creating sample multi-level embedding data...")
    
    # Sample Section
    graph.query("""
        MATCH (c:Contract) 
        WHERE c.file_id IS NOT NULL
        WITH c LIMIT 1
        CREATE (s:Section {
            id: c.file_id + "_section_1",
            section_type: "payment",
            content: "Payment terms: Net 30 days from invoice date",
            embedding: [0.1, 0.2, 0.3],
            order: 1
        })
        CREATE (c)-[:HAS_SECTION]->(s)
    """)
    
    # Sample Clause
    graph.query("""
        MATCH (c:Contract) 
        WHERE c.file_id IS NOT NULL
        WITH c LIMIT 1
        CREATE (cl:Clause {
            id: c.file_id + "_clause_1",
            clause_type: "Payment Terms",
            content: "Payment shall be made within thirty (30) days",
            embedding: [0.4, 0.5, 0.6],
            confidence: 0.85,
            start_position: 100,
            end_position: 200
        })
        CREATE (c)-[:CONTAINS_CLAUSE]->(cl)
    """)
    
    print("Sample data created successfully!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "upgrade":
            upgrade_schema()
        elif command == "downgrade":
            downgrade_schema()
        elif command == "sample":
            create_sample_data()
        else:
            print("Usage: python 001_multi_level_embeddings.py [upgrade|downgrade|sample]")
    else:
        print("Usage: python 001_multi_level_embeddings.py [upgrade|downgrade|sample]")