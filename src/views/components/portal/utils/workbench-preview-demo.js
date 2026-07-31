const metricList = [
  { label: '工单总数', value: 328, tone: 'primary', trend: '8.3%' },
  { label: '平均响应', value: 18, unit: '分钟', tone: 'success', trend: '12%' },
  { label: '一次解决率', value: 92, unit: '%', tone: 'primary', trend: '5%' },
  { label: '满意度', value: 4.6, unit: '/5', tone: 'success', trend: '0.2' }
];

const actionList = [
  { id: 'action-1', title: '核心交换机链路告警', status: '高', tone: 'danger', icon: 'tsfont-warning-o' },
  { id: 'action-2', title: '支付接口响应缓慢', status: '中', tone: 'warning', icon: 'tsfont-time' },
  { id: 'action-3', title: '数据库连接数过高', status: '中', tone: 'warning', icon: 'tsfont-ci' },
  { id: 'action-4', title: '备份任务失败', status: '高', tone: 'danger', icon: 'tsfont-close-o' }
];

const quickList = [
  { id: 'quick-1', title: '工单创建', icon: 'tsfont-plus', tone: 'primary' },
  { id: 'quick-2', title: 'VPN申请', icon: 'tsfont-lock', tone: 'primary' },
  { id: 'quick-3', title: '权限申请', icon: 'tsfont-user', tone: 'primary' },
  { id: 'quick-4', title: '变更申请', icon: 'tsfont-change', tone: 'primary' },
  { id: 'quick-5', title: '资产查询', icon: 'tsfont-ci', tone: 'primary' },
  { id: 'quick-6', title: '更多服务', icon: 'tsfont-apps', tone: 'primary' }
];

const timelineList = [
  { id: 'timeline-1', time: '07-30', title: '系统升级通知', tone: 'primary' },
  { id: 'timeline-2', time: '07-29', title: '安全补丁发布', tone: 'success' },
  { id: 'timeline-3', time: '07-28', title: 'IT 服务满意度调研', tone: 'warning' }
];

const progressList = [
  { id: 'progress-1', title: '应用服务', progress: 82, tone: 'primary' },
  { id: 'progress-2', title: '基础设施', progress: 64, tone: 'success' },
  { id: 'progress-3', title: '数据服务', progress: 46, tone: 'warning' },
  { id: 'progress-4', title: '安全服务', progress: 28, tone: 'danger' }
];

const distributionList = [
  { label: '新建', value: 82, tone: 'primary' },
  { label: '处理中', value: 146, tone: 'success' },
  { label: '待确认', value: 48, tone: 'warning' },
  { label: '已解决', value: 52, tone: 'danger' }
];

const rankingList = [
  { id: 'ranking-1', title: '核心系统', value: 92, tone: 'danger', unit: '%' },
  { id: 'ranking-2', title: '网络服务', value: 76, tone: 'warning', unit: '%' },
  { id: 'ranking-3', title: '终端服务', value: 58, tone: 'primary', unit: '%' }
];

const trendData = [36, 28, 47, 25, 43, 31, 52].map((value, index) => ({
  label: `07-${24 + index}`,
  value
}));

const tableList = [
  { id: 'INC202607300128', title: '支付接口超时', status: '处理中', priority: '高', time: '15:20' },
  { id: 'INC202607300127', title: '用户登录失败', status: '新建', priority: '中', time: '15:18' },
  { id: 'REQ202607300126', title: '申请访问权限', status: '待确认', priority: '低', time: '15:05' },
  { id: 'INC202607300125', title: '报表数据异常', status: '已解决', priority: '中', time: '14:50' }
];

export function getWorkbenchPreviewDemo(type) {
  return {
    metricList,
    actionList,
    quickList,
    timelineList,
    progressList,
    distributionList,
    rankingList,
    trendData,
    tableList,
    summary: {
      label: type === 'ranking' ? '高风险' : '待处理',
      value: type === 'ranking' ? 8 : 24,
      unit: '项',
      tone: type === 'ranking' ? 'danger' : 'primary'
    }
  };
}
