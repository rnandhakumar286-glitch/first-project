import React from 'react';
import { Target, Sparkles, Layers, BarChart3, BookOpen, CheckCircle2, Sun, Moon } from 'lucide-react';
import { JobRole } from '../types';

interface NavbarProps {
  activeTab: 'journey' | 'progress' | 'guide';
  setActiveTab: (tab: 'journey' | 'progress' | 'guide') => void;
  selectedRole?: JobRole;
  readinessScore: number;
  completedCount: number;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedRole,
  readinessScore,
  completedCount,
  isDarkMode,
  toggleDarkMode,
}) => {
  return (
    <header className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl sticky top-0 z-30 shadow-sm dark:shadow-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('journey')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">SkillBridge AI</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Placement Prep
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Personalized Skill Planning, Task Verification & Anti-Plagiarism</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('journey')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'journey'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Full Journey</span>
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'progress'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Progress & Mastery</span>
              <span className="sm:hidden">Progress</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Architecture</span>
            </button>
          </nav>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 rounded-xl px-3 py-1.5">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {selectedRole ? selectedRole.title : 'Target Role'}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {readinessScore}% Placement Ready
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 ml-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
