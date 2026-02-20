/**
 * chunkingPipeline.ts — Structure-aware document chunking for RAG ingestion.
 *
 * Splits documents by headings / tables / bullet blocks with configurable overlap,
 * generates per-chunk extractive summaries, and produces a manifest.
 * Pure TypeScript, no SQLite required.
 *
 * Port of Python chunking_pipeline.py
 */

import { randomUUID } from 'node:crypto';

/* ── Enums ─────────────────────────────────────────────────────────── */

export type ChunkStrategy = 'heading' | 'paragraph' | 'sentence' | 'fixed' | 'hybrid';
export type ChunkType = 'heading' | 'paragraph' | 'table' | 'list' | 'code' | 'sentence' | 'generic';

/* ── Interfaces ────────────────────────────────────────────────────── */

export interface DocChunk {
  chunkId: string;
  docId: string;
  chunkIndex: number;
  chunkType: ChunkType;
  headingPath: string[];
  content: string;
  summary: string;
  tokenEstimate: number;
  startChar: number;
  endChar: number;
  metadata: Record<string, unknown>;
}

export interface ChunkRequest {
  docId: string;
  content: string;
  strategy?: ChunkStrategy;
  maxChunkTokens?: number;
  overlapTokens?: number;
  minChunkTokens?: number;
  generateSummaries?: boolean;
  maxSummaryLength?: number;
  metadata?: Record<string, unknown>;
}

export interface ChunkManifest {
  docId: string;
  strategy: string;
  totalChunks: number;
  totalTokens: number;
  avgChunkTokens: number;
  chunks: DocChunk[];
  metadata: Record<string, unknown>;
}

/* ── Regex helpers ─────────────────────────────────────────────────── */

const HEADING_RE = /^(#{1,6})\s+(.+)$/gm;
const TABLE_RE = /^\|.+\|$/m;
const LIST_RE = /^(\s*[-*+]|\s*\d+\.)\s+/m;
const CODE_FENCE_RE = /```[\s\S]*?```/m;
const SENTENCE_END_RE = /(?<=[.!?])\s+/;

function estimateTokens(text: string): number {
  return Math.max(1, Math.floor(text.length / 4));
}

function buildSummary(content: string, maxLen: number): string {
  let clean = content.replace(/[#*_`~>|]/g, '');
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  clean = clean.replace(/\s+/g, ' ').trim();
  const sentences = clean.split(SENTENCE_END_RE);
  let summary = sentences.slice(0, 2).join(' ').trim();
  if (summary.length > maxLen) summary = summary.slice(0, maxLen).trimEnd() + '…';
  return summary || clean.slice(0, maxLen);
}

function detectChunkType(text: string): ChunkType {
  if (TABLE_RE.test(text)) return 'table';
  if (CODE_FENCE_RE.test(text)) return 'code';
  if (LIST_RE.test(text)) return 'list';
  if (/^#{1,6}\s+/.test(text.trim())) return 'heading';
  return 'paragraph';
}

function makeChunkId(docId: string, idx: number): string {
  return `${docId}::${String(idx).padStart(4, '0')}`;
}

/* ── Splitters ─────────────────────────────────────────────────────── */

interface HeadingSection {
  path: string[];
  body: string;
  start: number;
  end: number;
}

function splitByHeading(text: string): HeadingSection[] {
  const matches: { level: number; title: string; index: number; end: number }[] = [];
  const re = /^(#{1,6})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({ level: m[1]!.length, title: m[2]!.trim(), index: m.index, end: re.lastIndex });
  }
  if (matches.length === 0) return [{ path: [], body: text, start: 0, end: text.length }];

  const sections: HeadingSection[] = [];
  const headingStack: Array<{ level: number; title: string }> = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!;
    while (headingStack.length > 0 && headingStack[headingStack.length - 1]!.level >= match.level) {
      headingStack.pop();
    }
    headingStack.push({ level: match.level, title: match.title });
    const start = match.end;
    const end = i + 1 < matches.length ? matches[i + 1]!.index : text.length;
    const body = text.slice(start, end).trim();
    const path = headingStack.map(h => h.title);
    sections.push({ path, body, start, end });
  }

  // Prepend content before first heading
  if (matches[0]!.index > 0) {
    const preamble = text.slice(0, matches[0]!.index).trim();
    if (preamble) sections.unshift({ path: [], body: preamble, start: 0, end: matches[0]!.index });
  }

  return sections;
}

function splitByParagraph(text: string): string[] {
  return text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
}

function splitBySentence(text: string): string[] {
  return text.split(SENTENCE_END_RE).map(s => s.trim()).filter(Boolean);
}

function fixedWindows(text: string, maxTokens: number, overlapTokens: number): string[] {
  const words = text.split(/\s+/);
  const wpc = Math.max(1, Math.floor(maxTokens / 1.3));
  const overlapW = Math.max(0, Math.min(Math.floor(overlapTokens / 1.3), wpc - 1));
  const step = Math.max(1, wpc - overlapW);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + wpc).join(' '));
  }
  return chunks;
}

