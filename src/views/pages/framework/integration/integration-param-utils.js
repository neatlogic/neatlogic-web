// 新版后端独立控制输入、输出编辑权限；缺少字段时兼容旧版规范开关。
export function getParamEditPermission(handler, mode) {
  const direction = mode === 'input' ? 'Input' : 'Output';
  const permission = handler[`allowEdit${direction}Param`];
  return permission == null ? (handler[`has${direction}Pattern`] == 0 ? 1 : 0) : (permission == 1 ? 1 : 0);
}

// 配置始终只包含自定义参数，复制后编辑，避免回显时直接改写父组件或接口数据。
export function cloneParamConfig(config) {
  return {
    needValid: config && config.needValid == 1 ? 1 : 0,
    paramList: config && Array.isArray(config.paramList) ? JSON.parse(JSON.stringify(config.paramList)) : []
  };
}

// 固定参数方向由接口所在数组决定，同时向子节点传递，兼容缺少 mode 的历史定义。
export function withPatternMode(pattern, mode) {
  return (Array.isArray(pattern) ? pattern : []).map(item => ({
    ...item,
    mode,
    ...(Array.isArray(item.children) ? {children: withPatternMode(item.children, mode)} : {})
  }));
}

// 合并只用于展示和使用：固定优先，历史重复自定义项保留首条，不改变保存列表。
export function mergeIntegrationParams(pattern, config, mode) {
  const result = [];
  const seen = new Set();
  const custom = config && Array.isArray(config.paramList) ? config.paramList : [];
  [...(pattern || []), ...custom].forEach(item => {
    if (!item || !item.name || !item.type || !['input', 'output'].includes(item.mode) || (mode && item.mode !== mode)) return;
    const key = JSON.stringify([item.mode, item.name]);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  });
  return result;
}

// 树表按完整层级生成行键，避免子节点和顶层参数同名时展开状态互相影响。
export function withParamRowKeys(params, parentKey = '') {
  return (params || []).map((item, index) => {
    const key = `${parentKey}/${index}:${item.mode}:${item.name}`;
    return {
      ...item,
      typeName: item.typeName || item.type,
      _integrationParamKey: key,
      ...(Array.isArray(item.children) ? {children: withParamRowKeys(item.children, key)} : {})
    };
  });
}

// 保存前校验全部自定义顶层定义；不同方向及不同层级允许同名。
export function validateCustomParams(config, pattern) {
  const seen = new Set((pattern || []).map(item => JSON.stringify([item.mode, item.name])));
  const params = config && Array.isArray(config.paramList) ? config.paramList : [];
  for (let index = 0; index < params.length; index++) {
    const item = params[index];
    if (!item || typeof item.name !== 'string' || !item.name.trim() || !['input', 'output'].includes(item.mode) || typeof item.type !== 'string' || !item.type.trim()) {
      return {index, message: 'message.completerequired'};
    }
    const key = JSON.stringify([item.mode, item.name]);
    if (seen.has(key)) return {index, message: 'message.cannotrepeat'};
    seen.add(key);
  }
  return null;
}
