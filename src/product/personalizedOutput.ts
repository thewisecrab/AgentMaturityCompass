/**
 * personalizedOutput.ts — Style profiles (tone, length, format),
 * style application, and preference history.
 */

import { randomUUID } from 'node:crypto';

export type Tone = 'formal' | 'casual' | 'technical' | 'friendly' | 'neutral';
export type Length = 'brief' | 'standard' | 'detailed' | 'comprehensive';
export type Format = 'prose' | 'bullet' | 'numbered' | 'table' | 'structured';

export interface StyleProfile {
  id: string;
  userId: string;
  tone: Tone;
  length: Length;
  format: Format;
  jargonLevel: number;   // 0-1 (0 = plain language, 1 = domain expert)
  includeExamples: boolean;
  includeReferences: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface StyledOutput {
  content: string;
  appliedProfile: string;
  originalLength: number;
  styledLength: number;
}

export interface PreferenceUpdate {
  field: keyof Omit<StyleProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  oldValue: unknown;
  newValue: unknown;
  timestamp: number;
}

/* ── In-memory store ─────────────────────────────────────────────── */

const profiles = new Map<string, StyleProfile>();
const history = new Map<string, PreferenceUpdate[]>(); // userId -> updates

/* ── Default profile ─────────────────────────────────────────────── */

function defaultProfile(userId: string): StyleProfile {
  return {
    id: randomUUID(),
    userId,
    tone: 'neutral',
    length: 'standard',
    format: 'prose',
    jargonLevel: 0.5,
    includeExamples: true,
    includeReferences: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/* ── Profile management ──────────────────────────────────────────── */

export function getProfile(userId: string): StyleProfile {
  let profile = profiles.get(userId);
  if (!profile) {
    profile = defaultProfile(userId);
    profiles.set(userId, profile);
  }
  return profile;
}

export function updateProfile(userId: string, updates: Partial<Omit<StyleProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): StyleProfile {
  const profile = getProfile(userId);
  const userHistory = history.get(userId) ?? [];

  for (const [key, value] of Object.entries(updates) as Array<[keyof typeof updates, unknown]>) {
    if (key in profile && value !== undefined) {
      userHistory.push({
        field: key as PreferenceUpdate['field'],
        oldValue: (profile as unknown as Record<string, unknown>)[key],
        newValue: value,
        timestamp: Date.now(),
      });
      (profile as unknown as Record<string, unknown>)[key] = value;
    }
  }

  profile.updatedAt = Date.now();
  history.set(userId, userHistory);
  return profile;
}

export function getPreferenceHistory(userId: string): PreferenceUpdate[] {
  return history.get(userId) ?? [];
}

export function deleteProfile(userId: string): boolean {
  history.delete(userId);
  return profiles.delete(userId);
}

/* ── Style application ───────────────────────────────────────────── */

function applyTone(text: string, tone: Tone): string {
  switch (tone) {
    case 'formal':
      return text
        .replace(/\bdon't\b/g, 'do not')
        .replace(/\bcan't\b/g, 'cannot')
        .replace(/\bwon't\b/g, 'will not')
        .replace(/\bit's\b/g, 'it is');
    case 'casual':
      return text
        .replace(/\bdo not\b/g, "don't")
        .replace(/\bcannot\b/g, "can't")
        .replace(/\bwill not\b/g, "won't");
    case 'technical':
      return text; // no transformation, keep as-is
    case 'friendly':
      return text;
    case 'neutral':
    default:
      return text;
  }
}

function applyLength(text: string, length: Length): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  switch (length) {
    case 'brief':
      return sentences.slice(0, Math.max(2, Math.ceil(sentences.length * 0.3))).join(' ');
    case 'standard':
      return sentences.slice(0, Math.max(3, Math.ceil(sentences.length * 0.6))).join(' ');
    case 'detailed':
      return text;
    case 'comprehensive':
      return text;
  }
}

function applyFormat(text: string, format: Format): string {
  switch (format) {
    case 'bullet': {
      const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
      return sentences.map(s => `• ${s.trim()}`).join('\n');
    }
    case 'numbered': {
      const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
      return sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
    }
    case 'structured': {
      const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
      if (sentences.length <= 2) return text;
      const summary = sentences[0];
      const details = sentences.slice(1);
      return `Summary: ${summary}\n\nDetails:\n${details.map(s => `- ${s.trim()}`).join('\n')}`;
    }
    case 'table':
    case 'prose':
    default:
      return text;
  }
}

function applyJargonLevel(text: string, level: number): string {
  if (level >= 0.7) return text; // Keep technical terms
  // Simple jargon reduction for low jargon levels
  const replacements: Record<string, string> = {
    'idempotent': 'safe to retry',
    'latency': 'delay',
    'throughput': 'processing speed',
    'orchestrate': 'coordinate',
    'provisioning': 'setting up',
    'instantiate': 'create',
    'deprecated': 'outdated',
    'refactor': 'restructure',
  };
  let result = text;
  if (level < 0.3) {
    for (const [jargon, plain] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`\\b${jargon}\\b`, 'gi'), plain);
    }
  }
  return result;
}

/* ── Public style application ────────────────────────────────────── */

export function applyStyle(content: string, userId: string): StyledOutput {
  const profile = getProfile(userId);
  const originalLength = content.length;

  let styled = content;
  styled = applyTone(styled, profile.tone);
  styled = applyJargonLevel(styled, profile.jargonLevel);
  styled = applyLength(styled, profile.length);
  styled = applyFormat(styled, profile.format);

  return {
    content: styled,
    appliedProfile: profile.id,
    originalLength,
    styledLength: styled.length,
  };
}

export function applyStyleWithProfile(content: string, profile: Partial<StyleProfile>): StyledOutput {
  const originalLength = content.length;
  let styled = content;
  styled = applyTone(styled, profile.tone ?? 'neutral');
  styled = applyJargonLevel(styled, profile.jargonLevel ?? 0.5);
  styled = applyLength(styled, profile.length ?? 'standard');
  styled = applyFormat(styled, profile.format ?? 'prose');

  return {
    content: styled,
    appliedProfile: profile.id ?? 'inline',
    originalLength,
    styledLength: styled.length,
  };
}

/** List all profiles */
export function listProfiles(): StyleProfile[] {
  return [...profiles.values()];
}
