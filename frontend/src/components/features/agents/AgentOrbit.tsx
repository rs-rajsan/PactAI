import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Check, Loader2, Play } from 'lucide-react';
import { Badge } from '../../shared/ui/badge';

interface AgentExecution {
    agent_name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    started_at?: string;
    completed_at?: string;
}

interface AgentOrbitProps {
    workflowStatus: {
        agent_executions: AgentExecution[];
    };
}

export const AgentOrbit: React.FC<AgentOrbitProps> = ({ workflowStatus }) => {
    const executions = workflowStatus?.agent_executions || [];

    if (executions.length === 0) return null;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <Check className="h-3 w-3 text-white" />;
            case 'running': return <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />;
            case 'pending': return <Play className="h-3 w-3 text-slate-400" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500 border-green-600';
            case 'running': return 'bg-white border-blue-600 shadow-lg shadow-blue-100';
            case 'pending': return 'bg-slate-50 border-slate-200';
            default: return 'bg-slate-50 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 rounded-lg">
                        <Cpu className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                        Agent Reasoning Node
                    </h3>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-slate-200">
                    In Sync
                </Badge>
            </div>

            <div className="relative">
                {/* Connecting Lines */}
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100"></div>

                <div className="space-y-8">
                    <AnimatePresence mode="popLayout">
                        {executions.map((exec, idx) => (
                            <motion.div
                                key={exec.agent_name}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative flex items-center gap-6 group"
                            >
                                {/* Visual Connector Node */}
                                <div className={`z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${getStatusColor(exec.status)}`}>
                                    {getStatusIcon(exec.status)}
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 p-3 rounded-xl border transition-all duration-300 ${exec.status === 'running'
                                        ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                                        : 'bg-white border-slate-100 group-hover:border-slate-200'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-bold uppercase tracking-tight ${exec.status === 'running' ? 'text-blue-700' : 'text-slate-600'
                                            }`}>
                                            {exec.agent_name.replace('_agent', '')}
                                        </span>
                                        {exec.status === 'running' && (
                                            <span className="text-[9px] font-black text-blue-500 animate-pulse">THINKING...</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                                        {exec.status === 'completed' ? 'Reasoning cycle complete' : exec.status === 'running' ? 'Executing intelligence patterns' : 'Queued for processing'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Status</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-800 uppercase">Operating</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
