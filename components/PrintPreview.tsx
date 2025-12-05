
import React, { useMemo } from 'react';
import { AppConfig, NameEntry } from '../types';
import { PAPER_DIMENSIONS } from '../constants';
import NamePlate from './NamePlate';

interface PrintPreviewProps {
  config: AppConfig;
  names: NameEntry[];
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ config, names }) => {
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
    <div className="flex flex-col items-center gap-8 py-8 w-full print:py-0 print:gap-0">


      {names.length === 0 && (
        <div className="text-gray-400 text-lg mt-20">Start by adding names on the left...</div>
      )}

      {pages.map((pageNames, pageIndex) => {
        // Calculate layout positions for ruler highlighting
        const plateFullHeight = config.plateHeightCm * 2;
        const totalContentHeight = plateFullHeight * pageNames.length; // gap is 0
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
          <div key={pageIndex} className="relative">
            {/* Watermark for preview only - OUTSIDE the print-page */}
            <div className="absolute -top-6 right-0 text-xs text-gray-300 print:hidden pointer-events-none z-10 font-medium uppercase tracking-wide">
              Page {pageIndex + 1} ({config.paperSize.toUpperCase()} - {config.orientation})
            </div>

            {/* Guide Lines - Screen Only */}
            <div className="absolute inset-0 pointer-events-none z-20 print:hidden">
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
            <div className="absolute left-0 top-0 h-full w-12 -translate-x-full print:hidden flex flex-col pointer-events-none select-none bg-white/50 border-r border-gray-200">
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
                {/* MM Ticks */}
                {Array.from({ length: Math.floor(paperDims.height * 10) }, (_, i) => {
                  if (i % 10 === 0) return null; // Skip cm marks
                  const isHalf = i % 5 === 0;
                  const cmVal = i / 10;
                  const isActive = cmVal >= startY && cmVal <= endY;
                  return (
                    <div
                      key={`mm-${i}`}
                      className={`absolute right-0 ${isHalf ? 'w-2' : 'w-1'} h-px ${isActive ? 'bg-red-300' : (isHalf ? 'bg-gray-300' : 'bg-gray-200')}`}
                      style={{ top: `${(i / (paperDims.height * 10)) * 100}%` }}
                    ></div>
                  );
                })}
              </div>
            </div>

            {/* Right Ruler - Screen Only */}
            <div className="absolute right-0 top-0 h-full w-12 translate-x-full print:hidden flex flex-col pointer-events-none select-none bg-white/50 border-l border-gray-200">
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
                {/* MM Ticks */}
                {Array.from({ length: Math.floor(paperDims.height * 10) }, (_, i) => {
                  if (i % 10 === 0) return null;
                  const isHalf = i % 5 === 0;
                  const cmVal = i / 10;
                  const isActive = cmVal >= startY && cmVal <= endY;
                  return (
                    <div
                      key={`mm-${i}`}
                      className={`absolute left-0 ${isHalf ? 'w-2' : 'w-1'} h-px ${isActive ? 'bg-red-300' : (isHalf ? 'bg-gray-300' : 'bg-gray-200')}`}
                      style={{ top: `${(i / (paperDims.height * 10)) * 100}%` }}
                    ></div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Ruler - Screen Only */}
            <div className="absolute bottom-0 left-0 w-full h-12 translate-y-full print:hidden flex pointer-events-none select-none bg-white/50 border-t border-gray-200">
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
                {/* MM Ticks */}
                {Array.from({ length: Math.floor(paperDims.width * 10) }, (_, i) => {
                  if (i % 10 === 0) return null;
                  const isHalf = i % 5 === 0;
                  const cmVal = i / 10;
                  const isActive = cmVal >= startX && cmVal <= endX;
                  return (
                    <div
                      key={`mm-${i}`}
                      className={`absolute top-0 ${isHalf ? 'h-2' : 'h-1'} w-px ${isActive ? 'bg-red-300' : (isHalf ? 'bg-gray-300' : 'bg-gray-200')}`}
                      style={{ left: `${(i / (paperDims.width * 10)) * 100}%` }}
                    ></div>
                  );
                })}
              </div>
            </div>

            <div
              className="print-page bg-white shadow-2xl relative print:shadow-none print:m-0"
              style={{
                width: `${paperDims.width}cm`,
                height: `${paperDims.height}cm`,
                padding: 0, // Remove fixed padding to allow perfect centering
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Center horizontally
                justifyContent: 'center', // Center vertically
                gap: 0, // No gap between plates - borders will touch
                pageBreakAfter: pageIndex === pages.length - 1 ? 'auto' : 'always',
              }}
            >

              {pageNames.map((nameEntry) => (
                <div key={nameEntry.id} className="z-10 relative group">
                  {/* Width Indicator - Screen Only - ALWAYS VISIBLE */}
                  <div className="absolute -top-10 left-0 w-full text-center text-sm text-blue-600 font-bold print:hidden z-50">
                    <div className="flex items-center justify-center gap-2 bg-white/90 shadow-sm rounded-full py-1 px-4 mx-auto w-max border border-blue-200">
                      <div className="h-px w-8 bg-blue-400"></div>
                      <span>{config.plateWidthCm} cm</span>
                      <div className="h-px w-8 bg-blue-400"></div>
                    </div>
                  </div>

                  {/* Height Indicator - Screen Only - ALWAYS VISIBLE */}
                  <div className="absolute top-0 -left-16 h-full flex items-center justify-center text-sm text-blue-600 font-bold print:hidden z-50">
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
  );
};

export default PrintPreview;