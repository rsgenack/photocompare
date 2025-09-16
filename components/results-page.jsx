'use client';

import { scrollToTop } from '@/utils/scroll-utils';
import { ArrowRight, FileJson, FileSpreadsheet, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import MasonryGrid from './masonry-grid.jsx';
import Sparkle from './sparkle.jsx';

export default function ResultsPage({ uploadedImages, resetComparison, downloadResults }) {
  const handleResetComparison = () => {
    scrollToTop();
    resetComparison();
  };

  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Ensure no ties in rankings
  const ensureNoTies = (images) => {
    // First sort by score (descending)
    const sortedByScore = [...images].sort((a, b) => (b.score || 0) - (a.score || 0));

    // Then assign unique ranks (if scores are tied, the earlier image in the array gets the higher rank)
    return sortedByScore.map((image, index) => ({
      ...image,
      rank: index + 1,
    }));
  };

  // Apply no-ties ranking
  const rankedImages = ensureNoTies(uploadedImages);

  // Custom layout for the winner (first place)
  const customRenderItem = (item, index) => {
    const isWinner = item.rank === 1;
    const color = getColor(item.rank);

    const isSvg =
      (item?.file && item.file.type === 'image/svg+xml') || /\.svg($|\?)/i.test(item?.url || '');

    return (
      <div className="relative group w-full h-full">
        {/* Image container */}
        <div className="relative overflow-hidden w-full h-full border-2 border-black flex items-center justify-center bg-white">
          <img
            src={item.url || '/placeholder.svg'}
            alt={`Rank #${item.rank} photo`}
            className="w-full h-full object-cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: isSvg ? 'contain' : 'cover',
            }}
          />

          {/* Sparkles for #1 - positioned above the image */}
          {isWinner && showAnimation && (
            <>
              {/* Top sparkles - over the image */}
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

              {/* Left side sparkles - over the image */}
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

              {/* Right side sparkles - over the image */}
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

              {/* Bottom sparkles - over the image */}
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

          {/* Trophy for #1 */}
          {isWinner && showAnimation && (
            <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm p-2 rounded-full">
              <Trophy className="h-6 w-6" style={{ color: '#ffba08' }} />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get a color from the palette based on rank - alternating through all colors
  const getColor = (rank) => {
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

  return (
    <div className="w-full max-w-full px-4 py-12 overflow-x-hidden">
      {/* Mini Home Button */}
      <button
        onClick={handleResetComparison}
        className="mb-8 hover:scale-105 transition-transform duration-200"
      >
        <span
          className="relative inline-block bg-clip-text text-transparent text-sm font-bold break-words"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(209, 17, 73), rgb(241, 113, 5), rgb(255, 186, 8), rgb(177, 207, 95), rgb(144, 224, 243), rgb(123, 137, 239))',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          VOTOGRAPHER
          <div className="absolute -top-6 left-[15%]" style={{ opacity: 1, transform: 'none' }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-selective_yellow animate-sparkle-1"
            >
              <path
                d="M80 0L98.7868 61.2132L160 80L98.7868 98.7868L80 160L61.2132 98.7868L0 80L61.2132 61.2132L80 0Z"
                fill="currentColor"
                style={{
                  transform: 'scale(1.17977) rotate(40.448deg)',
                  transformOrigin: '80px 80px',
                }}
                transformOrigin="80px 80px"
              ></path>
            </svg>
          </div>
          <div className="absolute -top-8 left-[45%]" style={{ opacity: 1, transform: 'none' }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-pumpkin animate-sparkle-2"
            >
              <path
                d="M80 0L98.7868 61.2132L160 80L98.7868 98.7868L80 160L61.2132 98.7868L0 80L61.2132 61.2132L80 0Z"
                fill="currentColor"
                style={{
                  transform: 'scale(1.17977) rotate(40.448deg)',
                  transformOrigin: '80px 80px',
                }}
                transformOrigin="80px 80px"
              ></path>
            </svg>
          </div>
          <div className="absolute -top-4 right-[20%]" style={{ opacity: 1, transform: 'none' }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 text-cardinal animate-sparkle-3"
            >
              <path
                d="M80 0L98.7868 61.2132L160 80L98.7868 98.7868L80 160L61.2132 98.7868L0 80L61.2132 61.2132L80 0Z"
                fill="currentColor"
                style={{
                  transform: 'scale(1.17977) rotate(40.448deg)',
                  transformOrigin: '80px 80px',
                }}
                transformOrigin="80px 80px"
              ></path>
            </svg>
          </div>
          <div className="absolute top-[30%] -left-4" style={{ opacity: 1, transform: 'none' }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-yellow_green animate-sparkle-4"
            >
              <path
                d="M80 0L98.7868 61.2132L160 80L98.7868 98.7868L80 160L61.2132 98.7868L0 80L61.2132 61.2132L80 0Z"
                fill="currentColor"
                style={{
                  transform: 'scale(1.17977) rotate(40.448deg)',
                  transformOrigin: '80px 80px',
                }}
                transformOrigin="80px 80px"
              ></path>
            </svg>
          </div>
          <div className="absolute top-[40%] -right-4" style={{ opacity: 1, transform: 'none' }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-tropical_indigo animate-sparkle-2"
            >
              <path
                d="M80 0L98.7868 61.2132L160 80L98.7868 98.7868L80 160L61.2132 98.7868L0 80L61.2132 61.2132L80 0Z"
                fill="currentColor"
                style={{
                  transform: 'scale(1.17977) rotate(40.448deg)',
                  transformOrigin: '80px 80px',
                }}
                transformOrigin="80px 80px"
              ></path>
            </svg>
          </div>
          <div className="absolute -bottom-4 left-[25%]" style={{ opacity: 1, transform: 'none' }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 text-non_photo_blue animate-sparkle-3"
            >
              <path
                d="M80 0L98.7868 61.2132L160 80L98.7868 98.7868L80 160L61.2132 98.7868L0 80L61.2132 61.2132L80 0Z"
                fill="currentColor"
                style={{
                  transform: 'scale(1.17977) rotate(40.448deg)',
                  transformOrigin: '80px 80px',
                }}
                transformOrigin="80px 80px"
              ></path>
            </svg>
          </div>
          <div className="absolute -bottom-6 right-[35%]" style={{ opacity: 1, transform: 'none' }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-cardinal animate-sparkle-1"
            >
              <path
                d="M80 0L98.7868 61.2132L160 80L98.7868 98.7868L80 160L61.2132 98.7868L0 80L61.2132 61.2132L80 0Z"
                fill="currentColor"
                style={{
                  transform: 'scale(1.17977) rotate(40.448deg)',
                  transformOrigin: '80px 80px',
                }}
                transformOrigin="80px 80px"
              ></path>
            </svg>
          </div>
        </span>
      </button>

      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-center">
          FINAL RANKINGS
        </h1>

        <div className="border-t-2 border-b-2 border-black py-4 mb-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-lg font-bold">TOTAL PHOTOS: {rankedImages.length}</div>
          <div className="text-lg font-bold">WINNER: PHOTO #{rankedImages[0]?.rank || 1}</div>
        </div>
      </div>

      {/* Masonry Grid Layout */}
      <div className="mb-16 w-full max-w-full overflow-hidden">
        <MasonryGrid
          items={rankedImages}
          gap={12}
          columns={{ sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}
          showAnimation={showAnimation}
          renderItem={customRenderItem}
        />
      </div>

      {/* Download Section */}
      <div className="border-2 border-black p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center font-display">DOWNLOAD RESULTS</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <button
            onClick={() => downloadResults('csv')}
            className="flex-1 flex items-center justify-center py-4 px-6 bg-white text-black font-bold rounded-full border-2 border-black hover:bg-gray-100 transition-all duration-200"
          >
            <FileSpreadsheet className="h-6 w-6 mr-2" />
            DOWNLOAD CSV
          </button>

          <button
            onClick={() => downloadResults('json')}
            className="flex-1 flex items-center justify-center py-4 px-6 bg-yellow_green text-black font-bold rounded-full hover:shadow-lg transition-all duration-200"
          >
            <FileJson className="h-6 w-6 mr-2" />
            DOWNLOAD JSON
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center mb-12">
        <button
          onClick={handleResetComparison}
          className="px-12 py-4 text-xl font-bold text-black bg-yellow_green rounded-full hover:shadow-lg transition-all duration-200 flex items-center"
        >
          START NEW COMPARISON
          <ArrowRight className="ml-2 h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
