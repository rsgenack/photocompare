'use client';

import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import Sparkle from './sparkle';

/**
 * MasonryGrid Component
 *
 * A responsive masonry layout for displaying images with preserved aspect ratios.
 * Uses CSS columns for a simple, reliable masonry effect.
 *
 * @param {Object} props
 * @param {Array} props.items - Array of image objects to display
 * @param {number} props.gap - Gap between grid items in pixels (default: 12)
 * @param {Object} props.columns - Object specifying number of columns at different breakpoints
 * @param {Function} props.renderItem - Custom render function for each item (optional)
 * @param {boolean} props.showAnimation - Whether to show animations (default: false)
 */
export default function MasonryGrid({
  items = [],
  gap = 12,
  columns = { sm: 2, md: 3, lg: 4, xl: 5 },
  renderItem,
  showAnimation = false,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({});

  // Load image dimensions for proper aspect ratio sizing
  useEffect(() => {
    if (items.length === 0) return;

    const loadImageDimensions = async () => {
      const dimensions = {};

      for (const item of items) {
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              dimensions[item.id] = {
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight,
              };
              resolve();
            };
            img.onerror = reject;
            img.src = item.url || '/placeholder.svg';
          });
        } catch (err) {
          // Fallback dimensions for failed loads
          dimensions[item.id] = {
            width: 300,
            height: 400,
            aspectRatio: 0.75,
          };
        }
      }

      setImageDimensions(dimensions);
      setLoading(false);
    };

    loadImageDimensions();
  }, [items]);

  // Default render function for items
  const defaultRenderItem = (item, index) => {
    const isWinner = item.rank === 1;
    const color = getColorByRank(item.rank);
    const isSvg =
      (item?.file && item.file.type === 'image/svg+xml') || /\.svg($|\?)/i.test(item?.url || '');

    return (
      <div className="relative group overflow-hidden w-full h-full border-2 border-black flex items-center justify-center bg-white">
        <img
          src={item.url || '/placeholder.svg'}
          alt={`Rank #${item.rank} photo`}
          className="w-full h-full"
          style={{
            width: '100%',
            height: '100%',
            objectFit: isSvg ? 'contain' : 'cover',
          }}
        />

        {/* Rank indicator */}
        <div
          className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
          style={{
            backgroundColor: color,
            fontSize: isWinner ? '20px' : '16px',
          }}
        >
          {item.rank}
        </div>

        {/* Trophy and sparkles for #1 */}
        {isWinner && showAnimation && (
          <>
            <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm p-2 rounded-full">
              <Trophy className="h-6 w-6" style={{ color: '#ffba08' }} />
            </div>

            {/* Colorful Sparkles */}
            <Sparkle
              className="absolute top-2 left-[8%] animate-sparkle-1 w-4 h-4"
              style={{ color: '#ffba08' }}
            />
            <Sparkle
              className="absolute top-4 left-[18%] animate-sparkle-2 w-6 h-6"
              style={{ color: '#f17105' }}
            />
            <Sparkle
              className="absolute top-1 left-[32%] animate-sparkle-3 w-5 h-5"
              style={{ color: '#d11149' }}
            />
            <Sparkle
              className="absolute top-3 left-[48%] animate-sparkle-1 w-4 h-4"
              style={{ color: '#b1cf5f' }}
            />
            <Sparkle
              className="absolute top-2 left-[65%] animate-sparkle-4 w-5 h-5"
              style={{ color: '#7b89ef' }}
            />
            <Sparkle
              className="absolute top-5 left-[78%] animate-sparkle-2 w-6 h-6"
              style={{ color: '#90e0f3' }}
            />
            <Sparkle
              className="absolute top-3 right-[15%] animate-sparkle-3 w-4 h-4"
              style={{ color: '#ffba08' }}
            />
            <Sparkle
              className="absolute top-1 right-[3%] animate-sparkle-1 w-5 h-5"
              style={{ color: '#f17105' }}
            />

            {/* Left side sparkles */}
            <Sparkle
              className="absolute top-[12%] left-2 animate-sparkle-3 w-5 h-5"
              style={{ color: '#ffba08' }}
            />
            <Sparkle
              className="absolute top-[22%] left-1 animate-sparkle-1 w-4 h-4"
              style={{ color: '#f17105' }}
            />
            <Sparkle
              className="absolute top-[28%] left-3 animate-sparkle-4 w-6 h-6"
              style={{ color: '#d11149' }}
            />
            <Sparkle
              className="absolute top-[38%] left-1 animate-sparkle-2 w-4 h-4"
              style={{ color: '#b1cf5f' }}
            />
            <Sparkle
              className="absolute top-[45%] left-2 animate-sparkle-3 w-5 h-5"
              style={{ color: '#7b89ef' }}
            />
            <Sparkle
              className="absolute top-[58%] left-1 animate-sparkle-1 w-6 h-6"
              style={{ color: '#90e0f3' }}
            />
            <Sparkle
              className="absolute top-[68%] left-3 animate-sparkle-4 w-4 h-4"
              style={{ color: '#ffba08' }}
            />
            <Sparkle
              className="absolute top-[78%] left-1 animate-sparkle-2 w-5 h-5"
              style={{ color: '#f17105' }}
            />
            <Sparkle
              className="absolute top-[85%] left-2 animate-sparkle-3 w-4 h-4"
              style={{ color: '#d11149' }}
            />

            {/* Right side sparkles */}
            <Sparkle
              className="absolute top-[18%] right-2 animate-sparkle-2 w-6 h-6"
              style={{ color: '#ffba08' }}
            />
            <Sparkle
              className="absolute top-[26%] right-1 animate-sparkle-4 w-4 h-4"
              style={{ color: '#f17105' }}
            />
            <Sparkle
              className="absolute top-[35%] right-3 animate-sparkle-1 w-5 h-5"
              style={{ color: '#d11149' }}
            />
            <Sparkle
              className="absolute top-[48%] right-1 animate-sparkle-3 w-4 h-4"
              style={{ color: '#b1cf5f' }}
            />
            <Sparkle
              className="absolute top-[55%] right-2 animate-sparkle-2 w-6 h-6"
              style={{ color: '#7b89ef' }}
            />
            <Sparkle
              className="absolute top-[68%] right-1 animate-sparkle-4 w-4 h-4"
              style={{ color: '#90e0f3' }}
            />
            <Sparkle
              className="absolute top-[75%] right-3 animate-sparkle-1 w-5 h-5"
              style={{ color: '#ffba08' }}
            />
            <Sparkle
              className="absolute top-[82%] right-1 animate-sparkle-3 w-4 h-4"
              style={{ color: '#f17105' }}
            />
            <Sparkle
              className="absolute top-[88%] right-2 animate-sparkle-2 w-5 h-5"
              style={{ color: '#d11149' }}
            />

            {/* Bottom sparkles */}
            <Sparkle
              className="absolute bottom-2 left-[3%] animate-sparkle-1 w-5 h-5"
              style={{ color: '#ffba08' }}
            />
            <Sparkle
              className="absolute bottom-1 left-[12%] animate-sparkle-3 w-4 h-4"
              style={{ color: '#f17105' }}
            />
            <Sparkle
              className="absolute bottom-3 left-[22%] animate-sparkle-2 w-6 h-6"
              style={{ color: '#d11149' }}
            />
            <Sparkle
              className="absolute bottom-1 left-[35%] animate-sparkle-4 w-4 h-4"
              style={{ color: '#b1cf5f' }}
            />
            <Sparkle
              className="absolute bottom-2 left-[45%] animate-sparkle-1 w-5 h-5"
              style={{ color: '#7b89ef' }}
            />
            <Sparkle
              className="absolute bottom-1 left-[58%] animate-sparkle-3 w-4 h-4"
              style={{ color: '#90e0f3' }}
            />
            <Sparkle
              className="absolute bottom-3 left-[68%] animate-sparkle-2 w-6 h-6"
              style={{ color: '#ffba08' }}
            />
            <Sparkle
              className="absolute bottom-1 left-[78%] animate-sparkle-4 w-4 h-4"
              style={{ color: '#f17105' }}
            />
            <Sparkle
              className="absolute bottom-2 right-[12%] animate-sparkle-1 w-5 h-5"
              style={{ color: '#d11149' }}
            />
            <Sparkle
              className="absolute bottom-1 right-[4%] animate-sparkle-3 w-4 h-4"
              style={{ color: '#b1cf5f' }}
            />
            <Sparkle
              className="absolute bottom-3 right-[1%] animate-sparkle-2 w-5 h-5"
              style={{ color: '#7b89ef' }}
            />
          </>
        )}
      </div>
    );
  };

  // Helper function to get color based on rank
  const getColorByRank = (rank) => {
    const colors = [
      '#ffba08', // selective_yellow
      '#7b89ef', // tropical_indigo
      '#d11149', // cardinal
      '#f17105', // pumpkin
      '#b1cf5f', // yellow_green
      '#90e0f3', // non_photo_blue
    ];
    return colors[(rank - 1) % colors.length];
  };

  // Create masonry layout with sorted items
  const createMasonryLayout = () => {
    // Sort items by rank to maintain order
    return [...items].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center p-4 border-2 border-cardinal bg-cardinal/10 rounded">
        <p className="text-cardinal font-bold">Error loading images: {error}</p>
      </div>
    );
  }

  // Handle empty state
  if (items.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded">
        <p className="text-gray-500">No images to display</p>
      </div>
    );
  }

  const masonryItems = createMasonryLayout();

  // Simple flexbox layout - no complex calculations needed

  return (
    <div
      className="w-full overflow-visible"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: `${gap}px`,
        width: '100%',
        minHeight: '200px',
      }}
    >
      {masonryItems.map((item, itemIndex) => {
        const dimensions = imageDimensions[item.id];
        const aspectRatio = dimensions?.aspectRatio || 0.75;

        return (
          <div
            key={`item-${item.id || itemIndex}`}
            className="masonry-item"
            style={{
              flex: '1 1 0',
              minWidth: '160px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                aspectRatio: aspectRatio.toString(),
                width: '100%',
                height: 'auto',
              }}
            >
              {renderItem ? renderItem(item, itemIndex) : defaultRenderItem(item, itemIndex)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
