export interface Paper {
  id: string;
  slug: string;
  title: string;
  documentHeader: string;
  date: string;
  category: string;
  authors: string;
  institution: string;
  journal: string;
  links: string;
  excerpt: string;
  tags: string[];
  wordCount: number;
  readingTimeMinutes: number;
  content: string;
}

export interface TagInfo {
  name: string;
  count: number;
}

export interface Taxonomy {
  lastUpdated: string;
  totalPapers: number;
  categories: Record<string, number>;
  tags: TagInfo[];
}
