import React from 'react';
import { SelectedProperties } from '../types';
import { Home, Save, Download, Upload, Type, Square, Circle, Brush, MousePointer, Trash } from 'lucide-react';

interface ToolbarProps {
  activeTool: string;
  onSelectTool: (tool: string) => void;
  onDelete: () => void;
  onDownload: () => void;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveProject: () => void;
  onHome: () => void;
  selectedProperties: SelectedProperties;
  onUpdateProperty: (key: keyof SelectedProperties, value: any) => void;
  hasSelection: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onSelectTool, onDelete, onDownload, onUploadImage, onSaveProject, onHome, selectedProperties, onUpdateProperty, hasSelection }) => {
  return (
    <div className="absolute left-4 top-4 z-50 flex gap-4 items-start">
      <div className={`flex flex-col bg-[#0B1220]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 w-16`}>
        <button className={`p-3 ${activeTool === 'select' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'}`} onClick={() => onSelectTool('select')} title="Select"><MousePointer size={20} /></button>
        <button className={`p-3 ${activeTool === 'draw' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'}`} onClick={() => onSelectTool('draw')} title="Brush"><Brush size={20} /></button>
        <button className={`p-3 ${activeTool === 'rect' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'}`} onClick={() => onSelectTool('rect')} title="Rectangle"><Square size={20} /></button>
        <button className={`p-3 ${activeTool === 'circle' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'}`} onClick={() => onSelectTool('circle')} title="Circle"><Circle size={20} /></button>
        <button className={`p-3 ${activeTool === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'}`} onClick={() => onSelectTool('text')} title="Text"><Type size={20} /></button>
        <div className="border-t border-white/10" />
        <button className={`p-3 text-slate-300 hover:bg-white/10`} onClick={onSaveProject} title="Save"><Save size={20} /></button>
        <button className={`p-3 text-slate-300 hover:bg-white/10`} onClick={onDownload} title="Download"><Download size={20} /></button>
        <label className="p-3 text-slate-300 hover:bg-white/10 cursor-pointer" title="Upload">
          <Upload size={20} />
          <input type="file" className="hidden" accept="image/*" onChange={onUploadImage} />
        </label>
        <button className={`p-3 text-slate-300 hover:bg-white/10`} onClick={onHome} title="Home"><Home size={20} /></button>
        <button className={`p-3 ${hasSelection ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-500'} `} onClick={onDelete} disabled={!hasSelection} title="Delete"><Trash size={20} /></button>
      </div>

      <div className="bg-[#0B1220]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-4 w-[260px] text-slate-200">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Properties</div>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-slate-400">Stroke Color</label>
            <input type="color" value={selectedProperties.stroke} onChange={(e) => onUpdateProperty('stroke', e.target.value)} className="w-full h-8 p-0 bg-transparent border border-white/10 rounded" />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Stroke Width</label>
            <input type="range" min={1} max={20} value={selectedProperties.strokeWidth} onChange={(e) => onUpdateProperty('strokeWidth', Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Fill</label>
            <input type="color" value={selectedProperties.fill} onChange={(e) => onUpdateProperty('fill', e.target.value)} className="w-full h-8 p-0 bg-transparent border border-white/10 rounded" />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Font Size</label>
            <input type="number" min={8} max={200} value={selectedProperties.fontSize} onChange={(e) => onUpdateProperty('fontSize', Number(e.target.value))} className="w-full bg-transparent border border-white/10 rounded px-2 py-1" />
          </div>
          <div className="text-[11px] text-slate-400">Selected: <span className="text-slate-200 font-mono">{selectedProperties.type || 'none'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
