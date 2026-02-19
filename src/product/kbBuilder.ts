import { randomUUID } from 'node:crypto';

export interface Article { id: string; title: string; content: string; tags: string[]; }
export interface KnowledgeBase { kbId: string; name: string; entryCount: number; }

export class KnowledgeBaseBuilder {
  private articles = new Map<string, Article>();
  private index = new Map<string, Map<string, number>>(); // word -> articleId -> count

  addArticle(title: string, content: string, tags: string[]): Article {
    const article: Article = { id: randomUUID(), title, content, tags };
    this.articles.set(article.id, article);
    const words = `${title} ${content} ${tags.join(' ')}`.toLowerCase().split(/\W+/).filter(Boolean);
    for (const w of words) {
      if (!this.index.has(w)) this.index.set(w, new Map());
      const m = this.index.get(w)!;
      m.set(article.id, (m.get(article.id) ?? 0) + 1);
    }
    return article;
  }

  search(query: string): Article[] {
    const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
    const scores = new Map<string, number>();
    const totalDocs = this.articles.size || 1;
    for (const t of terms) {
      const postings = this.index.get(t);
      if (!postings) continue;
      const idf = Math.log(totalDocs / postings.size);
      for (const [id, tf] of postings) scores.set(id, (scores.get(id) ?? 0) + tf * idf);
    }
    return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => this.articles.get(id)!);
  }

  getArticle(id: string): Article | undefined { return this.articles.get(id); }

  summarizeKb(): { articleCount: number; uniqueWords: number; topTags: string[] } {
    const tagCount = new Map<string, number>();
    for (const a of this.articles.values()) for (const t of a.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
    const topTags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
    return { articleCount: this.articles.size, uniqueWords: this.index.size, topTags };
  }
}

export function buildKnowledgeBase(name: string, entries: string[]): KnowledgeBase {
  return { kbId: randomUUID(), name, entryCount: entries.length };
}
