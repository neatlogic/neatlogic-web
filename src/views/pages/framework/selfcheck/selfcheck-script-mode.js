export const SELF_CHECK_SCRIPT_LANGUAGE = 'selfcheck-javascript';
export const SELF_CHECK_SCRIPT_PREFIX = "(function () { 'use strict';\n";
export const SELF_CHECK_SCRIPT_SUFFIX = '\n})()';

/** 使用与后端一致的单行前缀包装函数体，供本地语法诊断使用。 */
export function wrapSelfCheckScript(script) {
  return `${SELF_CHECK_SCRIPT_PREFIX}${script || ''}${SELF_CHECK_SCRIPT_SUFFIX}`;
}

/** 将包装模型中的位置还原为用户函数体位置，并限制在有效行列范围内。 */
export function mapSelfCheckWrappedPosition(position, script) {
  const lineList = String(script || '').split('\n');
  const sourceLine = Math.max(1, Number(position && position.lineNumber) || 1) - 1;
  const lineNumber = Math.min(Math.max(sourceLine, 1), lineList.length);
  const maxColumn = lineList[lineNumber - 1].length + 1;
  let column = Math.max(1, Number(position && position.column) || 1);
  if (sourceLine !== lineNumber || column > maxColumn) {
    column = maxColumn;
  }
  return { lineNumber, column };
}
