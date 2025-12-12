# Enhanced Multi-Level Embeddings System

This system provides comprehensive multi-level embedding support for contract analysis, enabling semantic search at document, section, clause, and relationship levels.

## Architecture Overview

```
Document Upload
      ↓
EmbeddingOrchestrator
      ↓
┌─────────────────┬─────────────────┬─────────────────┐
│ DocumentAgent   │ ClauseAgent     │ RelationshipAgent│
│ - Full doc      │ - 41 CUAD types │ - Party contexts │
│ - Sections      │ - Pattern match │ - Gov law links │
└─────────────────┴─────────────────┴─────────────────┘
      ↓
Neo4j Multi-Level Storage
      ↓
Enhanced Search API
```

## Components

### 1. Embedding Strategies
- **DocumentEmbeddingStrategy**: Full document and section embeddings
- **ClauseEmbeddingStrategy**: CUAD clause type embeddings  
- **RelationshipEmbeddingStrategy**: Party and governing law embeddings

### 2. Embedding Agents
- **DocumentEmbeddingAgent**: Hierarchical document processing
- **ClauseEmbeddingAgent**: Pattern-based clause extraction
- **RelationshipEmbeddingAgent**: Relationship context extraction

### 3. Orchestration
- **EmbeddingOrchestrator**: Coordinates multi-agent processing
- **Command Pattern**: Modular processing pipeline
- **Validation**: Quality assurance for embeddings

## Usage

### 1. Run Schema Migration
```bash
cd backend
python run_migration.py upgrade
```

### 2. Migrate Existing Contracts
```bash
python run_migration.py migrate_contracts 5  # batch size of 5
```

### 3. Use Enhanced Search API
```python
# Document level search
POST /api/contracts/search/enhanced
{
  "search_level": "document",
  "query": "termination clauses"
}

# Clause level search
POST /api/contracts/search/clauses
{
  "clause_types": ["Termination For Convenience", "Governing Law"],
  "query": "30 day notice"
}

# Section level search
POST /api/contracts/search/sections
{
  "section_types": ["payment", "liability"],
  "query": "net 30 days"
}
```

## Database Schema

### Enhanced Contract Node
```cypher
(Contract {
  embedding: vector,           // Original summary
  document_embedding: vector,  // Full document
  summary_embedding: vector    // Dedicated summary
})
```

### New Section Nodes
```cypher
(Contract)-[:HAS_SECTION]->(Section {
  section_type: string,
  content: string,
  embedding: vector,
  order: int
})
```

### Enhanced Clause Nodes
```cypher
(Contract)-[:CONTAINS_CLAUSE]->(Clause {
  clause_type: string,         // CUAD type
  content: string,
  embedding: vector,
  confidence: float,
  start_position: int,
  end_position: int
})
```

### Relationship Embeddings
```cypher
()-[rel:PARTY_TO {
  embedding: vector,
  context: string
}]->()
```

## Search Capabilities

### 1. Document Level
- Full contract semantic search
- Section-based filtering
- Hierarchical content matching

### 2. Clause Level  
- 41 CUAD clause type search
- Pattern-based extraction
- Confidence scoring

### 3. Relationship Level
- Party role context search
- Governing law relationships
- Semantic relationship matching

## Frontend Integration

### Search Components
- **SearchLevelSelector**: Choose search granularity
- **ClauseTypeFilter**: Select from 41 CUAD types
- **SectionTypeFilter**: Filter by section types

### API Integration
```typescript
// Enhanced search with multiple levels
const searchResults = await fetch('/api/contracts/search/enhanced', {
  method: 'POST',
  body: JSON.stringify({
    search_level: 'clause',
    clause_types: ['Termination For Convenience'],
    query: 'thirty day notice period'
  })
});
```

## Migration & Rollback

### Upgrade Schema
```bash
python run_migration.py upgrade
```

### Migrate Contracts
```bash
python run_migration.py migrate_contracts
```

### Rollback
```bash
python run_migration.py rollback
```

## Benefits

1. **Granular Search**: Find specific clauses, sections, or relationships
2. **Semantic Understanding**: AI-powered meaning-based search
3. **CUAD Compliance**: Support for all 41 legal clause types
4. **Scalable Architecture**: Modular, extensible design
5. **Quality Assurance**: Built-in validation and error handling

## Example Use Cases

- "Find all termination clauses with 30-day notice periods"
- "Show payment terms sections across all MSAs"
- "Contracts where Acme Corp is the primary vendor"
- "Liability limitations in software licensing agreements"