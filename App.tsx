import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PrintPreview from './components/PrintPreview';
import PrintModal from './components/PrintModal';
import OnboardingModal from './components/OnboardingModal';
import AuthModal from './components/AuthModal';
import ProfileMenu from './components/ProfileMenu';
import HistoryPanel from './components/HistoryPanel';
import SaveDesignModal from './components/SaveDesignModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppConfig, NameEntry } from './types';
import { DEFAULT_CONFIG } from './constants';
import { LogIn, UserPlus, Printer } from 'lucide-react';

// Inner app component that uses auth context
const AppContent: React.FC = () => {
  const DEFAULT_NAMES: NameEntry[] = [
    { id: '1', line1: 'Full Name', line2: 'Designation' },
  ];
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [names, setNames] = useState<NameEntry[]>(DEFAULT_NAMES);
  const [bulkText, setBulkText] = useState(
    DEFAULT_NAMES.map(n => `${n.line1}, ${n.line2}`).join('\n')
  );
  const [showModal, setShowModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Lifted State from Sidebar
  const [activeTab, setActiveTab] = useState<'names' | 'style'>('names');
  const [inputMode, setInputMode] = useState<'manual' | 'bulk'>('manual');

  const { user, userData, loading, saveToHistory, restoreFromHistory, saveCurrentSettings } = useAuth();

  // Load user's saved settings when they log in
  useEffect(() => {
    if (userData) {
      if (userData.currentConfig) {
        setConfig(userData.currentConfig);
      }
      // If user has saved names, use them; otherwise keep defaults if it's a new account
      if (userData.currentNames && userData.currentNames.length > 0) {
        setNames(userData.currentNames);
        setBulkText(userData.currentNames.map(n => `${n.line1}, ${n.line2}`).join('\n'));
      }
    }
  }, [userData]);

  // Auto-save current settings periodically when logged in
  useEffect(() => {
    if (user && !loading) {
      const saveTimer = setTimeout(() => {
        saveCurrentSettings(config, names);
      }, 2000); // Debounce saves by 2 seconds
      return () => clearTimeout(saveTimer);
    }
  }, [config, names, user, loading]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    setActiveTab('names');
    setInputMode('manual');
    localStorage.setItem('tentcard_onboarding_seen', 'true');
  };

  const handleStepChange = (stepIndex: number) => {
    if (stepIndex === 1) {
      setActiveTab('names');
      setInputMode('manual');
    } else if (stepIndex === 2) {
      setActiveTab('names');
      setInputMode('bulk');
    } else if (stepIndex === 3 || stepIndex === 4) {
      setActiveTab('names');
      setInputMode('manual');
    } else if (stepIndex === 5) {
      setActiveTab('style');
    }
  };

  const handlePrintRequest = () => {
    setShowModal(true);
  };

  const handlePrintConfirm = () => {
    window.print();
    setShowModal(false);
  };

  const handleSaveToHistory = async (name: string) => {
    await saveToHistory(name, config, names);
  };

  const handleRestoreFromHistory = (id: string) => {
    const restored = restoreFromHistory(id);
    if (restored) {
      setConfig(restored.config);
      setNames(restored.names);
      setBulkText(restored.names.map(n => `${n.line1}, ${n.line2}`).join('\n'));
      setShowHistoryPanel(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100 overflow-hidden font-sans text-gray-900">
      <style>
        {`
          @media print {
            @page {
              size: ${config.paperSize} ${config.orientation};
              margin: 0;
            }
            
            html, body, #root {
              height: auto !important;
              width: 100% !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
              background: white !important;
            }
            
            #root > div {
              display: block !important;
              height: auto !important;
              width: 100% !important;
              overflow: visible !important;
              background: white !important;
            }
            
            header, .print-hidden {
              display: none !important;
            }

            main {
              display: block !important;
              height: auto !important;
              width: 100% !important;
              overflow: visible !important;
              position: static !important;
              background: white !important;
              padding: 0 !important;
            }
            
            main > div,
            main > div > div,
            main > div > div > div {
              height: auto !important;
              overflow: visible !important;
              position: static !important;
            }
            
            .print-pages-wrapper {
              transform: none !important;
              transform-origin: initial !important;
            }
            
            .page-wrapper {
              position: static !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            
            .print-page {
              box-shadow: none !important;
              margin: 0 !important;
              break-after: page !important;
              page-break-after: always !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            
            .print-page:last-of-type {
              break-after: auto !important;
              page-break-after: auto !important;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      {/* Full Width Top Navigation Header */}
      <header className="print:hidden z-30 bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-blue-600 text-white shadow-md">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-none">Name Plate Gen</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-semibold">Professional Tent Cards</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
            ) : user ? (
              <ProfileMenu
                onOpenHistory={() => setShowHistoryPanel(true)}
                onSaveToHistory={() => setShowSaveModal(true)}
              />
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  <LogIn size={18} />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="print:hidden h-full flex-shrink-0 z-20 shadow-xl">
          <Sidebar
            config={config}
            setConfig={setConfig}
            names={names}
            setNames={setNames}
            onPrint={handlePrintRequest}
            bulkText={bulkText}
            setBulkText={setBulkText}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            inputMode={inputMode}
            setInputMode={setInputMode}
          />
        </div>

        {/* Main Preview Area */}
        <main className="flex-1 h-full overflow-auto bg-gray-200/80 relative">
          <PrintPreview
            config={config}
            names={names}
            onHelp={() => setShowOnboarding(true)}
          />
        </main>
      </div>

      {/* Modals */}
      <PrintModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handlePrintConfirm}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onStepChange={handleStepChange}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <HistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        onRestore={handleRestoreFromHistory}
      />

      <SaveDesignModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveToHistory}
      />

      {/* Footer */}
      <footer className="fixed bottom-4 right-6 text-xs text-gray-400 pointer-events-none print:hidden z-10">
        Minimalist Name Plate Gen 🏷️
      </footer>
    </div>
  );
};

// Main App wrapper with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
