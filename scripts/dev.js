#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

// Force tsx to use a temp directory inside the workspace to avoid sandbox restrictions.
const tmpDir = resolve(".tmp");
mkdirSync(tmpDir, { recursive: true });

if (process.platform === "win32") {
  process.env.TEMP = tmpDir;
  process.env.TMP = tmpDir;
} else {
  process.env.TMPDIR = tmpDir;
}

process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

const child = spawn(process.execPath, ["--import", "tsx", "server/index.ts"], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
