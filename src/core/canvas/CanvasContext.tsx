'use client'

import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { CanvasManager } from './CanvasManager';
import { AbstractTool } from '../tools/AbstractTool';

interface CanvasContextType {
  canvasManager: CanvasManager | null;
  initCanvas: (canvasEl: HTMLCanvasElement) => void;
  setTool: (tool: AbstractTool) => void;
}

const CanvasContext = createContext<CanvasContextType>({
  canvasManager: null,
  initCanvas: () => {},
  setTool: () => {},
});

export const useCanvas = () => useContext(CanvasContext);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [canvasManager, setCanvasManager] = useState<CanvasManager | null>(null);
  const managerRef = useRef<CanvasManager | null>(null);

  const initCanvas = (canvasEl: HTMLCanvasElement) => {
    if (managerRef.current) {
      return;
    }

    const manager = new CanvasManager(canvasEl);
    manager.enableZoom();
    managerRef.current = manager;
    setCanvasManager(manager);
  };

  const setTool = (tool: AbstractTool) => {
    if (managerRef.current) {
      managerRef.current.setTool(tool);
    }
  };

  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.dispose();
        managerRef.current = null;
      }
    };
  }, []);

  return (
    <CanvasContext.Provider value={{ canvasManager, initCanvas, setTool }}>
      {children}
    </CanvasContext.Provider>
  );
};
