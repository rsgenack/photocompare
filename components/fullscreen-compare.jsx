'use client';

import { formatNumber } from '@/utils/format';
import { useEffect, useRef, useState } from 'react';

export default function FullScreenCompare({
  progress,
  remaining,
  leftImage,
  rightImage,
  onSelectLeft,
  onSelectRight,
  onRemoveLeft,
  onRemoveRight,
}) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(false);

  const enter = async () => {
    try {
      if (!containerRef.current) return;
      if (document.fullscreenElement) return setActive(true);
      await containerRef.current.requestFullscreen();
      setActive(true);
    } catch {}
  };

  const exit = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {}
    setActive(false);
  };

  useEffect(() => {
    const onChange = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  if (!leftImage || !rightImage) return null;

  return (
    <div className="my-4">
      {!active && (
        <button
          onClick={enter}
          className="mb-4 px-4 py-2 border-2 border-black bg-yellow_green font-bold rounded-full hover:shadow-md"
        >
          FULL SCREEN
        </button>
      )}

      <div ref={containerRef} className={`${active ? 'fixed inset-0 z-[1000] bg-white' : ''}`}>
        {active && (
          <div className="sticky top-0 left-0 right-0 z-[1001] bg-white border-b-2 border-black">
            <div className="px-4 py-3 flex flex-col md:flex-row gap-3 md:gap-6 items-center justify-between">
              <div className="text-base md:text-lg font-bold">
                {formatNumber(remaining)} COMPARISONS REMAINING
              </div>
              <div className="text-base md:text-lg font-bold">
                {formatNumber(Math.min(Math.round(progress), 100))}% COMPLETE
              </div>
              <button
                onClick={exit}
                className="px-4 py-2 border-2 border-black bg-white font-bold rounded-full hover:bg-gray-100"
              >
                EXIT FULL SCREEN
              </button>
            </div>
          </div>
        )}

        {active && (
          <div className="w-full h-[calc(100%-64px)] flex flex-col md:flex-row gap-4 items-center justify-center p-6 pb-6 overflow-auto box-border">
            <div
              className="relative flex-1 max-h-full w-full border-2 border-black bg-white cursor-pointer flex items-center justify-center"
              onClick={onSelectLeft}
              style={{
                height: '100%',
                aspectRatio:
                  leftImage.width && leftImage.height
                    ? leftImage.width / leftImage.height
                    : undefined,
                maxWidth: '100%',
              }}
            >
              <img src={leftImage.url} alt="Left" className="w-full h-full object-contain" />
              {onRemoveLeft && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveLeft(leftImage.id);
                  }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-cardinal"
                  title="Remove this image"
                >
                  <span className="text-white text-lg leading-none">×</span>
                </button>
              )}
            </div>
            <div
              className="relative flex-1 max-h-full w-full border-2 border-black bg-white cursor-pointer flex items-center justify-center"
              onClick={onSelectRight}
              style={{
                height: '100%',
                aspectRatio:
                  rightImage.width && rightImage.height
                    ? rightImage.width / rightImage.height
                    : undefined,
                maxWidth: '100%',
              }}
            >
              <img src={rightImage.url} alt="Right" className="w-full h-full object-contain" />
              {onRemoveRight && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRight(rightImage.id);
                  }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-cardinal"
                  title="Remove this image"
                >
                  <span className="text-white text-lg leading-none">×</span>
                </button>
              )}
            </div>
            {/* bottom spacer to mirror top spacing */}
            <div className="h-6 md:h-6 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
