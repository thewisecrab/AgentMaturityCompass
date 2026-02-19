import { randomUUID } from 'node:crypto';

export interface FieldSpec { name: string; type: 'email' | 'phone' | 'date' | 'number' | 'url' | 'name'; }
export interface ExtractionResult { fields: Record<string, string[]>; raw: string; }
export interface Extraction { field: string; value: string; confidence: number; }

const PATTERNS: Record<string, RegExp> = {
  email: /[\w.-]+@[\w.-]+\.\w{2,}/g,
  phone: /(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
  date: /\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g,
  number: /\b\d+\.?\d*\b/g,
  url: /https?:\/\/[^\s<>"]+/g,
  name: /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b/g,
};

export function extractStructured(text: string, schema: FieldSpec[]): ExtractionResult {
  const fields: Record<string, string[]> = {};
  for (const spec of schema) {
    const pattern = PATTERNS[spec.type];
    if (pattern) {
      const regex = new RegExp(pattern.source, pattern.flags);
      fields[spec.name] = [...(text.match(regex) ?? [])];
    } else {
      fields[spec.name] = [];
    }
  }
  return { fields, raw: text };
}

export function extractFields(text: string, fields: string[]): Extraction[] {
  return fields.map(f => ({ field: f, value: '', confidence: 0.5 }));
}
