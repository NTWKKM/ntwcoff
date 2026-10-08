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
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('ntwcoff_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
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
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-espresso-950 dark:text-slate-200 transition-colors">
      
      {/* Navigation Bar */}
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        totalPapers={papersData.length}
      />

      {/* Hero Banner with Search & Metrics */}
      <HeroBanner
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalPapers={papersData.length}
        totalCategories={categories.length}
        totalTags={taxonomyData.tags.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        
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

        {/* Paper Grid */}
        {filteredPapers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
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
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center mx-auto mb-4 text-stone-400 dark:text-slate-500">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1">
              ไม่พบบทวิเคราะห์ที่ตรงกับเงื่อนไข
            </h3>
            <p className="text-sm text-stone-500 dark:text-slate-400 mb-6">
              ลองค้นหาด้วยคำอื่น หรือกดล้างตัวกรองเพื่อดูบทวิเคราะห์ทั้งหมด
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedTag(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
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

      {/* Modern Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800/80 bg-stone-100/60 dark:bg-espresso-900/60 py-8 px-4 text-xs text-stone-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-stone-700 dark:text-slate-300">
              NTWK Coffee Science Portal
            </span>
            <span>— Google Drive Auto-Sync Edition</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>กำหนดเวลารัน: ทุกวัน 12:00 น. ICT (05:00 UTC)</span>
            <span>•</span>
            <a
              href="https://github.com/NTWKKM/ntwcoff"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
