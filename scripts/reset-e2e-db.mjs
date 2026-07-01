import { rmSync } from "node:fs";
import { resolve } from "node:path";

for (const suffix of ["", "-shm", "-wal"]) {
  rmSync(resolve(process.cwd(), `.data/e2e-manager.db${suffix}`), { force: true });
}
