import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PrintPreview from './components/PrintPreview';
import PrintModal from './components/PrintModal';
import { AppConfig, NameEntry } from './types';
import { DEFAULT_CONFIG, DEFAULT_NAMES } from './constants';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [names, setNames] = useState<NameEntry[]>(DEFAULT_NAMES);
  const [bulkText, setBulkText] = useState(
    DEFAULT_NAMES.map(n => `${n.line1}, ${n.line2}`).join('\n')
  );
  const [showModal, setShowModal] = useState(false);

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
        />
      </div>

      {/* Main Preview Area */}
      <main className="flex-1 h-full overflow-auto bg-gray-200/80 relative">
        <PrintPreview config={config} names={names} />
      </main>

      {/* Print Modal */}
      <PrintModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handlePrintConfirm}
      />

      {/* Footer / Branding - Visible only on screen */}
      <footer className="fixed bottom-4 right-6 text-xs text-gray-400 pointer-events-none print:hidden z-10">
        Minimalist Name Plate Gen 🏷️
      </footer>
    </div>
  );
};

export default App;
