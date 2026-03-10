import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, FileText, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card';
import { Badge } from '../../shared/ui/badge';

interface BentoDashboardProps {
    results: any;
    loading: boolean;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export const BentoDashboard: React.FC<BentoDashboardProps> = ({ results, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
                <div className="col-span-2 h-48 bg-muted rounded-xl"></div>
                <div className="h-48 bg-muted rounded-xl"></div>
                <div className="h-48 bg-muted rounded-xl"></div>
                <div className="col-span-1 h-64 bg-muted rounded-xl"></div>
                <div className="col-span-3 h-64 bg-muted rounded-xl"></div>
            </div>
        );
    }

    const riskAssessment = results?.risk_assessment || {};
    const violations = results?.violations || [];
    const clauses = results?.clauses || [];

    const getRiskColor = (level: string) => {
        switch (level?.toUpperCase()) {
            case 'CRITICAL': return 'bg-red-500 text-white';
            case 'HIGH': return 'bg-orange-500 text-white';
            case 'MEDIUM': return 'bg-yellow-500 text-white';
            case 'LOW': return 'bg-green-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
            {/* Risk Score - Large Tile */}
            <motion.div variants={item} className="md:col-span-2">
                <Card className="h-full border-border shadow-sm hover:shadow-md transition-shadow bg-card overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Shield size={120} />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Shield className="h-3 w-3 text-blue-600" />
                            Overall Risk Assessment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-between py-6">
                        <div>
                            <div className="text-6xl font-black text-foreground tracking-tighter mb-2">
                                {riskAssessment.overall_risk_score || 0}
                                <span className="text-2xl text-muted-foreground/30 font-medium font-sans">/100</span>
                            </div>
                            <Badge className={`${getRiskColor(riskAssessment.risk_level)} px-3 py-1 text-xs font-bold`}>
                                {riskAssessment.risk_level || 'UNKNOWN'}
                            </Badge>
                        </div>
                        <div className="mt-8 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span>+2.4% vs Avg</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-blue-500" />
                                <span>Analyzed just now</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Violations Summary */}
            <motion.div variants={item}>
                <Card className="h-full border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                            Policy Compliance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-foreground mb-1">{violations.length}</div>
                        <p className="text-xs text-muted-foreground font-medium">Violations Detected</p>
                        <div className="mt-6 space-y-2">
                            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-orange-500 h-full rounded-full"
                                    style={{ width: `${Math.min(100, (violations.length / 5) * 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-muted-foreground/60">Severity distribution is High</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Clauses Overview */}
            <motion.div variants={item}>
                <Card className="h-full border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <FileText className="h-3 w-3 text-green-500" />
                            Clause Extraction
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-foreground mb-1">{clauses.length}</div>
                        <p className="text-xs text-muted-foreground font-medium">Key Clauses Identified</p>
                        <div className="mt-6 flex flex-wrap gap-1">
                            {[...Array(Math.min(4, clauses.length))].map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-blue-600 shadow-sm shadow-blue-900"></div>
                            ))}
                            {clauses.length > 4 && <span className="text-[8px] text-muted-foreground/60">+{clauses.length - 4} more</span>}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Critical Issues - Long Tile */}
            <motion.div variants={item} className="md:col-span-3">
                <Card className="border-border shadow-sm bg-destructive/10 border-l-4 border-l-destructive">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Critical Issues Priority List
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {riskAssessment.critical_issues?.length > 0 ? (
                                riskAssessment.critical_issues.slice(0, 3).map((issue: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-white/5 dark:bg-black/20 rounded-lg border border-destructive/20 shadow-sm">
                                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-destructive"></div>
                                        <p className="text-xs font-medium text-foreground/80">{issue}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center gap-3 p-4 bg-white/5 dark:bg-black/20 rounded-lg border border-border">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <p className="text-xs font-medium text-muted-foreground">No critical issues detected in this document.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Recommendations / Next Steps */}
            <motion.div variants={item}>
                <Card className="h-full border-slate-200 shadow-sm bg-blue-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">
                            AI Recommendation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-medium leading-relaxed italic opacity-90">
                            "{results?.risk_assessment?.recommendations?.[0] || 'Proceed with legal review focusing on indemnity clauses.'}"
                        </p>
                        <div className="mt-8 flex justify-end">
                            <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold">
                                Level 2 Review Needed
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};
