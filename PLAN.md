# Implementation plan

## Goal

Build a small Node.js CLI that streams a Markdown file and prints a byte-stable JSON array of ATX headings with normalized text, heading level, and original byte offset.

## Spec coverage plan

| Spec area | Planned behavior | Test coverage |
| --- | --- | --- |
| Flat JSON output in document order | Accumulate headings in parse order and print `JSON.stringify(headings, null, 2)` | Fixture expected output and CLI test |
| ATX headings only | Parse only 1-6 leading `#` markers after allowed indentation; ignore Setext underlines | Fixture ignores `Architecture\n====` and `Subcomponents\n----` |
| Fenced code blocks | Track backtick/tilde fences opened with up to 3 spaces; ignore headings until closing fence | Fixture SQL block; dedicated tilde/backtick test |
| HTML comments | Mask HTML comments before parsing headings/fences | Fixture inline comment; dedicated multiline comment test |
| Indentation and tabs | Count CommonMark columns; up to 3 columns allowed, 4+ ignored; tabs advance to next multiple of 4 | Fixture indented headings; dedicated tab test |
| Closing hashes | Strip only trailing hash sequence preceded by whitespace | Fixture closing-hash cases; dedicated text test |
| Unicode normalization | Normalize heading text with NFC | Fixture contains precomposed/decomposed café/résumé headings |
| UTF-8 chunk boundaries | Avoid per-chunk string decoding; collect complete line bytes before decoding | Dedicated test using tiny stream chunks around emoji/CJK |
| Byte offsets | Use byte counters from original bytes and add byte length of pre-heading indentation | Fixture exact offsets and mixed line-ending test |
| Unterminated final line | Parse remaining buffered bytes at EOF | Fixture final line has no trailing newline |
| Byte-stable output | Deterministic array and property order | CLI snapshot-style assertion |
| Memory constraint | Use `fs.createReadStream`; never `readFileSync`/`readFile` for extraction | Source code review note plus tests using small `highWaterMark` |

## Design

1. `bin/markdown-headings.js` is the CLI entry point.
2. `src/extract-headings.js` exposes `extractHeadingsFromFile(filePath, options)` for tests and CLI.
3. The parser consumes bytes from `fs.createReadStream`, splits lines by `\n`, `\r\n`, or lone `\r`, and tracks `lineStartOffset` as an original byte offset.
4. Each complete line is decoded after line assembly, which preserves split multi-byte UTF-8 characters across stream chunks without decoding each chunk separately.
5. The parser tracks fenced-code and HTML-comment state before extracting headings.
6. Heading text is normalized with `String.prototype.normalize('NFC')`.

## Trade-offs

- The parser keeps one line in memory. This is O(1) relative to file size, although an extremely long single line still requires memory proportional to that line.
- HTML comments are masked with a practical state machine sufficient for Markdown content pipelines; it does not attempt to parse malformed nested HTML comments.
- Setext headings are intentionally ignored by spec.
