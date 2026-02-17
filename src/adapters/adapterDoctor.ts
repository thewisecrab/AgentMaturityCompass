import { adaptersDetectCli } from "./adapterCli.js";

export interface AdapterDoctorRow {
  adapterId: string;
  ok: boolean;
  message: string;
}

export function runAdapterDoctor(): AdapterDoctorRow[] {
  return adaptersDetectCli().map((row) => ({
    adapterId: row.adapterId,
    ok: row.installed && row.version !== null,
    message: row.installed
      ? `${row.command ?? "unknown"} ${row.version ?? "(version probe failed)"}`
      : row.detail
  }));
}
