import { verify, KeyObject } from 'node:crypto';

export interface SkillMetadata {
  name: string;
  version: string;
  author?: string;
  signature?: Buffer;
  [key: string]: unknown;
}

export interface RegistryEntry {
  skillId: string;
  metadata: SkillMetadata;
  registeredAt: string;
  verified: boolean;
  revoked: boolean;
}

export class SkillRegistry {
  private store = new Map<string, RegistryEntry>();

  register(skillId: string, metadata: SkillMetadata): RegistryEntry {
    const entry: RegistryEntry = {
      skillId,
      metadata,
      registeredAt: new Date().toISOString(),
      verified: false,
      revoked: false,
    };
    this.store.set(skillId, entry);
    return entry;
  }

  lookup(skillId: string): RegistryEntry | undefined {
    return this.store.get(skillId);
  }

  verify(skillId: string, signature: Buffer, publicKey: KeyObject): boolean {
    const entry = this.store.get(skillId);
    if (!entry || entry.revoked) return false;
    const data = Buffer.from(JSON.stringify(entry.metadata), 'utf-8');
    const valid = verify(null, data, publicKey, signature);
    if (valid) {
      entry.verified = true;
      entry.metadata.signature = signature;
    }
    return valid;
  }

  list(): RegistryEntry[] {
    return Array.from(this.store.values());
  }

  revoke(skillId: string): boolean {
    const entry = this.store.get(skillId);
    if (!entry) return false;
    entry.revoked = true;
    entry.verified = false;
    return true;
  }
}