/* ── ChunkingPipeline ──────────────────────────────────────────────── */

export class ChunkingPipeline {
  chunk(request: ChunkRequest): ChunkManifest {
    const content = request.content;
    const strategy: ChunkStrategy = request.strategy ?? 'hybrid';
    const maxChunkTokens = request.maxChunkTokens ?? 512;
    const overlapTokens = request.overlapTokens ?? 64;
    const minChunkTokens = request.minChunkTokens ?? 5;
    const genSummaries = request.generateSummaries ?? true;
    const maxSummaryLen = request.maxSummaryLength ?? 150;
    const metadata = request.metadata ?? {};
    let chunks: DocChunk[] = [];

    const materialize = (text: string, headingPath: string[], startChar: number, baseIndex: number, depth = 0): DocChunk[] => {
      text = text.trim();
      if (!text) return [];
      const tokens = estimateTokens(text);

      if (tokens > maxChunkTokens && depth < 4) {
        let subs = splitByParagraph(text);
        if (subs.length <= 1) subs = splitBySentence(text);
        if (subs.length <= 1) subs = fixedWindows(text, maxChunkTokens, overlapTokens);
        if (subs.length > 1) {
          const result: DocChunk[] = [];
          let offset = 0;
          for (const sub of subs) {
            const pos = text.indexOf(sub, offset);
            result.push(...materialize(sub, headingPath, startChar + Math.max(0, pos), baseIndex + result.length, depth + 1));
            offset = Math.max(0, pos + sub.length);
          }
          return result;
        }
      }

      const summary = genSummaries ? buildSummary(text, maxSummaryLen) : '';
      return [{
        chunkId: makeChunkId(request.docId, baseIndex),
        docId: request.docId,
        chunkIndex: baseIndex,
        chunkType: detectChunkType(text),
        headingPath,
        content: text,
        summary,
        tokenEstimate: tokens,
        startChar,
        endChar: startChar + text.length,
        metadata,
      }];
    };

    if (strategy === 'heading') {
      for (const sec of splitByHeading(content)) {
        chunks.push(...materialize(sec.body, sec.path, sec.start, chunks.length));
      }
    } else if (strategy === 'paragraph') {
      let offset = 0;
      for (const para of splitByParagraph(content)) {
        const pos = content.indexOf(para, offset);
        chunks.push(...materialize(para, [], pos, chunks.length));
        offset = pos + para.length;
      }
    } else if (strategy === 'sentence') {
      let offset = 0;
      for (const sent of splitBySentence(content)) {
        const pos = content.indexOf(sent, offset);
        chunks.push(...materialize(sent, [], pos, chunks.length));
        offset = pos + sent.length;
      }
    } else if (strategy === 'fixed') {
      for (const window of fixedWindows(content, maxChunkTokens, overlapTokens)) {
        const pos = content.indexOf(window.slice(0, 20));
        chunks.push(...materialize(window, [], Math.max(0, pos), chunks.length));
      }
    } else {
      // hybrid: headings first, then paragraphs within large sections
      for (const sec of splitByHeading(content)) {
        if (estimateTokens(sec.body) <= maxChunkTokens) {
          chunks.push(...materialize(sec.body, sec.path, sec.start, chunks.length));
        } else {
          for (const para of splitByParagraph(sec.body)) {
            const pos = sec.body.indexOf(para);
            chunks.push(...materialize(para, sec.path, sec.start + pos, chunks.length));
          }
        }
      }
    }

    // Filter tiny chunks
    chunks = chunks.filter(c => c.tokenEstimate >= minChunkTokens);

    // Re-index
    for (let i = 0; i < chunks.length; i++) {
      chunks[i]!.chunkIndex = i;
      chunks[i]!.chunkId = makeChunkId(request.docId, i);
    }

    const totalTokens = chunks.reduce((s, c) => s + c.tokenEstimate, 0);
    const avgChunkTokens = chunks.length > 0 ? Math.round((totalTokens / chunks.length) * 100) / 100 : 0;

    return {
      docId: request.docId,
      strategy,
      totalChunks: chunks.length,
      totalTokens,
      avgChunkTokens,
      chunks,
      metadata,
    };
  }
}

/* ── Singleton ─────────────────────────────────────────────────────── */

let _pipeline: ChunkingPipeline | undefined;

export function getChunkingPipeline(): ChunkingPipeline {
  if (!_pipeline) _pipeline = new ChunkingPipeline();
  return _pipeline;
}
