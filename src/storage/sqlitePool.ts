import Database from "better-sqlite3";

export interface SqlitePoolOptions {
  key: string;
  dbPath: string;
  maxSize?: number;
  configureConnection?: (db: Database.Database) => void;
  initialize?: (db: Database.Database) => void;
}

export interface SqliteConnectionLease {
  readonly db: Database.Database;
  release: () => void;
}

export interface SqlitePoolStats {
  key: string;
  dbPath: string;
  maxSize: number;
  idle: number;
  active: number;
  pooledConnections: number;
  initialized: boolean;
}

const DEFAULT_MAX_SIZE = 4;
const DEFAULT_MAX_POOLS = 32;

function parseIntEnv(raw: string | undefined, fallback: number): number {
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function normalizedPoolSize(size?: number): number {
  if (!Number.isFinite(size)) {
    return DEFAULT_MAX_SIZE;
  }
  const rounded = Math.floor(size ?? DEFAULT_MAX_SIZE);
  return Math.max(1, rounded);
}

export class SqliteConnectionPool {
  readonly key: string;
  readonly dbPath: string;
  readonly maxSize: number;
  private readonly configureConnection: ((db: Database.Database) => void) | undefined;
  private readonly initializeOnce: ((db: Database.Database) => void) | undefined;
  private readonly idle: Database.Database[] = [];
  private readonly pooled = new Set<Database.Database>();
  private readonly active = new Set<Database.Database>();
  private initialized = false;
  private closed = false;
  private lastUsedTs = Date.now();

  constructor(options: SqlitePoolOptions) {
    this.key = options.key;
    this.dbPath = options.dbPath;
    this.maxSize = normalizedPoolSize(options.maxSize);
    this.configureConnection = options.configureConnection;
    this.initializeOnce = options.initialize;
  }

  private createConnection(): Database.Database {
    const db = new Database(this.dbPath);
    if (this.configureConnection) {
      this.configureConnection(db);
    }
    return db;
  }

  acquire(): SqliteConnectionLease {
    if (this.closed) {
      throw new Error(`SQLite pool "${this.key}" is closed`);
    }

    this.lastUsedTs = Date.now();

    let db: Database.Database;
    let pooledLease = true;

    if (this.idle.length > 0) {
      db = this.idle.pop() as Database.Database;
    } else if (this.pooled.size < this.maxSize) {
      db = this.createConnection();
      this.pooled.add(db);
    } else {
      // Overflow connection: keep the pool bounded and close this connection on release.
      db = this.createConnection();
      pooledLease = false;
    }

    this.active.add(db);

    if (!this.initialized && this.initializeOnce) {
      try {
        this.initializeOnce(db);
        this.initialized = true;
      } catch (error) {
        this.active.delete(db);
        if (pooledLease) {
          this.pooled.delete(db);
        }
        db.close();
        throw error;
      }
    }

    let released = false;
    return {
      db,
      release: () => {
        if (released) {
          return;
        }
        released = true;
        this.releaseInternal(db, pooledLease);
      }
    };
  }

  withLease<T>(fn: (db: Database.Database) => T): T {
    const lease = this.acquire();
    try {
      return fn(lease.db);
    } finally {
      lease.release();
    }
  }

  private releaseInternal(db: Database.Database, pooledLease: boolean): void {
    if (!this.active.has(db)) {
      return;
    }
    this.active.delete(db);
    this.lastUsedTs = Date.now();

    if (this.closed) {
      if (!db.open) {
        return;
      }
      db.close();
      return;
    }

    if (pooledLease) {
      this.idle.push(db);
      return;
    }

    if (db.open) {
      db.close();
    }
  }

  isIdle(): boolean {
    return this.active.size === 0;
  }

  lastUsed(): number {
    return this.lastUsedTs;
  }

  closeAll(): void {
    if (this.closed) {
      return;
    }
    this.closed = true;

    for (const db of this.idle) {
      if (db.open) {
        db.close();
      }
    }
    this.idle.length = 0;

    for (const db of this.active) {
      if (db.open) {
        db.close();
      }
    }
    this.active.clear();
    this.pooled.clear();
  }

  stats(): SqlitePoolStats {
    return {
      key: this.key,
      dbPath: this.dbPath,
      maxSize: this.maxSize,
      idle: this.idle.length,
      active: this.active.size,
      pooledConnections: this.pooled.size,
      initialized: this.initialized
    };
  }
}

const pools = new Map<string, SqliteConnectionPool>();

function pruneIdlePools(): void {
  const maxPools = parseIntEnv(process.env.AMC_SQLITE_MAX_POOLS, DEFAULT_MAX_POOLS);
  if (pools.size <= maxPools) {
    return;
  }
  const entries = [...pools.entries()]
    .filter(([, pool]) => pool.isIdle())
    .sort((a, b) => a[1].lastUsed() - b[1].lastUsed());
  while (pools.size > maxPools && entries.length > 0) {
    const [key, pool] = entries.shift() as [string, SqliteConnectionPool];
    pool.closeAll();
    pools.delete(key);
  }
}

export function getOrCreateSqlitePool(options: SqlitePoolOptions): SqliteConnectionPool {
  const existing = pools.get(options.key);
  if (existing) {
    return existing;
  }
  const pool = new SqliteConnectionPool(options);
  pools.set(options.key, pool);
  pruneIdlePools();
  return pool;
}

export function closeSqlitePool(key: string): void {
  const pool = pools.get(key);
  if (!pool) {
    return;
  }
  pool.closeAll();
  pools.delete(key);
}

export function closeAllSqlitePools(): void {
  for (const [key, pool] of pools.entries()) {
    pool.closeAll();
    pools.delete(key);
  }
}

export function sqlitePoolStats(key: string): SqlitePoolStats | null {
  const pool = pools.get(key);
  return pool ? pool.stats() : null;
}
