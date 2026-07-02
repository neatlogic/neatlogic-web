import { buildFunctionSource, getBasePreview, getDataSourceFormItem, parseJsonConfig } from './rule-util';

export function createChartRule({ name, label, icon, extraFormConfig = () => ({}) }) {
  return {
    name,
    label,
    icon,
    parse(argsText) {
      return Object.assign({
        data: '',
        title: '',
        xLabel: '',
        yLabel: '',
        width: '',
        height: '',
        isShowValue: false,
        tick: ''
      }, parseJsonConfig(argsText));
    },
    stringify(config) {
      return buildFunctionSource(this.name, config);
    },
    getFormConfig(config, context) {
      return Object.assign({
        data: getDataSourceFormItem(config, context),
        title: { type: 'text', label: '标题', value: config.title },
        xLabel: { type: 'text', label: 'X轴标题', value: config.xLabel },
        yLabel: { type: 'text', label: 'Y轴标题', value: config.yLabel },
        width: { type: 'number', label: '宽度', value: config.width },
        height: { type: 'number', label: '高度', value: config.height },
        isShowValue: { type: 'switch', label: '显示数值', value: !!config.isShowValue },
        tick: { type: 'number', label: '刻度数量', value: config.tick }
      }, extraFormConfig(config, context));
    },
    getPreview(config) {
      return Object.assign(getBasePreview(config, this.label), {
        icon: this.icon,
        summary: [
          config.data ? `data: ${config.data}` : '',
          config.xLabel ? `X: ${config.xLabel}` : '',
          config.yLabel ? `Y: ${config.yLabel}` : ''
        ].filter(Boolean).join(' · ')
      });
    }
  };
}
