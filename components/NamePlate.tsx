
import React, { useRef, useState, useLayoutEffect } from 'react';
import { AppConfig, NameEntry } from '../types';

interface NamePlateProps {
  data: NameEntry;
  config: AppConfig;
}

// Helper component for Auto-Fitting text
const AutoFitText: React.FC<{
  text: string;
  style: React.CSSProperties;
  enabled: boolean;
}> = ({ text, style, enabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    // If not enabled, reset scale to 1 (uses provided font size)
    if (!enabled) {
      setScale(1);
      return;
    }

    const containerWidth = containerRef.current.clientWidth;
    const textWidth = textRef.current.scrollWidth;

    // If text is wider than container, scale down
    // Since we are starting with a MAX-HEIGHT based font size in the parent,
    // shrinking it here makes it fit BOTH width and height.
    if (textWidth > containerWidth) {
      setScale(containerWidth / textWidth);
    } else {
      // If it fits width at max-height size, we keep it at 1 (max height size)
      // We do NOT grow it here because that would overflow height.
      setScale(1);
    }
  }, [text, style.fontSize, style.fontFamily, style.fontWeight, enabled]);

  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <span
        ref={textRef}
        style={{
          ...style,
          whiteSpace: 'nowrap',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          display: 'inline-block'
        }}
      >
        {text}
      </span>
    </div>
  );
};

