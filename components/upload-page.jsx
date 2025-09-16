'use client';
import { scrollToTop } from '@/utils/scroll-utils';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ImageUploader from './image-uploader';

export default function UploadPage({
  uploadedImages,
  handleImagesUploaded,
  handleImageDelete,
  startComparison,
}) {
  const startButtonRef = useRef(null);

  const handleStartComparison = () => {
    scrollToTop();
    startComparison();
  };

  // Subtle scroll to bring start button into view when images are uploaded
  useEffect(() => {
    if (uploadedImages.length > 0 && startButtonRef.current) {
      // Small delay to allow the UI to update
      const timer = setTimeout(() => {
        startButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }, 100);

      return () => clearTimeout(timer);
    }
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
        <ImageUploader onImagesUploaded={handleImagesUploaded} />
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
    </div>
  );
}
