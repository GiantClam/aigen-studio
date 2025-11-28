import React, { useState } from 'react';
import { Template, Task, ModelType } from '../types';
import TemplateSelector from './TemplateSelector';

interface AIPanelProps {
  onGenerate: (prompt: string, model: ModelType, options?: { includeViewport: boolean }) => void;
  isGenerating: boolean;
  hasSelection: boolean;
  variant?: 'nano' | 'assistant';
}

const AIPanel: React.FC<AIPanelProps> = ({ onGenerate, isGenerating, hasSelection, variant = 'nano' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ModelType>(ModelType.NANO_BANANA_1);
  const [includeViewport, setIncludeViewport] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'templates'>('tasks');

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
      await onGenerate(prompt, model, { includeViewport });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'success' } : t));
    } catch (e: any) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error', error: e?.message } : t));
    }
  };

  const handleTemplateSelect = (t: Template) => {
    setPrompt(t.promptTemplate);
    setActiveTab('tasks');
  };

  return (
    <div className={`absolute top-4 right-4 z-50 transition-all duration-300 ease-in-out flex flex-col bg-[#0B1220]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden ${isCollapsed ? 'w-16 h-16 rounded-full' : 'w-[400px] h-[calc(100vh-2rem)]'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#151E2E]/50 select-none shrink-0">
        <div className="flex flex-col">
          <div className="text-sm font-semibold text-slate-200">{variant === 'nano' ? 'NanoCanvas' : 'Assistant'}</div>
          <div className="text-[11px] text-slate-400">Gemini Powered</div>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-slate-300 hover:text-white text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded">
          {isCollapsed ? 'Open' : 'Collapse'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="px-4 py-2 border-b border-white/10 bg-[#0B1220]/30 flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-200">
              <input type="checkbox" checked={includeViewport} onChange={(e) => setIncludeViewport(e.target.checked)} />
              Context: Full Viewport
            </label>
            <div className="ml-auto flex gap-4 text-[12px]">
              <button className={`pb-1 ${activeTab === 'tasks' ? 'text-slate-200 border-b-2 border-indigo-500' : 'text-slate-400'}`} onClick={() => setActiveTab('tasks')}>Tasks</button>
              <button className={`pb-1 ${activeTab === 'templates' ? 'text-slate-200 border-b-2 border-indigo-500' : 'text-slate-400'}`} onClick={() => setActiveTab('templates')}>Templates</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative bg-[#0B1220]/30">
            <div className="p-4 space-y-4">
              {activeTab === 'templates' ? (
                <div className="bg-[#151E2E]/50 border border-white/10 rounded-xl p-3">
                  <TemplateSelector onSelect={handleTemplateSelect} hasSelection={hasSelection} />
                </div>
              ) : (
                <>
                  <div className="text-center py-8 text-slate-200">
                    <div className="text-xl font-semibold">Ready to Create</div>
                    <div className="text-[12px] text-slate-400 mt-1">Select a template or start typing</div>
                  </div>

                  <div className="bg-[#151E2E]/50 border border-white/10 rounded-xl p-3">
                    <div className="text-[11px] text-slate-400 mb-2">Models</div>
                    <div className="flex flex-wrap gap-2">
                      <div className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${model === ModelType.NANO_BANANA_1 ? 'bg-indigo-600 text-white' : 'bg-[#0B1220] text-slate-300 border border-white/10'}`} onClick={() => setModel(ModelType.NANO_BANANA_1)}>Image Fast</div>
                      <div className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${model === ModelType.NANO_BANANA_2 ? 'bg-indigo-600 text-white' : 'bg-[#0B1220] text-slate-300 border border-white/10'}`} onClick={() => setModel(ModelType.NANO_BANANA_2)}>Image HQ</div>
                      <div className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${model === ModelType.VEO_FAST ? 'bg-indigo-600 text-white' : 'bg-[#0B1220] text-slate-300 border border-white/10'}`} onClick={() => setModel(ModelType.VEO_FAST)}>Video Fast</div>
                      <div className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${model === ModelType.VEO_HQ ? 'bg-indigo-600 text-white' : 'bg-[#0B1220] text-slate-300 border border-white/10'}`} onClick={() => setModel(ModelType.VEO_HQ)}>Video HQ</div>
                    </div>
                  </div>

                  <div className="bg-[#151E2E]/50 border border-white/10 rounded-xl p-3">
                    <div className="text-[11px] text-slate-400 mb-2">Prompt</div>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2">
                      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="flex-1 bg-transparent text-slate-200 text-sm outline-none" placeholder="Describe what you want to imagine..." />
                      <button onClick={handleGenerate} disabled={isGenerating} className="px-3 py-1.5 rounded bg-indigo-600 text-white text-xs disabled:opacity-50">{isGenerating ? '...' : 'Send'}</button>
                    </div>
                  </div>

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
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIPanel;
