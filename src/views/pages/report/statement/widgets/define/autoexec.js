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
    { name: 'jobPhaseName', label: $t('term.report.phasename'), type: 'text', isRequired: true },
    { name: 'jobPhaseStatus', label: $t('term.report.phasestatus'), type: 'text', isRequired: true },
    { name: 'progress', label: $t('term.report.phaseprogress'), type: ['text', 'number'], isRequired: true, description: $t('term.report.progressdesc') },
    { name: 'jobGroupSort', label: $t('term.report.phasegroup'), type: ['text', 'number'], isRequired: true }
  ],
  config: { 
    backgroundColor: '', 
    backgroundImage: '', 
    fontsize: 13, 
    color: '',
    arrowcolor: '',
    statusColorList: [
      {
        name: 'start',
        label: $t('term.report.start'),
        color: '#25b864',
        bgColor: 'rgba(37, 184, 100, .1)',
        disabled: true
      },
      {
        name: 'end',
        label: $t('page.end'),
        color: '#f33b3b',
        bgColor: 'rgba(243, 59, 59, .1)',
        disabled: true
      }
    ]
  }
};
