import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StockReports from './components/StockReports';
import SalesReports from './components/SalesReports';
import Analyser from './components/Analyser';
import Settings from './components/Settings';
import { PackageOpen, Menu } from 'lucide-react';
import { ConfigProvider } from './contexts/ConfigContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ReportHistoryProvider } from './contexts/ReportHistoryContext';

const AppContent: React.FC = () => {
  const { currentTab, setCurrentTab } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockReports />;
      case 'sales':
        return <SalesReports />;
      case 'analyser':
        return <Analyser />;
      case 'settings': 
        return <Settings />;
      case 'orders':
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <PackageOpen size={48} className="mb-4 opacity-50" />
            <p>Orders Module under development</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar now uses context internally */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 -ml-2 rounded-md hover:bg-gray-100 text-gray-600"
                >
                    <Menu size={24} />
                </button>
                <span className="ml-3 font-bold text-gray-800">Protein Pantry</span>
            </div>
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
              PP
            </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <NavigationProvider>
        <ReportHistoryProvider>
          <AppContent />
        </ReportHistoryProvider>
      </NavigationProvider>
    </ConfigProvider>
  );
};

export default App;
