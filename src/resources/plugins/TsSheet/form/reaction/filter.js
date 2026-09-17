import { resolveFilterSource, tableFilterValues, hasFilterValue, filterReferenceInvalid } from './filter-source.js';

export default ({ reaction, view }) => {
  const nextFilter = [];
  let invalid = false;
  const definitions = [...(view.formItemList || []), ...(view.extraFormItemList || [])];
  if (!view.$utils.isEmpty(reaction.ruleList)) {
    reaction.ruleList.forEach(r => {
      const source = resolveFilterSource(r.formItemUuid, definitions);
      if (!r.matrixAttrUuid || !source || filterReferenceInvalid(r.formItemUuid, definitions, view.formItem?.uuid)) { invalid = true; return; }
      if (source.table) {
        const values = tableFilterValues(source, view.formData[source.root.uuid], view.handleFilterValue.bind(view));
        if (values.length) nextFilter.push({ uuid: r.matrixAttrUuid, valueList: values.map(item => item.value), textList: values.map(item => item.text) });
        return;
      }
      let list = r.formItemUuid.split('#');
      let formItemUuid = list[0];
      let column = list[1] ? list[1] : 'value';
      let formItem = view.formItemList.find(d => d.uuid === formItemUuid);
      if (!formItem) {
        formItem = view.extraFormItemList.find(d => d.uuid === formItemUuid);
      }
      if (formItem && formItem.config) {
        let valueList = [];
        let textList = [];
        let currentFormData = view.formData[formItemUuid];
        if (currentFormData instanceof Array) {
          view.formData[formItemUuid].forEach(val => {
            if (!hasFilterValue(val)) return;
            const { text, value } = view.handleFilterValue(val, column, formItem);
            if (!hasFilterValue(value)) return;
            valueList.push(value);
            textList.push(text);
          });
        } else if (typeof currentFormData === 'number' || typeof currentFormData === 'boolean' || !view.$utils.isEmpty(currentFormData)) {
          const { text, value } = view.handleFilterValue(currentFormData, column, formItem);
          valueList.push(value);
          textList.push(text);
        }
        if (valueList.length > 0) {
          nextFilter.push({
            uuid: r.matrixAttrUuid,
            valueList: valueList,
            textList: textList
          });
        }
      }
    });
    view.addExecuteCount('filter');
  }
  if (!view.$utils.isSame(view.filter, nextFilter)) view.filter = nextFilter;
  view.$set(view, 'filterReady', !invalid && (!reaction.queryWhenConditionHasValue || nextFilter.some(item => item.valueList.some(hasFilterValue))));
  view.$set(view, 'filterInvalid', invalid);
};
