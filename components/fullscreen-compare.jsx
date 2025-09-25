'use client';

import { trackEvent } from '@/utils/analytics';
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
  disabled = false,
}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [active, setActive] = useState(false);
  const [leftDims, setLeftDims] = useState({ w: 0, h: 0 });
  const [rightDims, setRightDims] = useState({ w: 0, h: 0 });
  const [layout, setLayout] = useState({ halfW: 0, maxH: 0 });

  const enter = async () => {
    if (disabled) return; // no-op on mobile
    try {
      if (!containerRef.current) return;
      if (document.fullscreenElement) return setActive(true);
      await containerRef.current.requestFullscreen();
      setActive(true);
      trackEvent('fullscreen_compare_enter');
    } catch {}
  };

  const exit = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {}
    setActive(false);
    trackEvent('fullscreen_compare_exit');
  };

  useEffect(() => {
    const onChange = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Load natural image sizes (once per URL)
  useEffect(() => {
    if (!leftImage?.url) return;
    const img = new Image();
    img.onload = () => setLeftDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = leftImage.url;
  }, [leftImage?.url]);

  useEffect(() => {
    if (!rightImage?.url) return;
    const img = new Image();
    img.onload = () => setRightDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = rightImage.url;
  }, [rightImage?.url]);

  // Compute available half width and max height inside content area
  useEffect(() => {
    if (!active) return;
    const compute = () => {
      if (!contentRef.current) return;
      const gap = 16; // gap-4
      const padding = 24; // p-6
      const rect = contentRef.current.getBoundingClientRect();
      const halfW = Math.max(0, (rect.width - gap) / 2);
      const maxH = Math.max(0, rect.height - padding);
      setLayout({ halfW, maxH });
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [active]);

  const fit = (w, h, maxW, maxH) => {
    if (!w || !h || !maxW || !maxH) return { w: Math.floor(maxW), h: Math.floor(maxH) };
    const s = Math.min(maxW / w, maxH / h);
    return { w: Math.floor(w * s), h: Math.floor(h * s) };
  };

  if (!leftImage || !rightImage) return null;

  return (
    <div className="my-4">
      {!active && !disabled && (
        <button
          onClick={enter}
          className="mb-4 px-4 py-2 border-2 border-black bg-yellow_green font-bold rounded-full hover:shadow-md"
        >
          FULL SCREEN
        </button>
      )}

      <div ref={containerRef} className={`${active ? 'fixed inset-0 z-[1000] bg-white' : ''}`}>
        {active && !disabled && (
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

        {active && !disabled && (
          <div
            ref={contentRef}
            className="w-full h-[calc(100%-64px)] flex flex-col md:flex-row gap-4 items-center justify-center p-6 pb-6 overflow-auto box-border"
          >
            <div
              className="relative flex-1 max-h-full w-full border-2 border-black bg-white cursor-pointer flex items-center justify-center mx-auto"
              onClick={onSelectLeft}
              style={{
                width: `${fit(leftDims.w, leftDims.h, layout.halfW, layout.maxH).w}px`,
                height: `${fit(leftDims.w, leftDims.h, layout.halfW, layout.maxH).h}px`,
              }}
            >
              <img src={leftImage.url} alt="Left" className="block w-full h-full object-contain" />
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
              className="relative flex-1 max-h-full w-full border-2 border-black bg-white cursor-pointer flex items-center justify-center mx-auto"
              onClick={onSelectRight}
              style={{
                width: `${fit(rightDims.w, rightDims.h, layout.halfW, layout.maxH).w}px`,
                height: `${fit(rightDims.w, rightDims.h, layout.halfW, layout.maxH).h}px`,
              }}
            >
              <img
                src={rightImage.url}
                alt="Right"
                className="block w-full h-full object-contain"
              />
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
