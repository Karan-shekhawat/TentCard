
import React, { useMemo, useState } from 'react';
import { AppConfig, NameEntry } from '../types';
import { PAPER_DIMENSIONS } from '../constants';
import NamePlate from './NamePlate';
import { HelpCircle } from 'lucide-react';

interface PrintPreviewProps {
  config: AppConfig;
  names: NameEntry[];
  onHelp: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ config, names, onHelp }) => {
  // View Options State
  const [scale, setScale] = useState(0.7); // Default zoom 70%
  const [showMainRuler, setShowMainRuler] = useState(false); // Default OFF
  const [showSizeIndicators, setShowSizeIndicators] = useState(true); // Default ON
  const [showPrintRulers, setShowPrintRulers] = useState(true); // Default ON

  // Calculation logic for layout
  const pages = useMemo(() => {
    const paper = PAPER_DIMENSIONS[config.paperSize];
    const paperW = config.orientation === 'portrait' ? paper.width : paper.height;
    const paperH = config.orientation === 'portrait' ? paper.height : paper.width;

    const plateFullHeight = config.plateHeightCm * 2;

    // Simple vertical fit logic (assuming full width usage or centered)
    // Add minimal margin buffer (1cm)
    const availableHeight = paperH - 1;

    // Can we fit 2 plates vertically?
    const platesPerPage = (plateFullHeight * 2) <= availableHeight ? 2 : 1;

    const chunks = [];
    for (let i = 0; i < names.length; i += platesPerPage) {
      chunks.push(names.slice(i, i + platesPerPage));
    }
    return chunks;
  }, [config.paperSize, config.orientation, config.plateHeightCm, names]);

  const paperDims = config.orientation === 'portrait'
    ? PAPER_DIMENSIONS[config.paperSize]
    : { width: PAPER_DIMENSIONS[config.paperSize].height, height: PAPER_DIMENSIONS[config.paperSize].width };

  return (
    <div className="print-preview-container flex flex-col h-full w-full bg-gray-100">
      {/* View Options Control Bar - Screen Only */}
      <div className="view-options-bar flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm print:hidden z-50 sticky top-0">
        <div className="flex items-center gap-6">
          <div className="text-sm font-semibold text-gray-700">View Options:</div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
            <input
              type="checkbox"
              checked={showMainRuler}
              onChange={(e) => setShowMainRuler(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Page Ruler
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
            <input
              type="checkbox"
              checked={showSizeIndicators}
              onChange={(e) => setShowSizeIndicators(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Size Indicators
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
            <input
              type="checkbox"
              checked={showPrintRulers}
              onChange={(e) => setShowPrintRulers(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Print Rulers
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>Zoom:</span>
            <input
              type="range"
              min="30"
              max="150"
              value={scale * 100}
              onChange={(e) => setScale(Number(e.target.value) / 100)}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="w-12 text-right font-medium">{Math.round(scale * 100)}%</span>
          </label>

          <button
            onClick={onHelp}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Show Instructions"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable container for screen preview */}
      <div className="flex-1 overflow-auto bg-gray-100 p-8 flex flex-col items-center">
        {names.length === 0 && (
          <div className="text-gray-400 text-lg mt-20 print:hidden">Start by adding names on the left...</div>
        )}

        {/* Pages container - apply scale only for screen */}
        <div
          className="print-pages-wrapper flex flex-col items-center gap-20 print:gap-0"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {pages.map((pageNames, pageIndex) => {
            // Calculate layout positions for ruler highlighting
            const plateFullHeight = config.plateHeightCm * 2;
            const totalContentHeight = plateFullHeight * pageNames.length;
            const startY = (paperDims.height - totalContentHeight) / 2;
            const endY = startY + totalContentHeight;

            // Boundaries for guide lines
            const horizontalLines = [startY];
            for (let i = 1; i <= pageNames.length; i++) {
              horizontalLines.push(startY + (plateFullHeight * i));
            }

            const startX = (paperDims.width - config.plateWidthCm) / 2;
            const endX = startX + config.plateWidthCm;
            const verticalLines = [startX, endX];

            return (
              <div key={pageIndex} className="page-wrapper relative print:static">
                {/* Page Header - Screen Only */}
                <div className="page-header absolute -top-10 left-0 right-0 text-center text-sm text-gray-600 print:hidden pointer-events-none z-10 font-semibold uppercase tracking-wide bg-white/80 py-1 rounded-md mx-auto w-max px-4">
                  Page {pageIndex + 1} of {pages.length} ({config.paperSize.toUpperCase()} - {config.orientation})
                </div>

                {/* Guide Lines - Screen Only */}
                {showMainRuler && (
                  <div className="guides absolute inset-0 pointer-events-none z-20 print:hidden">
                    {/* Horizontal Dotted Lines */}
                    {horizontalLines.map((y, idx) => (
                      <div key={`h-line-${idx}`} className="absolute left-0 w-full border-t border-dotted border-red-400 opacity-50" style={{ top: `${(y / paperDims.height) * 100}%` }}></div>
                    ))}
                    {/* Vertical Dotted Lines */}
                    {verticalLines.map((x, idx) => (
                      <div key={`v-line-${idx}`} className="absolute top-0 h-full border-l border-dotted border-red-400 opacity-50" style={{ left: `${(x / paperDims.width) * 100}%` }}></div>
                    ))}
                  </div>
                )}

                {/* Left Ruler - Screen Only */}
                {showMainRuler && (
                  <div className="ruler-left absolute left-0 top-0 h-full w-12 -translate-x-full print:hidden flex flex-col pointer-events-none select-none bg-white/50 border-r border-gray-200">
                    <div className="relative w-full h-full">
                      {Array.from({ length: Math.floor(paperDims.height) + 1 }, (_, i) => {
                        const isActive = i >= Math.floor(startY) && i <= Math.ceil(endY);
                        return (
                          <div key={i} className="absolute right-0 w-full flex items-center justify-end" style={{ top: `${(i / paperDims.height) * 100}%`, transform: 'translateY(-50%)' }}>
                            <span className={`text-[10px] font-medium mr-2 ${isActive ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{i}</span>
                            <div className={`w-3 h-px ${isActive ? 'bg-red-400' : 'bg-gray-400'}`}></div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Right Ruler - Screen Only */}
                {showMainRuler && (
                  <div className="ruler-right absolute right-0 top-0 h-full w-12 translate-x-full print:hidden flex flex-col pointer-events-none select-none bg-white/50 border-l border-gray-200">
                    <div className="relative w-full h-full">
                      {Array.from({ length: Math.floor(paperDims.height) + 1 }, (_, i) => {
                        const isActive = i >= Math.floor(startY) && i <= Math.ceil(endY);
                        return (
                          <div key={i} className="absolute left-0 w-full flex items-center justify-start" style={{ top: `${(i / paperDims.height) * 100}%`, transform: 'translateY(-50%)' }}>
                            <div className={`w-3 h-px ${isActive ? 'bg-red-400' : 'bg-gray-400'}`}></div>
                            <span className={`text-[10px] font-medium ml-2 ${isActive ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{i}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom Ruler - Screen Only */}
                {showMainRuler && (
                  <div className="ruler-bottom absolute bottom-0 left-0 w-full h-12 translate-y-full print:hidden flex pointer-events-none select-none bg-white/50 border-t border-gray-200">
                    <div className="relative w-full h-full">
                      {Array.from({ length: Math.floor(paperDims.width) + 1 }, (_, i) => {
                        const isActive = i >= Math.floor(startX) && i <= Math.ceil(endX);
                        return (
                          <div key={i} className="absolute top-0 h-full flex flex-col items-center justify-start" style={{ left: `${(i / paperDims.width) * 100}%`, transform: 'translateX(-50%)' }}>
                            <div className={`h-3 w-px ${isActive ? 'bg-red-400' : 'bg-gray-400'}`}></div>
                            <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{i}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* THE ACTUAL PRINT PAGE */}
                <div
                  className="print-page bg-white shadow-2xl relative print:shadow-none print:m-0"
                  style={{
                    width: `${paperDims.width}cm`,
                    height: `${paperDims.height}cm`,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0,
                  }}
                >
                  {pageNames.map((nameEntry, plateIndex) => (
                    <div key={nameEntry.id} className="plate-container z-10 relative group">
                      {/* Width Indicator - Screen Only */}
                      {showSizeIndicators && (
                        <div className={`indicator-width absolute left-0 w-full text-center text-sm text-blue-600 font-bold print:hidden z-50 ${plateIndex === 0 ? '-top-10' : '-bottom-10'}`}>
                          <div className="flex items-center justify-center gap-2 bg-white/90 shadow-sm rounded-full py-1 px-4 mx-auto w-max border border-blue-200">
                            <div className="h-px w-8 bg-blue-400"></div>
                            <span>{config.plateWidthCm} cm</span>
                            <div className="h-px w-8 bg-blue-400"></div>
                          </div>
                        </div>
                      )}

                      {/* Height Indicator - Screen Only */}
                      {showSizeIndicators && (
                        <div className={`indicator-height absolute top-0 h-full flex items-center justify-center text-sm text-blue-600 font-bold print:hidden z-50 ${plateIndex === 0 ? '-left-16' : '-right-16'}`}>
                          <div className="flex flex-col items-center gap-2 bg-white/90 shadow-sm rounded-full py-4 px-1 border border-blue-200">
                            <div className="w-px h-8 bg-blue-400"></div>
                            <span className="vertical-rl rotate-180" style={{ writingMode: 'vertical-rl' }}>{config.plateHeightCm * 2} cm</span>
                            <div className="w-px h-8 bg-blue-400"></div>
                          </div>
                        </div>
                      )}

                      <NamePlate
                        data={nameEntry}
                        config={config}
                        isFirstOnPage={plateIndex === 0}
                        isLastOnPage={plateIndex === pageNames.length - 1}
                        showPrintRulers={showPrintRulers}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Print-specific styles injected via style tag */}
      <style>{`
        @media print {
          /* Reset the entire document for printing */
          html, body, #root {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          /* Hide all non-print elements */
          aside, footer, header, nav, .fixed, .view-options-bar,
          .page-header, .guides, .ruler-left, .ruler-right, .ruler-bottom,
          .indicator-width, .indicator-height {
            display: none !important;
          }

          /* Ensure proper page breaks and layout */
          .print-preview-container {
            display: block !important;
            height: auto !important;
            width: auto !important;
            overflow: visible !important;
            background: white !important;
          }
           
          /* Force display of print wrappers */
          .print-pages-wrapper, .page-wrapper {
             display: block !important;
             height: auto !important;
             overflow: visible !important;
             transform: none !important; /* Disable zoom for print */
          }

          /* Define page constraints */
          .print-page {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
            break-after: always;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          /* Ensure last page doesn't break endlessly */
          .page-wrapper:last-child .print-page {
             break-after: auto;
             page-break-after: auto;
          }
        }
      `}</style>
    </div >
  );
};

export default PrintPreview;