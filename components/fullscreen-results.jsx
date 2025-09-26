'use client';

import { Events } from '@/utils/analytics';
import { useEffect, useRef, useState } from 'react';

export default function FullScreenResults({ children, disabled = false }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  const enter = async () => {
    if (disabled) return;
    try {
      if (!ref.current) return;
      if (document.fullscreenElement) return setActive(true);
      await ref.current.requestFullscreen();
      setActive(true);
      Events.fullscreenEnter('results');
    } catch {}
  };

  const exit = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {}
    setActive(false);
    Events.fullscreenExit('results');
  };

  useEffect(() => {
    const onChange = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return (
    <div className="my-4">
      {!active && !disabled && (
        <button
          onClick={enter}
          className="mb-4 px-4 py-2 border-2 border-black bg-yellow_green font-bold rounded-full"
        >
          FULL SCREEN
        </button>
      )}

      <div ref={ref} className={`${active ? 'fixed inset-0 z-[1000] bg-white overflow-auto' : ''}`}>
        {active && !disabled && (
          <div className="absolute top-4 right-4">
            <button
              onClick={exit}
              className="px-4 py-2 border-2 border-black bg-white font-bold rounded-full"
            >
              EXIT FULL SCREEN
            </button>
          </div>
        )}
        <div className={`${active ? 'p-6' : ''}`}>{children}</div>
      </div>
    </div>
  );
}
