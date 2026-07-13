import { buildFunctionSource, getBasePreview, getDataSourceFormItem, parseJsonConfig } from './rule-util';
import { $t } from '@/resources/init.js';

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
        title: { type: 'text', label: $t('page.title'), value: config.title },
        xLabel: { type: 'text', label: $t('term.report.axis.xaxistitle'), value: config.xLabel },
        yLabel: { type: 'text', label: $t('term.report.axis.yaxistitle'), value: config.yLabel },
        width: { type: 'number', label: $t('page.width'), value: config.width },
        height: { type: 'number', label: $t('page.height'), value: config.height },
        isShowValue: { type: 'switch', label: $t('term.report.chartsetting.showvalue'), value: !!config.isShowValue },
        tick: { type: 'number', label: $t('term.report.chartsetting.tickcount'), value: config.tick }
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
