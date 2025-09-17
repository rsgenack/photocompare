'use client';

import { ArrowLeft, ArrowRight, Maximize, Minimize, X, ZoomIn, ZoomOut } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useEffect, useRef, useState } from 'react';
import ReactCompareImage from 'react-compare-image';

// Add aspectRatio to the props
export default function ComparisonView({
  leftImage,
  rightImage,
  zoom,
  onSelectLeft,
  onSelectRight,
  onRemoveImage,
  aspectRatio,
  setZoom = () => {}, // Provide a default empty function
  overlayMode = 'slider', // 'slider' or 'side-by-side' when aspectRatio is provided
}) {
  // Add state for fit mode
  const [fitMode, setFitMode] = useState('contain'); // "contain" or "cover"
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const leftImageRef = useRef(null);
  const rightImageRef = useRef(null);
  // Add state for container style
  const [containerStyle, setContainerStyle] = useState({});

  // Ensure we have valid image objects
  const leftSrc = leftImage?.url || '/placeholder.svg?height=500&width=500';
  const rightSrc = rightImage?.url || '/placeholder.svg?height=500&width=500';

  // Toggle fit mode
  const toggleFitMode = () => {
    setFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'));
  };

  // Match image heights when both images are loaded
  useEffect(() => {
    const leftImg = leftImageRef.current;
    const rightImg = rightImageRef.current;

    if (!leftImg || !rightImg) return;

    const handleLoad = () => {
      if (leftImg.complete && rightImg.complete) {
        // Reset any previous styles to ensure natural display
        leftImg.style.height = '';
        leftImg.style.width = '';
        leftImg.style.margin = '';
        rightImg.style.height = '';
        rightImg.style.width = '';
        rightImg.style.margin = '';

        setImagesLoaded(true);
      }
    };

    // Check if images are already loaded
    handleLoad();

    // Add event listeners for when images load
    leftImg.addEventListener('load', handleLoad);
    rightImg.addEventListener('load', handleLoad);

    return () => {
      leftImg.removeEventListener('load', handleLoad);
      rightImg.removeEventListener('load', handleLoad);
    };
  }, [leftSrc, rightSrc]);

  // Update container style when aspectRatio changes
  useEffect(() => {
    if (aspectRatio) {
      setContainerStyle({
        aspectRatio: aspectRatio,
      });
    } else {
      // Default height for "different" comparison type
      setContainerStyle({});
    }
  }, [aspectRatio]);

  // Fix the click handlers to ensure they properly trigger selection

  // Handle image click events - simplified to directly call the handlers
  const handleLeftImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Left image clicked in comparison view');
    onSelectLeft();
  };

  const handleRightImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Right image clicked in comparison view');
    onSelectRight();
  };

  // In the return statement, update the image containers:
  return (
    <div className="p-6 space-y-6" style={{ WebkitTapHighlightColor: 'transparent' }}>
      {/* Fit mode toggle - only show for different photos */}
      <div className="flex justify-end mb-2">
        {!aspectRatio && (
          <button
            onClick={toggleFitMode}
            className="flex items-center gap-2 text-sm font-bold text-black bg-yellow_green px-3 py-1.5 rounded-full border-2 border-black transition-colors"
          >
            {fitMode === 'contain' ? (
              <>
                <Maximize className="h-4 w-4" />
                <span>FILL CONTAINER</span>
              </>
            ) : (
              <>
                <Minimize className="h-4 w-4" />
                <span>SHOW FULL IMAGE</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Slider for version comparisons */}
      {aspectRatio && overlayMode === 'slider' ? (
        <div className="w-full max-w-2xl mx-auto" style={{ aspectRatio: aspectRatio }}>
          <ReactCompareImage
            leftImage={leftSrc}
            rightImage={rightSrc}
            leftImageLabel="Left Version"
            rightImageLabel="Right Version"
            sliderLineWidth={4}
            sliderLineColor="#d11149"
            handleSize={48}
            aspectRatio={aspectRatio}
            onSliderPositionChange={(pos) => {}}
            alt="Image comparison slider"
          />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col">
            <div
              className="overflow-hidden select-none relative flex-grow border-2 border-black cursor-pointer w-full"
              style={{
                ...(aspectRatio
                  ? { aspectRatio: aspectRatio }
                  : { height: '300px', minHeight: '300px' }),
                backgroundColor: 'white',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
              }}
              onClick={handleLeftImageClick}
              role="button"
              tabIndex={0}
              aria-label="Select left image"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  ref={leftImageRef}
                  src={leftSrc || '/placeholder.svg'}
                  alt="Left comparison image"
                  className={`w-full h-full ${
                    aspectRatio
                      ? 'object-contain'
                      : fitMode === 'contain'
                      ? 'object-contain'
                      : 'object-cover'
                  }`}
                  style={{ transform: `scale(${zoom / 100})` }}
                  draggable="false"
                />
              </div>

              {/* X button to remove left image */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent click from triggering parent onClick
                  console.log('Removing left image:', leftImage?.id);
                  if (onRemoveImage && leftImage?.id) {
                    onRemoveImage(leftImage.id);
                  }
                }}
                className="absolute top-3 right-3 bg-cardinal text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md z-20"
                title="Remove this image from comparisons"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div
              className="overflow-hidden select-none relative flex-grow border-2 border-black cursor-pointer w-full"
              style={{
                ...(aspectRatio
                  ? { aspectRatio: aspectRatio }
                  : { height: '300px', minHeight: '300px' }),
                backgroundColor: 'white',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
              }}
              onClick={handleRightImageClick}
              role="button"
              tabIndex={0}
              aria-label="Select right image"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  ref={rightImageRef}
                  src={rightSrc || '/placeholder.svg'}
                  alt="Right comparison image"
                  className={`w-full h-full ${
                    aspectRatio
                      ? 'object-contain'
                      : fitMode === 'contain'
                      ? 'object-contain'
                      : 'object-cover'
                  }`}
                  style={{ transform: `scale(${zoom / 100})` }}
                  draggable="false"
                />
              </div>

              {/* X button to remove right image */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent click from triggering parent onClick
                  console.log('Removing right image:', rightImage?.id);
                  if (onRemoveImage && rightImage?.id) {
                    onRemoveImage(rightImage.id);
                  }
                }}
                className="absolute top-3 right-3 bg-cardinal text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md z-20"
                title="Remove this image from comparisons"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts info */}
      <div className="bg-gray-100 p-4 text-center border-2 border-black">
        <p className="text-lg font-bold text-black mb-2">KEYBOARD SHORTCUTS</p>
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center">
            <div className="bg-white px-3 py-1 font-mono rounded-full border-2 border-black shadow-sm">
              <ArrowLeft className="h-4 w-4 text-black" />
            </div>
            <span className="ml-2 text-black font-bold">LEFT IMAGE</span>
          </div>
          <div className="flex items-center">
            <span className="text-black font-bold">RIGHT IMAGE</span>
            <div className="ml-2 bg-white px-3 py-1 font-mono rounded-full border-2 border-black shadow-sm">
              <ArrowRight className="h-4 w-4 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="bg-gray-100 p-4 border-2 border-black">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="font-bold text-black">ZOOM:</div>
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="bg-white p-2 rounded-full border border-black"
          >
            <ZoomOut className="h-5 w-5 text-gray-800" />
          </button>
          <Slider
            value={zoom}
            min={50}
            max={200}
            step={5}
            onChange={(value) => setZoom(value)}
            className="flex-1 h-3 md:h-4"
            trackStyle={{ backgroundColor: '#3b82f6' }}
            handleStyle={{
              border: '2px solid #000',
              backgroundColor: '#fff',
              width: '20px',
              height: '20px',
              marginTop: '-8px',
            }}
            railStyle={{ backgroundColor: '#e5e7eb' }}
          />
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="bg-white p-2 rounded-full border border-black"
          >
            <ZoomIn className="h-5 w-5 text-gray-800" />
          </button>
          <span className="text-base md:text-lg font-medium w-12 md:w-16 text-right text-gray-800">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(100)}
            className="bg-yellow_green px-3 py-1 rounded-full border-2 border-black font-bold"
          >
            RESET
          </button>
        </div>
      </div>
    </div>
  );
}
