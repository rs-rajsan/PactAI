import React from 'react';
import { Button } from './ui/button';

interface NavigationProps {
  currentPage: 'chat' | 'intelligence';
  onNavigate: (page: 'chat' | 'intelligence') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="mb-8 border-b border-slate-200 bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-slate-800">Contract Intelligence</h1>
            <div className="flex space-x-1">
              <Button
                variant={currentPage === 'intelligence' ? 'default' : 'ghost'}
                onClick={() => onNavigate('intelligence')}
                className="px-4 py-2"
              >
                Document Analysis
              </Button>
              <Button
                variant={currentPage === 'chat' ? 'default' : 'ghost'}
                onClick={() => onNavigate('chat')}
                className="px-4 py-2"
              >
                Contract Search
              </Button>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            AI-Powered Legal Document Analysis
          </div>
        </div>
      </div>
    </nav>
  );
};