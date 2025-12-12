import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
// Simple Badge component
const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline'; className?: string }> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-slate-100 text-slate-800', 
    outline: 'border border-slate-200 text-slate-700'
  };
  return <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>{children}</span>;
};
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Bot, 
  FileText, 
  Shield, 
  AlertTriangle, 
  Edit3, 
  Brain,
  ArrowRight,
  MessageSquare,
  Upload,
  BarChart3,
  CheckCircle,
  Clock,
  Zap,
  Users
} from 'lucide-react';

const getAgentTools = (agentId: string): string => {
  const toolMappings: Record<string, string> = {
    'pdf-processing': 'PDFTextExtractorTool, ContractAnalyzerTool, DataValidatorTool',
    'planning': 'ContractSearchTool, EnhancedContractSearchTool (for analysis planning)',
    'document-embedding': 'GoogleGenerativeAIEmbeddings, DocumentEmbeddingStrategy, Neo4j Vector Storage',
    'clause-extraction': 'ClauseDetectorTool, PolicyCheckerTool, ContractAnalyzerTool',
    'relationship-embedding': 'RelationshipEmbeddingStrategy, Neo4j Graph Queries, Entity Extraction Tools',
    'policy-compliance': 'PolicyCheckerTool, CompanyPolicyRules, ViolationDetector',
    'risk-assessment': 'RiskCalculatorTool, PolicyViolationAnalyzer, RiskScoring',
    'redline-generation': 'RedlineGeneratorTool, PolicyTemplates, TextDiffAlgorithms',
    'embedding-validator': 'EmbeddingValidator, DimensionChecker, ConsistencyValidator',
    'migration-agent': 'Neo4jMigrator, SchemaUpgrader, BatchProcessor'
  };
  return toolMappings[agentId] || 'ContractSearchTool, EnhancedContractSearchTool';
};

