import React, { useState, useEffect, useMemo } from 'react';
import rawPapers from './data/papers.json';
import rawTaxonomy from './data/taxonomy.json';
import { Paper, Taxonomy } from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { PaperCard } from './components/PaperCard';
import { PaperReader } from './components/PaperReader';
import { Coffee, SearchX, Sparkles, RefreshCw } from 'lucide-react';

const papersData = rawPapers as Paper[];
const taxonomyData = rawTaxonomy as Taxonomy;

export const App: React.FC = () => {
  // Theme state — Defaults to Light Eggshell per ElevenLabs design system
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('ntwcoff_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('ntwcoff_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('ntwcoff_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Handle URL hash for deep linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#paper=')) {
        const slug = decodeURIComponent(hash.replace('#paper=', ''));
        const matched = papersData.find((p) => p.slug === slug);
        if (matched) setSelectedPaper(matched);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectPaper = (paper: Paper) => {
    setSelectedPaper(paper);
    window.location.hash = `#paper=${encodeURIComponent(paper.slug)}`;
  };

  const handleCloseReader = () => {
    setSelectedPaper(null);
    if (window.location.hash.startsWith('#paper=')) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  };

  // Filtered papers calculation
  const filteredPapers = useMemo(() => {
    return papersData.filter((paper) => {
      // Category filter
      if (selectedCategory && paper.category !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (selectedTag && !paper.tags.includes(selectedTag)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = paper.title.toLowerCase().includes(q);
        const inAuthors = paper.authors.toLowerCase().includes(q);
        const inTags = paper.tags.some((t) => t.toLowerCase().includes(q));
        const inExcerpt = paper.excerpt.toLowerCase().includes(q);
        const inContent = paper.content.toLowerCase().includes(q);
        return inTitle || inAuthors || inTags || inExcerpt || inContent;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedTag]);

  const categories = Object.keys(taxonomyData.categories || {});

  return (
    <div className="min-h-screen flex flex-col bg-eggshell text-ink transition-colors selection:bg-stone selection:text-ink">
      
      {/* Top Nav Bar */}
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        totalPapers={papersData.length}
      />

      {/* Hero Banner with Whisper Headline & Audio Sphere */}
      <HeroBanner
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalPapers={papersData.length}
        totalCategories={categories.length}
        totalTags={taxonomyData.tags.length}
      />

      {/* Main Content Area — Single Max-Width 1280px Centered Column */}
      <main id="catalog" className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Category & Tag Filter Bar */}
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          tags={taxonomyData.tags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          filteredCount={filteredPapers.length}
          totalCount={papersData.length}
        />

        {/* Paper Grid — 2-Column Responsive Feature Cards with 20px Radius */}
        {filteredPapers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-4">
            {filteredPapers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onSelect={handleSelectPaper}
                onTagClick={(tag) => setSelectedTag(tag)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-warm-taupe border border-stone flex items-center justify-center mx-auto mb-4 text-smoke">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-light tracking-whisper text-ink font-waldenburg mb-2">
              ไม่พบบทวิเคราะห์ที่ตรงกับเงื่อนไข
            </h3>
            <p className="text-sm text-smoke font-sans mb-6 leading-relaxed">
              ลองค้นหาด้วยคำอื่น หรือกดล้างตัวกรองเพื่อดูบทวิเคราะห์ทั้งหมด
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedTag(null);
              }}
              className="px-4 py-2 rounded-full text-xs font-medium bg-ink hover:bg-graphite text-white border border-[#e5e5e5] transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}

      </main>

      {/* Paper Reader Modal */}
      <PaperReader
        paper={selectedPaper}
        onClose={handleCloseReader}
        onTagClick={(tag) => setSelectedTag(tag)}
      />

      {/* Compact Single Band Footer — ElevenLabs Bauhaus Reference */}
      <footer className="border-t border-stone bg-warm-taupe py-6 px-4 sm:px-6 lg:px-8 text-xs text-smoke font-sans">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink font-sans">
              NTWK Coffee
            </span>
            <span className="text-ash">•</span>
            <span>Scientific Research Notebook & Knowledge Portal</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[12px] font-mono text-ash">
            <span>Daily Sync: 12:00 ICT (05:00 UTC)</span>
            <span>•</span>
            <a
              href="https://github.com/NTWKKM/ntwcoff"
              target="_blank"
              rel="noopener noreferrer"
              className="text-graphite hover:text-ink underline decoration-stone hover:decoration-ink transition-colors"
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
