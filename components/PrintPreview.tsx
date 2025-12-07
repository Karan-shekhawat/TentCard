
import React, { useMemo, useState, useEffect } from 'react';
import { AppConfig, NameEntry } from '../types';
import { PAPER_DIMENSIONS } from '../constants';
import NamePlate from './NamePlate';

interface PrintPreviewProps {
  config: AppConfig;
  names: NameEntry[];
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ config, names }) => {
  const [scale, setScale] = useState(1);

  // Calculate optimal scale based on viewport
  useEffect(() => {
    const calculateScale = () => {
      const paper = PAPER_DIMENSIONS[config.paperSize];
      const paperH = config.orientation === 'portrait' ? paper.height : paper.width;

      // Convert cm to pixels (approximately 37.8 pixels per cm)
      const cmToPx = 37.8;
      const paperHeightPx = paperH * cmToPx;

      // Get available viewport height (subtract header/footer space ~100px)
      const availableHeight = window.innerHeight - 100;

      // Calculate scale to fit paper in viewport
      let newScale = availableHeight / (paperHeightPx + 150); // +150 for rulers and padding

      // Clamp scale between 0.3 and 1
      newScale = Math.min(1, Math.max(0.3, newScale));

      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [config.paperSize, config.orientation]);

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
    <div className="print-preview-container">
      {/* Scale indicator - screen only */}
      <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-200 text-xs font-medium text-gray-600 print:hidden z-50">
        Preview: {Math.round(scale * 100)}%
      </div>

      {/* Scrollable container for screen preview */}
      <div className="flex flex-col items-center pt-12 pb-8 w-full h-full overflow-auto print:overflow-visible print:h-auto print:p-0">
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

                {/* Left Ruler - Screen Only */}
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

                {/* Right Ruler - Screen Only */}
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

                {/* Bottom Ruler - Screen Only */}
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
                      <div className={`indicator-width absolute left-0 w-full text-center text-sm text-blue-600 font-bold print:hidden z-50 ${plateIndex === 0 ? '-top-10' : '-bottom-10'}`}>
                        <div className="flex items-center justify-center gap-2 bg-white/90 shadow-sm rounded-full py-1 px-4 mx-auto w-max border border-blue-200">
                          <div className="h-px w-8 bg-blue-400"></div>
                          <span>{config.plateWidthCm} cm</span>
                          <div className="h-px w-8 bg-blue-400"></div>
                        </div>
                      </div>

                      {/* Height Indicator - Screen Only */}
                      <div className={`indicator-height absolute top-0 h-full flex items-center justify-center text-sm text-blue-600 font-bold print:hidden z-50 ${plateIndex === 0 ? '-left-16' : '-right-16'}`}>
                        <div className="flex flex-col items-center gap-2 bg-white/90 shadow-sm rounded-full py-4 px-1 border border-blue-200">
                          <div className="w-px h-8 bg-blue-400"></div>
                          <span className="vertical-rl rotate-180" style={{ writingMode: 'vertical-rl' }}>{config.plateHeightCm * 2} cm</span>
                          <div className="w-px h-8 bg-blue-400"></div>
                        </div>
                      </div>

                      <NamePlate data={nameEntry} config={config} />
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
          aside, footer, header, nav, .fixed, 
          .page-header, .guides, .ruler-left, .ruler-right, .ruler-bottom,
          .indicator-width, .indicator-height {
            display: none !important;
          }
          
          /* Reset the preview container */
          .print-preview-container,
          .print-preview-container > div {
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* CRITICAL: Remove scale transform for print */
          .print-pages-wrapper {
            transform: none !important;
            gap: 0 !important;
          }
          
          /* Page wrapper for print */
          .page-wrapper {
            position: static !important;
          }
          
          /* Each print page */
          .print-page {
            break-after: page !important;
            page-break-after: always !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
          
          .print-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
          
          /* Ensure colors print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintPreview;