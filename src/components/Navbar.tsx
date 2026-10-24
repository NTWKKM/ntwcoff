import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  totalPapers: number;
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, totalPapers }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-cream-paper/90 backdrop-blur-md border-b border-charcoal/15 transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#"
          className="font-gelica font-semibold text-[19px] lowercase text-cocoa-ink hover:text-marker-orange transition-colors whitespace-nowrap shrink-0"
        >
          ntwk coffee
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-charcoal/75 font-geist">
          <a
            href="#catalog"
            className="hover:text-cocoa-ink hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 tabular-nums"
          >
            Monographs ({totalPapers})
          </a>
          <a
            href="#taxonomy"
            className="hover:text-cocoa-ink hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Disciplines
          </a>
          <a
            href="https://github.com/NTWKKM/ntwcoff"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cocoa-ink hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            GitHub
          </a>
        </nav>

        {/* Zone 3: Primary Theme Action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={toggleTheme}
            aria-pressed={isDark}
            className="superr-pill-btn"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-charcoal" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-charcoal" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
