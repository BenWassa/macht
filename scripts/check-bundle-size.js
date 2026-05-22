#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

// Budgets: generous for now, tighten as the app matures.
const BUDGET_JS_RAW = 400 * 1024;  // 400 KB raw JS total
const BUDGET_JS_GZIP = 120 * 1024; // 120 KB gzipped JS total

const ASSETS_DIR = join(process.cwd(), "dist", "assets");

let totalRaw = 0;
let totalGzip = 0;
let passed = true;

for (const file of readdirSync(ASSETS_DIR)) {
  if (!file.endsWith(".js")) continue;
  const buf = readFileSync(join(ASSETS_DIR, file));
  const raw = buf.byteLength;
  const gz = gzipSync(buf).byteLength;
  totalRaw += raw;
  totalGzip += gz;
  console.log(`  ${file}: ${(raw / 1024).toFixed(1)} KB raw / ${(gz / 1024).toFixed(1)} KB gz`);
}

console.log();
console.log(`  JS total: ${(totalRaw / 1024).toFixed(1)} KB raw / ${(totalGzip / 1024).toFixed(1)} KB gz`);
console.log(`  Budget:   ${(BUDGET_JS_RAW / 1024).toFixed(0)} KB raw / ${(BUDGET_JS_GZIP / 1024).toFixed(0)} KB gz`);
console.log();

if (totalRaw > BUDGET_JS_RAW) {
  console.error(`ERR: Raw JS ${(totalRaw / 1024).toFixed(1)} KB exceeds ${(BUDGET_JS_RAW / 1024).toFixed(0)} KB budget.`);
  passed = false;
}
if (totalGzip > BUDGET_JS_GZIP) {
  console.error(`ERR: Gzip JS ${(totalGzip / 1024).toFixed(1)} KB exceeds ${(BUDGET_JS_GZIP / 1024).toFixed(0)} KB budget.`);
  passed = false;
}

if (!passed) process.exit(1);
console.log("OK: bundle within budget.");
