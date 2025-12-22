import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PrintPreview from './components/PrintPreview';
import PrintModal from './components/PrintModal';
import OnboardingModal from './components/OnboardingModal';
import { AppConfig, NameEntry } from './types';
import { DEFAULT_CONFIG } from './constants'; // DEFAULT_NAMES is no longer imported from constants

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  // Define DEFAULT_NAMES locally with a single generic entry
  const DEFAULT_NAMES: NameEntry[] = [
    { id: '1', line1: 'Full Name', line2: 'Designation' },
  ];
  const [names, setNames] = useState<NameEntry[]>(DEFAULT_NAMES);
  const [bulkText, setBulkText] = useState(
    DEFAULT_NAMES.map(n => `${n.line1}, ${n.line2}`).join('\n')
  );
  const [showModal, setShowModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Lifted State from Sidebar
  const [activeTab, setActiveTab] = useState<'names' | 'style'>('names');
  const [inputMode, setInputMode] = useState<'manual' | 'bulk'>('manual');


  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    // User requested to switch to "Names" tab and list view on completion
    setActiveTab('names');
    setInputMode('manual');
    localStorage.setItem('tentcard_onboarding_seen', 'true');
  };

  const handleStepChange = (stepIndex: number) => {
    // 0: Welcome
    // 1: Manual (List & Size)
    // 2: Bulk
    // 3: Delete
    // 4: Zoom
    // 5: Dimensions (Style Tab)
    // 6: Print

    if (stepIndex === 1) { // Manual
      setActiveTab('names');
      setInputMode('manual');
    } else if (stepIndex === 2) { // Bulk
      setActiveTab('names');
      setInputMode('bulk');
    } else if (stepIndex === 3 || stepIndex === 4) { // Delete / Zoom (Back to list)
      setActiveTab('names');
      setInputMode('manual'); // Need manual mode to see list items
    } else if (stepIndex === 5) { // Dimensions
      setActiveTab('style');
    }
  };

  // Simple debounce for preview rendering if needed, 
  // but React 18 handles this efficiently. 
  // We'll pass state directly for instant feedback as requested.

  const handlePrintRequest = () => {
    setShowModal(true);
  };

  const handlePrintConfirm = () => {
    window.print();
    setShowModal(false);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans text-gray-900">
      <style>
        {`
          @media print {
            @page {
              size: ${config.paperSize} ${config.orientation};
              margin: 0;
            }
            
            /* CRITICAL: Override all layout constraints for print */
            html, body, #root {
              height: auto !important;
              width: 100% !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
              background: white !important;
            }
            
            /* Override the root flex container */
            #root > div {
              display: block !important;
              height: auto !important;
              width: 100% !important;
              overflow: visible !important;
              background: white !important;
            }
            
            /* Override main element */
            main {
              display: block !important;
              height: auto !important;
              width: 100% !important;
              overflow: visible !important;
              position: static !important;
              background: white !important;
            }
            
            /* Override all nested containers in main */
            main > div,
            main > div > div,
            main > div > div > div {
              height: auto !important;
              overflow: visible !important;
              position: static !important;
            }
            
            /* Reset the scale transform wrapper */
            .print-pages-wrapper {
              transform: none !important;
              transform-origin: initial !important;
            }
            
            /* Each page wrapper */
            .page-wrapper {
              position: static !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            
            /* Each print page - force page breaks */
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
            
            /* Ensure colors print */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
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

      {/* Print Modal */}
      <PrintModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handlePrintConfirm}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onStepChange={handleStepChange}
      />

      {/* Footer / Branding - Visible only on screen */}
      <footer className="fixed bottom-4 right-6 text-xs text-gray-400 pointer-events-none print:hidden z-10">
        Minimalist Name Plate Gen 🏷️
      </footer>
    </div>
  );
};

export default App;
