import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, MessageSquare, Book, FileSearch, ArrowRight, Settings } from 'lucide-react';

interface CommandPaletteProps {
    onNavigate: (page: 'chat' | 'intelligence' | 'agents' | 'search') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        command();
        setOpen(false);
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setOpen(false)}
        >
            <div className="flex items-start justify-center pt-[15vh]">
                <Command
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden outline-none animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center border-b border-slate-100 px-4 py-3">
                        <Search className="h-5 w-5 text-slate-400 mr-3" />
                        <Command.Input
                            placeholder="Search contracts, actions, or tools..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm py-1"
                            autoFocus
                        />
                        <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">
                            ESC
                        </div>
                    </div>

                    <Command.List className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                        <Command.Empty className="py-12 text-center">
                            <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                <Search className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">No results found for your search.</p>
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Item icon={<FileText className="h-4 w-4" />} onSelect={() => runCommand(() => onNavigate('intelligence'))}>
                                Document Intelligence
                            </Item>
                            <Item icon={<MessageSquare className="h-4 w-4" />} onSelect={() => runCommand(() => onNavigate('chat'))}>
                                Contract Chat
                            </Item>
                            <Item icon={<FileSearch className="h-4 w-4" />} onSelect={() => runCommand(() => onNavigate('search'))}>
                                Enhanced Search
                            </Item>
                            <Item icon={<Book className="h-4 w-4" />} onSelect={() => runCommand(() => onNavigate('agents'))}>
                                Documentation
                            </Item>
                        </Command.Group>

                        <Command.Group heading="Common Actions" className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-50">
                            <Item icon={<Settings className="h-4 w-4" />} onSelect={() => console.log('Settings')}>
                                User Settings
                            </Item>
                        </Command.Group>
                    </Command.List>

                    <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-t border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-500 shadow-sm">↵</kbd>
                                <span className="text-[10px] text-slate-400 font-medium font-sans">to select</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-500 shadow-sm">↑↓</kbd>
                                <span className="text-[10px] text-slate-400 font-medium font-sans">to navigate</span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">PactAI Command Menu</span>
                    </div>
                </Command>
            </div>
        </div>
    );
};

const Item = ({ children, icon, onSelect }: { children: React.ReactNode; icon: React.ReactNode; onSelect: () => void }) => (
    <Command.Item
        onSelect={onSelect}
        className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-blue-600 aria-selected:text-white group transition-colors"
    >
        <div className="flex items-center gap-3">
            <div className="p-1 rounded bg-slate-50 text-slate-500 group-aria-selected:bg-blue-500 group-aria-selected:text-white transition-colors">
                {icon}
            </div>
            <span className="text-sm font-medium">{children}</span>
        </div>
        <ArrowRight className="h-3 w-3 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
    </Command.Item>
);
