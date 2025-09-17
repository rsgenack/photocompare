'use client';

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
        <button onClick={enter} className="mb-4 px-4 py-2 border-2 border-black bg-yellow_green font-bold rounded-full">FULL SCREEN</button>
      )}

      <div ref={containerRef} className={`${active ? 'fixed inset-0 z-[1000] bg-white' : ''}`}>
        {active && (
          <div className="sticky top-0 left-0 right-0 z-[1001] bg-white border-b-2 border-black">
            <div className="px-4 py-3 flex flex-col md:flex-row gap-3 md:gap-6 items-center justify-between">
              <div className="text-base md:text-lg font-bold">{remaining} COMPARISONS REMAINING</div>
              <div className="text-base md:text-lg font-bold">{Math.min(Math.round(progress), 100)}% COMPLETE</div>
              <button onClick={exit} className="px-4 py-2 border-2 border-black bg-white font-bold rounded-full hover:bg-gray-100">EXIT FULL SCREEN</button>
            </div>
          </div>
        )}

        {active && (
          <div className="w-full h-full flex flex-col md:flex-row gap-4 items-center justify-center p-6">
            <div className="relative flex-1 h-1/2 md:h-full max-h-full w-full border-2 border-black bg-white cursor-pointer flex items-center justify-center" onClick={onSelectLeft}>
              <img src={leftImage.url} alt="Left" className="max-w-full max-h-full object-contain" />
              {onRemoveLeft && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveLeft(leftImage.id); }}
                  className="absolute top-3 right-3 bg-cardinal text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                  title="Remove this image"
                >
                  ×
                </button>
              )}
            </div>
            <div className="relative flex-1 h-1/2 md:h-full max-h-full w-full border-2 border-black bg-white cursor-pointer flex items-center justify-center" onClick={onSelectRight}>
              <img src={rightImage.url} alt="Right" className="max-w-full max-h-full object-contain" />
              {onRemoveRight && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveRight(rightImage.id); }}
                  className="absolute top-3 right-3 bg-cardinal text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                  title="Remove this image"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


