import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { extractHeadingsFromFile } from '../src/extract-headings.js';

const execFileAsync = promisify(execFile);
const root = resolve(new URL('..', import.meta.url).pathname);
const fixturePath = join(root, 'fixtures', 'fixture.md');
const cliPath = join(root, 'bin', 'markdown-headings.js');

async function tempMarkdown(content, encoding = 'utf8') {
  const dir = await mkdtemp(join(tmpdir(), 'heading-extractor-'));
  const path = join(dir, 'input.md');
  await writeFile(path, content, encoding);
  return path;
}

test('extracts the provided fixture with exact byte offsets and normalized text', async () => {
  const headings = await extractHeadingsFromFile(fixturePath, { highWaterMark: 7 });

  assert.deepEqual(headings, [
    { text: 'Project notes', level: 1, byte_offset: 0 },
    { text: 'Components', level: 2, byte_offset: 101 },
    { text: 'Storage layer', level: 3, byte_offset: 180 },
    { text: 'Café — résumé section', level: 2, byte_offset: 317 },
    { text: 'Café — résumé section', level: 2, byte_offset: 387 },
    { text: 'Edge cases', level: 4, byte_offset: 465 },
    { text: 'Indented three spaces still a heading', level: 3, byte_offset: 503 },
    { text: 'Closing hashes', level: 1, byte_offset: 664 },
    { text: 'No space before closing###', level: 1, byte_offset: 686 },
    { text: '🩺 Multi-byte heading at chunk boundary', level: 2, byte_offset: 716 },
    { text: 'Final line, no trailing newline', level: 1, byte_offset: 762 }
  ]);
});

test('CLI prints deterministic JSON for the fixture', async () => {
  const { stdout } = await execFileAsync(process.execPath, [cliPath, fixturePath]);
  const parsed = JSON.parse(stdout);

  assert.equal(stdout.endsWith('\n'), true);
  assert.equal(parsed.length, 11);
  assert.deepEqual(Object.keys(parsed[0]), ['text', 'level', 'byte_offset']);
});

test('ignores Setext headings and headings in fenced code blocks', async () => {
  const path = await tempMarkdown([
    'Title',
    '=====',
    '```js',
    '# not a heading',
    '```',
    '~~~',
    '## not either',
    '~~~',
    '## real'
  ].join('\n'));

  assert.deepEqual(await extractHeadingsFromFile(path, { highWaterMark: 3 }), [
    { text: 'real', level: 2, byte_offset: 60 }
  ]);
});

test('ignores headings inside multiline HTML comments', async () => {
  const path = await tempMarkdown('<!--\n# hidden\n-->\n# visible\ntext <!-- ## hidden inline -->\n## visible too');

  assert.deepEqual(await extractHeadingsFromFile(path, { highWaterMark: 5 }), [
    { text: 'visible', level: 1, byte_offset: 18 },
    { text: 'visible too', level: 2, byte_offset: 59 }
  ]);
});

test('handles indentation columns and tabs according to CommonMark', async () => {
  const path = await tempMarkdown('   # yes\n    # no\n\t# no\n  \t# no\n  ## also yes');

  assert.deepEqual(await extractHeadingsFromFile(path, { highWaterMark: 2 }), [
    { text: 'yes', level: 1, byte_offset: 3 },
    { text: 'also yes', level: 2, byte_offset: 34 }
  ]);
});

test('strips only valid ATX closing hashes', async () => {
  const path = await tempMarkdown('# Title ###\n# Title###\n###    \n####');

  assert.deepEqual(await extractHeadingsFromFile(path), [
    { text: 'Title', level: 1, byte_offset: 0 },
    { text: 'Title###', level: 1, byte_offset: 12 },
    { text: '', level: 3, byte_offset: 23 },
    { text: '', level: 4, byte_offset: 31 }
  ]);
});

test('keeps byte offsets stable across mixed line endings and UTF-8 characters', async () => {
  const path = await tempMarkdown('# one\r\n## café\r### 🩺\n# last');

  assert.deepEqual(await extractHeadingsFromFile(path, { highWaterMark: 1 }), [
    { text: 'one', level: 1, byte_offset: 0 },
    { text: 'café', level: 2, byte_offset: 7 },
    { text: '🩺', level: 3, byte_offset: 16 },
    { text: 'last', level: 1, byte_offset: 25 }
  ]);
});

test('handles split multi-byte UTF-8 sequences without replacement characters', async () => {
  const path = await tempMarkdown('## A🩺中B\n# done');
  const headings = await extractHeadingsFromFile(path, { highWaterMark: 1 });

  assert.equal(headings[0].text, 'A🩺中B');
  assert.equal(headings[0].text.includes('\uFFFD'), false);
  assert.deepEqual(headings, [
    { text: 'A🩺中B', level: 2, byte_offset: 0 },
    { text: 'done', level: 1, byte_offset: 13 }
  ]);
});
