'use client'

import React, { useEffect, useRef } from 'react';
import { useCanvas } from '@/core/canvas/CanvasContext';

export const CanvasArea: React.FC = () => {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const { initCanvas } = useCanvas();

  useEffect(() => {
    if (canvasElRef.current) {
      initCanvas(canvasElRef.current);
    }
  }, [initCanvas]);

  return (
    <div className="w-full h-full relative bg-gray-100 overflow-hidden">
      <canvas
        ref={canvasElRef}
        className="absolute top-0 left-0 w-full h-full outline-none"
      />
    </div>
  );
};

