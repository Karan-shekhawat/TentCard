import React from 'react';
import { X, Clock, Trash2, RotateCcw } from 'lucide-react';
import { SavedNameplate } from '../userTypes';
import { useAuth } from '../contexts/AuthContext';

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onRestore: (id: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, onRestore }) => {
    const { userData, deleteFromHistory, user } = useAuth();

    if (!isOpen) return null;

    // Get history from userData (logged in) or localStorage (guest)
    const history: SavedNameplate[] = userData?.history || [];
    const sortedHistory = [...history].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Delete this saved design?')) {
            await deleteFromHistory(id);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Clock size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Saved Designs</h2>
                            <p className="text-sm text-gray-500">
                                {sortedHistory.length} saved design{sortedHistory.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {sortedHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Clock size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No saved designs yet</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Create a nameplate design and save it to see it here. Your designs will be
                                {user ? ' synced across devices.' : ' saved locally.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {sortedHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className="group bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {formatDate(item.savedAt)}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                                                    {item.names.length} name{item.names.length !== 1 ? 's' : ''}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                                    {item.config.plateWidthCm}×{item.config.plateHeightCm} cm
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => onRestore(item.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                <RotateCcw size={14} />
                                                Restore
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(item.id, e)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {sortedHistory.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-500 text-center">
                            Maximum 20 designs can be saved. Oldest designs are removed when limit is reached.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPanel;
