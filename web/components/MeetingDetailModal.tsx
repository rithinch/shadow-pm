
import React, { useState } from 'react';
import { MeetingSession, Ticket, Outcome } from '../types';
// Added Save to the list of icons imported from lucide-react
import { X, Calendar, FileText, ClipboardCheck, Zap, History, Save } from 'lucide-react';
import { ActionCard } from './ActionCard';

interface MeetingDetailModalProps {
  session: MeetingSession;
  onClose: () => void;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({ session, onClose }) => {
  const [localSession, setLocalSession] = useState(session);

  const handleUpdate = (updatedItem: Ticket | Outcome) => {
    const isTicket = 'title' in updatedItem;
    const { analysis } = localSession;
    
    if (isTicket) {
      const updatedTickets = analysis.suggestedTickets.map(t => t.id === updatedItem.id ? (updatedItem as Ticket) : t);
      setLocalSession({ ...localSession, analysis: { ...analysis, suggestedTickets: updatedTickets } });
    } else {
      const updatedOutcomes = analysis.outcomes.map(o => o.id === updatedItem.id ? (updatedItem as Outcome) : o);
      setLocalSession({ ...localSession, analysis: { ...analysis, outcomes: updatedOutcomes } });
    }
  };

  const handleApprove = (id: string) => {
    const { analysis } = localSession;
    const updatedTickets = analysis.suggestedTickets.map(t => t.id === id ? ({ ...t, status: 'approved' as const }) : t);
    const updatedOutcomes = analysis.outcomes.map(o => o.id === id ? ({ ...o, status: 'approved' as const }) : o);
    setLocalSession({ ...localSession, analysis: { ...analysis, suggestedTickets: updatedTickets, outcomes: updatedOutcomes } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl h-[92vh] glass rounded-[40px] overflow-hidden flex flex-col shadow-2xl border border-white/10">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/5 rounded-2xl text-blue-400/70 border border-white/5 shadow-inner">
              <History size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Review Session History</h2>
              <div className="flex items-center gap-3 text-xs text-white/30 font-mono mt-1">
                 <Calendar size={12} /> {localSession.date}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/20 hover:text-white border border-transparent hover:border-white/10">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              <section className="space-y-4">
                <h3 className="text-[11px] uppercase font-bold text-white/20 tracking-[0.25em] flex items-center gap-2">
                  <FileText size={16} /> Original Input
                </h3>
                <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] shadow-inner">
                  <p className="text-sm text-white/50 leading-loose italic font-light whitespace-pre-wrap">
                    {localSession.notes}
                  </p>
                </div>
              </section>

              <div className="glass p-6 rounded-3xl border border-blue-500/10 bg-blue-500/[0.02]">
                <h3 className="text-xs font-bold text-blue-400/60 mb-3 flex items-center gap-2 tracking-wide">
                  <Zap size={16} /> Synthesis context
                </h3>
                <p className="text-xs text-white/30 leading-relaxed font-light">
                  ShadowPM reconciled this input against active commits and found 2 existing tickets were actually already in progress.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-12">
              <section className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-[11px] uppercase font-bold text-white/20 tracking-[0.25em]">Generated Tickets</h3>
                  <span className="text-[10px] text-white/20 font-mono">Status: {localSession.analysis.suggestedTickets.filter(t => t.status === 'approved').length}/{localSession.analysis.suggestedTickets.length} Approved</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {localSession.analysis.suggestedTickets.map(ticket => (
                    <ActionCard 
                      key={ticket.id} 
                      item={ticket} 
                      onUpdate={handleUpdate}
                      onApprove={handleApprove}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-[11px] uppercase font-bold text-white/20 tracking-[0.25em]">Strategic Outcomes</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {localSession.analysis.outcomes.map(outcome => (
                    <ActionCard 
                      key={outcome.id} 
                      item={outcome} 
                      onUpdate={handleUpdate}
                      onApprove={handleApprove}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
          <p className="text-[10px] text-white/20 italic font-mono uppercase tracking-widest">ShadowPM v2.4 • Agent Context Active</p>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-8 py-3 rounded-2xl border border-white/10 text-white/60 font-semibold hover:bg-white/5 transition-all text-sm"
            >
              Close History
            </button>
            <button className="bg-white text-black px-10 py-3 rounded-2xl font-bold text-sm hover:bg-white/90 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)] flex items-center gap-2">
              Save Session Changes <Save size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
