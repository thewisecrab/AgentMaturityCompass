/**
 * autodocGenerator.ts — Auto Documentation Generator.
 *
 * Generate README / examples / limitations documents from workflow step definitions
 * and test definitions. Supports Markdown, HTML, and reStructuredText output formats.
 * In-memory backed (no SQLite).
 *
 * Port of Python autodoc_generator.py
 */

import { randomUUID } from 'node:crypto';

/* ── Interfaces ────────────────────────────────────────────────────── */

export interface WorkflowStep {
  name: string;
  description: string;
  inputs: string[];
  outputs: string[];
  tools: string[];
}

export interface TestDefinition {
  name: string;
  description: string;
  inputs: Record<string, unknown>;
  expectedOutputs: Record<string, unknown>;
  testType: string; // unit | integration | e2e
}

export interface DocGenerateRequest {
  workflowName: string;
  workflowDescription: string;
  steps?: WorkflowStep[];
  tests?: TestDefinition[];
  version?: string;
  author?: string;
  tags?: string[];
  knownLimitations?: string[];
  includeExamples?: boolean;
  includeLimitations?: boolean;
  includeChangelog?: boolean;
  outputFormat?: string; // markdown | html | rst
  metadata?: Record<string, unknown>;
}

export interface GeneratedDoc {
  docId: string;
  workflowName: string;
  content: string;
  format: string;
  sections: string[];
  wordCount: number;
  generatedAt: string;
  metadata: Record<string, unknown>;
}

export interface DocGenerateResult {
  doc: GeneratedDoc;
  warnings: string[];
  durationMs: number;
}

/* ── HTML escape helper ────────────────────────────────────────────── */

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── AutoDocGenerator ──────────────────────────────────────────────── */

export class AutoDocGenerator {
  private history: GeneratedDoc[] = [];

