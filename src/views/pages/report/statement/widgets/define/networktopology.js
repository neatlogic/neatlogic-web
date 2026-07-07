import { $t } from '@/resources/init.js';

export default {
  name: 'networktopology',
  label: $t('term.report.networktopology'),
  type: 'networktopology',
  icon: 'tsfont-topo',
  widgetType: 'basic',
  hasCustomConfig: true,
  supportAppearanceColor: true,
  width: 760,
  height: 460,
  padding: 0,
  color: '#00e5ff',
  accentColor: '#00ffa8',
  dataTypes: [{ value: 'dynamic', text: $t('term.report.datatype.dynamicdata') }],
  needData: true,
  fields: [
    { name: 'rowType', label: $t('term.report.rowtype'), type: ['text'], isRequired: true, description: $t('term.report.rowtypedesc') },
    { name: 'nodeId', label: $t('term.report.nodeid'), type: ['text'], isRequired: false, isRecommended: true, description: $t('term.report.nodeiddesc') },
    { name: 'nodeLabel', label: $t('term.report.nodename'), type: ['text', 'number'], isRequired: false, description: $t('term.report.nodelabeldesc') },
    { name: 'nodeType', label: $t('term.report.nodetype'), type: ['text'], isRequired: false, description: $t('term.report.nodetypedesc') },
    { name: 'nodeStatus', label: $t('term.report.nodestatus'), type: ['text'], isRequired: false, description: $t('term.report.nodestatusdesc') },
    { name: 'nodeX', label: $t('term.report.nodex'), type: ['number', 'text'], isRequired: false, description: $t('term.report.nodecoorddesc') },
    { name: 'nodeY', label: $t('term.report.nodey'), type: ['number', 'text'], isRequired: false, description: $t('term.report.nodecoorddesc') },
    { name: 'sourceId', label: $t('term.report.sourceid'), type: ['text'], isRequired: false, isRecommended: true, description: $t('term.report.sourceiddesc') },
    { name: 'targetId', label: $t('term.report.targetid'), type: ['text'], isRequired: false, isRecommended: true, description: $t('term.report.targetiddesc') },
    { name: 'linkStatus', label: $t('term.report.linkstatus'), type: ['text'], isRequired: false, description: $t('term.report.linkstatusdesc') },
    { name: 'linkLabel', label: $t('term.report.linklabel'), type: ['text', 'number'], isRequired: false, description: $t('term.report.linklabeldesc') }
  ],
  config: {
    preset: 'coreAccess',
    enabled: true,
    showFlow: true,
    showAlarmPulse: true,
    showNodeBreath: true,
    showLabel: true,
    showLinkLabel: false,
    lineWidth: 2,
    nodeSize: 28,
    lowPerformance: false
  }
};
