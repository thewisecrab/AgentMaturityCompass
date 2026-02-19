export interface Finding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  passed: boolean;
  detail: string;
}

export interface HardeningResult {
  score: number;
  maxScore: number;
  findings: Finding[];
  passed: boolean;
}

export function checkHostHardening(): HardeningResult {
  const findings: Finding[] = [];

  // Check debug flags
  const debugFlags = process.execArgv.filter(a => a.startsWith('--inspect'));
  findings.push({
    id: 'H001',
    title: 'No debug flags',
    severity: 'critical',
    passed: debugFlags.length === 0,
    detail: debugFlags.length === 0 ? 'No debug flags detected' : `Debug flags found: ${debugFlags.join(', ')}`,
  });

  // Check leaked secrets in env
  const secretPatterns = ['SECRET', 'TOKEN', 'PASSWORD', 'API_KEY'];
  const leaked = Object.keys(process.env).filter(k => {
    const upper = k.toUpperCase();
    return secretPatterns.some(p => upper.includes(p)) && !!process.env[k];
  });
  findings.push({
    id: 'H002',
    title: 'No leaked secrets in environment',
    severity: 'high',
    passed: leaked.length === 0,
    detail: leaked.length === 0 ? 'No secret-like env vars detected' : `Potentially leaked env vars: ${leaked.length} found (keys containing ${secretPatterns.join('/')})`,
  });

  // Check Node.js version
  const major = parseInt(process.versions.node.split('.')[0]!, 10);
  const recentEnough = major >= 18;
  findings.push({
    id: 'H003',
    title: 'Node.js version is recent',
    severity: 'medium',
    passed: recentEnough,
    detail: `Node.js ${process.versions.node} (major ${major}, minimum 18)`,
  });

  // Check running as root
  const uid = process.getuid?.();
  const isRoot = uid === 0;
  findings.push({
    id: 'H004',
    title: 'Not running as root',
    severity: 'critical',
    passed: !isRoot,
    detail: isRoot ? 'Process is running as root (uid=0)' : `Process running as uid=${uid ?? 'unknown'}`,
  });

  const maxScore = findings.length;
  const score = findings.filter(f => f.passed).length;

  return { score, maxScore, findings, passed: findings.every(f => f.passed) };
}

/** Backward-compatible wrapper */
export function runHardeningChecks() {
  const r = checkHostHardening();
  return {
    checks: r.findings.map(f => ({ checkId: f.id, title: f.title, passed: f.passed, severity: f.severity })),
    score: (r.score / r.maxScore) * 100,
  };
}
