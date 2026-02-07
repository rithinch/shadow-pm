
import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, Database, MessageSquare, ClipboardCheck, Settings, Ghost, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  onSignOut?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, onSignOut }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Overview' },
    { id: AppView.KNOWLEDGE_BASE, icon: Database, label: 'Context' },
    { id: AppView.MEETINGS, icon: MessageSquare, label: 'Meetings' },
    { id: AppView.ACTION_BOARD, icon: ClipboardCheck, label: 'Action Board' },
  ];

  if (activeView === AppView.ONBOARDING) return <>{children}</>;

  return (
    <div className="flex h-screen w-full bg-[#030303] overflow-hidden text-white/90">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#050505] flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 glass rounded-lg shadow-lg">
            <Ghost className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">Shadow<span className="text-white/40">PM</span></span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeView === item.id 
                  ? 'bg-white/10 text-white border border-white/10 shadow-lg' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-white/50 hover:text-white rounded-xl transition-all">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button 
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500/50 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#030303]">
        <div className="max-w-6xl mx-auto px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
};
