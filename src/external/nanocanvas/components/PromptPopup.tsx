import React from 'react';

interface PromptPopupProps {
  visible: boolean;
  x: number;
  y: number;
  prompt: string;
  onClose: () => void;
}

const PromptPopup: React.FC<PromptPopupProps> = ({ visible, x, y, prompt, onClose }) => {
  if (!visible) return null;
  return (
    <div className="fixed z-50" style={{ left: x, top: y }}>
      <div className="bg-[#0B1220]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden text-slate-200 p-4 w-80">
        <div className="text-xs text-slate-400 mb-2">Prompt</div>
        <div className="text-sm text-slate-200 whitespace-pre-wrap">{prompt}</div>
        <div className="mt-3 text-right">
          <button className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded hover:bg-white" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PromptPopup;
