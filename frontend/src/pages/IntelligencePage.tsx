import React, { useState } from 'react';
import { BentoDashboard } from '../components/features/intelligence/BentoDashboard';
import { AgentOrbit } from '../components/features/agents/AgentOrbit';
import { useContractHistory } from '../contexts/ContractHistoryContext';
import { ContractIntelligence } from '../components/features/intelligence/ContractIntelligence';

interface UploadResult {
  filename: string;
  status: string;
  contract_id?: string;
  details: string;
  model_used: string;
}

interface IntelligencePageProps {
  uploadResult: UploadResult | null;
  workflowStatus: any;
  isUploading: boolean;
  selectedModel: string;
}

export const IntelligencePage: React.FC<IntelligencePageProps> = ({
  uploadResult,
  workflowStatus,
  isUploading,
  selectedModel
}) => {
  const { updateContract, selectedContractId } = useContractHistory();
  const [intelligenceResults, setIntelligenceResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (contractId: string, riskScore?: number, riskLevel?: string, results?: any) => {
    setIntelligenceResults(results);
    updateContract(contractId, {
      analysis_completed: true,
      risk_score: riskScore,
      risk_level: riskLevel,
      analysis_results: results
    });
  };

  const currentContractId = uploadResult?.contract_id || selectedContractId;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 pb-20">
      {/* Dynamic Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-8 pt-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            Intelligence <span className="text-blue-600">Workspace</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Real-time legal analysis and multi-agent risk assessment.
          </p>
        </div>

        {currentContractId && (
          <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-full border border-border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Active ID: {currentContractId.slice(0, 8)}...
            </span>
          </div>
        )}
      </div>

      {/* Bento Dashboard Section */}
      <section>
        <BentoDashboard
          results={intelligenceResults}
          loading={isUploading || isAnalyzing}
        />
      </section>

      {/* Main Analysis Logic (Hidden but functional or integrated) */}
      <div className="grid grid-cols-1 gap-8">
        {currentContractId ? (
          <div className="space-y-8">
            {/* Detailed Analysis View */}
            <ContractIntelligence
              contractId={currentContractId}
              model={selectedModel}
              onAnalysisComplete={handleAnalysisComplete}
              onWorkflowUpdate={(status) => {
                // Tracking internal analysis state
                if (status?.status === 'processing') setIsAnalyzing(true);
                else setIsAnalyzing(status?.status === 'completed' ? false : isAnalyzing);
              }}
            />

            {/* Premium Workflow Visualizer */}
            {(isUploading || (workflowStatus && workflowStatus.agent_executions?.length > 0)) && (
              <div className="fixed bottom-8 right-8 z-50 w-96 bg-card/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                <AgentOrbit workflowStatus={workflowStatus} />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border-2 border-dashed border-border rounded-3xl p-24 text-center">
            <div className="mx-auto w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <span className="text-4xl">📁</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Workspace Empty</h3>
            <p className="text-muted-foreground max-w-xs mx-auto text-sm font-medium">
              Upload a contract via the sidebar or select a recent one to initialize the intelligence engine.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