const agents = [
  {
    id: 'pdf-processing',
    name: 'PDF Processing Agent',
    icon: <FileText className="w-6 h-6" />,
    role: 'Document Ingestion',
    description: 'Extracts text and metadata from uploaded PDF contracts with enhanced multi-level processing',
    capabilities: ['PDF text extraction', 'OCR processing', 'Contract structure analysis', 'Metadata extraction', 'Multi-level embedding generation'],
    input: 'Raw PDF files',
    output: 'Structured contract text + metadata + embeddings',
    color: 'bg-blue-500'
  },
  {
    id: 'planning',
    name: 'Autonomous Planning Agent',
    icon: <Brain className="w-6 h-6" />,
    role: 'Workflow Orchestration',
    description: 'Analyzes queries and creates optimal execution plans for contract analysis',
    capabilities: ['Query complexity analysis', 'Strategy selection', 'Execution planning', 'Self-reflection'],
    input: 'Analysis requirements',
    output: 'Optimized execution plan',
    color: 'bg-purple-500'
  },
  {
    id: 'document-embedding',
    name: 'Document Embedding Agent',
    icon: <FileText className="w-6 h-6" />,
    role: 'Semantic Processing',
    description: 'Generates hierarchical embeddings for full documents and sections using Google AI',
    capabilities: ['Document-level embeddings', 'Section identification', 'Hierarchical processing', 'Semantic representation'],
    input: 'Contract text + metadata',
    output: 'Document & section embeddings (768-dim vectors)',
    color: 'bg-cyan-500'
  },
  {
    id: 'clause-extraction',
    name: 'Clause Extraction Agent',
    icon: <Bot className="w-6 h-6" />,
    role: 'Content Analysis',
    description: 'Identifies and extracts 41 CUAD clause types with embeddings and confidence scores',
    capabilities: ['41 CUAD clause types', 'Pattern matching', 'Confidence scoring', 'Clause embeddings', 'Position tracking'],
    input: 'Contract text',
    output: 'Structured clause data + embeddings + confidence scores',
    color: 'bg-green-500'
  },
  {
    id: 'relationship-embedding',
    name: 'Relationship Embedding Agent',
    icon: <Users className="w-6 h-6" />,
    role: 'Relationship Analysis',
    description: 'Extracts and embeds party relationships and governing law contexts',
    capabilities: ['Party role extraction', 'Governing law identification', 'Relationship context embedding', 'Entity linking'],
    input: 'Contract text + entities',
    output: 'Relationship embeddings + context metadata',
    color: 'bg-teal-500'
  },
  {
    id: 'policy-compliance',
    name: 'Policy Compliance Agent',
    icon: <Shield className="w-6 h-6" />,
    role: 'Compliance Validation',
    description: 'Validates contract clauses against company policies and regulations',
    capabilities: ['Company policy checking', 'Violation detection', 'Severity assessment', 'Compliance scoring'],
    input: 'Extracted clauses',
    output: 'Policy violations with severity levels',
    color: 'bg-orange-500'
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment Agent',
    icon: <AlertTriangle className="w-6 h-6" />,
    role: 'Risk Analysis',
    description: 'Calculates overall contract risk scores and provides recommendations',
    capabilities: ['Risk score calculation', 'Critical issue identification', 'Recommendation generation', 'Risk level classification'],
    input: 'Clauses + Policy violations',
    output: 'Risk assessment with recommendations',
    color: 'bg-red-500'
  },
  {
    id: 'redline-generation',
    name: 'Redline Generation Agent',
    icon: <Edit3 className="w-6 h-6" />,
    role: 'Contract Optimization',
    description: 'Generates contract redline suggestions based on policy violations',
    capabilities: ['Redline text generation', 'Priority assignment', 'Justification creation', 'Alternative language suggestions'],
    input: 'Policy violations',
    output: 'Redline suggestions with priorities',
    color: 'bg-indigo-500'
  },
  {
    id: 'embedding-validator',
    name: 'Embedding Validation Agent',
    icon: <CheckCircle className="w-6 h-6" />,
    role: 'Quality Assurance',
    description: 'Validates embedding quality, consistency, and dimensional accuracy',
    capabilities: ['Dimension validation', 'Consistency checks', 'Duplicate detection', 'Quality scoring'],
    input: 'Generated embeddings',
    output: 'Validation results + quality metrics',
    color: 'bg-emerald-500'
  },
  {
    id: 'migration-agent',
    name: 'Database Migration Agent',
    icon: <BarChart3 className="w-6 h-6" />,
    role: 'Schema Management',
    description: 'Manages database schema upgrades and contract migration to enhanced embeddings',
    capabilities: ['Schema upgrades', 'Batch migration', 'Rollback support', 'Data integrity checks'],
    input: 'Migration commands',
    output: 'Migration status + statistics',
    color: 'bg-slate-500'
  }
];

