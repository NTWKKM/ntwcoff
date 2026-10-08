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
    setSelectedPaper(paper);
    window.location.hash = `#paper=${encodeURIComponent(paper.slug)}`;
  };

  const handleCloseReader = () => {
    setSelectedPaper(null);
    if (window.location.hash.startsWith('#paper=')) {
      history.replaceState('', document.title, window.location.pathname + window.location.search);
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
    <div className="min-h-screen flex flex-col bg-gallery-white text-ink transition-colors selection:bg-pricing-blue/15 selection:text-ink">
      
      {/* Global & Local Navigation */}
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        totalPapers={papersData.length}
      />

      {/* Hero Visual Stage: Full-bleed #ffffff Gallery White */}
      <HeroBanner
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalPapers={papersData.length}
        totalCategories={categories.length}
        totalTags={taxonomyData.tags.length}
      />

      {/* Feature & Catalog Stage: Full-width Studio Mist (#f5f5f7) Band */}
      <section id="catalog" className="flex-1 w-full bg-studio-mist border-b border-hairline-silver py-12 sm:py-16 transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          
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

          {/* Paper Grid — 2-Column Oversized #ffffff Gallery Cards with 28px Radius & Shadowless Surface */}
          {filteredPapers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6">
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
              <div className="w-14 h-14 rounded-full bg-gallery-white border border-hairline-silver flex items-center justify-center mx-auto mb-4 text-slate">
                <SearchX className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.3px] text-ink font-sf-display mb-2">
                No matching research monographs found
              </h3>
              <p className="text-sm text-slate font-sf-text mb-6 leading-relaxed">
                Try searching for other chemical compounds, keywords, or reset filters to view all papers.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSelectedTag(null);
                }}
                className="px-4 py-2 rounded-full text-[12px] font-normal bg-pricing-blue hover:bg-[#0077ed] text-white transition-colors"
              >
                Reset all filters
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Paper Reader Modal */}
      <PaperReader
        paper={selectedPaper}
        onClose={handleCloseReader}
        onTagClick={(tag) => setSelectedTag(tag)}
      />

      {/* Studio Mist Clean Footer */}
      <footer className="bg-gallery-white py-8 px-4 sm:px-6 lg:px-8 text-[12px] text-slate font-sf-text">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink font-sf-display">
              NTWK Coffee
            </span>
            <span className="text-hairline-silver">•</span>
            <span>Scientific Research Notebook & Knowledge Portal</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[12px] text-slate">
            <span>Daily Sync: 12:00 ICT (05:00 UTC)</span>
            <span className="text-hairline-silver">•</span>
            <a
              href="https://github.com/NTWKKM/ntwcoff"
              target="_blank"
              rel="noopener noreferrer"
              className="text-apple-blue hover:underline transition-colors"
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
