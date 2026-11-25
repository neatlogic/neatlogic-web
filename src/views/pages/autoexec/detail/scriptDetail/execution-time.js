// 审计时间可能是毫秒时间戳或数据库日期字符串；缺失或无效的时间不参与运算。
export function timestamp(value) {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
  const millis = typeof value === 'number' || /^\d+$/.test(value) ? Number(value) : Date.parse(value.replace(' ', 'T'));
  return Number.isFinite(new Date(millis).getTime()) ? millis : null;
}
