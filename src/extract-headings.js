import { createReadStream } from 'node:fs';
import { TextDecoder } from 'node:util';

const SPACE = 0x20;
const TAB = 0x09;
const LF = 0x0a;
const CR = 0x0d;

export async function extractHeadingsFromFile(filePath, options = {}) {
  const highWaterMark = options.highWaterMark ?? 64 * 1024;
  const state = createParserState();

  for await (const chunk of createReadStream(filePath, { highWaterMark })) {
    consumeChunk(chunk, state);
  }

  finishParser(state);
  return state.headings;
}

function createParserState() {
  return {
    headings: [],
    lineBytes: [],
    lineStartOffset: 0,
    absoluteOffset: 0,
    pendingCr: false,
    inFence: false,
    fenceChar: '',
    fenceLength: 0,
    inHtmlComment: false
  };
}

function consumeChunk(chunk, state) {
  for (const byte of chunk) {
    if (state.pendingCr) {
      if (byte === LF) {
        state.absoluteOffset += 1;
        state.lineStartOffset = state.absoluteOffset;
        state.pendingCr = false;
        continue;
      }
      state.lineStartOffset = state.absoluteOffset;
      state.pendingCr = false;
    }

    if (byte === CR) {
      processLine(state);
      state.absoluteOffset += 1;
      state.pendingCr = true;
      continue;
    }

    if (byte === LF) {
      processLine(state);
      state.absoluteOffset += 1;
      state.lineStartOffset = state.absoluteOffset;
      continue;
    }

    state.lineBytes.push(byte);
    state.absoluteOffset += 1;
  }
}

function finishParser(state) {
  if (state.pendingCr) {
    state.lineStartOffset = state.absoluteOffset;
    state.pendingCr = false;
  }

  if (state.lineBytes.length > 0) {
    processLine(state);
    state.lineStartOffset = state.absoluteOffset;
  }
}

function processLine(state) {
  const bytes = Uint8Array.from(state.lineBytes);
  const line = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  state.lineBytes.length = 0;

  const indent = readIndentColumns(line);
  if (indent.columns >= 4) {
    return;
  }

  const uncommented = maskHtmlComments(line, state);
  const fence = parseFence(uncommented, indent.index);
  if (state.inFence) {
    if (fence && fence.char === state.fenceChar && fence.length >= state.fenceLength && fence.isClosing) {
      state.inFence = false;
      state.fenceChar = '';
      state.fenceLength = 0;
    }
    return;
  }

  if (fence) {
    state.inFence = true;
    state.fenceChar = fence.char;
    state.fenceLength = fence.length;
    return;
  }

  const heading = parseAtxHeading(uncommented, indent.index);
  if (!heading) {
    return;
  }

  state.headings.push({
    text: heading.text.normalize('NFC'),
    level: heading.level,
    byte_offset: state.lineStartOffset + Buffer.byteLength(line.slice(0, heading.hashIndex), 'utf8')
  });
}

function readIndentColumns(line) {
  let columns = 0;
  let index = 0;
  while (index < line.length) {
    const ch = line[index];
    if (ch === ' ') {
      columns += 1;
      index += 1;
    } else if (ch === '\t') {
      columns += 4 - (columns % 4);
      index += 1;
    } else {
      break;
    }

    if (columns >= 4) {
      break;
    }
  }
  return { columns, index };
}

function maskHtmlComments(line, state) {
  let result = '';
  let index = 0;

  while (index < line.length) {
    if (state.inHtmlComment) {
      const end = line.indexOf('-->', index);
      if (end === -1) {
        result += ' '.repeat(line.length - index);
        return result;
      }
      result += ' '.repeat(end + 3 - index);
      index = end + 3;
      state.inHtmlComment = false;
      continue;
    }

    const start = line.indexOf('<!--', index);
    if (start === -1) {
      result += line.slice(index);
      return result;
    }

    result += line.slice(index, start);
    const end = line.indexOf('-->', start + 4);
    if (end === -1) {
      result += ' '.repeat(line.length - start);
      state.inHtmlComment = true;
      return result;
    }

    result += ' '.repeat(end + 3 - start);
    index = end + 3;
  }

  return result;
}

function parseFence(line, indentIndex) {
  const ch = line[indentIndex];
  if (ch !== '`' && ch !== '~') {
    return null;
  }

  let index = indentIndex;
  while (line[index] === ch) {
    index += 1;
  }

  const length = index - indentIndex;
  if (length < 3) {
    return null;
  }

  const rest = line.slice(index);
  const isClosing = /^[ \t]*$/.test(rest);
  return { char: ch, length, isClosing };
}

function parseAtxHeading(line, indentIndex) {
  let index = indentIndex;
  let level = 0;

  while (line[index] === '#' && level < 7) {
    level += 1;
    index += 1;
  }

  if (level < 1 || level > 6) {
    return null;
  }

  const next = line[index];
  if (next !== undefined && next !== ' ' && next !== '\t') {
    return null;
  }

  while (line[index] === ' ' || line[index] === '\t') {
    index += 1;
  }

  let text = line.slice(index);
  text = text.replace(/[ \t]+#+[ \t]*$/, '');
  text = text.trim();

  return { level, text, hashIndex: indentIndex };
}