const workflows = {
  storage: {
    title: 'Document Upload & Dataset Storage',
    icon: <FileText className="w-8 h-8" />,
    description: 'Complete flow for storing uploaded documents in searchable dataset',
    steps: [
      { agent: 'Document Upload', description: 'PDF validation and preprocessing', icon: <Upload className="w-5 h-5" />, tech: 'FastAPI, Pydantic validation, file size limits' },
      { agent: 'PDF Processing Agent', description: 'Text extraction and OCR processing', icon: <FileText className="w-5 h-5" />, tech: 'PyPDF2, pdfplumber, Tesseract OCR' },
      { agent: 'Clause Extraction Agent', description: 'Extract 41 CUAD clause types', icon: <Bot className="w-5 h-5" />, tech: 'LangChain, Gemini/OpenAI LLMs, spaCy NLP' },
      { agent: 'Knowledge Graph Storage', description: 'Store in Neo4j with relationships', icon: <CheckCircle className="w-5 h-5" />, tech: 'Neo4j Aura, py2neo driver, Cypher queries' },
      { agent: 'Multi-Level Embedding Generation', description: 'Create hierarchical embeddings for semantic search', icon: <Zap className="w-5 h-5" />, tech: 'Google text-embedding-004, Neo4j vector indexing' },
      { agent: 'Dataset Integration', description: 'Add to searchable contract corpus with embeddings', icon: <BarChart3 className="w-5 h-5" />, tech: 'Neo4j graph storage, vector similarity indexing' }
    ]
  },
  chat: {
    title: 'Contract Search & Chat',
    icon: <MessageSquare className="w-8 h-8" />,
    description: 'Natural language search and analysis of existing contracts',
    steps: [
      { agent: 'User Query', description: 'Natural language contract search', icon: <MessageSquare className="w-5 h-5" />, tech: 'React frontend, WebSocket connections' },
      { agent: 'Search Processing', description: 'Query analysis and vector search', icon: <Bot className="w-5 h-5" />, tech: 'LangChain query processing, similarity search' },
      { agent: 'Contract Retrieval', description: 'Semantic matching from Neo4j database', icon: <FileText className="w-5 h-5" />, tech: 'Neo4j graph traversal, vector similarity' },
      { agent: 'Response Generation', description: 'Contextual answer with contract references', icon: <CheckCircle className="w-5 h-5" />, tech: 'LangChain RAG, Gemini/Claude LLMs' }
    ]
  },
  search: {
    title: 'Enhanced Multi-Level Search',
    icon: <MessageSquare className="w-8 h-8" />,
    description: 'Advanced semantic search across document, section, clause, and relationship levels',
    steps: [
      { agent: 'Query Processing', description: 'Analyze search intent and level', icon: <Brain className="w-5 h-5" />, tech: 'Query analysis, intent classification' },
      { agent: 'Embedding Generation', description: 'Convert query to 768-dim vector', icon: <Zap className="w-5 h-5" />, tech: 'Google text-embedding-004 API' },
      { agent: 'Multi-Level Search', description: 'Search documents, sections, clauses, relationships', icon: <BarChart3 className="w-5 h-5" />, tech: 'Neo4j vector similarity, cosine distance' },
      { agent: 'Result Ranking', description: 'Rank and merge results by relevance', icon: <CheckCircle className="w-5 h-5" />, tech: 'Similarity scoring, result fusion' }
    ]
  },
  orchestration: {
    title: 'Embedding Orchestration Pipeline',
    icon: <Zap className="w-8 h-8" />,
    description: 'Multi-agent embedding generation and validation workflow',
    steps: [
      { agent: 'Document Embedding Agent', description: 'Generate document & section embeddings', icon: <FileText className="w-5 h-5" />, tech: 'Google text-embedding-004, hierarchical processing' },
      { agent: 'Clause Embedding Agent', description: 'Extract & embed 41 CUAD clause types', icon: <Bot className="w-5 h-5" />, tech: 'Pattern matching, confidence scoring' },
      { agent: 'Relationship Embedding Agent', description: 'Extract & embed party relationships', icon: <Users className="w-5 h-5" />, tech: 'Entity extraction, context embedding' },
      { agent: 'Embedding Validator', description: 'Validate quality & consistency', icon: <CheckCircle className="w-5 h-5" />, tech: 'Dimension checks, similarity validation' },
      { agent: 'Neo4j Storage', description: 'Store multi-level embeddings', icon: <BarChart3 className="w-5 h-5" />, tech: 'Graph database, vector indexing' }
    ]
  },
  analysis: {
    title: 'Contract Intelligence Analysis',
    icon: <BarChart3 className="w-8 h-8" />,
    description: 'Comprehensive multi-agent contract analysis workflow',
    steps: [
      { agent: 'Planning Agent', description: 'Create optimal execution plan', icon: <Brain className="w-5 h-5" />, tech: 'LangGraph workflows, strategy patterns' },
      { agent: 'Clause Extraction Agent', description: 'Extract key contract clauses', icon: <Bot className="w-5 h-5" />, tech: 'Named Entity Recognition, regex patterns' },
      { agent: 'Policy Compliance Agent', description: 'Check against company policies', icon: <Shield className="w-5 h-5" />, tech: 'Rule engine, policy templates, scoring' },
      { agent: 'Risk Assessment Agent', description: 'Calculate risk scores', icon: <AlertTriangle className="w-5 h-5" />, tech: 'Risk matrices, weighted scoring algorithms' },
      { agent: 'Redline Generation Agent', description: 'Generate improvement suggestions', icon: <Edit3 className="w-5 h-5" />, tech: 'Text diff algorithms, suggestion templates' }
    ]
  }
};

