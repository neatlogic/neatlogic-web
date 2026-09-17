import filterReaction from '../../reaction/filter.js';
import hide from '../../reaction/hide.js';
import display from '../../reaction/display.js';
import mask from '../../reaction/mask.js';
import disable from '../../reaction/disable.js';
import readonly from '../../reaction/readonly.js';
import required from '../../reaction/required.js';
import filterValueMixin from '../common/filter-value-mixin.js';

const actions = { hide, display, mask, disable, readonly, required };
export const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));

// 保存联动依赖值的副本，用于判断是否需要重新执行清空等依赖变化操作。
export function reactionInputs(column, data) {
  const inputs = {};
  Object.values(column.reaction || {}).forEach(reaction => {
    (Array.isArray(reaction) ? reaction : [reaction]).forEach(rule => {
      (rule.conditionGroupList || []).forEach(group => (group.conditionList || []).forEach(condition => {
        const uuid = (condition.formItemUuid || '').split('#')[0];
        inputs[uuid] = data[uuid];
      }));
    });
  });
  return clone(inputs);
}

// 为未挂载的单元格构造联动上下文，复用 ColumnItem 使用的动作及过滤取值，覆盖父表非当前页。
export function selectorContext(owner, column, row, definitions, oldData = {}) {
  // 行内字段与表格外字段合并；同名键以当前行值为准。
  const data = { ...(owner.formData || {}), ...row };
  const view = {
    formItem: clone(column), formData: data, formItemList: definitions, extraFormItemList: [],
    currentItemReaction: {}, filter: [], $utils: owner.$utils,
    $set: (object, key, value) => { object[key] = value; },
    addExecuteCount() {},
    hideFormItem() { this.formItem.config.isHide = true; },
    showFormItem() { this.formItem.config.isHide = false; },
    ...filterValueMixin.methods
  };
  const overrideConfig = column.override_config || {};
  Object.entries(overrideConfig).forEach(([key, value]) => { if (value) view.formItem.config[key] = value; });
  for (const [action, reaction] of Object.entries(column.reaction || {})) {
    if (!actions[action] || owner.$utils.isEmpty(reaction)) continue;
    (Array.isArray(reaction) ? reaction : [reaction]).forEach(rule => {
      actions[action]({ overrideConfig, result: owner.executeReaction(rule, data, oldData), view });
    });
  }
  // 整组规则交给公共过滤逻辑，内外组件采用同一查询门槛和引用校验。
  filterReaction({ reaction: column.reaction?.filter || {}, view });
  const config = view.formItem.config;
  const clearRules = column.reaction?.clearValue;
  const clear = clearRules && !owner.$utils.isEmpty(clearRules) && (Array.isArray(clearRules) ? clearRules : [clearRules]).some(rule => owner.executeReaction(rule, data, oldData));
  return { filter: clone(view.filter), ready: view.filterReady, invalid: view.filterInvalid, inputs: reactionInputs(column, data), clear: !!clear,
    effective: { hidden: !!config.isHide, masked: !!config.isMask, disabled: !!(owner.disabled || config.isDisabled),
      readonly: !!(owner.readonly || config.isReadOnly), required: !!config.isRequired } };
}

// 子记录优先于父行和表格外字段；展示和提交校验使用同一套有效状态。
export function extraContext(owner, state, row, column) {
  return selectorContext({
    formData: { ...(owner.formData || {}), ...state.row },
    readonly: state.effective.readonly, disabled: state.effective.disabled,
    $utils: owner.$utils, executeReaction: owner.executeReaction
  }, column, row, [...(state.column.config.dataConfig || []), ...(owner.config.dataConfig || []), ...(owner.effectiveReferenceFormItemList || [])]);
}
