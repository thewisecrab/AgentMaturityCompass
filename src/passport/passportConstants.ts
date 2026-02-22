export const PASSPORT_EXPIRY_DAYS = 90;
export const PASSPORT_EXPIRY_MS = PASSPORT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export function computePassportExpiresTs(generatedTs: number): number {
  return generatedTs + PASSPORT_EXPIRY_MS;
}
