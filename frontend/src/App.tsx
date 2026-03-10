import { useState } from 'react';
import { ThemeProvider } from './components/shared/theme-provider';
import { Navigation } from './components/layout/Navigation';
import { Sidebar } from './components/layout/Sidebar';
import { ChatPage } from './pages/ChatPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { DocumentationPage } from './pages/DocumentationPage';
import { SearchPage } from './pages/SearchPage';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ContractHistoryProvider, useContractHistory } from './contexts/ContractHistoryContext';
import { useRouter } from './lib/useRouter';
import { CommandPalette } from './components/shared/ui/CommandPalette';

interface UploadResult {
  filename: string;
  status: string;
  contract_id?: string;
  details: string;
  model_used: string;
}

function AppContent() {
  const { currentPage, navigate } = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { addContract } = useContractHistory();

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResult(result);
    setIsUploading(false);

    // Add to contract history
    if (result.contract_id) {
      addContract({
        contract_id: result.contract_id,
        filename: result.filename,
        upload_date: new Date().toISOString(),
        model_used: result.model_used,
        analysis_completed: false
      });
    }
  };

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleWorkflowUpdate = (status: any) => {
    setWorkflowStatus(status);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatPage />;
      case 'intelligence':
        return (
          <IntelligencePage
            uploadResult={uploadResult}
            workflowStatus={workflowStatus}
            isUploading={isUploading}
            selectedModel={selectedModel}
          />
        );
      case 'agents':
        return <DocumentationPage />;
      case 'search':
        return (
          <ErrorBoundary>
            <SearchPage />
          </ErrorBoundary>
        );
      default:
        return (
          <IntelligencePage
            uploadResult={uploadResult}
            workflowStatus={workflowStatus}
            isUploading={isUploading}
            selectedModel={selectedModel}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <CommandPalette onNavigate={navigate} />
      <Navigation
        currentPage={currentPage}
        onNavigate={navigate}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 pt-14">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPage={currentPage}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onUploadComplete={handleUploadComplete}
          onUploadStart={handleUploadStart}
          onWorkflowUpdate={handleWorkflowUpdate}
        />

        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out p-6 ${isSidebarOpen ? 'lg:pl-80' : 'pl-0'
            }`}
        >
          <div className="mx-auto max-w-7xl">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ContractHistoryProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppContent />
      </ThemeProvider>
    </ContractHistoryProvider>
  );
}

export default App;