export const AgentsPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center bg-white rounded-lg p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">AI Agent Architecture</h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Explore our multi-agent system that powers intelligent contract analysis through 
          specialized AI agents working together in coordinated workflows.
        </p>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="architecture">Tech Stack</TabsTrigger>
          <TabsTrigger value="production">Prototype to Production</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card 
                key={agent.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedAgent === agent.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${agent.color} text-white`}>
                      {agent.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{agent.role}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{agent.description}</p>
                  
                  {selectedAgent === agent.id && (
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Capabilities</h4>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.map((cap, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{cap}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Input:</span>
                          <p className="text-slate-600">{agent.input}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Output:</span>
                          <p className="text-slate-600">{agent.output}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Tools Used</h4>
                        <div className="bg-slate-50 rounded p-2 text-xs text-slate-600">
                          {getAgentTools(agent.id)}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          {Object.entries(workflows).map(([key, workflow]) => (
            <Card 
              key={key} 
              className={`overflow-hidden cursor-pointer transition-all duration-200 ${
                activeWorkflow === key ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => setActiveWorkflow(activeWorkflow === key ? null : key)}
            >
              <CardHeader className="bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 text-white rounded-lg">
                      {workflow.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{workflow.title}</CardTitle>
                      <p className="text-slate-600">{workflow.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Click to expand</Badge>
                </div>
              </CardHeader>
              {activeWorkflow === key && (
                <CardContent className="p-6 border-t">
                  <div className="flex items-center justify-between">
                    {workflow.steps.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col items-center text-center max-w-32">
                          <div className="p-3 bg-slate-100 rounded-full mb-2 hover:bg-blue-100 transition-colors">
                            {step.icon}
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{step.agent}</h4>
                          <p className="text-xs text-slate-600 mb-2">{step.description}</p>
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border">
                            {step.tech}
                          </div>
                        </div>
                        {idx < workflow.steps.length - 1 && (
                          <ArrowRight className="w-5 h-5 text-slate-400 mx-2 animate-pulse" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-center">
                      <Badge variant="secondary">
                        {key === 'storage' && 'Automatic: Happens when you upload any document'}
                        {key === 'chat' && 'Try it: Go to Contract Search'}
                        {key === 'search' && 'Try it: Use enhanced search with granular filters'}
                        {key === 'orchestration' && 'Automatic: Multi-level embedding generation'}
                        {key === 'analysis' && 'Try it: Upload PDF → Click Analyze'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Technology Stack</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Frontend:</span>
                      <Badge>React + TypeScript</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Backend:</span>
                      <Badge>FastAPI + Python</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Framework:</span>
                      <Badge>LangChain + LangGraph</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Database:</span>
                      <Badge>Neo4j Aura + Vector Search</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Embeddings:</span>
                      <Badge>Google text-embedding-004</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>LLM Providers:</span>
                      <Badge>Gemini, OpenAI, Claude</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>PDF Processing:</span>
                      <Badge>PyPDF2 + pdfplumber + OCR</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Enhanced Frontend Components</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Search Interface:</span>
                      <Badge variant="outline">Multi-Level Search Selector</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Clause Filters:</span>
                      <Badge variant="outline">41 CUAD Type Checkboxes</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Section Filters:</span>
                      <Badge variant="outline">6 Section Type Categories</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Results Display:</span>
                      <Badge variant="outline">Multi-Level Result Visualization</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>API Integration:</span>
                      <Badge variant="outline">Enhanced Search Service</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Enhanced Backend Features</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Multi-Level Embeddings:</span>
                      <Badge variant="outline">Document + Section + Clause + Relationship</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>CUAD Compliance:</span>
                      <Badge variant="outline">41 Legal Clause Types</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Semantic Search:</span>
                      <Badge variant="outline">Cosine Similarity + Vector DB</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Assurance:</span>
                      <Badge variant="outline">Embedding Validation + Consistency</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Architecture Patterns:</span>
                      <Badge variant="outline">Strategy + Factory + Command</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Migration & Database Schema</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Enhanced Neo4j Schema</h4>
                      <div className="space-y-1 text-xs text-slate-600">
                        <div>Contract: document_embedding, summary_embedding</div>
                        <div>Section: section_type, content, embedding, order</div>
                        <div>Clause: clause_type, embedding, confidence</div>
                        <div>Relationship: embedding, context</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Migration Tools</h4>
                      <div className="space-y-1 text-xs text-slate-600">
                        <div>Schema upgrade/downgrade scripts</div>
                        <div>Batch contract migration</div>
                        <div>Embedding validation & quality checks</div>
                        <div>Rollback capabilities</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Enhanced Search Capabilities</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Document-Level Search</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-green-500" />
                      <span>Section-Level Search</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-purple-500" />
                      <span>Clause-Level Search (41 CUAD Types)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      <span>Relationship-Level Search</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-center space-x-4 text-xs text-slate-600">
                      <span>768-dimensional embeddings</span>
                      <span>•</span>
                      <span>Cosine similarity matching</span>
                      <span>•</span>
                      <span>Real-time semantic search</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Enhanced API Endpoints</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Enhanced Search APIs</h4>
                      <div className="space-y-1 text-xs text-slate-600">
                        <div>POST /api/contracts/search/enhanced</div>
                        <div>POST /api/contracts/search/clauses</div>
                        <div>POST /api/contracts/search/sections</div>
                        <div>POST /api/contracts/search/relationships</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Enhanced Upload APIs</h4>
                      <div className="space-y-1 text-xs text-slate-600">
                        <div>POST /documents/enhanced/upload</div>
                        <div>GET /documents/enhanced/embedding-status</div>
                        <div>GET /api/contracts/search/clause-types</div>
                        <div>GET /api/contracts/search/section-types</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Production Readiness Roadmap</CardTitle>
              <p className="text-slate-600">High-level requirements to transform prototype into enterprise-ready solution</p>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* AI/ML Enhancement */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI/ML Enhancement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-purple-700">Fine-Tuning & LoRA</h4>
                    <p className="text-sm text-slate-600">Custom legal domain adaptation for contract-specific terminology and clause understanding</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-purple-700">MCP Integration</h4>
                    <p className="text-sm text-slate-600">Model Context Protocol for standardized AI model interactions and context management</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-purple-700">Explainability</h4>
                    <p className="text-sm text-slate-600">AI decision transparency, confidence scoring, and reasoning traces for legal compliance</p>
                  </div>
                </div>
              </div>

              {/* Security & Compliance */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Security & Compliance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-red-700">Authentication/Authorization</h4>
                    <p className="text-sm text-slate-600">Multi-tenant access control, role-based permissions, SSO integration</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-red-700">Data Security</h4>
                    <p className="text-sm text-slate-600">End-to-end encryption, secure key management, PII/PHI protection</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-red-700">Legal Compliance</h4>
                    <p className="text-sm text-slate-600">GDPR, SOX, industry-specific regulations, audit trails</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-red-700">Data Masking</h4>
                    <p className="text-sm text-slate-600">Sensitive information redaction, anonymization for non-production environments</p>
                  </div>
                </div>
              </div>

              {/* Infrastructure & Scalability */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Infrastructure & Scalability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-blue-700">Deployment</h4>
                    <p className="text-sm text-slate-600">Container orchestration (Kubernetes), CI/CD pipelines, blue-green deployments</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-blue-700">Cache & Queue</h4>
                    <p className="text-sm text-slate-600">Redis/ElastiCache for performance, message queues for async processing</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-blue-700">Load Balancing</h4>
                    <p className="text-sm text-slate-600">Auto-scaling, geographic distribution, failover mechanisms</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-blue-700">Database</h4>
                    <p className="text-sm text-slate-600">Production-grade Neo4j clustering, backup/recovery strategies</p>
                  </div>
                </div>
              </div>

              {/* Monitoring & Governance */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Monitoring & Governance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-green-700">Observability</h4>
                    <p className="text-sm text-slate-600">Comprehensive logging, metrics, distributed tracing, alerting</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-green-700">Performance Monitoring</h4>
                    <p className="text-sm text-slate-600">Response times, throughput, resource utilization</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-green-700">AI Governance</h4>
                    <p className="text-sm text-slate-600">Model versioning, A/B testing, bias detection, performance drift monitoring</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-green-700">Business Intelligence</h4>
                    <p className="text-sm text-slate-600">Usage analytics, contract processing metrics, ROI tracking</p>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Data Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-orange-700">Data Pipeline</h4>
                    <p className="text-sm text-slate-600">ETL processes, data validation, quality assurance</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-orange-700">Data Cleaning</h4>
                    <p className="text-sm text-slate-600">Automated preprocessing, duplicate detection, format standardization</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-orange-700">Backup & Recovery</h4>
                    <p className="text-sm text-slate-600">Automated preprocessing, duplicate detection, format standardization</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-orange-700">Data Lifecycle</h4>
                    <p className="text-sm text-slate-600">Retention policies, archival strategies, compliance deletion</p>
                  </div>
                </div>
              </div>

              {/* Safety & Risk Management */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Safety & Risk Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-yellow-700">Error Handling</h4>
                    <p className="text-sm text-slate-600">Graceful degradation, circuit breakers, retry mechanisms</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-yellow-700">Safety Guardrails</h4>
                    <p className="text-sm text-slate-600">Content filtering, output validation, hallucination detection</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-yellow-700">Business Continuity</h4>
                    <p className="text-sm text-slate-600">Disaster recovery, incident response procedures</p>
                  </div>
                </div>
              </div>

              {/* Testing & LLM Evaluation */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  Testing & LLM Evaluation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-indigo-700">LLM Evaluation Framework</h4>
                    <p className="text-sm text-slate-600">CUAD benchmark testing, accuracy metrics, legal clause precision/recall scoring</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-indigo-700">Automated Testing</h4>
                    <p className="text-sm text-slate-600">Unit tests, integration tests, end-to-end contract processing validation</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-indigo-700">Performance Testing</h4>
                    <p className="text-sm text-slate-600">Load testing, latency benchmarks, concurrent user simulation, embedding generation speed</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-indigo-700">Legal Accuracy Validation</h4>
                    <p className="text-sm text-slate-600">Expert legal review, ground truth comparison, hallucination detection, confidence calibration</p>
                  </div>
                </div>
              </div>

              {/* Ethics & Responsible AI */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-600" />
                  Ethics & Responsible AI
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-pink-700">Bias Detection & Mitigation</h4>
                    <p className="text-sm text-slate-600">Fairness testing across contract types, demographic bias analysis, equitable AI outcomes</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-pink-700">Transparency & Explainability</h4>
                    <p className="text-sm text-slate-600">Decision reasoning, confidence scores, human-interpretable AI outputs, audit trails</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-pink-700">Human-AI Collaboration</h4>
                    <p className="text-sm text-slate-600">Human-in-the-loop workflows, AI assistance not replacement, legal professional oversight</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium mb-2 text-pink-700">Ethical Guidelines & Governance</h4>
                    <p className="text-sm text-slate-600">AI ethics board, responsible AI policies, legal profession standards, continuous monitoring</p>
                  </div>
                </div>
              </div>

              {/* Implementation Priority */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Implementation Priority Matrix</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-red-700 mb-2">Phase 1: Architecture & Foundation (0-3 months)</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Fine-tuning & LoRA</li>
                      <li>• MCP Integration</li>
                      <li>• LLM Evaluation Framework</li>
                      <li>• Bias Detection Framework</li>
                      <li>• Transparency & Explainability</li>
                      <li>• Automated Testing Suite</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-yellow-700 mb-2">Phase 2: Production & Compliance (3-6 months)</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Ethical Guidelines & Governance</li>
                      <li>• Human-AI Collaboration Workflows</li>
                      <li>• Performance Testing</li>
                      <li>• Legal Accuracy Validation</li>
                      <li>• Production Deployment</li>
                      <li>• Data Masking & Compliance</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-green-700 mb-2">Phase 3: Intelligence & Optimization (6+ months)</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Advanced AI Governance</li>
                      <li>• Business Intelligence</li>
                      <li>• Performance Optimization</li>
                      <li>• Continuous Ethics Monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};