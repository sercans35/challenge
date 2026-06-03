#!/usr/bin/env node
import { extractHeadingsFromFile } from '../src/extract-headings.js';

async function main() {
  const filePath = process.argv[2];
  if (!filePath || process.argv.length > 3) {
    console.error('Usage: node ./bin/markdown-headings.js <markdown-file>');
    process.exitCode = 2;
    return;
  }

  try {
    const headings = await extractHeadingsFromFile(filePath);
    process.stdout.write(`${JSON.stringify(headings, null, 2)}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

main();