const NamePlate: React.FC<NamePlateProps> = ({ data, config }) => {
  // Border width mapping
  const borderWidths = {
    none: '0px',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  };

  const borderStyle = {
    border: config.borderStyle !== 'none' ? `${borderWidths[config.borderStyle]} solid ${config.textColor}` : 'none',
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    width: `${config.plateWidthCm}cm`,
    height: `${config.plateHeightCm * 2}cm`,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    ...borderStyle,
    color: config.textColor,
    fontFamily: config.fontFamily,
    backgroundColor: 'white',
  };

  const halfStyle: React.CSSProperties = {
    height: '50%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0.5cm',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  // --- Sizing Logic ---

  let mainFontSizePt = 24;
  let secondaryFontSizePt = 16;
  const secondaryScale = config.autoFit ? 0.4 : config.secondaryScale; // Force 40% scale in AutoFit for good proportions
  const entryScale = data.scale || 1.0; // Individual scale for this entry

  if (config.autoFit) {
    // 1. Calculate Available Vertical Height in Pixels
    // 1cm approx 37.8px. Padding is 0.5cm top + 0.5cm bottom = 1cm total.
    // We calculate for ONE HALF of the name plate.
    const availableHeightCm = config.plateHeightCm - 1.0;
    const availableHeightPx = availableHeightCm * 37.8;

    // 2. Determine how many "lines" we effectively have.
    // Main text = 1 unit height. Secondary text = 0.5 unit height.
    // LineHeight factor approx 1.2
    const units = data.line2 ? (1 + secondaryScale) : 1;
    const lineHeightAdjust = 1.2;

    // 3. Calculate max font size in pixels that fits the height
    const maxMainFontSizePx = availableHeightPx / (units * lineHeightAdjust);

    // 4. Convert to Points (1px = 0.75pt)
    mainFontSizePt = maxMainFontSizePx * 0.75;

    // 5. Cap it reasonably so extremely short names don't look absurd (e.g. 200pt)
    // Although user asked for "Max Space", let's limit to something huge but safe.
    mainFontSizePt = Math.min(mainFontSizePt, 150);

    // 6. Apply individual entry scale on top of autofit
    mainFontSizePt = mainFontSizePt * entryScale;

    secondaryFontSizePt = mainFontSizePt * secondaryScale;
  } else {
    // Manual Mode
    mainFontSizePt = config.fontSize * entryScale;
    secondaryFontSizePt = mainFontSizePt * config.secondaryScale;
  }

  const line1Style: React.CSSProperties = {
    fontSize: `${mainFontSizePt}pt`,
    fontWeight: config.isBold ? 'bold' : 'normal',
    fontStyle: config.isItalic ? 'italic' : 'normal',
    lineHeight: 1.2,
  };

  const line2Style: React.CSSProperties = {
    fontSize: `${secondaryFontSizePt}pt`,
    fontWeight: config.isBold ? '600' : 'normal',
    fontStyle: config.secondaryIsItalic ? 'italic' : 'normal',
    color: config.secondaryColor,
    marginTop: '0.2em',
    lineHeight: 1.2,
  };

  // Generate ruler marks for the given length in cm
  // Extended by 2cm beyond the actual size
  const generateRulerMarks = (lengthCm: number, isVertical: boolean, flipDirection: boolean = false) => {
    const marks = [];
    const extendedLengthCm = lengthCm + 2; // Add 2cm extra
    const totalMm = Math.floor(extendedLengthCm * 10);

    for (let mm = 0; mm <= totalMm; mm++) {
      const isCm = mm % 10 === 0;
      const isHalfCm = mm % 5 === 0;
      const position = (mm / totalMm) * 100;

      if (isVertical) {
        // Right side ruler - ticks on left (toward nameplate), numbers on right
        marks.push(
          <div
            key={mm}
            className={`absolute ${flipDirection ? 'left-0' : 'right-0'}`}
            style={{
              top: `${position}%`,
              width: isCm ? '0.4cm' : isHalfCm ? '0.25cm' : '0.15cm',
              height: '0.5px',
              backgroundColor: '#666',
            }}
          >
            {isCm && (
              <span
                className="absolute text-[6pt] text-gray-600"
                style={flipDirection ? { left: '0.5cm', top: '-0.15cm' } : { right: '0.5cm', top: '-0.15cm' }}
              >
                {mm / 10}
              </span>
            )}
          </div>
        );
      } else {
        marks.push(
          <div
            key={mm}
            className="absolute top-0"
            style={{
              left: `${position}%`,
              height: isCm ? '0.4cm' : isHalfCm ? '0.25cm' : '0.15cm',
              width: '0.5px',
              backgroundColor: '#666',
            }}
          >
            {isCm && (
              <span
                className="absolute text-[6pt] text-gray-600"
                style={{ left: '-0.15cm', top: '0.45cm' }}
              >
                {mm / 10}
              </span>
            )}
          </div>
        );
      }
    }
    return marks;
  };

  // Calculate extended ruler dimensions
  const extendedHeight = config.plateHeightCm * 2 + 2; // +2cm extension
  const extendedWidth = config.plateWidthCm + 2; // +2cm extension

  return (
    <div className="name-plate-container" style={containerStyle}>
      {/* Fold Line (Middle) - Always visible */}
      <div
        className="absolute top-1/2 left-0 w-full border-t border-dashed border-gray-300 transform -translate-y-1/2"
        style={{ borderWidth: '1px' }}
      />

      {/* PRINTABLE GUIDE RULER - Right Side (Height) - Extended and flipped */}
      <div
        className="absolute -top-[1cm] -right-[0.8cm] pointer-events-none"
        style={{
          width: '0.7cm',
          height: `${extendedHeight}cm`
        }}
      >
        <div className="relative h-full w-full border-l border-gray-400">
          {generateRulerMarks(config.plateHeightCm * 2, true, true)}
        </div>
        <div
          className="absolute top-1/2 right-[-0.2cm] text-[5pt] text-gray-500 whitespace-nowrap"
          style={{ transform: 'translateY(-50%) rotate(90deg)', transformOrigin: 'center center' }}
        >
          HEIGHT: {config.plateHeightCm * 2}cm
        </div>
      </div>

      {/* PRINTABLE GUIDE RULER - Bottom Side (Width) - Extended, stops before right ruler */}
      <div
        className="absolute -left-[1cm] -bottom-[0.8cm] pointer-events-none"
        style={{
          height: '0.7cm',
          width: `${extendedWidth}cm`
        }}
      >
        <div className="relative w-full h-full border-t border-gray-400">
          {generateRulerMarks(config.plateWidthCm, false)}
        </div>
        <div
          className="absolute bottom-[-0.3cm] left-1/2 text-[5pt] text-gray-500 whitespace-nowrap"
          style={{ transform: 'translateX(-50%)' }}
        >
          WIDTH: {config.plateWidthCm}cm
        </div>
      </div>

      {/* Top Half (Rotated 180deg) */}
      <div style={{ ...halfStyle, transform: 'rotate(180deg)' }}>
        <AutoFitText text={data.line1} style={line1Style} enabled={config.autoFit} />
        {data.line2 && <AutoFitText text={data.line2} style={line2Style} enabled={config.autoFit} />}
      </div>

      {/* Bottom Half (Normal) */}
      <div style={halfStyle}>
        <AutoFitText text={data.line1} style={line1Style} enabled={config.autoFit} />
        {data.line2 && <AutoFitText text={data.line2} style={line2Style} enabled={config.autoFit} />}
      </div>
    </div>
  );
};

export default NamePlate;