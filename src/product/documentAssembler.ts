import { randomUUID } from 'node:crypto';

export interface Section { title: string; content: string; required?: boolean; }
export interface AssembledDoc { id: string; content: string; sections: number; valid: boolean; }

export function assembleDocument(sections: Section[] | string[], template?: string): AssembledDoc {
  if (sections.length === 0) return { id: randomUUID(), content: '', sections: 0, valid: false };
  let content: string;
  if (typeof sections[0] === 'string') {
    content = (sections as string[]).join('\n\n');
  } else {
    const secs = sections as Section[];
    if (template === 'html') {
      content = secs.map(s => `<section><h2>${s.title}</h2><p>${s.content}</p></section>`).join('\n');
    } else {
      content = secs.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n');
    }
  }
  return { id: randomUUID(), content, sections: sections.length, valid: true };
}

export function validateDocument(doc: AssembledDoc, requiredSections?: string[]): { valid: boolean; missing: string[] } {
  if (!requiredSections) return { valid: doc.valid, missing: [] };
  const missing = requiredSections.filter(s => !doc.content.includes(s));
  return { valid: missing.length === 0, missing };
}

export function exportDocument(doc: AssembledDoc, format: 'markdown' | 'text' | 'html'): string {
  if (format === 'html') return `<html><body>${doc.content.replace(/## (.+)/g, '<h2>$1</h2>').replace(/\n/g, '<br>')}</body></html>`;
  if (format === 'text') return doc.content.replace(/##\s*/g, '').replace(/\*\*/g, '');
  return doc.content;
}
