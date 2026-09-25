import React from 'react';
import { UserRole } from '../types';
import { 
  Printer, 
  Sparkles, 
  LayoutDashboard, 
  PlusCircle, 
  Bot, 
  BookOpen, 
  Webhook, 
  BarChart3, 
  Play, 
  RotateCcw,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onRunLiveDemo: () => void;
  onResetData: () => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  onRunLiveDemo,
  onResetData,
  pendingCount
}) => {
  const tabs = [
    { id: 'landing', label: 'Overview', icon: BookOpen },
    { id: 'dashboard', label: 'Dashboard & Queue', icon: LayoutDashboard, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'order', label: 'New Print Order', icon: PlusCircle },
    { id: 'ai', label: 'Gemini RAG Assistant', icon: Bot, isAi: true },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'automations', label: 'n8n Automations', icon: Webhook },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top Banner / Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">PrintAI Spooler v2.6 Online</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">Central Campus & Enterprise Print Node</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Section 15 Live Demo Button */}
          <button
            onClick={onRunLiveDemo}
            className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-md shadow-sm transition-all text-xs"
            title="Execute PRD Section 15 Complete Live Demo Scenario"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run PRD Live Demo</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors"
            title="Reset all orders and database to factory defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Data</span>
          </button>

          {/* Role Persona Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 px-2 py-1 rounded-md border border-slate-700">
            <span className="text-slate-400 font-normal hidden sm:inline">Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="customer" className="bg-slate-900 text-white">Student / Customer</option>
              <option value="staff" className="bg-slate-900 text-white">Printing Staff / Admin</option>
              <option value="manager" className="bg-slate-900 text-white">Department Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-mono">PrintAI</span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30">
                  RAG + n8n
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">AI-Powered Smart Printing Platform</p>
            </div>
          </div>

          {/* Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? tab.isAi
                        ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${tab.isAi ? 'text-indigo-400' : isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                      {tab.badge}
                    </span>
                  )}
                  {tab.isAi && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile / Compact Navigation Bar */}
        <div className="lg:hidden flex items-center space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-800 text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`whitespace-nowrap flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
