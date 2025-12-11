import React, { useState } from 'react';
import { DocumentUpload } from '../components/upload/DocumentUpload';
import { ContractIntelligence } from '../components/intelligence/ContractIntelligence';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface UploadResult {
  filename: string;
  status: string;
  contract_id?: string;
  details: string;
  model_used: string;
}

export const IntelligencePage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResult(result);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center bg-white rounded-lg p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Document Intelligence Platform</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Upload legal contracts and leverage AI-powered analysis for comprehensive insights, 
          risk assessment, and compliance review.
        </p>
      </div>

      {/* Model Selection */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-700">AI Model:</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-56 border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="sonnet-3.5">Claude Sonnet 3.5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-slate-800">Document Upload</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Upload PDF contracts for AI-powered analysis and extraction of key legal terms.
            </p>
            <DocumentUpload 
              onUploadComplete={handleUploadComplete}
              modelSelection={selectedModel}
            />
          </div>
        </Card>

        {/* Analysis Section */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-slate-800">Intelligence Analysis</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Comprehensive AI analysis including risk assessment, clause extraction, and compliance review.
            </p>
            {uploadResult?.contract_id ? (
              <ContractIntelligence 
                contractId={uploadResult.contract_id}
                model={selectedModel}
              />
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                <div className="text-slate-400 text-4xl mb-3">📄</div>
                <p className="text-slate-500 font-medium">Upload a contract to begin analysis</p>
                <p className="text-slate-400 text-sm mt-1">
                  AI will extract clauses, assess risks, and provide recommendations
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};