  generate(request: DocGenerateRequest): DocGenerateResult {
    const t0 = performance.now();
    const warnings: string[] = [];

    const steps = request.steps ?? [];
    const tests = request.tests ?? [];
    const version = request.version ?? '1.0.0';
    const author = request.author ?? '';
    const tags = request.tags ?? [];
    const knownLimitations = request.knownLimitations ?? [];
    const includeExamples = request.includeExamples ?? true;
    const includeLimitations = request.includeLimitations ?? true;
    const includeChangelog = request.includeChangelog ?? false;

    let fmt = (request.outputFormat ?? 'markdown').toLowerCase();
    let content: string;
    let sections: string[];

    if (fmt === 'markdown') {
      ({ content, sections } = this.renderMarkdown(request.workflowName, request.workflowDescription, steps, tests, version, author, tags, knownLimitations, includeExamples, includeLimitations, includeChangelog));
    } else if (fmt === 'html') {
      ({ content, sections } = this.renderHtml(request.workflowName, request.workflowDescription, steps, tests, version, author, tags, knownLimitations, includeExamples, includeLimitations, includeChangelog));
    } else if (fmt === 'rst') {
      ({ content, sections } = this.renderRst(request.workflowName, request.workflowDescription, steps, tests, version, author, tags, knownLimitations, includeExamples, includeLimitations, includeChangelog));
    } else {
      warnings.push(`Unknown output_format '${fmt}'; falling back to markdown.`);
      fmt = 'markdown';
      ({ content, sections } = this.renderMarkdown(request.workflowName, request.workflowDescription, steps, tests, version, author, tags, knownLimitations, includeExamples, includeLimitations, includeChangelog));
    }

    if (steps.length === 0) {
      warnings.push('No workflow steps provided; steps table will be empty.');
    }
    if (tests.length === 0 && includeExamples) {
      warnings.push('includeExamples=true but no test definitions provided.');
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const docId = randomUUID();
    const generatedAt = new Date().toISOString();
    const metadata: Record<string, unknown> = { ...(request.metadata ?? {}) };
    if (!('version' in metadata)) metadata.version = version;
    if (!('author' in metadata)) metadata.author = author;
    if (!('tags' in metadata)) metadata.tags = tags;

    const doc: GeneratedDoc = {
      docId, workflowName: request.workflowName, content,
      format: fmt, sections, wordCount, generatedAt, metadata,
    };

    this.history.unshift(doc);
    if (this.history.length > 100) this.history.length = 100;

    const durationMs = Math.round(performance.now() - t0);
    return { doc, warnings, durationMs };
  }

  getHistory(limit = 20): GeneratedDoc[] {
    return this.history.slice(0, limit);
  }

  getDoc(docId: string): GeneratedDoc | undefined {
    return this.history.find(d => d.docId === docId);
  }

  /* ── Markdown renderer ──────────────────────────────────────────── */

  private renderMarkdown(
    name: string, desc: string, steps: WorkflowStep[], tests: TestDefinition[],
    version: string, author: string, tags: string[], limitations: string[],
    includeExamples: boolean, includeLimitations: boolean, includeChangelog: boolean,
  ): { content: string; sections: string[] } {
    const sections: string[] = [];
    const lines: string[] = [];
    const safeName = name.toLowerCase().replace(/\s+/g, '_');

    // Overview
    sections.push('Overview');
    lines.push(`# ${name}`, '');
    if (author) lines.push(`> **Author:** ${author} | **Version:** ${version}`);
    else lines.push(`> **Version:** ${version}`);
    if (tags.length) lines.push(`> **Tags:** ${tags.join(', ')}`);
    lines.push('', desc, '');

    // Quick Start
    sections.push('Quick Start');
    lines.push('## Quick Start', '', '```typescript',
      `import { ${safeName} } from 'amc/workflows';`, '',
      `const result = ${safeName}.run({});`,
      'console.log(result);', '```', '');

    // Steps table
    sections.push('Workflow Steps');
    lines.push('## Workflow Steps', '');
    if (steps.length) {
      lines.push('| Step | Description | Inputs | Outputs | Tools |');
      lines.push('|------|-------------|--------|---------|-------|');
      for (const step of steps) {
        const inputs = step.inputs.length ? step.inputs.join(', ') : '—';
        const outputs = step.outputs.length ? step.outputs.join(', ') : '—';
        const tools = step.tools.length ? step.tools.join(', ') : '—';
        const d = step.description.replace(/\|/g, '\\|');
        lines.push(`| **${step.name}** | ${d} | ${inputs} | ${outputs} | ${tools} |`);
      }
    } else {
      lines.push('*No steps defined.*');
    }
    lines.push('');

    // Examples
    if (includeExamples) {
      sections.push('Examples');
      lines.push('## Examples', '');
      if (tests.length) {
        for (const test of tests) {
          lines.push(`### ${test.name} (\`${test.testType}\`)`, '', test.description, '',
            '```typescript',
            `// ${test.name}`,
            `const inputs = ${JSON.stringify(test.inputs, null, 4)};`,
            `const expected = ${JSON.stringify(test.expectedOutputs, null, 4)};`,
            `const result = ${safeName}.run(inputs);`,
            'expect(result).toEqual(expected);',
            '```', '');
        }
      } else {
        lines.push('*No test definitions provided.*', '');
      }
    }

    // Limitations
    if (includeLimitations) {
      sections.push('Limitations');
      lines.push('## Limitations', '');
      if (limitations.length) {
        for (const lim of limitations) lines.push(`- ${lim}`);
      } else {
        lines.push('*No known limitations documented.*');
      }
      lines.push('');
      sections.push('Known Issues');
      lines.push('### Known Issues', '', 'Please file issues at the AMC platform tracker.', '');
    }

    // Changelog
    if (includeChangelog) {
      sections.push('Changelog');
      lines.push('## Changelog', '', `### ${version}`, '', '- Initial release.', '');
    }

    return { content: lines.join('\n'), sections };
  }

  /* ── HTML renderer ──────────────────────────────────────────────── */

  private renderHtml(
    name: string, desc: string, steps: WorkflowStep[], tests: TestDefinition[],
    version: string, author: string, tags: string[], limitations: string[],
    includeExamples: boolean, includeLimitations: boolean, includeChangelog: boolean,
  ): { content: string; sections: string[] } {
    const sections: string[] = [];
    const parts: string[] = [];
    const safeName = name.toLowerCase().replace(/\s+/g, '_');

    parts.push("<!DOCTYPE html>", "<html lang='en'>", "<head>",
      "  <meta charset='UTF-8'>", `  <title>${esc(name)}</title>`,
      "</head>", "<body>");

    // Overview
    sections.push('Overview');
    parts.push(`<h1>${esc(name)}</h1>`);
    const metaParts = [`Version: ${esc(version)}`];
    if (author) metaParts.unshift(`Author: ${esc(author)}`);
    if (tags.length) metaParts.push(`Tags: ${esc(tags.join(', '))}`);
    parts.push(`<p><em>${metaParts.join(' | ')}</em></p>`);
    parts.push(`<p>${esc(desc)}</p>`);

    // Quick Start
    sections.push('Quick Start');
    parts.push('<h2>Quick Start</h2>');
    const quickCode = `import { ${safeName} } from 'amc/workflows';\n\nconst result = ${safeName}.run({});\nconsole.log(result);`;
    parts.push(`<pre><code>${esc(quickCode)}</code></pre>`);

    // Steps table
    sections.push('Workflow Steps');
    parts.push('<h2>Workflow Steps</h2>');
    if (steps.length) {
      parts.push("<table border='1' cellpadding='6' cellspacing='0'>",
        "<thead><tr><th>Step</th><th>Description</th><th>Inputs</th><th>Outputs</th><th>Tools</th></tr></thead>",
        "<tbody>");
      for (const step of steps) {
        const inputs = step.inputs.length ? step.inputs.join(', ') : '—';
        const outputs = step.outputs.length ? step.outputs.join(', ') : '—';
        const tools = step.tools.length ? step.tools.join(', ') : '—';
        parts.push(`<tr><td><strong>${esc(step.name)}</strong></td><td>${esc(step.description)}</td><td>${esc(inputs)}</td><td>${esc(outputs)}</td><td>${esc(tools)}</td></tr>`);
      }
      parts.push("</tbody></table>");
    } else {
      parts.push("<p><em>No steps defined.</em></p>");
    }

    // Examples
    if (includeExamples) {
      sections.push('Examples');
      parts.push('<h2>Examples</h2>');
      if (tests.length) {
        for (const test of tests) {
          parts.push(`<h3>${esc(test.name)} (<code>${esc(test.testType)}</code>)</h3>`);
          parts.push(`<p>${esc(test.description)}</p>`);
          const code = `// ${test.name}\nconst inputs = ${JSON.stringify(test.inputs, null, 4)};\nconst expected = ${JSON.stringify(test.expectedOutputs, null, 4)};\nconst result = ${safeName}.run(inputs);\nexpect(result).toEqual(expected);`;
          parts.push(`<pre><code>${esc(code)}</code></pre>`);
        }
      } else {
        parts.push("<p><em>No test definitions provided.</em></p>");
      }
    }

    // Limitations
    if (includeLimitations) {
      sections.push('Limitations');
      parts.push('<h2>Limitations</h2>');
      if (limitations.length) {
        parts.push('<ul>');
        for (const lim of limitations) parts.push(`  <li>${esc(lim)}</li>`);
        parts.push('</ul>');
      } else {
        parts.push("<p><em>No known limitations documented.</em></p>");
      }
      sections.push('Known Issues');
      parts.push('<h3>Known Issues</h3>');
      parts.push('<p>Please file issues at the AMC platform tracker.</p>');
    }

    // Changelog
    if (includeChangelog) {
      sections.push('Changelog');
      parts.push('<h2>Changelog</h2>');
      parts.push(`<h3>${esc(version)}</h3>`);
      parts.push('<ul><li>Initial release.</li></ul>');
    }

    parts.push("</body>", "</html>");
    return { content: parts.join('\n'), sections };
  }

  /* ── reStructuredText renderer ──────────────────────────────────── */

  private renderRst(
    name: string, desc: string, steps: WorkflowStep[], tests: TestDefinition[],
    version: string, author: string, tags: string[], limitations: string[],
    includeExamples: boolean, includeLimitations: boolean, includeChangelog: boolean,
  ): { content: string; sections: string[] } {
    const sections: string[] = [];
    const lines: string[] = [];
    const safeName = name.toLowerCase().replace(/\s+/g, '_');

    const heading = (text: string, ch: string): string[] => [text, ch.repeat(text.length), ''];

    // Overview
    sections.push('Overview');
    lines.push(...heading(name, '='));
    const metaParts = [`:version: ${version}`];
    if (author) metaParts.unshift(`:author: ${author}`);
    if (tags.length) metaParts.push(`:tags: ${tags.join(', ')}`);
    lines.push(...metaParts, '', desc, '');

    // Quick Start
    sections.push('Quick Start');
    lines.push(...heading('Quick Start', '-'));
    lines.push('.. code-block:: typescript', '',
      `   import { ${safeName} } from 'amc/workflows';`, '',
      `   const result = ${safeName}.run({});`,
      '   console.log(result);', '');

    // Steps table
    sections.push('Workflow Steps');
    lines.push(...heading('Workflow Steps', '-'));
    if (steps.length) {
      lines.push('.. list-table::', '   :header-rows: 1', '   :widths: 20 30 15 15 20', '',
        '   * - Step', '     - Description', '     - Inputs', '     - Outputs', '     - Tools');
      for (const step of steps) {
        const inputs = step.inputs.length ? step.inputs.join(', ') : '—';
        const outputs = step.outputs.length ? step.outputs.join(', ') : '—';
        const tools = step.tools.length ? step.tools.join(', ') : '—';
        lines.push(`   * - **${step.name}**`, `     - ${step.description}`,
          `     - ${inputs}`, `     - ${outputs}`, `     - ${tools}`);
      }
      lines.push('');
    } else {
      lines.push('*No steps defined.*', '');
    }

    // Examples
    if (includeExamples) {
      sections.push('Examples');
      lines.push(...heading('Examples', '-'));
      if (tests.length) {
        for (const test of tests) {
          lines.push(...heading(`${test.name} (${test.testType})`, '~'));
          lines.push(test.description, '', '.. code-block:: typescript', '',
            `   // ${test.name}`);
          for (const line of JSON.stringify(test.inputs, null, 4).split('\n'))
            lines.push(`   ${line}`);
          lines.push('');
          for (const line of JSON.stringify(test.expectedOutputs, null, 4).split('\n'))
            lines.push(`   ${line}`);
          lines.push(`   const result = ${safeName}.run(inputs);`,
            '   expect(result).toEqual(expected);', '');
        }
      } else {
        lines.push('*No test definitions provided.*', '');
      }
    }

    // Limitations
    if (includeLimitations) {
      sections.push('Limitations');
      lines.push(...heading('Limitations', '-'));
      if (limitations.length) {
        for (const lim of limitations) lines.push(`- ${lim}`);
      } else {
        lines.push('*No known limitations documented.*');
      }
      lines.push('');
      sections.push('Known Issues');
      lines.push(...heading('Known Issues', '~'));
      lines.push('Please file issues at the AMC platform tracker.', '');
    }

    // Changelog
    if (includeChangelog) {
      sections.push('Changelog');
      lines.push(...heading('Changelog', '-'));
      lines.push(...heading(version, '~'));
      lines.push('- Initial release.', '');
    }

    return { content: lines.join('\n'), sections };
  }
}

/* ── Singleton ─────────────────────────────────────────────────────── */

let _generator: AutoDocGenerator | undefined;

export function getAutoDocGenerator(): AutoDocGenerator {
  if (!_generator) _generator = new AutoDocGenerator();
  return _generator;
}
