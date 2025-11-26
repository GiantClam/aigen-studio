import React, { useEffect, useState } from 'react';
import { Template } from '../types';
import { fetchNanoCanvasTemplates } from '../services/templateAdapter';

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
  hasSelection: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect, hasSelection }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNanoCanvasTemplates().then((data) => { setTemplates(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[11px] text-slate-400">Loading templates...</div>;

  return (
    <div className="grid grid-cols-1 gap-2">
      {templates.map((t) => (
        <button key={t.id} onClick={() => onSelect(t)} className="px-3 py-2 bg-slate-50 rounded border border-white/10 text-left hover:bg-indigo-600 hover:text-white transition-colors">
          <div className="text-xs font-bold">{t.name}</div>
          <div className="text-[11px] text-slate-400">{t.description}</div>
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;
