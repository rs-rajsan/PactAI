import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/shared/ui/card';
import { Badge } from '../components/shared/ui/badge';
import { agents, getAgentTools } from '../data/agents.tsx';

export const AgentsPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="text-center bg-white rounded-lg p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">AI Agents</h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Specialized AI agents that work together to analyze contracts and extract insights.
        </p>
      </div>

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
    </div>
  );
};