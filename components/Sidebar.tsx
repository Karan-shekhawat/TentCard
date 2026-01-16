
import React, { ChangeEvent, useState } from 'react';
import { AppConfig, NameEntry, PaperSize, Orientation, BorderStyle } from '../types';
import { FONT_OPTIONS, COLOR_OPTIONS } from '../constants';
import { Settings, Printer, List, Layout, Plus, Trash2, AlignJustify, ZoomIn, ZoomOut, ChevronDown, Palette, FileText, Check, Scaling, HelpCircle } from 'lucide-react';

interface SidebarProps {
    config: AppConfig;
    setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
    names: NameEntry[];
    setNames: React.Dispatch<React.SetStateAction<NameEntry[]>>;
    onPrint: () => void;
    bulkText: string;
    setBulkText: (text: string) => void;
    activeTab: 'names' | 'style';
    setActiveTab: (tab: 'names' | 'style') => void;
    inputMode: 'manual' | 'bulk';
    setInputMode: (mode: 'manual' | 'bulk') => void;
}

interface ConfigSectionProps {
    title: string;
    icon?: any;
    defaultOpen?: boolean;
    id?: string;
}

const ConfigSection: React.FC<React.PropsWithChildren<ConfigSectionProps>> = ({ title, icon: Icon, children, defaultOpen = false, id }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div id={id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <span className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />} {title}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-3 space-y-3 border-t border-gray-100">{children}</div>}
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({
    config,
    setConfig,
    names,
    setNames,
    onPrint,
    bulkText,
    setBulkText,
    activeTab,
    setActiveTab,
    inputMode,
    setInputMode
}) => {
    // Manual Entry State
    const [manualLine1, setManualLine1] = useState('');
    const [manualLine2, setManualLine2] = useState('');

    const handleBulkChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setBulkText(text);

        const newNames: NameEntry[] = text
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line, idx) => {
                const parts = line.split(/[,—-]+(.+)/);
                const line1 = parts[0].trim();
                const line2 = parts[1] ? parts[1].trim() : '';
                return { id: `bulk-${idx}`, line1, line2, scale: 1 };
            });
        setNames(newNames);
    };

    const handleManualAdd = () => {
        if (!manualLine1.trim()) return;
        const newEntry: NameEntry = {
            id: `manual-${Date.now()}`,
            line1: manualLine1,
            line2: manualLine2,
            scale: 1,
        };
        const newNames = [...names, newEntry];
        setNames(newNames);

        // Sync bulk text
        setBulkText(newNames.map(n => n.line2 ? `${n.line1}, ${n.line2}` : n.line1).join('\n'));

        setManualLine1('');
        setManualLine2('');
    };

    const handleDelete = (id: string) => {
        const newNames = names.filter(n => n.id !== id);
        setNames(newNames);
        setBulkText(newNames.map(n => n.line2 ? `${n.line1}, ${n.line2}` : n.line1).join('\n'));
    };

    const handleScaleChange = (id: string, delta: number) => {
        const newNames = names.map(n => {
            if (n.id === id) {
                const currentScale = n.scale || 1;
                const newScale = Math.max(0.5, Math.min(2.0, currentScale + delta));
                return { ...n, scale: newScale };
            }
            return n;
        });
        setNames(newNames);
    };

    const updateConfig = (key: keyof AppConfig, value: any) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full max-h-screen overflow-hidden font-sans z-30 transition-all duration-300 text-[0.85rem]">
            {/* Minimal top padding since we have a main header now */}
            <div className="h-2 bg-gray-50/50"></div>

            <div className="flex border-b border-gray-200 bg-white">
                <button
                    onClick={() => setActiveTab('names')}
                    className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'names' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <List className="w-3.5 h-3.5" /> Names
                </button>
                <button
                    onClick={() => setActiveTab('style')}
                    className={`flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'style' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <Settings className="w-3.5 h-3.5" /> Style
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 bg-gray-50/50">
                {activeTab === 'names' ? (
                    <div className="space-y-3">

                        {/* Input Mode Toggle */}
                        <div className="flex rounded-lg bg-gray-200 p-0.5 mb-3">
                            <button
                                onClick={() => setInputMode('manual')}
                                className={`flex-1 py-1 text-[10px] font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${inputMode === 'manual' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <List className="w-2.5 h-2.5" /> List & Size
                            </button>
                            <button
                                onClick={() => {
                                    setInputMode('bulk');
                                    const currentBulk = names.map(n => n.line2 ? `${n.line1}, ${n.line2}` : n.line1).join('\n');
                                    setBulkText(currentBulk);
                                }}
                                className={`flex-1 py-1 text-[10px] font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${inputMode === 'bulk' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <AlignJustify className="w-2.5 h-2.5" /> Bulk Text
                            </button>
                        </div>

                        {inputMode === 'manual' ? (
                            <>
                                {/* Add New Section */}
                                <div id="tour-manual-input" className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm space-y-2 mb-4">
                                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Create New Plate</h3>
                                    <div className="space-y-1.5">
                                        <input
                                            type="text"
                                            placeholder="Full Name (e.g. John Doe)"
                                            className="w-full p-2 border border-gray-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                                            value={manualLine1}
                                            onChange={e => setManualLine1(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleManualAdd()}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Designation (Optional)"
                                            className="w-full p-2 border border-gray-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                                            value={manualLine2}
                                            onChange={e => setManualLine2(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleManualAdd()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleManualAdd}
                                        disabled={!manualLine1.trim()}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md shadow-sm flex items-center justify-center gap-1.5 transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Plate
                                    </button>
                                </div>

                                {/* List of names */}
                                <div id="tour-names-list" className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Your Plates ({names.length})</h3>
                                    </div>

                                    {names.map((entry) => (
                                        <div key={entry.id} className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm hover:border-blue-400 transition-all group">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-gray-900 truncate leading-tight">{entry.line1}</div>
                                                    {entry.line2 && <div className="text-[10px] text-gray-500 truncate mt-0.5">{entry.line2}</div>}
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="delete-btn p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Individual Scale Controls - Always visible */}
                                            <div className="zoom-controls flex items-center gap-1.5 bg-gray-50 rounded-md p-1 border border-gray-100">
                                                <span className="text-[9px] uppercase font-bold text-gray-400 px-1">Size</span>
                                                <button
                                                    onClick={() => handleScaleChange(entry.id, -0.1)}
                                                    className="onboarding-zoom-btn w-6 h-6 flex items-center justify-center hover:bg-white hover:shadow-sm rounded text-gray-600 transition-all border border-transparent hover:border-gray-200"
                                                    title="Decrease Size"
                                                >
                                                    <ZoomOut className="w-3 h-3" />
                                                </button>

                                                <div className="flex-1 text-center font-mono text-[10px] font-medium text-gray-700">
                                                    {Math.round((entry.scale || 1) * 100)}%
                                                </div>

                                                <button
                                                    onClick={() => handleScaleChange(entry.id, 0.1)}
                                                    className="onboarding-zoom-btn w-6 h-6 flex items-center justify-center hover:bg-white hover:shadow-sm rounded text-gray-600 transition-all border border-transparent hover:border-gray-200"
                                                    title="Increase Size"
                                                >
                                                    <ZoomIn className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {names.length === 0 && (
                                        <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                                            <p className="text-gray-400 text-xs">No names added yet.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div id="tour-bulk-mode" className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Bulk Paste
                                </label>
                                <div className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                                    Paste your list below. <br />
                                    One name per line. Use a comma or dash to separate the designation.
                                </div>
                                <textarea
                                    className="flex-1 w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs font-mono leading-relaxed outline-none transition-colors resize-none"
                                    placeholder="John Doe, CEO&#10;Jane Smith, Manager"
                                    value={bulkText}
                                    onChange={handleBulkChange}
                                />
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="pb-8">
                        {/* Paper & Layout */}
                        <ConfigSection title="Paper & Layout" icon={Layout} defaultOpen={true}>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Paper Size</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-1.5 pl-2 bg-gray-50 border border-gray-200 rounded-md text-xs appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={config.paperSize}
                                            onChange={(e) => updateConfig('paperSize', e.target.value as PaperSize)}
                                        >
                                            <option value="a4">A4</option>
                                            <option value="letter">Letter</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Orientation</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-1.5 pl-2 bg-gray-50 border border-gray-200 rounded-md text-xs appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={config.orientation}
                                            onChange={(e) => updateConfig('orientation', e.target.value as Orientation)}
                                        >
                                            <option value="portrait">Portrait</option>
                                            <option value="landscape">Landscape</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </ConfigSection>

                        {/* Dimensions */}
                        <ConfigSection id="tour-dimensions" title="Plate Dimensions" icon={FileText} defaultOpen={true}>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-[10px] font-medium text-gray-600">Width</label>
                                        <div className="flex items-center gap-1 text-[10px] font-mono text-blue-600 bg-blue-50 px-1 rounded">
                                            <input
                                                type="number"
                                                min="5"
                                                max="28"
                                                step="0.1"
                                                value={config.plateWidthCm}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (!isNaN(val)) updateConfig('plateWidthCm', Math.max(5, Math.min(28, val)));
                                                }}
                                                className="w-10 bg-transparent border-none p-0 focus:ring-0 text-right outline-none"
                                            />
                                            <span>cm</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="28"
                                        step="0.1"
                                        value={config.plateWidthCm}
                                        onChange={(e) => updateConfig('plateWidthCm', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-[10px] font-medium text-gray-600">Height (One Side)</label>
                                        <div className="flex items-center gap-1 text-[10px] font-mono text-blue-600 bg-blue-50 px-1 rounded">
                                            <input
                                                type="number"
                                                min="2"
                                                max="14"
                                                step="0.1"
                                                value={config.plateHeightCm}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (!isNaN(val)) updateConfig('plateHeightCm', Math.max(2, Math.min(14, val)));
                                                }}
                                                className="w-8 bg-transparent border-none p-0 focus:ring-0 text-right outline-none"
                                            />
                                            <span>cm</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="2"
                                        max="14"
                                        step="0.1"
                                        value={config.plateHeightCm}
                                        onChange={(e) => updateConfig('plateHeightCm', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            </div>
                        </ConfigSection>

                        {/* Sizing Tab */}
                        <ConfigSection title="Sizing" icon={Scaling} defaultOpen={true}>
                            <div className="space-y-3">
                                {/* Auto-Fit Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-medium text-gray-800">Auto-fit Text Width</span>
                                        <p className="text-[9px] text-gray-400 mt-0.5">Scale text to fit plate automatically</p>
                                    </div>
                                    <button
                                        onClick={() => updateConfig('autoFit', !config.autoFit)}
                                        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${config.autoFit ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    >
                                        <span
                                            className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm ${config.autoFit ? 'translate-x-4' : 'translate-x-0'}`}
                                        />
                                    </button>
                                </div>

                                {/* Manual Sizing Controls - Only show if Auto-Fit is OFF */}
                                {!config.autoFit && (
                                    <div className="pt-3 border-t border-gray-100 space-y-3 animate-in fade-in duration-300">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <label className="text-[10px] font-medium text-gray-600">Base Font Size</label>
                                                <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1 rounded">{config.fontSize} pt</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="10"
                                                max="72"
                                                value={config.fontSize}
                                                onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
                                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                        </div>

                                        <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
                                            <div className="flex justify-between mb-1">
                                                <label className="text-[10px] font-medium text-gray-600">Secondary Scale</label>
                                                <span className="text-[10px] font-mono text-blue-600 bg-white border border-gray-200 px-1 rounded">{Math.round(config.secondaryScale * 100)}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.2"
                                                max="1.0"
                                                step="0.05"
                                                value={config.secondaryScale}
                                                onChange={(e) => updateConfig('secondaryScale', parseFloat(e.target.value))}
                                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ConfigSection>

                        {/* Text Styling (Always Visible) */}
                        <ConfigSection title="Text Styling" icon={Palette} defaultOpen={true}>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Font Family</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-1.5 pl-2 bg-gray-50 border border-gray-200 rounded-md text-xs appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={config.fontFamily}
                                            onChange={(e) => updateConfig('fontFamily', e.target.value)}
                                        >
                                            {FONT_OPTIONS.map((f) => (
                                                <option key={f.value} value={f.value}>{f.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Main Text Style */}
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Main Text</label>
                                    <div className="flex gap-1.5 mb-2">
                                        <button
                                            onClick={() => updateConfig('isBold', !config.isBold)}
                                            className={`flex-1 py-1.5 text-[10px] font-semibold border rounded-md transition-all ${config.isBold ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            Bold
                                        </button>
                                        <button
                                            onClick={() => updateConfig('isItalic', !config.isItalic)}
                                            className={`flex-1 py-1.5 text-[10px] font-serif italic border rounded-md transition-all ${config.isItalic ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            Italic
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {COLOR_OPTIONS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => updateConfig('textColor', c)}
                                                className={`w-5 h-5 rounded-full transition-all relative ${config.textColor === c ? 'ring-2 ring-offset-1 ring-blue-500 scale-110 shadow-sm' : 'border border-gray-200 hover:scale-110'}`}
                                                style={{ backgroundColor: c }}
                                            >
                                                {config.textColor === c && <Check className="w-2.5 h-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Secondary Text Style */}
                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Secondary Text</label>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] text-gray-500">Italic</span>
                                            <button
                                                onClick={() => updateConfig('secondaryIsItalic', !config.secondaryIsItalic)}
                                                className={`w-7 h-3.5 rounded-full transition-colors flex items-center px-0.5 ${config.secondaryIsItalic ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}
                                            >
                                                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            onClick={() => updateConfig('secondaryColor', config.textColor)}
                                            className={`h-5 px-1.5 rounded-full border text-[9px] font-medium flex items-center justify-center transition-all ${config.secondaryColor === config.textColor ? 'bg-blue-50 border-blue-500 text-blue-600 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                        >
                                            Match
                                        </button>
                                        {COLOR_OPTIONS.slice(0, 5).map(c => (
                                            <button
                                                key={c + 'sec'}
                                                onClick={() => updateConfig('secondaryColor', c)}
                                                className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 relative ${config.secondaryColor === c ? 'ring-2 ring-offset-1 ring-blue-500 scale-110 shadow-sm' : 'border-gray-200'}`}
                                                style={{ backgroundColor: c }}
                                            >
                                                {config.secondaryColor === c && <Check className="w-2.5 h-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ConfigSection>

                        {/* Appearance (Renamed/Simplified) */}
                        <ConfigSection title="Appearance" icon={Settings} defaultOpen={true}>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Border Thickness</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-1.5 pl-2 bg-gray-50 border border-gray-200 rounded-md text-xs appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={config.borderStyle}
                                            onChange={(e) => updateConfig('borderStyle', e.target.value as BorderStyle)}
                                        >
                                            <option value="none">None</option>
                                            <option value="thin">Thin</option>
                                            <option value="medium">Medium</option>
                                            <option value="thick">Thick</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                            </div>
                        </ConfigSection>

                    </div>
                )}
            </div>

            <div id="tour-print" className="p-2.5 border-t border-gray-200 bg-white">
                <button
                    onClick={onPrint}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1.5 transform active:scale-[0.98] text-xs"
                >
                    <Printer className="w-4 h-4" />
                    Print Name Plates
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;