import {$t} from '@/resources/init.js';

export default {
  name: 'networktopology',
  label: '网络拓扑',
  type: 'networktopology',
  icon: 'tsfont-topo',
  widgetType: 'network',
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
    { name: 'rowType', label: '行类型', type: ['text'], isRequired: true, description: '必填；节点行填写 node，链路行填写 link。' },
    { name: 'nodeId', label: '节点ID', type: ['text'], isRequired: false, isRecommended: true, description: '推荐绑定；rowType 为 node 时用于标识节点，缺失时该节点行会被忽略。' },
    { name: 'nodeLabel', label: '节点名称', type: ['text', 'number'], isRequired: false, description: '可选；不绑定时使用节点ID作为名称。' },
    { name: 'nodeType', label: '节点类型', type: ['text'], isRequired: false, description: '可选；switch、router、firewall、server、database、cloud、terminal，非法或为空时按 terminal 展示。' },
    { name: 'nodeStatus', label: '节点状态', type: ['text'], isRequired: false, description: '可选；normal、warning、critical、offline，非法或为空时按 normal 展示。' },
    { name: 'nodeX', label: '节点X坐标', type: ['number', 'text'], isRequired: false, description: '可选；缺失时优先使用模板同序号坐标，仍缺失时自动排布。' },
    { name: 'nodeY', label: '节点Y坐标', type: ['number', 'text'], isRequired: false, description: '可选；缺失时优先使用模板同序号坐标，仍缺失时自动排布。' },
    { name: 'sourceId', label: '源节点ID', type: ['text'], isRequired: false, isRecommended: true, description: '推荐绑定；rowType 为 link 时表示链路源节点。' },
    { name: 'targetId', label: '目标节点ID', type: ['text'], isRequired: false, isRecommended: true, description: '推荐绑定；rowType 为 link 时表示链路目标节点。' },
    { name: 'linkStatus', label: '链路状态', type: ['text'], isRequired: false, description: '可选；normal、warning、critical、congested、disconnected，非法或为空时按 normal 展示。' },
    { name: 'linkLabel', label: '链路标签', type: ['text', 'number'], isRequired: false, description: '可选；用于展示链路名称或带宽等说明。' }
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
