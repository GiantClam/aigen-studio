'use client'

import React from 'react';
import { CanvasProvider, useCanvas } from '@/core/canvas/CanvasContext';
import { CanvasArea } from './CanvasArea';
import { SelectTool } from '@/core/tools/SelectTool';
import { RectangleTool } from '@/core/tools/RectangleTool';
import { DrawTool } from '@/core/tools/DrawTool';

const Toolbar: React.FC = () => {
  const { canvasManager, setTool } = useCanvas();

  // 只有当 canvasManager 初始化后才显示工具栏
  if (!canvasManager) return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-10 shadow-sm">
      <div className="w-10 h-10 bg-gray-100 rounded animate-pulse mb-3"></div>
      <div className="w-10 h-10 bg-gray-100 rounded animate-pulse mb-3"></div>
      <div className="w-10 h-10 bg-gray-100 rounded animate-pulse mb-3"></div>
    </div>
  );

  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-10 shadow-sm">
      <button 
        onClick={() => setTool(new SelectTool(canvasManager))}
        className="w-10 h-10 hover:bg-gray-100 text-gray-600 rounded-lg mb-3 flex items-center justify-center transition-colors"
        title="Select (V)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
      </button>
      
      <button 
        onClick={() => setTool(new RectangleTool(canvasManager))}
        className="w-10 h-10 hover:bg-gray-100 text-gray-600 rounded-lg mb-3 flex items-center justify-center transition-colors"
        title="Rectangle (R)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
      </button>
      
      <button 
        onClick={() => setTool(new DrawTool(canvasManager))}
        className="w-10 h-10 hover:bg-gray-100 text-gray-600 rounded-lg mb-3 flex items-center justify-center transition-colors"
        title="Draw (P)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
      </button>
    </div>
  );
};

export const EditorLayout: React.FC = () => {
  return (
    <CanvasProvider>
      <div className="flex flex-col h-screen w-screen bg-white text-black">
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 z-10 shadow-sm">
          <div className="font-bold text-lg mr-4">AI Image Editor</div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Fabric 6.9.0 Refactor</div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <Toolbar />

          <div className="flex-1 relative">
            <CanvasArea />
          </div>

          <div className="w-80 bg-white border-l border-gray-200 z-10 flex flex-col shadow-sm">
             <div className="p-4 border-b border-gray-100">
               <h2 className="font-semibold">Properties</h2>
             </div>
             <div className="p-4 flex-1 overflow-y-auto">
               <p className="text-sm text-gray-500 text-center mt-10">Select an object to edit properties.</p>
             </div>
             
             <div className="p-4 border-t border-gray-200 bg-gray-50">
               <h3 className="font-medium mb-2 text-sm">Nanobanana AI</h3>
               <button className="w-full bg-black text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                 Open Generation Panel
               </button>
             </div>
          </div>
        </div>
      </div>
    </CanvasProvider>
  );
};
