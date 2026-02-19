import { randomUUID } from 'node:crypto';

export interface DocRecord { id: string; content: string; format: string; chunks: Chunk[]; }
export interface Chunk { id: string; text: string; index: number; }
export interface IngestedDoc { docId: string; source: string; chunks: number; }

export class DocumentIngester {
  private docs = new Map<string, DocRecord>();
  private invertedIndex = new Map<string, Set<string>>();

  ingestDocument(content: string, format: 'markdown' | 'text' | 'html'): DocRecord {
    let cleaned = content;
    if (format === 'html') cleaned = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const doc: DocRecord = { id: randomUUID(), content: cleaned, format, chunks: [] };
    this.docs.set(doc.id, doc);
    return doc;
  }

  extractChunks(docId: string, chunkSize = 500): Chunk[] {
    const doc = this.docs.get(docId);
    if (!doc) throw new Error('Doc not found');
    const chunks: Chunk[] = [];
    for (let i = 0; i < doc.content.length; i += chunkSize) {
      chunks.push({ id: randomUUID(), text: doc.content.slice(i, i + chunkSize), index: chunks.length });
    }
    doc.chunks = chunks;
    return chunks;
  }

  indexContent(chunks: Chunk[]): number {
    let indexed = 0;
    for (const chunk of chunks) {
      const words = chunk.text.toLowerCase().split(/\W+/).filter(Boolean);
      for (const w of words) {
        if (!this.invertedIndex.has(w)) this.invertedIndex.set(w, new Set());
        this.invertedIndex.get(w)!.add(chunk.id);
      }
      indexed++;
    }
    return indexed;
  }

  search(query: string): Chunk[] {
    const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
    const scores = new Map<string, number>();
    for (const t of terms) {
      const ids = this.invertedIndex.get(t);
      if (ids) for (const id of ids) scores.set(id, (scores.get(id) ?? 0) + 1);
    }
    const allChunks = [...this.docs.values()].flatMap(d => d.chunks);
    return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => allChunks.find(c => c.id === id)!).filter(Boolean);
  }
}

export function ingestDocument(source: string, content: string): IngestedDoc {
  return { docId: randomUUID(), source, chunks: Math.ceil(content.length / 500) };
}
