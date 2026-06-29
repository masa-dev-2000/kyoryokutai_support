import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const envFile = process.argv[2] || ".env.1password.local";

const checks = [];

function addCheck(name, ok, detail) {
  checks.push({ name, ok, detail });
}

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

function runOpVersion() {
  const direct = spawnSync("op", ["--version"], {
    encoding: "utf8",
  });

  if (direct.status === 0) {
    return { ok: true, version: direct.stdout.trim(), pathHint: "op" };
  }

  const wingetOp = process.platform === "win32" ? findWingetOp() : null;
  if (!wingetOp) {
    return { ok: false };
  }

  const fallback = spawnSync(wingetOp, ["--version"], {
    encoding: "utf8",
  });

  if (fallback.status !== 0) {
    return { ok: false };
  }

  return { ok: true, version: fallback.stdout.trim(), pathHint: wingetOp };
}

const opVersion = runOpVersion();

addCheck(
  "1Password CLI",
  opVersion.ok,
  opVersion.ok
    ? `op ${opVersion.version} (${opVersion.pathHint})`
    : "op command not found. Install 1Password CLI, then run op --version."
);

addCheck(
  "env file",
  existsSync(envFile),
  existsSync(envFile)
    ? `${envFile} exists`
    : `Copy .env.1password.example to ${envFile}`
);

if (existsSync(envFile)) {
  const envContent = readFileSync(envFile, "utf8");
  const sensitiveKeys = new Set([
    "ANTHROPIC_API_KEY",
    "AWS_SECRET_ACCESS_KEY",
    "R2_SECRET_ACCESS_KEY",
    "SMTP_PASS",
    "STORAGE_SECRET_ACCESS_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);

  const leakedLines = envContent
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => line && !line.startsWith("#"))
    .filter(({ line }) => {
      const eq = line.indexOf("=");
      if (eq === -1) return false;

      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).trim();
      if (!sensitiveKeys.has(key) || !value) return false;
      if (value.startsWith("op://")) return false;
      if (["...", "<同上>"].includes(value)) return false;
      if (value.startsWith("your-") || value.includes("example")) return false;

      return true;
    });

  addCheck(
    "secret placeholders",
    leakedLines.length === 0,
    leakedLines.length === 0
      ? `${envFile} uses empty values or op:// references for sensitive keys`
      : `${envFile} may contain concrete secrets at lines ${leakedLines
          .map(({ number }) => number)
          .join(", ")}`
  );
}

for (const check of checks) {
  const mark = check.ok ? "ok" : "fail";
  console.log(`[${mark}] ${check.name}: ${check.detail}`);
}

if (checks.some((check) => !check.ok)) {
  console.log("");
  console.log("Next steps:");
  console.log("- Windows: winget install AgileBits.1Password.CLI");
  console.log("- Restart the shell if op was just installed and PATH is not refreshed yet");
  console.log("- Sign in: op signin");
  console.log("- Create env file: Copy-Item .env.1password.example .env.1password.local");
  process.exit(1);
}
