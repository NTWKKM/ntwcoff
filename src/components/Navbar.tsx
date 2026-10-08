import React from 'react';
import { Github, Clock, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  totalPapers: number;
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, totalPapers }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-gallery-white/85 backdrop-blur-md border-b border-hairline-silver transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        
        {/* Brand: Product Local Bar Style (SF Pro Display 19px/600) */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 text-ink hover:opacity-85 transition-opacity"
          >
            <span className="font-semibold text-[19px] tracking-[0.228px] text-ink font-sf-display">
              NTWK Coffee
            </span>
          </a>
          <span className="hidden sm:inline-block text-[12px] font-normal text-slate tracking-[-0.12px]">
            Science Notebook
          </span>
        </div>

        {/* Center Navigation Links (SF Pro Text 12px/400) */}
        <nav className="hidden md:flex items-center gap-6 text-[12px] font-normal text-slate tracking-[-0.12px]">
          <span className="text-ink font-medium">
            Overview
          </span>
          <a href="#catalog" className="hover:text-apple-blue transition-colors">
            {totalPapers} Monographs
          </a>
          <a href="#taxonomy" className="hover:text-apple-blue transition-colors">
            Taxonomy
          </a>
          <span className="text-slate/70">
            Sync: 12:00 ICT
          </span>
        </nav>

        {/* Right Controls: Outlined Explore Pill & Pricing Blue Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Sync schedule badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-studio-mist text-[12px] text-slate border border-hairline-silver">
            <Clock className="w-3 h-3 text-slate" />
            <span className="tracking-[-0.12px]">Daily 12:00 ICT</span>
          </div>

          {/* Theme Switcher — Outlined Explore Pill */}
          <button
            onClick={toggleTheme}
            className="px-2.5 py-1 rounded-full text-[12px] text-ink bg-transparent hover:bg-studio-mist border border-steel hover:border-ink transition-colors flex items-center gap-1.5"
            title={isDark ? "Switch to Light Gallery" : "Switch to Dark Gallery"}
            aria-label="Toggle Canvas Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3 h-3 text-ink" />
                <span className="hidden sm:inline tracking-[-0.12px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-ink" />
                <span className="hidden sm:inline tracking-[-0.12px]">Dark</span>
              </>
            )}
          </button>

          {/* GitHub Repo — Pricing Blue Pill (#0071e3 filled conversion control) */}
          <a
            href="https://github.com/NTWKKM/ntwcoff"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12px] font-normal text-white bg-pricing-blue hover:bg-[#0077ed] active:bg-[#0062c4] transition-colors tracking-[-0.12px]"
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


