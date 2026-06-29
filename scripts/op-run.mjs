import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function findWingetOp() {
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) return null;

  const packagesDir = join(localAppData, "Microsoft", "WinGet", "Packages");
  if (!existsSync(packagesDir)) return null;

  for (const name of readdirSync(packagesDir)) {
    if (!name.startsWith("AgileBits.1Password.CLI_")) continue;

    const candidate = join(packagesDir, name, "op.exe");
    if (existsSync(candidate)) return candidate;
  }

  return null;
}

function resolveOp() {
  const probe = spawnSync("op", ["--version"], { encoding: "utf8" });
  if (probe.status === 0) return "op";

  const wingetOp = process.platform === "win32" ? findWingetOp() : null;
  if (wingetOp) return wingetOp;

  return null;
}

const [envFile, ...command] = process.argv.slice(2);
if (!envFile || command.length === 0) {
  console.error("Usage: node scripts/op-run.mjs <env-file> <command...>");
  process.exit(2);
}

const op = resolveOp();
if (!op) {
  console.error("1Password CLI not found. Install it with: winget install AgileBits.1Password.CLI");
  process.exit(1);
}

const result = spawnSync(op, ["run", "--env-file", envFile, "--", ...command], {
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
