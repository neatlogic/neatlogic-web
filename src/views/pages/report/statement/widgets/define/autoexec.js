import { $t } from '@/resources/init.js';

export default {
  name: 'autoexec',
  label: $t('term.deploy.flowchart'),
  type: 'autoexec',
  icon: 'tsfont-topo',
  widgetType: 'other',
  hasCustomConfig: true,
  width: 500,
  height: 300,
  padding: 5,
  needData: true,
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }],
  fields: [
    { name: 'jobPhaseName', label: '阶段名称', type: 'text', isRequired: true },
    { name: 'jobPhaseStatus', label: '阶段状态', type: 'text', isRequired: true },
    { name: 'progress', label: '阶段进度', type: ['text', 'number'], isRequired: true, description: '进度说明：1代表已完成，0代表未完成' },
    { name: 'jobGroupSort', label: '阶段组', type: ['text', 'number'], isRequired: true }
  ],
  config: { 
    backgroundColor: '', 
    backgroundImage: '', 
    fontsize: 13, 
    color: '',
    arrowcolor: ''
  }
};
