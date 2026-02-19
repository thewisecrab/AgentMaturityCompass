/**
 * Account takeover detection.
 */

export interface AtoResult {
  suspicious: boolean;
  riskScore: number;
  signals: string[];
}

export function detectAto(events: Array<{ type: string; ts: number; metadata?: Record<string, unknown> }>): AtoResult {
  const signals: string[] = [];
  let riskScore = 0;

  if (events.length === 0) return { suspicious: false, riskScore: 0, signals: [] };

  // Rapid login attempts
  const logins = events.filter(e => e.type === 'login');
  if (logins.length >= 5) {
    const span = (logins[logins.length - 1]!.ts - logins[0]!.ts);
    if (span < 60000) { signals.push('Rapid login attempts'); riskScore += 30; }
  }

  // Failed logins
  const failed = events.filter(e => e.type === 'login_failed');
  if (failed.length >= 3) { signals.push('Multiple failed logins'); riskScore += 25; }

  // Password change after login
  const pwChange = events.find(e => e.type === 'password_change');
  if (pwChange && logins.length > 0) { signals.push('Password change after login burst'); riskScore += 20; }

  // New device
  const newDevice = events.find(e => e.type === 'new_device');
  if (newDevice) { signals.push('New device detected'); riskScore += 15; }

  // Geo anomaly
  const geoAnomaly = events.find(e => e.type === 'geo_anomaly');
  if (geoAnomaly) { signals.push('Geographic anomaly'); riskScore += 25; }

  riskScore = Math.min(100, riskScore);
  return { suspicious: riskScore >= 40, riskScore, signals };
}
