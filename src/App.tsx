import React, { useState, useEffect, useMemo, useRef } from 'react';
import rawPapers from './data/papers.json';
import rawTaxonomy from './data/taxonomy.json';
import { Paper, Taxonomy } from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { PaperCard } from './components/PaperCard';
import { PaperReader } from './components/PaperReader';
import { SearchX } from 'lucide-react';

const papersData = rawPapers as Paper[];
const taxonomyData = rawTaxonomy as Taxonomy;

export const App: React.FC = () => {
  // Theme state — Reads persisted preference safely, defaulting to system preference
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ntwcoff_theme');
      if (saved === 'dark' || saved === 'light') return saved === 'dark';
    } catch {
      // Ignore storage access errors in restricted frames
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  // Focus restoration ref for accessibility
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Sync theme with HTML root class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Listen to OS system color-scheme changes if not manually overridden by the user
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('ntwcoff_theme');
      } catch {
        // Ignore storage errors
      }
      if (!saved) {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ntwcoff_theme', next ? 'dark' : 'light');
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // Handle URL hash for deep linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#paper=')) {
        const slug = decodeURIComponent(hash.replace('#paper=', ''));
        const matched = papersData.find((p) => p.slug === slug);
        setSelectedPaper(matched || null);
      } else {
        setSelectedPaper(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectPaper = (paper: Paper) => {
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    setSelectedPaper(paper);
    window.location.hash = `#paper=${encodeURIComponent(paper.slug)}`;
  };

  const handleCloseReader = () => {
    setSelectedPaper(null);
    if (window.location.hash.startsWith('#paper=')) {
      history.replaceState('', document.title, window.location.pathname + window.location.search);
    }
    setTimeout(() => {
      lastActiveElementRef.current?.focus();
    }, 50);
  };

  // Filtered papers (pre-sorted latest publishedYear first by prep_content.py)
  const filteredPapers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return papersData.filter((paper) => {
      if (selectedCategory && paper.category !== selectedCategory) return false;
      if (selectedYear !== null && paper.publishedYear !== selectedYear) return false;
      if (selectedTag && !paper.tags.includes(selectedTag)) return false;
      if (q) {
        return (
          paper.title.toLowerCase().includes(q) ||
          paper.authors.toLowerCase().includes(q) ||
          paper.tags.some((t) => t.toLowerCase().includes(q)) ||
          paper.excerpt.toLowerCase().includes(q) ||
          paper.content.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedYear, selectedTag]);

  const categories = Object.keys(taxonomyData.categories || {});
  const availableYears = taxonomyData.years || [];

  return (
    <div className="min-h-screen flex flex-col bg-cream-paper text-charcoal transition-colors selection:bg-marker-orange/20 selection:text-charcoal">
      {/* Skip to Main Content Link for Keyboard / Screen Reader Accessibility */}
      <a
        href="#catalog"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-marker-orange focus:text-charcoal focus:rounded-[20px] focus:font-gelica focus:shadow-subtle focus:border-[1.5px] focus:border-charcoal focus:outline-none"
      >
        ข้ามไปยังเนื้อหาหลัก (Skip to main content)
      </a>

      {/* Global Navigation */}
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        totalPapers={papersData.length}
      />

      {/* Main Semantic Landmark */}
      <main id="main-content" className="flex-1 flex flex-col">
        {/* Minimal Editorial Hero Stage */}
        <HeroBanner
          totalPapers={papersData.length}
          totalCategories={categories.length}
        />

        {/* Catalog Stage: Warm Dew Drop Band with Subtle Archival Grain */}
        <section id="catalog" className="flex-1 w-full bg-dew-drop/60 bg-notebook-dots py-8 sm:py-10 transition-colors">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Consolidated Search, Category, Year & Keyword Toolbar */}
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              years={availableYears}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              tags={taxonomyData.tags}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              filteredCount={filteredPapers.length}
              totalCount={papersData.length}
            />

            {/* Paper Grid — Clean 2-Column Editorial Cards */}
            {filteredPapers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {filteredPapers.map((paper, index) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    isDeferred={index >= 6}
                    onSelect={handleSelectPaper}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search State */
              <div className="py-16 text-center max-w-md mx-auto">
                <div className="w-10 h-10 rounded-[8px] bg-cream-paper border border-charcoal/15 flex items-center justify-center mx-auto mb-3 text-charcoal/70">
                  <SearchX className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-gelica font-semibold lowercase text-cocoa-ink mb-1.5">
                  no matching monographs found
                </h3>
                <p className="text-[13px] text-charcoal/70 font-geist mb-5 leading-relaxed">
                  ลองค้นหาด้วยชื่อสารเคมี คำสำคัญอื่น หรือล้างตัวกรองเพื่อดูงานวิจัยทั้งหมด
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    setSelectedYear(null);
                    setSelectedTag(null);
                  }}
                  className="superr-pill-btn"
                >
                  รีเซ็ตตัวกรองทั้งหมด
                </button>
              </div>
            )}

          </div>
        </section>
      </main>

      {/* Monograph Reader Modal */}
      <PaperReader
        paper={selectedPaper}
        onClose={handleCloseReader}
        onTagClick={(tag) => setSelectedTag(tag)}
      />

      {/* Quiet Editorial Footer */}
      <footer className="w-full bg-cream-paper border-t border-charcoal/12 py-6 px-4 sm:px-6 lg:px-8 mt-auto transition-colors">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-charcoal/60 font-geist">
          <span className="font-gelica font-semibold text-[15px] lowercase text-cocoa-ink">
            ntwk coffee
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>Coffee Science Research Archive</span>
            <span aria-hidden="true">·</span>
            <a
              href="https://github.com/NTWKKM/ntwcoff"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cocoa-ink underline underline-offset-4 transition-colors"
            >
              GitHub Source
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
