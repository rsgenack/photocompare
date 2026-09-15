'use client';

export default function InvalidImagesModal({ isOpen, invalid = [], onRemove, onRedo, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border-2 border-black rounded-lg max-w-lg w-[92%] p-6 shadow-xl">
        <h3 className="text-2xl font-bold mb-3 font-display">Some photos couldn't be loaded</h3>
        <p className="mb-4 font-sans text-gray-800">
          We couldn't load {invalid.length} photo{invalid.length === 1 ? '' : 's'}. You can remove
          the problematic photos and continue, or re-upload your images.
        </p>

        {invalid.length > 0 && (
          <div className="mb-5 max-h-60 overflow-auto border border-gray-200 p-3">
            <ul className="list-disc pl-5 space-y-1">
              {invalid.map((img) => (
                <li key={img.id} className="text-sm font-sans truncate" title={img.name || img.id}>
                  {img.name || img.id}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRemove}
            className="flex-1 px-5 py-3 font-bold border-2 border-black rounded-full bg-yellow_green hover:shadow-md transition"
          >
            REMOVE PHOTOS
          </button>
          <button
            onClick={onRedo}
            className="flex-1 px-5 py-3 font-bold border-2 border-black rounded-full bg-white hover:bg-gray-100 transition"
          >
            RE-UPLOAD
          </button>
        </div>

        <button onClick={onClose} className="mt-4 text-sm underline text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
}
