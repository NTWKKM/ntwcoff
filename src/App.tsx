import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import rawPapers from './data/papers.json';
import rawTaxonomy from './data/taxonomy.json';
import { Paper, Taxonomy } from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { PaperCard } from './components/PaperCard';
import { SearchX, Sparkles } from 'lucide-react';

// Code-split PaperReader & KaTeX engine to drastically reduce initial payload
const loadPaperReader = () =>
  import('./components/PaperReader').then((m) => ({ default: m.PaperReader }));

interface PaperReaderErrorBoundaryProps {
  children: React.ReactNode;
  onRetry: () => void;
}

interface PaperReaderErrorBoundaryState {
  hasError: boolean;
}

class PaperReaderErrorBoundary extends React.Component<
  PaperReaderErrorBoundaryProps,
  PaperReaderErrorBoundaryState
> {
  constructor(props: PaperReaderErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Failed to load PaperReader chunk:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <aside
          role="alert"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md bg-cream-paper text-charcoal border-[1.5px] border-charcoal p-4 rounded-[12px] shadow-card flex items-center justify-between gap-4 motion-safe:animate-fadeIn"
        >
          <div className="text-[13px]">
            <p className="font-semibold text-charcoal">ไม่สามารถโหลดเนื้อหางานวิจัยได้</p>
            <p className="text-charcoal/70">โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</p>
          </div>
          <button
            onClick={this.handleRetry}
            className="superr-pill-btn !py-1.5 !px-3 !text-[12px] shrink-0"
          >
            ลองใหม่อีกครั้ง
          </button>
        </aside>
      );
    }
    return this.props.children;
  }
}

const papersData = rawPapers as Paper[];
const taxonomyData = rawTaxonomy as Taxonomy;

export const App: React.FC = () => {
  // Theme state — Reads persisted preference, defaulting to system preference
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('ntwcoff_theme');
    if (saved) return saved === 'dark';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  // Lazy component state & key to force reload/remount of PaperReader on error retry
  const [PaperReaderComponent, setPaperReaderComponent] = useState(() =>
    React.lazy(loadPaperReader)
  );
  const [readerRetryKey, setReaderRetryKey] = useState(0);

  const handleRetryReader = () => {
    setPaperReaderComponent(() => React.lazy(loadPaperReader));
    setReaderRetryKey((prev) => prev + 1);
  };

  // Focus restoration ref for accessibility
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Sync theme with HTML root class and system media changes
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

  // Listen to OS system color-scheme changes if not manually overridden in this session
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('ntwcoff_theme');
      } catch {
        // Storage access may be restricted (e.g. private browsing); treat as no saved preference
      }
      if (!saved) {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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
    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    setSelectedPaper(paper);
    window.location.hash = `#paper=${encodeURIComponent(paper.slug)}`;
  };

  const handleCloseReader = () => {
    setSelectedPaper(null);
    if (window.location.hash.startsWith('#paper=')) {
      history.replaceState('', document.title, window.location.pathname + window.location.search);
    }
    // Restore focus back to the triggering element
    setTimeout(() => {
      lastActiveElementRef.current?.focus();
    }, 50);
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
        {/* Hero Visual Stage */}
        <HeroBanner
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalPapers={papersData.length}
          totalCategories={categories.length}
          totalTags={taxonomyData.tags.length}
        />

        {/* Feature & Catalog Stage: Full-width Dew Drop (#f7efe9) Warm Band with Notebook Dots */}
        <section id="catalog" className="flex-1 w-full bg-dew-drop bg-notebook-dots border-b-[1.5px] border-charcoal/20 py-10 sm:py-14 transition-colors">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            
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

            {/* Paper Grid — 2-Column Warm Notebook Cards with 12px Radius & Defer Rendering */}
            {filteredPapers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 mt-4">
                {filteredPapers.map((paper, index) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    isDeferred={index >= 4}
                    onSelect={handleSelectPaper}
                    onTagClick={(tag) => setSelectedTag(tag)}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search State */
              <div className="py-20 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-[12px] bg-cream-paper border-[1.5px] border-charcoal flex items-center justify-center mx-auto mb-4 text-charcoal shadow-subtle">
                  <SearchX className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-gelica font-semibold lowercase text-cocoa-ink mb-2">
                  no matching research monographs found
                </h3>
                <p className="text-sm text-charcoal/80 font-geist mb-6 leading-relaxed">
                  ลองค้นหาด้วยชื่อสารเคมี คำสำคัญ หรือรีเซ็ตตัวกรองเพื่อดูงานวิจัยทั้งหมด
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    setSelectedTag(null);
                  }}
                  className="superr-pill-btn !py-2 !px-5"
                >
                  รีเซ็ตตัวกรองทั้งหมด
                </button>
              </div>
            )}

          </div>
        </section>
      </main>

      {/* Lazy-loaded Paper Reader Modal wrapped in Error Boundary and Suspense */}
      <PaperReaderErrorBoundary key={readerRetryKey} onRetry={handleRetryReader}>
        <Suspense fallback={null}>
          <PaperReaderComponent
            paper={selectedPaper}
            onClose={handleCloseReader}
            onTagClick={(tag) => setSelectedTag(tag)}
          />
        </Suspense>
      </PaperReaderErrorBoundary>

      {/* Superr Footer Brand Band: Marker Orange (#ff6f1e) with 56px Top Border Radius */}
      <footer className="w-full bg-marker-orange text-charcoal rounded-t-[56px] pt-10 pb-8 px-6 sm:px-10 mt-auto transition-colors shadow-card">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center text-center sm:text-left">
            <span className="font-gelica font-semibold text-[20px] lowercase text-charcoal">
              ntwk coffee
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] font-gelica text-charcoal">
            <span>daily sync 12:00 ict (05:00 utc)</span>
            <span className="text-charcoal/40">•</span>
            <a
              href="https://github.com/NTWKKM/ntwcoff"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-charcoal/40 hover:decoration-charcoal transition-colors"
            >
              github source
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
