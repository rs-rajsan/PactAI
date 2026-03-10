import React from 'react';
import { Button } from '../shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shared/ui/select';
import { DocumentUpload } from '../features/contracts/DocumentUpload';
import { useContractHistory } from '../../contexts/ContractHistoryContext';
import {
    X,
    History,
    Upload,
    MessageSquare,
    Book,
    Filter,
    Bookmark,
    ChevronRight,
    Database,
    Cpu
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentPage: 'chat' | 'intelligence' | 'agents' | 'search';
    selectedModel: string;
    onModelChange: (model: string) => void;
    onUploadComplete: (result: any) => void;
    onUploadStart: () => void;
    onWorkflowUpdate: (status: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    currentPage,
    selectedModel,
    onModelChange,
    onUploadComplete,
    onUploadStart,
    onWorkflowUpdate
}) => {
    const { contracts, selectedContractId, setSelectedContract } = useContractHistory();

    const renderAnalysisSidebar = () => (
        <>
            {/* Quick Upload */}
            <section>
                <div className="flex items-center gap-2 mb-4 text-sidebar-foreground/70">
                    <Upload className="h-4 w-4" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider">Quick Upload</h3>
                </div>
                <DocumentUpload
                    variant="minimal"
                    onUploadComplete={onUploadComplete}
                    modelSelection={selectedModel}
                    onWorkflowUpdate={onWorkflowUpdate}
                    onUploadStart={onUploadStart}
                />
            </section>

            {/* Analysis Model */}
            <section>
                <div className="flex items-center gap-2 mb-4 text-sidebar-foreground/70">
                    <Cpu className="h-4 w-4" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider">Analysis Model</h3>
                </div>
                <div className="space-y-3">
                    <Select value={selectedModel} onValueChange={onModelChange}>
                        <SelectTrigger className="w-full border-sidebar-border bg-sidebar-accent">
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
            </section>

            {/* Active Contract / History */}
            <section>
                <div className="flex items-center gap-2 mb-4 text-sidebar-foreground/70">
                    <History className="h-4 w-4" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider">Recent Analysis</h3>
                </div>
                <div className="space-y-2">
                    {contracts.length > 0 ? (
                        contracts.slice(0, 8).map((contract) => (
                            <div
                                key={contract.contract_id}
                                className={`p-3 rounded-lg cursor-pointer border transition-all text-left ${selectedContractId === contract.contract_id
                                    ? 'bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground shadow-md'
                                    : 'bg-sidebar-accent border-transparent hover:border-sidebar-border text-sidebar-foreground'
                                    }`}
                                onClick={() => setSelectedContract(contract.contract_id)}
                            >
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium truncate flex-1 pr-2 ${selectedContractId === contract.contract_id ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground'}`}>
                                        {contract.filename}
                                    </p>
                                    {selectedContractId === contract.contract_id && <ChevronRight className="h-3 w-3" />}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className={`text-[10px] ${selectedContractId === contract.contract_id ? 'text-sidebar-primary-foreground/70' : 'text-sidebar-foreground/50'}`}>
                                        {new Date(contract.upload_date).toLocaleDateString()}
                                    </span>
                                    {contract.risk_level && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${selectedContractId === contract.contract_id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-sidebar border border-sidebar-border text-sidebar-foreground'
                                            }`}>
                                            {contract.risk_level}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-sidebar-border rounded-lg">
                            <p className="text-xs text-sidebar-foreground/40 font-medium">No analysis history</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );

    const renderChatSidebar = () => (
        <>
            <section>
                <div className="flex items-center gap-2 mb-4 text-sidebar-foreground/70">
                    <MessageSquare className="h-4 w-4" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider">Chat History</h3>
                </div>
                <div className="space-y-2">
                    <div className="p-3 bg-sidebar-primary rounded-lg shadow-md border border-sidebar-primary cursor-pointer">
                        <p className="text-sm font-medium text-sidebar-primary-foreground line-clamp-2">Current Session</p>
                        <p className="text-[10px] text-sidebar-primary-foreground/70 mt-1">Active Now</p>
                    </div>
                    <div className="p-3 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-lg border border-transparent hover:border-sidebar-border cursor-pointer transition-all">
                        <p className="text-sm font-medium text-sidebar-foreground line-clamp-2">Risk profile clarification</p>
                        <p className="text-[10px] text-sidebar-foreground/50 mt-1">Yesterday</p>
                    </div>
                    <div className="p-3 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-lg border border-transparent hover:border-sidebar-border cursor-pointer transition-all">
                        <p className="text-sm font-medium text-sidebar-foreground line-clamp-2">Clause 12.4 explanation</p>
                        <p className="text-[10px] text-sidebar-foreground/50 mt-1">2 days ago</p>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4 text-sidebar-foreground/70">
                    <Database className="h-4 w-4" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider">Context Scope</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-sidebar-primary/20 border border-sidebar-primary/30">
                        <span className="text-xs font-medium text-sidebar-primary">Current Document</span>
                        <div className="w-8 h-4 bg-sidebar-primary rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-sidebar-primary-foreground rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-sidebar-accent border border-sidebar-border">
                        <span className="text-xs font-medium text-sidebar-foreground/40">Full Library</span>
                        <div className="w-8 h-4 bg-sidebar-accent-foreground/10 rounded-full relative">
                            <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-sidebar-foreground rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

    const renderSearchSidebar = () => (
        <>
            <section>
                <div className="flex items-center gap-2 mb-4 text-sidebar-foreground/70">
                    <Filter className="h-4 w-4" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider">Search Filters</h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-sidebar-foreground/50 uppercase">Risk Level</label>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer">High</span>
                            <span className="px-2 py-1 bg-sidebar-accent text-sidebar-foreground rounded text-[10px] font-bold cursor-pointer hover:bg-sidebar-accent/80">Medium</span>
                            <span className="px-2 py-1 bg-sidebar-accent text-sidebar-foreground rounded text-[10px] font-bold cursor-pointer hover:bg-sidebar-accent/80">Low</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-sidebar-foreground/50 uppercase">Date Range</label>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-full border-sidebar-border h-8 text-xs bg-sidebar-accent">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="7">Last 7 Days</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="90">Last 90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4 text-sidebar-foreground/70">
                    <Bookmark className="h-4 w-4" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider">Saved Searches</h3>
                </div>
                <div className="space-y-2">
                    <div className="p-2.5 bg-sidebar-accent hover:border-sidebar-border rounded-lg border border-transparent cursor-pointer transition-all flex items-center justify-between group">
                        <span className="text-xs font-medium text-sidebar-foreground">High Risk MSAs</span>
                        <ChevronRight className="h-3 w-3 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60" />
                    </div>
                    <div className="p-2.5 bg-sidebar-accent hover:border-sidebar-border rounded-lg border border-transparent cursor-pointer transition-all flex items-center justify-between group">
                        <span className="text-xs font-medium text-sidebar-foreground">Expiring in 2026</span>
                        <ChevronRight className="h-3 w-3 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60" />
                    </div>
                </div>
            </section>
        </>
    );

    const renderDocsSidebar = () => (
        <section>
            <div className="flex items-center gap-2 mb-4 text-sidebar-foreground/70">
                <Book className="h-4 w-4" />
                <h3 className="font-semibold text-xs uppercase tracking-wider">Table of Contents</h3>
            </div>
            <div className="space-y-1">
                <div className="p-2 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-medium text-xs cursor-pointer shadow-sm">
                    Introduction
                </div>
                <div className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 text-xs cursor-pointer transition-all">
                    Getting Started
                </div>
                <div className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 text-xs cursor-pointer transition-all">
                    Analysis Features
                </div>
                <div className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 text-xs cursor-pointer transition-all">
                    Multi-Agent Workflows
                </div>
                <div className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 text-xs cursor-pointer transition-all">
                    Model Comparison
                </div>
            </div>
        </section>
    );

    const getSidebarContent = () => {
        switch (currentPage) {
            case 'intelligence':
                return renderAnalysisSidebar();
            case 'chat':
                return renderChatSidebar();
            case 'search':
                return renderSearchSidebar();
            case 'agents':
                return renderDocsSidebar();
            default:
                return renderAnalysisSidebar();
        }
    };

    return (
        <aside
            className={`fixed top-14 bottom-0 left-0 z-50 w-80 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="h-full flex flex-col">
                {/* Header/Close button for mobile */}
                <div className="flex items-center justify-between px-6 py-4 lg:hidden border-b border-sidebar-border">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-sidebar-primary rounded">
                            <Cpu className="h-4 w-4 text-sidebar-primary-foreground" />
                        </div>
                        <h2 className="text-sm font-bold text-sidebar-foreground uppercase tracking-tighter">Tools & Context</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-sidebar-foreground/50">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    {getSidebarContent()}
                </div>

                {/* Bottom Status Panel (Optional but premium feel) */}
                <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/50">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-widest">System Ready</span>
                        </div>
                        <span className="text-[10px] font-medium text-sidebar-foreground/30">v1.0.4</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
