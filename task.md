# Take-home task: Markdown heading extractor

## What to build

A small CLI that takes a markdown file as input and outputs a flat JSON array of all headings. Each entry must have:

- `text` — the heading text
- `level` — integer 1–6
- `byte_offset` — byte offset of the heading start in the source file

Stack: TypeScript or C# (.NET), your call — these are the languages you'd actually use on the team. Tests required. Single command to run.

## Spec

- Output is a flat JSON array, one entry per heading, in document order.
- All headings in our markdown files use ATX syntax (`#`, `##`, ...). You can ignore Setext-style headings (the kind with `===` or `---` underlines) — we have never used them in our content pipeline.
- Headings inside fenced code blocks must NOT be extracted.
- Headings inside HTML comments must NOT be extracted.
- **Indentation:** Up to 3 leading columns of whitespace still count as a heading. 4 or more leading columns means the line is an indented code block and must NOT be extracted. A leading tab expands to the next multiple of 4 columns (per CommonMark 0.31.2 §2.2). So `\t# foo` is a code block (tab → column 4), and `  \t# foo` is a code block (2 + tab → column 4), but `   # foo` (three spaces) is a level-1 heading.
- **Trailing hashes (ATX closing sequence):** A trailing `#` sequence preceded by a space is the optional closing marker and must be stripped from `text` (e.g. `# Title ###` → `text` is `"Title"`). A trailing `#` sequence without a preceding space is part of the title (e.g. `# Title###` → `text` is `"Title###"`).
- Heading `text` must be Unicode-normalized so that visually identical strings compare equal (e.g. precomposed "é" U+00E9 and decomposed "e\u0301" must yield the same `text` value).
- **UTF-8 streaming decode:** The decoder must handle multi-byte UTF-8 sequences (CJK, emoji, ZWJ sequences) correctly even when they split across read chunks. Per-chunk decode via `chunk.toString('utf8')` / `Encoding.UTF8.GetString(buffer)` is forbidden — these produce `U+FFFD` replacement characters at chunk boundaries. Use a streaming decoder (`new TextDecoder('utf-8', { stream: true })` in Node, `System.Text.Decoder.Convert(..., flush: false)` in C#) or an equivalent buffering strategy.
- **Byte offsets are byte offsets in the original input bytes.** They are NOT offsets into a normalized string. Mixed line endings (`\n`, `\r\n`, lone `\r`) must not shift the offsets reported.
- **Unterminated final line:** The input may end without a final line terminator. The last line must still be parsed if it is a heading. (CommonMark 0.31.2 §3: a line ends at a line ending or at end-of-file.)
- Output must be byte-stable across runs and across machines (no timestamps, no random IDs, no hash-map iteration order leaking into output).
- **Memory constraint:** The extractor must work on files of arbitrary size. Reading the full file into memory in one call (`fs.readFileSync`, `File.ReadAllText`, equivalent) is forbidden. Process the input as a stream with memory usage O(1) relative to file size. Byte offsets must still be exact under streaming.

## Fixture

A file `fixture.md` is provided alongside this task. Use it as your primary test input. Include the JSON output your tool produces on `fixture.md` in your README so we can see what you got.

## Deliverables (pushed to your repo at the 60-minute mark)

- Source code, runnable in one documented command.
- Automated tests covering the cases above.
- `README.md` with: how to run, design choices, and your tool's output on `fixture.md`.

## Time budget

**60 minutes, hard cutoff.** What is committed and pushed at minute 60 is what we review. Completion is not the metric — we evaluate how you work, what trade-offs you make, what you skip on purpose, and what you skip by accident. A partial-but-thought-through submission outscores a complete-but-shallow one.

Use your normal AI setup. We expect it.

## Submission

Push your work to the private repo you invited me to, then drop me a quick message ("done") when the 60 minutes are up. I will review the code, and we schedule a follow-up call where you walk me through your decisions and answer questions.
