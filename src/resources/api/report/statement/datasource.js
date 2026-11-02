// 旧大屏没有保存来源类型时，继续使用数据仓库；未知类型交给后端明确校验。
export const DEFAULT_DATASOURCE_TYPE = 'datawarehouse';

// 编辑、展示和接口封装共用缺省规则，避免旧配置需要重新保存才能取数。
export function getDatasourceType(value) {
  return value == null || (typeof value === 'string' && value.trim() === '') ? DEFAULT_DATASOURCE_TYPE : value;
}
