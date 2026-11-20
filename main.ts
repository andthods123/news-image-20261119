// news-image-20261119 — deterministic entry runner.
//
// The entry is a pre-rendered newspaper front page for Thursday 19 November
// 2026. This script performs the single job the competition asks for: place a
// byte-identical copy of entry.png into the output directory and prove the
// copy is intact with a SHA-256 digest. No network access, no randomness.

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import * as crypto from "node:crypto";
import { join } from "node:path";
import { fileURLToPath as toPath } from "node:url";

const EXPECTED_DIGEST =
  "effa92549af0ea33a6322e3be0ea53efb270c7d3b4485be1eb4b8f27fa314b84";

function fingerprint(path: string): string {
  const bytes = readFileSync(path);
  const hash = crypto.createHash("sha256");
  hash.update(bytes);
  return hash.digest("hex");
}

function run(): void {
  const sourcePng = toPath(new URL("./entry.png", import.meta.url));
  if (!existsSync(sourcePng)) {
    throw new Error(`entry.png is missing next to main.ts (${sourcePng})`);
  }
  const sourceDigest = fingerprint(sourcePng);
  if (sourceDigest !== EXPECTED_DIGEST) {
    throw new Error(`entry.png source failed its integrity check: ${sourceDigest}`);
  }
  const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(targetDir, { recursive: true });
  const targetPng = join(targetDir, "entry.png");
  copyFileSync(sourcePng, targetPng);
  const digest = fingerprint(targetPng);
  if (digest !== EXPECTED_DIGEST) {
    throw new Error(`entry.png failed its integrity check: ${digest}`);
  }
  const size = statSync(targetPng).size;
  console.log(`entry.png -> ${targetPng} (${size} bytes, sha256 ${digest})`);
}

run();
