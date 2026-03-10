import React from 'react';
import { Button } from '../shared/ui/button';
import { Menu } from 'lucide-react';

interface NavigationProps {
  currentPage: 'chat' | 'intelligence' | 'agents' | 'search';
  onNavigate: (page: 'chat' | 'intelligence' | 'agents' | 'search') => void;
  onToggleSidebar: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, onToggleSidebar }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-background shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-muted-foreground">
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('intelligence')}>
                <img
                  src="/logo.png"
                  alt="PactAI"
                  className="h-8 w-auto object-contain brightness-0 invert"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <h1 className="text-xl font-bold text-foreground tracking-tight">PactAI</h1>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-1 pl-6 border-l border-border">
              <Button
                variant={currentPage === 'intelligence' ? 'default' : 'ghost'}
                onClick={() => onNavigate('intelligence')}
                className={`px-4 py-2 text-sm font-medium ${currentPage === 'intelligence' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-muted-foreground hover:bg-accent'}`}
              >
                Document Analysis
              </Button>
              <Button
                variant={currentPage === 'chat' ? 'default' : 'ghost'}
                onClick={() => onNavigate('chat')}
                className={`px-4 py-2 text-sm font-medium ${currentPage === 'chat' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-muted-foreground hover:bg-accent'}`}
              >
                Contract Chat
              </Button>
              <Button
                variant={currentPage === 'search' ? 'default' : 'ghost'}
                onClick={() => onNavigate('search')}
                className={`px-4 py-2 text-sm font-medium ${currentPage === 'search' ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'text-muted-foreground hover:bg-accent'}`}
              >
                Enhanced Search
              </Button>
              <Button
                variant={currentPage === 'agents' ? 'default' : 'ghost'}
                onClick={() => onNavigate('agents')}
                className={`px-4 py-2 text-sm font-medium ${currentPage === 'agents' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-muted-foreground hover:bg-accent'}`}
              >
                Documentation
              </Button>
            </div>
          </div>
          <div className="hidden sm:block text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            AI-Powered Legal Intelligence
          </div>
        </div>
      </div>
    </nav>
  );
};
