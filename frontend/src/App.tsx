import React from 'react';
import { ThemeProvider } from './components/theme-provider';
import { Navigation } from './components/Navigation';
import { ChatPage } from './pages/ChatPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { AgentsPage } from './pages/AgentsPage';
import { ContractHistoryProvider } from './contexts/ContractHistoryContext';
import { useRouter } from './lib/useRouter';
import './App.css';

function App() {
  const { currentPage, navigate } = useRouter();

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatPage />;
      case 'intelligence':
        return <IntelligencePage />;
      case 'agents':
        return <AgentsPage />;
      default:
        return <IntelligencePage />;
    }
  };

  return (
    <ContractHistoryProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-7xl p-6">
            <Navigation currentPage={currentPage} onNavigate={navigate} />
            {renderPage()}
          </div>
        </div>
      </ThemeProvider>
    </ContractHistoryProvider>
  );
}

export default App;