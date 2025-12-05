import React from 'react';
import { Printer, Heart, X, Check } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Printer className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Print!</h2>
          <p className="text-gray-600 mb-6">
            We've prepared your name plates. The first page includes a 5cm scale for verification.
            Use standard A4 or Letter paper.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1 font-medium">
              Developed by <span className="text-blue-600">Gemini</span> with <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            </p>
            <p className="text-xs text-gray-400 mt-1">Enjoy your event! 🎉</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Adjust
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
