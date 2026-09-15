'use client';

import { X } from 'lucide-react';

// Polaroid-inspired color palette
const colors = {
  coral: 'rgb(255, 96, 55)', // Coral red
  yellow: 'rgb(253, 198, 0)', // Sunshine yellow
  purple: 'rgb(130, 36, 227)', // Purple
  orange: 'rgb(255, 150, 0)', // Orange
  blue: 'rgb(74, 144, 226)', // Blue
  green: 'rgb(80, 200, 120)', // Green
  pink: 'rgb(252, 82, 140)', // Pink
  cyan: 'rgb(0, 175, 240)', // Cyan
};

export default function DimensionWarningModal({ isOpen, onClose, onProceed, onRemoveUnmatched }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:text-gray-700"
          style={{ color: colors.coral }}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div
            className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${colors.yellow}20` }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: colors.yellow }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold" style={{ color: colors.purple }}>
            Different Image Dimensions
          </h3>
        </div>

        <p className="text-gray-600 mb-6">
          The images you've uploaded have different dimensions. You can continue anyway, but results
          may be less precise. For best accuracy, use identical dimensions for version comparisons.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRemoveUnmatched}
            className="px-4 py-2 border rounded-2xl text-white font-medium hover:opacity-90"
            style={{ backgroundColor: colors.coral, borderColor: colors.coral }}
          >
            Remove Unmatched Images
          </button>
          <button
            onClick={onProceed}
            className="px-4 py-2 text-white rounded-2xl font-medium hover:opacity-90"
            style={{ background: `linear-gradient(to right, ${colors.pink}, ${colors.purple})` }}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
