import React from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  onCompose: () => void;
  onMatting: () => void;
  onFlatten: () => void;
  onDelete: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, visible, onClose, onCompose, onMatting, onFlatten, onDelete }) => {
  if (!visible) return null;
  return (
    <div className="fixed z-50" style={{ left: x, top: y }}>
      <div className="bg-[#0B1220]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden text-slate-200">
        <button className="block w-48 text-left px-4 py-2 hover:bg-white/10" onClick={onCompose}>Compose</button>
        <button className="block w-48 text-left px-4 py-2 hover:bg-white/10" onClick={onMatting}>Remove Background</button>
        <button className="block w-48 text-left px-4 py-2 hover:bg-white/10" onClick={onFlatten}>Flatten Selection</button>
        <div className="border-t border-white/10" />
        <button className="block w-48 text-left px-4 py-2 hover:bg-red-500/10 text-red-400" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
};

export default ContextMenu;
