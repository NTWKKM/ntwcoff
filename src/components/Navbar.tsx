import React from 'react';
import { Github, Clock, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  totalPapers: number;
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, totalPapers }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-eggshell/95 backdrop-blur-sm border-b border-stone transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[52px] flex items-center justify-between">
        
        {/* Brand Wordmark — Restrained Bauhaus Editorial with Spark Accent */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="group flex items-center gap-2 text-ink hover:opacity-90 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-violet-spark to-ember-orange shadow-sm group-hover:scale-125 transition-transform" />
            <span className="font-semibold text-[17px] tracking-tight text-ink font-sans">
              NTWK Coffee
            </span>
          </a>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-warm-taupe text-graphite border border-stone">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-spark mr-1.5" />
            Research Notebook
          </span>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-[13px] text-smoke">
          <span className="text-ash">•</span>
          <span className="font-sans text-graphite">
            {totalPapers} Scientific Monographs
          </span>
          <span className="text-ash">•</span>
          <span className="text-smoke">Google Drive Sync (12:00 ICT)</span>
        </nav>

        {/* Right Actions — Pill Buttons Hierarchy with Spark Accents */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sync schedule badge with Spark Pulse */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-taupe text-xs text-smoke border border-stone">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember-orange opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-violet-spark to-ember-orange" />
            </span>
            <Clock className="w-3 h-3 text-smoke ml-0.5" />
            <span>Auto-Sync 12:00 ICT</span>
          </div>

          {/* Theme Switcher — Outline Pill */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium text-ink bg-eggshell hover:bg-warm-taupe border border-[#e5e5e5] hover:border-violet-spark/40 transition-all flex items-center gap-1.5"
            title={isDark ? "Switch to Light Canvas" : "Switch to Dark Canvas"}
            aria-label="Toggle Canvas Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-ember-orange" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-violet-spark" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* GitHub Repo — Filled Pill Button with Spark Hover */}
          <a
            href="https://github.com/NTWKKM/ntwcoff"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white bg-ink hover:bg-gradient-to-r hover:from-violet-spark hover:to-ember-orange border border-[#e5e5e5] hover:border-transparent transition-all shadow-none"
            title="View on GitHub"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>

      </div>
    </header>
  );
};

