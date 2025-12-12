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
  Zap
} from 'lucide-react';

const agents = [
  {
    id: 'pdf-processing',
    name: 'PDF Processing Agent',
    icon: <FileText className="w-6 h-6" />,
    role: 'Document Ingestion',
    description: 'Extracts text and metadata from uploaded PDF contracts',
    capabilities: ['PDF text extraction', 'Contract structure analysis', 'Metadata extraction', 'File validation'],
    input: 'Raw PDF files',
    output: 'Structured contract text + metadata',
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
    id: 'clause-extraction',
    name: 'Clause Extraction Agent',
    icon: <Bot className="w-6 h-6" />,
    role: 'Content Analysis',
    description: 'Identifies and extracts key contract clauses with confidence scores',
    capabilities: ['Payment terms detection', 'Liability clause extraction', 'IP ownership identification', 'Termination clause analysis'],
    input: 'Contract text',
    output: 'Structured clause data with confidence scores',
    color: 'bg-green-500'
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
  }
];

const workflows = {
  storage: {
    title: 'Document Upload & Dataset Storage',
    icon: <FileText className="w-8 h-8" />,
    description: 'Complete flow for storing uploaded documents in searchable dataset',
    steps: [
      { agent: 'Document Upload', description: 'PDF validation and preprocessing', icon: <Upload className="w-5 h-5" /> },
      { agent: 'PDF Processing Agent', description: 'Text extraction and OCR processing', icon: <FileText className="w-5 h-5" /> },
      { agent: 'Clause Extraction Agent', description: 'Extract 41 CUAD clause types', icon: <Bot className="w-5 h-5" /> },
      { agent: 'Knowledge Graph Storage', description: 'Store in Neo4j with relationships', icon: <CheckCircle className="w-5 h-5" /> },
      { agent: 'Vector Database Indexing', description: 'Create embeddings for semantic search', icon: <Zap className="w-5 h-5" /> },
      { agent: 'Dataset Integration', description: 'Add to searchable contract corpus', icon: <BarChart3 className="w-5 h-5" /> }
    ]
  },
  chat: {
    title: 'Contract Search & Chat',
    icon: <MessageSquare className="w-8 h-8" />,
    description: 'Natural language search and analysis of existing contracts',
    steps: [
      { agent: 'User Query', description: 'Natural language contract search', icon: <MessageSquare className="w-5 h-5" /> },
      { agent: 'Search Processing', description: 'Query analysis and vector search', icon: <Bot className="w-5 h-5" /> },
      { agent: 'Contract Retrieval', description: 'Semantic matching from Neo4j database', icon: <FileText className="w-5 h-5" /> },
      { agent: 'Response Generation', description: 'Contextual answer with contract references', icon: <CheckCircle className="w-5 h-5" /> }
    ]
  },
  analysis: {
    title: 'Contract Intelligence Analysis',
    icon: <BarChart3 className="w-8 h-8" />,
    description: 'Comprehensive multi-agent contract analysis workflow',
    steps: [
      { agent: 'Planning Agent', description: 'Create optimal execution plan', icon: <Brain className="w-5 h-5" /> },
      { agent: 'Clause Extraction Agent', description: 'Extract key contract clauses', icon: <Bot className="w-5 h-5" /> },
      { agent: 'Policy Compliance Agent', description: 'Check against company policies', icon: <Shield className="w-5 h-5" /> },
      { agent: 'Risk Assessment Agent', description: 'Calculate risk scores', icon: <AlertTriangle className="w-5 h-5" /> },
      { agent: 'Redline Generation Agent', description: 'Generate improvement suggestions', icon: <Edit3 className="w-5 h-5" /> }
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="architecture">Tech Stack</TabsTrigger>
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
                          <p className="text-xs text-slate-600">{step.description}</p>
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
                      <Badge>Neo4j Aura</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>LLM Providers:</span>
                      <Badge>Gemini, OpenAI, Claude</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Design Patterns</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Architecture:</span>
                      <Badge variant="outline">Multi-Agent System</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Orchestration:</span>
                      <Badge variant="outline">LangGraph Workflows</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>State Management:</span>
                      <Badge variant="outline">TypedDict + Context</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Handling:</span>
                      <Badge variant="outline">Circuit Breaker + Retry</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Principles:</span>
                      <Badge variant="outline">SOLID + DRY</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Agent Coordination</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>Sequential Execution</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span>Parallel Processing</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span>Result Aggregation</span>
                    </div>
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