#!/usr/bin/env node
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const lesson = process.argv.slice(2).join(' ').trim();

if (!lesson) {
  console.error('Usage: node scripts/agent-learn.js "Durable project lesson"');
  process.exit(2);
}

const file = resolve('docs/agent/PROJECT_KNOWLEDGE.md');
await mkdir(dirname(file), { recursive: true });
await appendFile(file, `\n- ${lesson}\n`, 'utf8');
console.log(`Appended lesson to ${file}`);
console.log('Review docs/agent/TOC.md and agents.md if this changes navigation or workflow.');
