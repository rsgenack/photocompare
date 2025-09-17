'use client';
import { scrollToTop } from '@/utils/scroll-utils';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ImageUploader from './image-uploader';
import { useState } from 'react';
import InvalidImagesModal from './invalid-images-modal.jsx';

export default function UploadPage({
  uploadedImages,
  handleImagesUploaded,
  handleImageDelete,
  startComparison,
}) {
  const startButtonRef = useRef(null);
  const prevCountRef = useRef(uploadedImages.length);
  const [invalidImages, setInvalidImages] = useState([]);
  const [showInvalidModal, setShowInvalidModal] = useState(false);

  const handleStartComparison = () => {
    scrollToTop();
    startComparison();
  };

  // Subtle scroll to bring start button into view when images are added (not when removed)
  useEffect(() => {
    const prev = prevCountRef.current;
    const curr = uploadedImages.length;
    // Only scroll when count increases (i.e., user added photos)
    if (curr > prev && curr > 0 && startButtonRef.current) {
      const timer = setTimeout(() => {
        startButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }, 100);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = curr;
  }, [uploadedImages.length]);

  // Function to get a color based on index
  const getColor = (index) => {
    const colors = ['#f17105', '#d11149', '#ffba08', '#b1cf5f', '#7b89ef', '#90e0f3'];
    return colors[index % colors.length];
  };

  return (
    <div className="editorial-container py-12">
      <div className="mb-12">
        <h1 className="editorial-heading mb-8 text-center">UPLOAD PHOTOS</h1>

        <div className="border-t-2 border-b-2 border-black py-4 mb-12">
          <h2 className="editorial-subheading text-center">
            ADD YOUR PHOTOS TO START THE COMPARISON
          </h2>
        </div>
      </div>

      <div className="mb-12 border-2 border-black p-8" style={{ minHeight: '375px' }}>
        <ImageUploader
          onImagesUploaded={(imgs) => {
            // Preflight: try loading images and flag failures
            const loadCheck = (url) =>
              new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ ok: true });
                img.onerror = () => resolve({ ok: false });
                img.src = url;
              });

            Promise.all(
              imgs.map(async (img) => {
                const res = await loadCheck(img.url || '');
                return { ...img, __invalid: !res.ok };
              }),
            ).then((checked) => {
              const bad = checked.filter((i) => i.__invalid);
              if (bad.length > 0) {
                setInvalidImages(bad.map((b) => b.id));
                setShowInvalidModal(true);
              }
              const good = checked.filter((i) => !i.__invalid).map(({ __invalid, ...rest }) => rest);
              if (good.length > 0) handleImagesUploaded(good);
            });
          }}
        />
      </div>

      {uploadedImages.length > 0 && (
        <div className="space-y-8">
          <div className="border-t-2 border-b-2 border-black py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold font-display">
              YOUR IMAGES ({uploadedImages.length})
            </h2>

            {uploadedImages.length < 2 ? (
              <div className="text-lg font-bold font-sans text-cardinal">
                UPLOAD AT LEAST {2 - uploadedImages.length} MORE
              </div>
            ) : (
              <button
                ref={startButtonRef}
                onClick={handleStartComparison}
                className="px-8 py-3 text-lg font-bold text-black rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 font-sans bg-yellow_green flex items-center"
              >
                START COMPARING
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={image.id} className="relative group aspect-square">
                <img
                  src={image.url || '/placeholder.svg'}
                  alt="Uploaded image"
                  className="w-full h-full object-cover border-2 border-black"
                />
                <button
                  className="absolute top-2 right-2 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold"
                  onClick={() => handleImageDelete(image.id)}
                  style={{ backgroundColor: getColor(index) }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <InvalidImagesModal
        isOpen={showInvalidModal}
        invalidCount={invalidImages.length}
        onRemove={() => {
          // Just do nothing further (we already skipped invalid on add)
          setShowInvalidModal(false);
          setInvalidImages([]);
        }}
        onRedo={() => {
          // Clear all and let user upload again
          window.location.reload();
        }}
        onClose={() => setShowInvalidModal(false)}
      />
    </div>
  );
}
