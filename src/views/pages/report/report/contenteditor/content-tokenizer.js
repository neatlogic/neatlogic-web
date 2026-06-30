const DRAW_FUNCTION_PATTERN = /\$\{\s*(draw[A-Za-z0-9_]*)\s*\(/g;

function findCallEnd(content, startIndex) {
  let quote = '';
  let escapeNext = false;
  let depth = 1;
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (quote) {
      if (char === '\\') {
        escapeNext = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '(') {
      depth += 1;
      continue;
    }
    if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        let endIndex = i + 1;
        while (/\s/.test(content[endIndex])) {
          endIndex += 1;
        }
        return content[endIndex] === '}' ? { argsEnd: i, end: endIndex + 1 } : null;
      }
    }
  }
  return null;
}

function parseJsonArgs(argsText) {
  try {
    return {
      parsed: true,
      config: JSON.parse(argsText || '{}')
    };
  } catch (e) {
    return {
      parsed: false,
      config: {}
    };
  }
}

export function tokenizeContent(content, ruleMap = {}) {
  const source = content || '';
  const tokenList = [];
  DRAW_FUNCTION_PATTERN.lastIndex = 0;
  let match = null;
  while ((match = DRAW_FUNCTION_PATTERN.exec(source)) !== null) {
    const name = match[1];
    const start = match.index;
    const argsStart = DRAW_FUNCTION_PATTERN.lastIndex;
    const range = findCallEnd(source, argsStart);
    if (!range) {
      continue;
    }
    const sourceText = source.slice(start, range.end);
    const argsText = source.slice(argsStart, range.argsEnd);
    const parseResult = parseJsonArgs(argsText);
    const rule = ruleMap[name];
    tokenList.push({
      id: `report_content_widget_${tokenList.length + 1}`,
      name,
      start,
      end: range.end,
      source: sourceText,
      argsText,
      parsed: parseResult.parsed,
      config: rule && parseResult.parsed ? rule.parse(argsText) : parseResult.config,
      hasRule: !!rule
    });
    DRAW_FUNCTION_PATTERN.lastIndex = range.end;
  }
  return tokenList;
}

export function replaceToken(content, token, newSource) {
  if (!token) {
    return content || '';
  }
  return `${(content || '').slice(0, token.start)}${newSource}${(content || '').slice(token.end)}`;
}

export function swapToken(content, tokenList, tokenId, direction) {
  const index = tokenList.findIndex(token => token.id === tokenId);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= tokenList.length) {
    return content || '';
  }
  const first = tokenList[Math.min(index, targetIndex)];
  const second = tokenList[Math.max(index, targetIndex)];
  const source = content || '';
  return [
    source.slice(0, first.start),
    second.source,
    source.slice(first.end, second.start),
    first.source,
    source.slice(second.end)
  ].join('');
}
