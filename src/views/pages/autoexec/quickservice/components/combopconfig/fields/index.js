import utils from '@/resources/assets/js/util.js';
import scenario from './scenario/index.js';
import parallelPolicy from './parallelpolicy/index.js';
import roundCount from './roundcount/index.js';
import parallelCount from './parallelcount/index.js';
import runnerGroupTag from './runnergrouptag/index.js';
import runnerGroup from './runnergroup/index.js';
import executeTarget from './executetarget/index.js';
import protocol from './protocol/index.js';
import executeUser from './executeuser/index.js';
import { createRuntimeDefinitions } from './runtimeparam/index.js';
import { PARAMETER_GROUPS } from '../groups.js';

// 新增内置参数：在当前目录新增参数文件夹，内含 index.js 规则和 index.vue 控件，
// 然后在此引入规则并注册一条记录。记录顺序决定参数顺序；分组顺序由 ../groups.js 维护。
// 控件选项和专属交互归各 Vue 文件，共享状态仍由 parameterContext 提供。
// fullField 控件承载完整字段（含映射选择和关联配置），其余控件只编辑参数值。
// 延迟到生成页面字段时加载控件，模型读取规则及初始化值时无需加载 Vue 组件。
const FIELDS = [
  { definition: scenario, loadComponent: () => require('./scenario/index.vue').default },
  { definition: parallelPolicy, loadComponent: () => require('./parallelpolicy/index.vue').default },
  { definition: roundCount, loadComponent: () => require('./roundcount/index.vue').default },
  { definition: parallelCount, loadComponent: () => require('./parallelcount/index.vue').default },
  { definition: runnerGroupTag, loadComponent: () => require('./runnergrouptag/index.vue').default },
  { definition: runnerGroup, loadComponent: () => require('./runnergroup/index.vue').default },
  { definition: executeTarget, loadComponent: () => require('./executetarget/index.vue').default },
  { definition: protocol, loadComponent: () => require('./protocol/index.vue').default },
  { definition: executeUser, loadComponent: () => require('./executeuser/index.vue').default }
];

export const BUILTIN_DEFINITIONS = FIELDS.map(field => field.definition);

export function assertDefinitions(definitions = BUILTIN_DEFINITIONS) {
  const keys = new Set();
  const groups = new Set(PARAMETER_GROUPS.map(group => group.key));
  definitions.forEach(definition => {
    if (!definition.key || keys.has(definition.key) || !groups.has(definition.group)) {
      throw new Error(`Invalid quickservice parameter registration: ${definition.key}`);
    }
    keys.add(definition.key);
  });
}

assertDefinitions();

let editors;
function getEditors() {
  if (!editors) {
    editors = {
      components: Object.fromEntries(FIELDS.map(field => [field.definition.key, field.loadComponent()])),
      runtimeComponent: require('./runtimeparam/index.vue').default
    };
  }
  return editors;
}

export function assertEditors(definitions = BUILTIN_DEFINITIONS, components = getEditors().components) {
  const keys = definitions.map(definition => definition.key);
  if (!getEditors().runtimeComponent || keys.some(key => !components[key]) || Object.keys(components).some(key => !keys.includes(key))) {
    throw new Error('Incomplete quickservice parameter editor registration');
  }
}

/**
 * 根据组合工具配置和当前参数值生成业务定义，不加载 Vue 控件。
 * 各参数的 index.js 维护默认值、显隐、锁定及取值转换规则。
 * @param {import('../../../model/service-model.js').ParameterContext} context
 */
export function createParameterDefinitions(context) {
  const builtins = BUILTIN_DEFINITIONS
    // visible 统一判断工具是否支持该参数及参数联动条件；未配置时默认显示。
    .filter(definition => !definition.visible || definition.visible(context))
    .map(definition => ({
      ...definition,
      defaultValue: utils.deepClone(definition.defaultValue),
      locked: typeof definition.locked === 'function' ? !!definition.locked(context) : !!definition.locked
    }));

  // 在内置参数之后追加组合工具定义的动态作业参数。
  return builtins.concat(createRuntimeDefinitions(context));
}

export function createDefinitions(context) {
  assertEditors();
  const { components, runtimeComponent } = getEditors();
  return createParameterDefinitions(context).map(definition => ({
    ...definition,
    component: definition.dynamic ? runtimeComponent : components[definition.key]
  }));
}
