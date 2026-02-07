
import React, { useState, useEffect } from 'react';
import { AppView, TeamConfig, ShadowAnalysis, BacklogItem, CommitItem, Ticket, Outcome, MeetingSession } from './types';
import { Layout } from './components/Layout';
import { IntegrationLogo } from './components/IntegrationLogo';
import { ActionCard } from './components/ActionCard';
import { GranolaLogo } from './components/GranolaLogo';
import { ReewildLogo } from './components/ReewildLogo';
import { MeetingDetailModal } from './components/MeetingDetailModal';
import { analyzeProductContext } from './services/geminiService';
import { DEMO_DATASETS, DemoDataset } from './mockData';
import { 
  Github, 
  Slack, 
  MessageCircle, 
  Plus, 
  FileText, 
  Upload, 
  Cpu, 
  Sparkles, 
  Code,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Database,
  Users,
  History,
  Clock,
  ExternalLink,
  ClipboardCheck,
  Search,
  CheckCircle2,
  Inbox,
  Activity,
  Zap,
  CheckCircle,
  Ghost,
  RefreshCw,
  SearchCode,
  AlertTriangle,
  X,
  Layers,
  Rocket,
  Info,
  Terminal,
  UserPlus
} from 'lucide-react';

const App: React.FC = () => {
  const reewildDefault = DEMO_DATASETS.find(d => d.id === 'reewild') || DEMO_DATASETS[0];

  const [view, setView] = useState<AppView>(AppView.ONBOARDING);
  const [teamConfig, setTeamConfig] = useState<TeamConfig>(reewildDefault.config);
  const [backlog, setBacklog] = useState<BacklogItem[]>(reewildDefault.backlog);
  const [commits, setCommits] = useState<CommitItem[]>(reewildDefault.commits);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [analysis, setAnalysis] = useState<ShadowAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [meetingSessions, setMeetingSessions] = useState<MeetingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<MeetingSession | null>(null);
  
  // Modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingExternalMeeting, setViewingExternalMeeting] = useState<any | null>(null);

  // API states
  const [externalMeetings, setExternalMeetings] = useState<any[]>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('shadow_sessions');
    if (saved) {
      setMeetingSessions(JSON.parse(saved));
    }
    fetchExternalMeetings();
  }, []);

  const fetchExternalMeetings = async () => {
    setIsLoadingExternal(true);
    setFetchError(null);
    try {
      const response = await fetch('https://shadowpm-api.redstone-c46110a3.uksouth.azurecontainerapps.io/meetings');
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      if (data.status === 'success') {
        setExternalMeetings(data.meetings);
      }
    } catch (error: any) {
      console.error("Failed to fetch meetings:", error);
      setFetchError(error.message === 'Failed to fetch' ? 'Network error or CORS issue' : error.message);
    } finally {
      setIsLoadingExternal(false);
    }
  };

  const handleSignOut = () => {
    if (confirm("Reset current session and return to initialization?")) {
      handleCustomReset();
      setView(AppView.ONBOARDING);
    }
  };

  const handleCustomReset = () => {
    setTeamConfig({
      name: '',
      productDescription: '',
      members: [],
      githubConnected: false,
      jiraConnected: false,
      slackConnected: false,
    });
    setBacklog([]);
    setCommits([]);
    setMeetingNotes('');
    setAnalysis(null);
    setMeetingSessions([]);
    localStorage.removeItem('shadow_sessions');
  };

  const runAnalysis = async (notes: string) => {
    if (!notes) return;
    setIsAnalyzing(true);
    setIsImportModalOpen(false);
    setViewingExternalMeeting(null);
    
    try {
      const backlogStr = backlog.map(b => `${b.id},${b.summary},${b.status}`).join('\n');
      const commitStr = commits.map(c => `${c.hash},${c.message},${c.author}`).join('\n');
      const result = await analyzeProductContext(
        notes,
        backlogStr,
        commitStr,
        `Team: ${teamConfig.name}. Product: ${teamConfig.productDescription}. Members: ${teamConfig.members.join(', ')}`
      );
      
      const newSession: MeetingSession = {
        id: Date.now().toString(),
        date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        notes: notes,
        analysis: result
      };

      setAnalysis(result);
      setMeetingSessions([newSession, ...meetingSessions]);
      setView(AppView.ACTION_BOARD);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateCurrentAnalysis = (updatedItem: Ticket | Outcome) => {
    const isTicket = 'title' in updatedItem;
    if (analysis) {
       if (isTicket) {
         setAnalysis({
           ...analysis,
           suggestedTickets: analysis.suggestedTickets.map(t => t.id === updatedItem.id ? (updatedItem as Ticket) : t)
         });
       } else {
         setAnalysis({
           ...analysis,
           outcomes: analysis.outcomes.map(o => o.id === updatedItem.id ? (updatedItem as Outcome) : o)
         });
       }
    }
  };

  const approveItem = (id: string) => {
    if (!analysis) return;
    const updatedTickets = analysis.suggestedTickets.map(t => t.id === id ? ({ ...t, status: 'approved' as const }) : t);
    const updatedOutcomes = analysis.outcomes.map(o => o.id === id ? ({ ...o, status: 'approved' as const }) : o);
    setAnalysis({ ...analysis, suggestedTickets: updatedTickets, outcomes: updatedOutcomes });
  };

  const renderOnboarding = () => (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 animate-in fade-in duration-1000 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-5xl w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="p-4 glass rounded-[32px] shadow-2xl border border-white/10 flex items-center justify-center bg-white/5">
              <Ghost size={48} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            </div>
          </div>
          <h1 className="text-6xl font-black tracking-tighter mb-6 text-white leading-tight">
            Shadow<span className="text-white/30">PM</span>
          </h1>
          <p className="text-xl text-white/40 max-w-4xl mx-auto font-light leading-relaxed">
            The agentic PM for teams without a PM — it turns meeting notes and standups into prioritized tickets and keeps your backlog and changelog up to date (<span className="text-white/60">Github / Linear / Jira / Shortcut</span>).
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-stretch max-w-5xl mx-auto">
          <div className="lg:col-span-3 glass p-10 rounded-[40px] border border-white/10 space-y-8 flex flex-col shadow-2xl bg-white/[0.01]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-white/30" />
                <h2 className="text-lg font-bold text-white/90 tracking-tight">System Configuration</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  setTeamConfig(reewildDefault.config);
                  setBacklog(reewildDefault.backlog);
                  setCommits(reewildDefault.commits);
                }} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${teamConfig.name === 'Reewild' ? 'bg-white text-black border-white' : 'text-white/30 border-white/10 hover:border-white/20'}`}>Demo: Reewild</button>
                <button onClick={handleCustomReset} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${teamConfig.name === '' ? 'bg-white text-black border-white' : 'text-white/30 border-white/10 hover:border-white/20'}`}>Manual Setup</button>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/20 tracking-[0.2em] block mb-2 ml-1">Team Identity</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 transition-opacity flex items-center pointer-events-none">
                        {teamConfig.name === 'Reewild' ? <ReewildLogo className="w-5 h-5" /> : <Database size={16} />}
                    </div>
                    <input 
                      type="text" 
                      value={teamConfig.name}
                      onChange={(e) => setTeamConfig({ ...teamConfig, name: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-base focus:outline-none focus:border-white/20 transition-all text-white font-medium placeholder:text-white/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/20 tracking-[0.2em] block mb-2 ml-1">Key Members</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 flex items-center">
                      <UserPlus size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={teamConfig.members.join(', ')}
                      onChange={(e) => setTeamConfig({ ...teamConfig, members: e.target.value.split(',').map(m => m.trim()) })}
                      placeholder="e.g. Sam, Jordan, Chris"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-base focus:outline-none focus:border-white/20 transition-all text-white font-medium placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-white/20 tracking-[0.2em] block mb-2 ml-1">Product Context</label>
                <textarea 
                  value={teamConfig.productDescription}
                  onChange={(e) => setTeamConfig({ ...teamConfig, productDescription: e.target.value })}
                  placeholder="Describe what your team is building... (e.g. A rewards platform for sustainable shopping)"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-3xl px-6 py-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all h-32 resize-none placeholder:text-white/10 leading-relaxed"
                />
              </div>
            </div>
            
            <button 
              onClick={() => setView(AppView.DASHBOARD)}
              disabled={!teamConfig.name}
              className="w-full bg-white text-black py-5 rounded-[24px] font-bold text-base hover:bg-white/90 disabled:opacity-20 transition-all flex items-center justify-center gap-3 group shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
            >
              Initialize ShadowPM <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="lg:col-span-2 glass p-10 rounded-[40px] border border-white/10 space-y-8 shadow-xl flex flex-col bg-white/[0.005]">
            <h2 className="text-lg font-bold text-white/90 tracking-tight">Sync stack</h2>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[
                {id: 'github', label: 'Repo'}, 
                {id: 'linear', label: 'Linear'}, 
                {id: 'jira', label: 'Jira'}, 
                {id: 'shortcut', label: 'Shortcut'},
                {id: 'slack', label: 'Slack'},
                {id: 'teams', label: 'Teams'}
              ].map((tool) => (
                <div key={tool.id} className="flex flex-col items-center justify-center gap-2 p-4 glass rounded-[24px] border border-white/5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <IntegrationLogo type={tool.id as any} size={20} />
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{tool.label}</p>
                </div>
              ))}
            </div>
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                <Info size={12} /> Sync Tip
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed font-light">ShadowPM works best when synced with both your work management (Jira/Linear) and your code (Github) for full reconcile context.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const pendingTickets = meetingSessions.flatMap(s => s.analysis.suggestedTickets).filter(t => t.status === 'suggested');
    return (
      <div className="space-y-12 animate-in fade-in duration-500">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">{teamConfig.name} <span className="text-white/20">Dashboard</span></h1>
            <p className="text-white/30 font-light italic">System initialized. <span className="text-white/60">{meetingSessions.length} sessions analyzed</span> and reconciled.</p>
          </div>
          <button onClick={() => setView(AppView.MEETINGS)} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl hover:bg-white/90 transition-all text-sm font-bold shadow-xl shadow-white/5">
            <MessageCircle size={18} /> Context Stream
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass p-8 rounded-[32px] border border-white/10 bg-white/[0.01]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Inbox</h3>
            <p className="text-4xl font-black">{pendingTickets.length}</p>
            <p className="text-[10px] text-blue-400 mt-2 font-medium">Awaiting approval</p>
          </div>
          <div className="glass p-8 rounded-[32px] border border-white/10 bg-white/[0.01]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Context</h3>
            <p className="text-4xl font-black">94%</p>
            <p className="text-[10px] text-green-400 mt-2 font-medium">System Alignment</p>
          </div>
          <div className="glass p-8 rounded-[32px] border border-white/10 bg-white/[0.01]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Backlog</h3>
            <p className="text-4xl font-black">{backlog.length}</p>
            <p className="text-[10px] text-white/40 mt-2 font-medium">Reconciled Items</p>
          </div>
          <div className="glass p-8 rounded-[32px] border border-white/10 bg-white/[0.01]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Syncs</h3>
            <p className="text-4xl font-black">{commits.length}</p>
            <p className="text-[10px] text-purple-400 mt-2 font-medium">Recent Commits</p>
          </div>
        </div>

        {pendingTickets.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-3"><AlertCircle size={22} className="text-blue-400" /> Action Required</h2>
              <button onClick={() => setView(AppView.ACTION_BOARD)} className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all">Review All Drafts</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingTickets.slice(0, 3).map(ticket => (
                <ActionCard key={ticket.id} item={ticket} onApprove={approveItem} onUpdate={updateCurrentAnalysis} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderKnowledgeBase = () => (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">System Context</h1>
          <p className="text-white/40 mt-1 font-light italic">The source of truth reconciled from your external platforms.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex -space-x-3">
             <div className="w-10 h-10 rounded-full border-2 border-[#030303] bg-white/5 flex items-center justify-center"><IntegrationLogo type="github" size={16} /></div>
             <div className="w-10 h-10 rounded-full border-2 border-[#030303] bg-white/5 flex items-center justify-center"><IntegrationLogo type="linear" size={16} /></div>
          </div>
          <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-all">Config Sync</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3"><Terminal size={20} className="text-purple-400" /> Recent Changelog</h2>
            <span className="text-[10px] text-white/20 font-mono">Syncing from main</span>
          </div>
          <div className="glass rounded-[32px] border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              {commits.slice(0, 8).map(c => (
                <div key={c.hash} className="px-6 py-4 hover:bg-white/[0.02] transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover:text-purple-400 transition-colors"><Code size={14} /></div>
                    <div>
                      <p className="text-sm font-medium text-white/80">{c.message}</p>
                      <p className="text-[10px] text-white/20">{c.author} • {c.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/10">{c.hash}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3"><Layers size={20} className="text-blue-400" /> Backlog State</h2>
            <span className="text-[10px] text-white/20 font-mono">Synced with Linear/Jira</span>
          </div>
          <div className="glass rounded-[32px] border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              {backlog.slice(0, 8).map(b => (
                <div key={b.id} className="px-6 py-4 hover:bg-white/[0.02] transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover:text-blue-400 transition-colors"><Activity size={14} /></div>
                    <div>
                      <p className="text-sm font-medium text-white/80">{b.summary}</p>
                      <p className="text-[10px] text-white/20">{b.id}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                    b.status === 'Done' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'
                  }`}>{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMeetings = () => (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Meeting Context</h1>
          <p className="text-white/40 mt-1 font-light italic">Sync your voice notes and standups to the engineering state.</p>
        </div>
        <button 
          onClick={() => setIsImportModalOpen(true)}
          className="bg-white text-black px-8 py-4 rounded-[20px] font-bold text-sm hover:bg-white/90 transition-all flex items-center gap-3 shadow-[0_10px_40px_rgba(255,255,255,0.05)] group"
        >
          <Plus size={20} /> Sync New Context
        </button>
      </header>

      {/* Logs Table First */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-3"><History className="text-white/30" size={20} /> Recent Meeting Logs</h2>
          <button onClick={fetchExternalMeetings} className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white transition-all flex items-center gap-2">
            <RefreshCw size={12} className={isLoadingExternal ? 'animate-spin' : ''} /> Refresh Sync
          </button>
        </div>
        
        {fetchError ? (
          <div className="glass rounded-[32px] p-12 border border-red-500/10 text-center">
             <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
             <p className="text-xs text-white/40 mb-4">Failed to fetch external logs: {fetchError}</p>
             <button onClick={fetchExternalMeetings} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/60">Retry Fetch</button>
          </div>
        ) : (
          <div className="glass rounded-[32px] border border-white/10 overflow-hidden shadow-2xl bg-white/[0.005]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/20">Title</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/20">Date</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/20">Source</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-white/20 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoadingExternal ? (
                   Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6"><div className="h-4 bg-white/5 rounded w-full" /></td>
                    </tr>
                   ))
                ) : externalMeetings.map((m) => (
                  <tr 
                    key={m.id} 
                    className="group hover:bg-white/[0.02] transition-all cursor-pointer"
                    onClick={() => setViewingExternalMeeting(m)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                        <span className="text-sm font-semibold text-white/80 group-hover:text-white">{m.title || "Untitled Standup"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-mono text-white/30">{new Date(m.calendar_event_time).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs text-white/50">{m.creator_name}</span>
                        <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Granola Sync</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white group-hover:bg-white/10 transition-all">
                          Preview Log
                       </button>
                    </td>
                  </tr>
                ))}
                {externalMeetings.length === 0 && !isLoadingExternal && (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center text-xs text-white/20 font-light italic">No logs found in synced channels.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-6 pt-10 border-t border-white/5">
        <h2 className="text-lg font-bold flex items-center gap-3"><CheckCircle2 className="text-green-500/40" size={20} /> Analyzed Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetingSessions.map((session) => (
            <div key={session.id} onClick={() => setSelectedSession(session)} className="glass p-8 rounded-[32px] border border-white/10 hover:border-white/30 transition-all cursor-pointer bg-white/[0.01]">
              <div className="text-[9px] font-mono text-white/20 mb-3">{session.date}</div>
              <h3 className="text-sm font-bold text-white/80 mb-4 line-clamp-1">{session.notes.split('\n')[0]}</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase tracking-widest font-bold"><ClipboardCheck size={12} className="text-green-500/50" /> {session.analysis.suggestedTickets.length} items</div>
                 <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase tracking-widest font-bold"><Zap size={12} className="text-blue-500/50" /> {session.analysis.outcomes.length} decisions</div>
              </div>
            </div>
          ))}
          {meetingSessions.length === 0 && (
            <div className="col-span-full py-12 glass rounded-[32px] border border-white/5 text-center text-white/20 text-xs italic">
               No sessions synthesized yet. Use the sync tools above.
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative glass w-full max-w-2xl rounded-[40px] border border-white/10 shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200 bg-[#080808]">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Sync New Context</h3>
                <p className="text-sm text-white/30 font-light">Paste a standup summary or meeting transcript below.</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 text-white/20 hover:text-white transition-all"><X size={24} /></button>
            </div>
            <textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              placeholder="E.g. Daily Standup: We decided to pivot the login flow to use clerk instead of custom auth..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-3xl p-6 text-base text-white/80 focus:outline-none focus:border-white/20 min-h-[300px] resize-none font-light leading-relaxed shadow-inner"
            />
            <button 
              onClick={() => runAnalysis(meetingNotes)}
              disabled={!meetingNotes || isAnalyzing}
              className="w-full bg-white text-black py-5 rounded-[24px] font-bold text-base hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
            >
              {isAnalyzing ? <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" /> : "Synthesize into Action Board"} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* External Meeting Viewer Modal */}
      {viewingExternalMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={() => setViewingExternalMeeting(null)} />
          <div className="relative glass w-full max-w-3xl h-[85vh] rounded-[40px] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 bg-[#080808]">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
               <div className="space-y-1">
                 <h3 className="text-2xl font-black">{viewingExternalMeeting.title || "Meeting Log"}</h3>
                 <p className="text-xs font-mono text-white/30">{new Date(viewingExternalMeeting.calendar_event_time).toLocaleString()}</p>
               </div>
               <button onClick={() => setViewingExternalMeeting(null)} className="p-2 text-white/20 hover:text-white transition-all"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="space-y-8">
                <section className="space-y-4">
                  <h4 className="text-[10px] uppercase font-bold text-white/20 tracking-[0.2em]">Context Content</h4>
                  <div className="glass p-8 rounded-3xl border border-white/5 bg-white/[0.01] shadow-inner">
                    <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap font-light">
                      {viewingExternalMeeting.transcript || viewingExternalMeeting.enhanced_notes || viewingExternalMeeting.my_notes || "No context content found for this log."}
                    </p>
                  </div>
                </section>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 glass rounded-2xl border border-white/5">
                    <p className="text-[9px] uppercase font-bold text-white/20 tracking-widest mb-2">Creator</p>
                    <p className="text-xs text-white/60 font-medium">{viewingExternalMeeting.creator_name}</p>
                    <p className="text-[10px] text-white/30 truncate">{viewingExternalMeeting.creator_email}</p>
                  </div>
                  <div className="p-5 glass rounded-2xl border border-white/5">
                    <p className="text-[9px] uppercase font-bold text-white/20 tracking-widest mb-2">Sync Intelligence</p>
                    <p className="text-xs text-white/40 flex items-center gap-2"><Sparkles size={12} className="text-blue-500" /> High Depth Capture</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-white/5 bg-white/[0.02]">
              <button 
                onClick={() => runAnalysis(viewingExternalMeeting.transcript || viewingExternalMeeting.enhanced_notes || viewingExternalMeeting.my_notes)}
                disabled={isAnalyzing}
                className="w-full bg-white text-black py-5 rounded-[24px] font-bold text-base hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
              >
                {isAnalyzing ? <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" /> : "Extract & Sythesize Board"} <Sparkles size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSession && <MeetingDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  );

  const renderActionBoard = () => (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex justify-between items-center border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Action Board</h1>
          <p className="text-white/40 mt-1 font-light italic">Refine suggested work items and sync them to Shortcut, Jira, or Linear.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setView(AppView.DASHBOARD)} className="px-6 py-3 border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/5 transition-all text-white/60">Dashboard</button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center gap-2">
            Push All Approved <Rocket size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white/90 flex items-center gap-3">
              <Layers size={22} className="text-blue-400" /> Draft Backlog 
              <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] text-white/30 font-mono">{analysis?.suggestedTickets.length || 0}</span>
            </h2>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">Ready for Sync</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis?.suggestedTickets.map(ticket => (
              <ActionCard key={ticket.id} item={ticket} onApprove={approveItem} onUpdate={updateCurrentAnalysis} />
            ))}
            {!analysis && (
              <div className="col-span-full py-20 text-center glass rounded-[40px] border border-white/5">
                <Sparkles size={48} className="mx-auto text-white/10 mb-4" />
                <h3 className="text-lg font-bold text-white/30">No active synthesis</h3>
                <button onClick={() => setView(AppView.MEETINGS)} className="mt-4 text-blue-400 font-bold text-sm hover:underline">Pick a meeting to start</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-xl font-bold text-white/90">Strategic Decisions</h2>
          <div className="space-y-4">
            {analysis?.outcomes.map(outcome => (
              <ActionCard key={outcome.id} item={outcome} onApprove={approveItem} onUpdate={updateCurrentAnalysis} />
            ))}
            {(!analysis || analysis.outcomes.length === 0) && (
              <div className="py-10 text-center glass rounded-[32px] border border-white/5">
                 <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">No decisions detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case AppView.ONBOARDING: return renderOnboarding();
      case AppView.DASHBOARD: return renderDashboard();
      case AppView.KNOWLEDGE_BASE: return renderKnowledgeBase();
      case AppView.MEETINGS: return renderMeetings();
      case AppView.ACTION_BOARD: return renderActionBoard();
      default: return renderDashboard();
    }
  };

  return (
    <Layout activeView={view} onViewChange={setView} onSignOut={handleSignOut}>
      {renderContent()}
    </Layout>
  );
};

export default App;
