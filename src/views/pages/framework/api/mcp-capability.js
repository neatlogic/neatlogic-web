// API 管理的 MCP 界面沿用 tenant 商业模块标识；初始化标识缺失时保持关闭。
export function hasMcpSupport() {
  return typeof COMMERCIAL_MODULES !== 'undefined' && Array.isArray(COMMERCIAL_MODULES) && COMMERCIAL_MODULES.includes('tenant');
}
