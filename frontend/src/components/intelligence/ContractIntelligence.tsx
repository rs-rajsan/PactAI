import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Clock, Brain, FileText, Shield, Edit } from 'lucide-react';

interface ContractClause {
  clause_type: string;
  content: string;
  risk_level: string;
  confidence_score: number;
  location: string;
}

interface PolicyViolation {
  clause_type: string;
  issue: string;
  severity: string;
  suggested_fix: string;
  clause_content: string;
}

interface RiskAssessment {
  overall_risk_score: number;
  risk_level: string;
  critical_issues: string[];
  recommendations: string[];
}

interface RedlineRecommendation {
  original_text: string;
  suggested_text: string;
  justification: string;
  priority: string;
}

interface IntelligenceResults {
  clauses: ContractClause[];
  violations: PolicyViolation[];
  risk_assessment: RiskAssessment;
  redlines: RedlineRecommendation[];
}

interface ContractIntelligenceProps {
  contractId: string;
}

const ContractIntelligence: React.FC<ContractIntelligenceProps> = ({ contractId }) => {
  const [results, setResults] = useState<IntelligenceResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeContract = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/intelligence/contracts/${contractId}/analyze`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'MEDIUM': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'LOW': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contract Intelligence Analysis</h2>
          <p className="text-muted-foreground">Multi-agent AI analysis for contract {contractId}</p>
        </div>
        <Button 
          onClick={analyzeContract} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Multi-agent analysis in progress...</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-sm text-muted-foreground">• Clause Extraction Agent: Working...</div>
              <div className="text-sm text-muted-foreground">• Policy Compliance Agent: Waiting...</div>
              <div className="text-sm text-muted-foreground">• Risk Assessment Agent: Waiting...</div>
              <div className="text-sm text-muted-foreground">• Redline Generation Agent: Waiting...</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clauses">Clauses</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="redlines">Redlines</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.risk_assessment.overall_risk_score}/100</div>
                  <Badge className={getRiskColor(results.risk_assessment.risk_level)}>
                    {results.risk_assessment.risk_level}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Violations Found</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.violations.length}</div>
                  <p className="text-xs text-muted-foreground">Policy violations detected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clauses Analyzed</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.clauses.length}</div>
                  <p className="text-xs text-muted-foreground">Key clauses extracted</p>
                </CardContent>
              </Card>
            </div>

            {/* Critical Issues */}
            {results.risk_assessment.critical_issues.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700">Critical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.risk_assessment.critical_issues.map((issue, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Clauses Tab */}
          <TabsContent value="clauses" className="space-y-4">
            {results.clauses.map((clause, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{clause.clause_type}</CardTitle>
                    <Badge className={getRiskColor(clause.risk_level)}>
                      {clause.risk_level}
                    </Badge>
                  </div>
                  <CardDescription>{clause.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{clause.content}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Confidence: {(clause.confidence_score * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations" className="space-y-4">
            {results.violations.map((violation, index) => (
              <Card key={index} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(violation.severity)}
                    <CardTitle className="text-lg">{violation.clause_type}</CardTitle>
                    <Badge variant="outline">{violation.severity}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-red-700">Issue:</h4>
                    <p className="text-sm">{violation.issue}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700">Suggested Fix:</h4>
                    <p className="text-sm">{violation.suggested_fix}</p>
                  </div>
                  {violation.clause_content && (
                    <div>
                      <h4 className="font-medium">Original Clause:</h4>
                      <p className="text-sm text-muted-foreground italic">{violation.clause_content}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Overall Risk Level:</h4>
                  <Badge className={getRiskColor(results.risk_assessment.risk_level)}>
                    {results.risk_assessment.risk_level} ({results.risk_assessment.overall_risk_score}/100)
                  </Badge>
                </div>
                
                {results.risk_assessment.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium">Recommendations:</h4>
                    <ul className="mt-2 space-y-1">
                      {results.risk_assessment.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-blue-500" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redlines Tab */}
          <TabsContent value="redlines" className="space-y-4">
            {results.redlines.map((redline, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <CardTitle className="text-lg">Redline Recommendation #{index + 1}</CardTitle>
                    <Badge variant="outline">{redline.priority}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-red-700">Original Text:</h4>
                    <p className="text-sm bg-red-50 p-2 rounded border">{redline.original_text}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700">Suggested Text:</h4>
                    <p className="text-sm bg-green-50 p-2 rounded border">{redline.suggested_text}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Justification:</h4>
                    <p className="text-sm text-muted-foreground">{redline.justification}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ContractIntelligence;