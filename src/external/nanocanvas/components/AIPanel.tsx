import React, { useState } from 'react';
import { Template, Task, ModelType } from '../types';
import TemplateSelector from './TemplateSelector';

interface AIPanelProps {
  onGenerate: (prompt: string, model: ModelType) => void;
  isGenerating: boolean;
  hasSelection: boolean;
}

const AIPanel: React.FC<AIPanelProps> = ({ onGenerate, isGenerating, hasSelection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ModelType>(ModelType.NANO_BANANA_1);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      type: model === ModelType.VEO_FAST || model === ModelType.VEO_HQ ? 'video' : (hasSelection ? 'edit' : 'generate'),
      status: 'loading',
      prompt,
      timestamp: Date.now(),
      model,
    };
    setTasks(prev => [task, ...prev]);
    try {
      await onGenerate(prompt, model);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'success' } : t));
    } catch (e: any) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error', error: e?.message } : t));
    }
  };

  const handleTemplateSelect = (t: Template) => {
    setPrompt(t.promptTemplate);
  };

  return (
    <div className={`absolute top-4 right-4 z-50 transition-all duration-300 ease-in-out flex flex-col bg-[#0B1220]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden ${isCollapsed ? 'w-16 h-16 rounded-full' : 'w-[400px] h-[calc(100vh-2rem)]'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#151E2E]/50 select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">AI</div>
          <div className="text-sm font-semibold text-slate-200">Assistant</div>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-slate-300 hover:text-white text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded">
          {isCollapsed ? 'Open' : 'Collapse'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Main Content Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative bg-[#0B1220]/30">
            <div className="p-4 space-y-4">
              <div className="bg-[#151E2E]/50 border border-white/10 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 mb-1">Template</div>
                <TemplateSelector onSelect={handleTemplateSelect} hasSelection={hasSelection} />
              </div>

              <div className="bg-[#151E2E]/50 border border-white/10 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 mb-2">Prompt</div>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 rounded bg-[#0B1220]/60 text-slate-200 p-2 text-sm border border-white/10" placeholder="Describe what to generate..." />
              </div>

              <div className="bg-[#151E2E]/50 border border-white/10 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 mb-2">Model</div>
                <select value={model} onChange={e => setModel(e.target.value as ModelType)} className="w-full bg-[#0B1220]/60 text-slate-200 p-2 text-sm rounded border border-white/10">
                  <option value={ModelType.NANO_BANANA_1}>Image (fast)</option>
                  <option value={ModelType.NANO_BANANA_2}>Image (quality)</option>
                  <option value={ModelType.VEO_FAST}>Video (fast)</option>
                  <option value={ModelType.VEO_HQ}>Video (hq)</option>
                </select>
              </div>

              <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                {isGenerating ? 'Generating...' : (hasSelection ? 'Edit Selection' : 'Generate Content')}
              </button>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-[#151E2E]/60 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-200">{task.type}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${task.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : task.status === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'}`}>{task.status}</div>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{task.prompt}</div>
                    {task.error && <div className="text-[11px] text-rose-400 mt-1">{task.error}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIPanel;
