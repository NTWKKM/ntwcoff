import React from 'react';
import { Coffee, Moon, Sun, Github, Clock, RefreshCw } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  totalPapers: number;
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, totalPapers }) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-stone-50/90 dark:bg-espresso-950/90 border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-coffee-800 flex items-center justify-center text-white shadow-md shadow-amber-900/20 ring-1 ring-amber-500/30">
            <Coffee className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-stone-900 dark:text-white">
                NTWK <span className="text-amber-600 dark:text-amber-400 font-semibold">Coffee</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                Deep Research
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-slate-400 hidden sm:block">
              วิทยาศาสตร์และอุณหพลศาสตร์กาแฟระดับโมเลกุล
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Sync schedule badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-xs text-stone-600 dark:text-slate-300 border border-stone-200 dark:border-stone-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ml-0.5" />
            <span>Sync อัตโนมัติทุก 12:00 น.</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 dark:text-slate-300 dark:hover:text-white bg-stone-100 hover:bg-stone-200/70 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-all focus:outline-none"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/NTWKKM/ntwcoff"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:text-stone-900 dark:text-slate-200 dark:hover:text-white bg-stone-100 hover:bg-stone-200/70 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-all"
            title="View on GitHub"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>

      </div>
    </header>
  );
};
