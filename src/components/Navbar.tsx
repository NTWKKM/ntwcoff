import React from 'react';
import { Github, Clock, Sun, Moon, BookOpen } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  totalPapers: number;
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, totalPapers }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-cream-paper/95 backdrop-blur-md border-b-[1.5px] border-charcoal/20 transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand: Schoolyard Notebook Brand (lowercase Cocoa Ink + Marker Orange Script) */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2.5 text-cocoa-ink hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-[8px] bg-dew-drop border-[1.5px] border-charcoal flex items-center justify-center text-charcoal shadow-subtle">
              <BookOpen className="w-4 h-4 text-cocoa-ink" />
            </div>
            <span className="font-gelica font-semibold text-[20px] lowercase text-cocoa-ink tracking-normal">
              ntwk coffee
            </span>
          </a>
          <span className="hidden sm:inline-block font-gelica text-[14px] text-marker-orange lowercase pl-1">
            ~ science notebook
          </span>
        </div>

        {/* Center Navigation Links (Geist & Gelica) */}
        <nav className="hidden md:flex items-center gap-6 text-[14px] text-charcoal font-geist">
          <a href="#catalog" className="hover:text-marker-orange transition-colors">
            {totalPapers} monographs
          </a>
          <a href="#taxonomy" className="hover:text-marker-orange transition-colors">
            taxonomy
          </a>
          <span className="text-charcoal/60 text-[13px]">
            daily sync 12:00 ict
          </span>
        </nav>

        {/* Right Controls: Superr Pill Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Sync schedule badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-[20px] bg-dew-drop text-[12px] text-charcoal border-[1.5px] border-charcoal/30">
            <Clock className="w-3.5 h-3.5 text-charcoal" />
            <span>12:00 ICT</span>
          </div>

          {/* Theme Switcher — Superr Pill */}
          <button
            onClick={toggleTheme}
            aria-pressed={isDark}
            className="px-3 py-1.5 rounded-[20px] text-[13px] text-charcoal bg-cream-paper hover:bg-dew-drop border-[1.5px] border-charcoal shadow-subtle transition-all flex items-center gap-1.5"
            title={isDark ? "Switch to Light Notebook" : "Switch to Dark Notebook"}
            aria-label="Toggle Canvas Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-charcoal" />
                <span className="hidden sm:inline font-gelica text-[13px]">light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-charcoal" />
                <span className="hidden sm:inline font-gelica text-[13px]">dark</span>
              </>
            )}
          </button>

          {/* GitHub Repo — Superr Pill Action Button (Cream fill, 1.5px Charcoal border, 20px radius) */}
          <a
            href="https://github.com/NTWKKM/ntwcoff"
            target="_blank"
            rel="noopener noreferrer"
            className="superr-pill-btn !py-1.5 !px-3.5 !text-[13px]"
            title="View on GitHub"
          >
            <Github className="w-3.5 h-3.5 text-charcoal" />
            <span>github</span>
          </a>
        </div>

      </div>
    </header>
  );
};
