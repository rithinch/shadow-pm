
import React, { useState } from 'react';
import { Ticket, Outcome } from '../types';
import { refineItemWithAI } from '../services/geminiService';
import { 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  ChevronRight, 
  Edit3, 
  Save, 
  X, 
  Check, 
  Plus, 
  Trash2,
  Sparkles,
  Zap,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';

interface ActionCardProps {
  item: Ticket | Outcome;
  onUpdate?: (updatedItem: Ticket | Outcome) => void;
  onApprove?: (id: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ item, onUpdate, onApprove }) => {
  const isTicket = 'title' in item;
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);
  const [aiInstruction, setAiInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleSave = () => {
    onUpdate?.(editedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedItem(item);
    setIsEditing(false);
    setAiInstruction('');
  };

  const handleAiRefine = async () => {
    if (!aiInstruction) return;
    setIsRefining(true);
    try {
      const refined = await refineItemWithAI(editedItem, aiInstruction);
      setEditedItem(refined);
      setAiInstruction('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  if (isTicket) {
    const t = editedItem as Ticket;
    const isApproved = t.status === 'approved' || t.status === 'synced';

    if (isEditing) {
      return (
        <div className="glass rounded-[24px] p-6 mb-4 border border-blue-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Edit3 size={12} /> Editing Draft
              </span>
              <button onClick={handleCancel} className="text-white/20 hover:text-white"><X size={18} /></button>
            </div>

            {/* AI Refinement Area */}
            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">
                <Sparkles size={12} /> Refine with Gemini
              </div>
              <div className="flex gap-2">
                <input 
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  placeholder="e.g. 'Make the acceptance criteria more technical'..."
                  className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/30 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleAiRefine()}
                />
                <button 
                  onClick={handleAiRefine}
                  disabled={isRefining || !aiInstruction}
                  className="p-2 bg-blue-600 rounded-xl hover:bg-blue-500 disabled:opacity-20 transition-all shadow-lg shadow-blue-600/20"
                >
                  {isRefining ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Zap size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1.5 block ml-1">Title</label>
              <input 
                value={t.title}
                onChange={(e) => setEditedItem({ ...t, title: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1.5 block ml-1">Description</label>
              <textarea 
                value={t.description}
                onChange={(e) => setEditedItem({ ...t, description: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block ml-1">Acceptance Criteria</label>
              <div className="space-y-2">
                {t.acceptanceCriteria.map((ac, i) => (
                  <div key={i} className="flex gap-2 group/ac">
                    <input 
                      value={ac}
                      onChange={(e) => {
                        const newAc = [...t.acceptanceCriteria];
                        newAc[i] = e.target.value;
                        setEditedItem({ ...t, acceptanceCriteria: newAc });
                      }}
                      className="flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-blue-500/20"
                    />
                    <button 
                      onClick={() => {
                        const newAc = t.acceptanceCriteria.filter((_, idx) => idx !== i);
                        setEditedItem({ ...t, acceptanceCriteria: newAc });
                      }}
                      className="opacity-0 group-hover/ac:opacity-100 p-1.5 text-white/20 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setEditedItem({ ...t, acceptanceCriteria: [...t.acceptanceCriteria, ''] })}
                  className="text-[10px] font-bold text-white/30 hover:text-blue-400 flex items-center gap-1.5 mt-2 transition-colors ml-1"
                >
                  <Plus size={12} /> Add Criteria
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button onClick={handleSave} className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`glass rounded-[28px] p-6 mb-4 hover:bg-white/[0.04] transition-all group border ${isApproved ? 'border-green-500/20' : 'border-white/5'} shadow-xl relative`}>
        {isApproved && (
          <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 p-2 rounded-full border border-green-500/20">
            <Check size={14} strokeWidth={3} />
          </div>
        )}
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
              t.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/10' : 
              t.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/10' : 'bg-blue-500/10 text-blue-400 border-blue-500/10'
            }`}>
              {t.priority}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/20 px-2 py-0.5 border border-white/5 rounded-full">{t.type}</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
             <button 
              onClick={() => setIsEditing(true)}
              className="p-2 text-white/30 hover:text-white transition-all bg-white/5 rounded-xl border border-white/5"
            >
              <Edit3 size={14} />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white/90 mb-2 leading-tight pr-8">{t.title}</h3>
        <p className="text-sm text-white/50 mb-6 line-clamp-3 font-light leading-relaxed">{t.description}</p>
        
        <div className="space-y-2 mb-6 p-4 bg-white/[0.01] rounded-2xl border border-white/5">
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest flex items-center gap-2">
            <CheckCircle size={12} className="text-blue-500/40" /> Acceptance Criteria
          </p>
          <div className="space-y-1.5 pt-1">
            {t.acceptanceCriteria.slice(0, 3).map((ac, i) => (
              <div key={i} className="flex items-start gap-3 text-xs text-white/40">
                <span className="text-white/20 font-mono mt-0.5">{i+1}.</span>
                <span className="flex-1 leading-relaxed">{ac}</span>
              </div>
            ))}
            {t.acceptanceCriteria.length > 3 && (
              <p className="text-[10px] text-blue-500/40 pl-6 font-bold uppercase tracking-widest pt-1">+{t.acceptanceCriteria.length - 3} more items...</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] text-white/20 font-mono">
            <FileText size={12} className="opacity-50" />
            <span className="truncate max-w-[120px]">{t.source}</span>
          </div>
          <div className="flex gap-2">
            {!isApproved && onApprove && (
              <button 
                onClick={() => onApprove(t.id)}
                className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-lg hover:bg-white/90"
              >
                Approve & Ready
              </button>
            )}
            {isApproved && (
              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-blue-600 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20 group/btn">
                Sync <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Outcome rendering
  const o = item as Outcome;
  const isApprovedOutcome = o.status === 'approved';

  return (
    <div className={`glass rounded-[24px] p-5 mb-3 border-l-4 ${
      o.type === 'risk' ? 'border-l-red-500/50' : 
      o.type === 'decision' ? 'border-l-green-500/50' : 'border-l-blue-500/50'
    } hover:bg-white/[0.04] transition-all group relative`}>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white/5 rounded-xl text-white/40">
           {o.type === 'decision' ? <CheckCircle size={16} /> : o.type === 'risk' ? <AlertTriangle size={16} /> : <HelpCircle size={16} />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white/80 leading-snug pr-6">{o.content}</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{o.type}</p>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onApprove && !isApprovedOutcome && (
                <button onClick={() => onApprove(o.id)} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-green-500/10 text-green-400 rounded-lg border border-green-500/10">
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
