# Markdown Heading Extractor

A small Node.js CLI that streams a Markdown file and prints a flat JSON array of ATX headings.

## Run

To write the fixture output to a file:

```bash
node ./bin/markdown-headings.js fixtures/fixture.md > result.json
```

Plain call without exporting the file:
```bash
node ./bin/markdown-headings.js fixtures/fixture.md
```

For testing:
```bash
npm test
```

The CLI accepts one Markdown file path and writes JSON to stdout.

## Design choices

- Uses native Node.js only: `fs.createReadStream`, `TextDecoder`, and `node:test`.
- Processes input as bytes and decodes each complete line, avoiding per-chunk UTF-8 decoding issues.
- Tracks original byte offsets from the byte stream, not from normalized strings.
- Handles `\n`, `\r\n`, lone `\r`, and an unterminated final line.
- Tracks fenced code blocks and HTML comments so headings inside them are ignored.
- Counts indentation columns according to CommonMark tab expansion; headings are accepted only with up to three leading columns.
- Normalizes heading text with NFC so visually identical Unicode forms compare equally.
- Keeps one current line in memory. This is O(1) relative to file size, with the practical caveat that a single extremely long line must be buffered until its line ending.

## Fixture output

```json
[
  {
    "text": "Project notes",
    "level": 1,
    "byte_offset": 0
  },
  {
    "text": "Components",
    "level": 2,
    "byte_offset": 101
  },
  {
    "text": "Storage layer",
    "level": 3,
    "byte_offset": 180
  },
  {
    "text": "Café — résumé section",
    "level": 2,
    "byte_offset": 317
  },
  {
    "text": "Café — résumé section",
    "level": 2,
    "byte_offset": 387
  },
  {
    "text": "Edge cases",
    "level": 4,
    "byte_offset": 465
  },
  {
    "text": "Indented three spaces still a heading",
    "level": 3,
    "byte_offset": 503
  },
  {
    "text": "Closing hashes",
    "level": 1,
    "byte_offset": 664
  },
  {
    "text": "No space before closing###",
    "level": 1,
    "byte_offset": 686
  },
  {
    "text": "🩺 Multi-byte heading at chunk boundary",
    "level": 2,
    "byte_offset": 716
  },
  {
    "text": "Final line, no trailing newline",
    "level": 1,
    "byte_offset": 762
  }
]
```
