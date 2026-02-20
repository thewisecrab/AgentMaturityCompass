/**
 * documentAssembler.ts — Document assembly engine with sections,
 * TOC generation, status tracking, and multi-format output.
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ──────────────────────────────────────────────────── */

export interface DocSection {
  sectionId: string;
  assemblyId: string;
  title: string;
  seq: number;
  level: number;
  content: string;
  sourceType: 'manual' | 'template' | 'generated' | 'imported';
  wordCount: number;
  status: 'draft' | 'review' | 'approved';
}

export interface DocAssembly {
  id: string;
  name: string;
  sections: DocSection[];
  status: 'draft' | 'assembling' | 'review' | 'completed';
  format: 'markdown' | 'html' | 'json';
  toc: string[];
  createdAt: number;
  updatedAt: number;
}

/** Backward-compat shape from stubs.ts */
export interface AssembledDoc { content: string; sections: number; }

/* ── Class ───────────────────────────────────────────────────────── */

export class DocumentAssembler {
  private assemblies = new Map<string, DocAssembly>();
  private sectionIndex = new Map<string, DocSection>();

  createAssembly(name: string, format: DocAssembly['format'] = 'markdown'): DocAssembly {
    const assembly: DocAssembly = {
      id: randomUUID(), name, sections: [], status: 'draft',
      format, toc: [], createdAt: Date.now(), updatedAt: Date.now(),
    };
    this.assemblies.set(assembly.id, assembly);
    return assembly;
  }

  getAssembly(assemblyId: string): DocAssembly | undefined {
    return this.assemblies.get(assemblyId);
  }

  addSection(
    assemblyId: string, title: string, seq: number, level: number,
    content = '', sourceType: DocSection['sourceType'] = 'manual',
  ): DocSection {
    const assembly = this.assemblies.get(assemblyId);
    if (!assembly) throw new Error(`Assembly ${assemblyId} not found`);
    const section: DocSection = {
      sectionId: randomUUID(), assemblyId, title, seq, level, content,
      sourceType, wordCount: content.split(/\s+/).filter(Boolean).length,
      status: 'draft',
    };
    assembly.sections.push(section);
    assembly.sections.sort((a, b) => a.seq - b.seq);
    assembly.updatedAt = Date.now();
    this.sectionIndex.set(section.sectionId, section);
    return section;
  }

  updateSection(sectionId: string, content: string, status?: DocSection['status']): DocSection {
    const section = this.sectionIndex.get(sectionId);
    if (!section) throw new Error(`Section ${sectionId} not found`);
    section.content = content;
    section.wordCount = content.split(/\s+/).filter(Boolean).length;
    if (status) section.status = status;
    const assembly = this.assemblies.get(section.assemblyId);
    if (assembly) assembly.updatedAt = Date.now();
    return section;
  }

  generateToc(assemblyId: string): string[] {
    const assembly = this.assemblies.get(assemblyId);
    if (!assembly) throw new Error(`Assembly ${assemblyId} not found`);
    const toc = assembly.sections.map(s => {
      const indent = '  '.repeat(Math.max(0, s.level - 1));
      return `${indent}- ${s.title}`;
    });
    assembly.toc = toc;
    return toc;
  }

  assembleDocument(assemblyId: string): string {
    const assembly = this.assemblies.get(assemblyId);
    if (!assembly) throw new Error(`Assembly ${assemblyId} not found`);
    assembly.status = 'assembling';

    const toc = this.generateToc(assemblyId);
    let doc: string;

    if (assembly.format === 'html') {
      const tocHtml = `<nav><h2>Table of Contents</h2><ul>${toc.map(t => `<li>${t.replace(/^[\s-]+/, '')}</li>`).join('')}</ul></nav>`;
      const bodyHtml = assembly.sections.map(s => {
        const tag = `h${Math.min(s.level + 1, 6)}`;
        return `<section><${tag}>${s.title}</${tag}><p>${s.content}</p></section>`;
      }).join('\n');
      doc = `<article>\n<h1>${assembly.name}</h1>\n${tocHtml}\n${bodyHtml}\n</article>`;
    } else if (assembly.format === 'json') {
      doc = JSON.stringify({
        name: assembly.name, toc,
        sections: assembly.sections.map(s => ({ title: s.title, level: s.level, content: s.content })),
      }, null, 2);
    } else {
      const tocMd = `## Table of Contents\n\n${toc.join('\n')}`;
      const bodyMd = assembly.sections.map(s => {
        const heading = '#'.repeat(Math.min(s.level + 1, 6));
        return `${heading} ${s.title}\n\n${s.content}`;
      }).join('\n\n');
      doc = `# ${assembly.name}\n\n${tocMd}\n\n${bodyMd}`;
    }

    assembly.status = 'completed';
    assembly.updatedAt = Date.now();
    return doc;
  }

  listAssemblies(): DocAssembly[] {
    return [...this.assemblies.values()];
  }
}

/* ── Legacy compat ───────────────────────────────────────────────── */

export function assembleDocument(sections: string[]): AssembledDoc {
  return { content: sections.join('\n\n'), sections: sections.length };
}
