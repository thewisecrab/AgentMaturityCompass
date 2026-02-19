import { randomUUID } from 'node:crypto';

export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
export interface JobSpec { type: string; payload: unknown; priority?: number; }
export interface JobRecord { id: string; spec: JobSpec; status: JobStatus; createdAt: number; startedAt?: number; completedAt?: number; attempts: number; error?: string; }
export interface Job { jobId: string; type: string; status: string; }
export interface BatchJob { jobId: string; items: unknown[]; status: 'pending' | 'running' | 'complete'; }

export class JobQueue {
  private jobs = new Map<string, JobRecord>();

  createJob(spec: JobSpec): JobRecord {
    const job: JobRecord = { id: randomUUID(), spec, status: 'pending', createdAt: Date.now(), attempts: 0 };
    this.jobs.set(job.id, job);
    return job;
  }

  enqueueJob(jobId: string): JobRecord {
    const j = this.jobs.get(jobId);
    if (!j) throw new Error('Job not found');
    if (j.status !== 'pending') throw new Error(`Cannot enqueue job in ${j.status} state`);
    j.status = 'queued';
    return j;
  }

  processJob(jobId: string): JobRecord {
    const j = this.jobs.get(jobId);
    if (!j) throw new Error('Job not found');
    j.status = 'processing';
    j.startedAt = Date.now();
    j.attempts++;
    // Simulate completion
    j.status = 'completed';
    j.completedAt = Date.now();
    return j;
  }

  getJobStatus(jobId: string): JobRecord | undefined { return this.jobs.get(jobId); }

  retryJob(jobId: string): JobRecord {
    const j = this.jobs.get(jobId);
    if (!j) throw new Error('Job not found');
    j.status = 'queued';
    j.error = undefined;
    return j;
  }

  listJobs(filter?: { status?: JobStatus }): JobRecord[] {
    let jobs = [...this.jobs.values()];
    if (filter?.status) jobs = jobs.filter(j => j.status === filter.status);
    return jobs.sort((a, b) => (b.spec.priority ?? 0) - (a.spec.priority ?? 0));
  }
}

export function createBatchJob(items: unknown[]): { jobId: string; items: unknown[]; status: 'pending' | 'running' | 'complete' } {
  return { jobId: randomUUID(), items, status: 'pending' };
}

export function createJob(type: string): Job {
  return { jobId: randomUUID(), type, status: 'pending' };
}
