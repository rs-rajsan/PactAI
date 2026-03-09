# Agentic GraphRAG on Commercial Contracts

This repository implements an enterprise-grade **Multi-Agent Contract Intelligence Platform** using LangGraph, Neo4j, and Gemini. It automates legal review, policy compliance checking, and risk assessment for commercial contracts (CUAD).

## ⚠️ The Problem

Enterprise contract review is traditionally a slow, manual, and error-prone process. Legal teams face several critical challenges:
- **Volume & Complexity**: Reviewing hundreds of multi-page contracts for specific clauses is time-consuming.
- **Inconsistency**: Manual reviews often miss subtle deviations from company policy or jurisdictional nuances.
- **Hidden Risks**: Identifying "merged" clauses or missing critical protections requires deep expertise and extreme focus.
- **Lack of Precedents**: Finding similar clauses across thousands of historical documents is nearly impossible without advanced search.

## 💡 The Solution

This platform solves these challenges by combining **Graph Databases** with **Agentic AI** to create a system that thinks and reasons like a legal expert:
- **Autonomous Review**: 11+ specialized agents work together to extract, validate, and risk-rate clauses automatically.
- **Graph-Based Intelligence**: Neo4j stores multi-level relationships (Document → Section → Clause), enabling the system to understand context, not just keywords.
- **Explainable AI**: Every decision includes a "Chain-of-Thought" reasoning trace and a quality grade (A-F), giving legal teams confidence in the output.
- **Advanced RAG**: Beyond simple search, the system performs precedent lookup and historical analysis to ensure consistency across the entire contract repository.

See blog for more: [Agentic GraphRAG for Commercial Contracts](https://towardsdatascience.com/agentic-graphrag-for-commercial-contracts/)

![](https://cdn-images-1.medium.com/max/800/1*R57-KUW9zvXhx5VucKEMLA.png)

## 🚀 Enterprise Features

- **Multi-Agent System Design**: Orchestrates 11+ specialized agents including PDF Processing, Supervisor, Planning, Clause Extraction, and Risk Assessment.
- **Supervisor Pattern**: Enterprise-grade coordination with quality gates, error recovery, and A-F grading system.
- **Autonomous Planning**: Dynamically generates and adopts execution strategies based on query complexity.
- **Multi-Level Semantic Search**: Contextual retrieval at document, section, clause, and relationship levels.
- **Policy Compliance Engine**: Automated violation detection against custom policy playbooks.

## 🧠 Advanced AI Patterns

- **ReACT Pattern**: Reasoning-Action-Observation cycles for iterative problem-solving in contract analysis.
- **Chain-of-Thought (CoT)**: Explicit step-by-step reasoning documentation for transparent AI decision-making.
- **Advanced RAG**: Sophisticated retrieval with precedent lookup and multi-level embedding matching.
- **Self-Reflection**: Inter-agent validation and recursive plan refinement.

## 🛠️ Technical Stack

- **AI Framework**: LangChain + LangGraph for agent workflows and orchestration.
- **Database**: Neo4j Aura with vector indexing for graph-based knowledge storage.
- **Embeddings**: **Gemini 1536-dimensional** high-precision vectors (`gemini-embedding-001`).
- **LLM Providers**: Optimized for Google Gemini 1.5 Pro/Flash, supporting OpenAI and Claude.
- **Backend/Frontend**: FastAPI (Async Python) and React + TypeScript with Vite.

## 📄 About CUAD

The [Contract Understanding Atticus Dataset (CUAD)](https://www.atticusprojectai.org/cuad) consists of 500 contracts with annotations for 41 legal clauses. This project extends CUAD analysis to handle custom provisions and complex legal patterns.

## ⚙️ Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rs-rajsan/PactAI.git
   cd PactAI
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Add your GOOGLE_API_KEY and NEO4J_URI
   ```

3. **Start with Docker**:
   ```bash
   docker-compose up
   ```

4. **Initialize Metadata** (Optional):
   ```bash
   python update_contract_types.py
   ```
