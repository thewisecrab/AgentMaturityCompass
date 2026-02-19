import { randomUUID } from 'node:crypto';

export interface PersonaStyle { tone: string; verbosity: 'low' | 'medium' | 'high'; }
export interface PersonaRecord { id: string; name: string; traits: string[]; style: PersonaStyle; }
export interface Persona { personaId: string; name: string; traits: string[]; }

export class PersonaManager {
  private personas = new Map<string, PersonaRecord>();

  createPersona(name: string, traits: string[], style?: Partial<PersonaStyle>): PersonaRecord {
    const p: PersonaRecord = { id: randomUUID(), name, traits, style: { tone: style?.tone ?? 'neutral', verbosity: style?.verbosity ?? 'medium' } };
    this.personas.set(p.id, p);
    return p;
  }

  getPersona(id: string): PersonaRecord | undefined { return this.personas.get(id); }

  updatePersona(id: string, updates: Partial<{ name: string; traits: string[]; style: Partial<PersonaStyle> }>): PersonaRecord {
    const p = this.personas.get(id);
    if (!p) throw new Error('Persona not found');
    if (updates.name) p.name = updates.name;
    if (updates.traits) p.traits = updates.traits;
    if (updates.style) Object.assign(p.style, updates.style);
    return p;
  }

  listPersonas(): PersonaRecord[] { return [...this.personas.values()]; }
}

export function createPersona(name: string, traits: string[]): Persona {
  return { personaId: randomUUID(), name, traits };
}
