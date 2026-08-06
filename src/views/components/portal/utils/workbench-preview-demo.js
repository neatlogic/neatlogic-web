const metricList = [
  { label: '工单总数', value: 328, tone: 'primary', trend: '8.3%' },
  { label: '平均响应', value: 18, unit: '分钟', tone: 'success', trend: '12%' },
  { label: '一次解决率', value: 92, unit: '%', tone: 'primary', trend: '5%' },
  { label: '满意度', value: 4.6, unit: '/5', tone: 'success', trend: '0.2' }
];

const quickList = [
  { id: 'quick-1', title: '工单创建', icon: 'tsfont-plus', tone: 'primary' },
  { id: 'quick-2', title: 'VPN申请', icon: 'tsfont-lock', tone: 'primary' },
  { id: 'quick-3', title: '权限申请', icon: 'tsfont-user', tone: 'primary' },
  { id: 'quick-4', title: '变更申请', icon: 'tsfont-change', tone: 'primary' },
  { id: 'quick-5', title: '资产查询', icon: 'tsfont-ci', tone: 'primary' },
  { id: 'quick-6', title: '更多服务', icon: 'tsfont-apps', tone: 'primary' }
];

const distributionList = [
  { label: '新建', value: 82, tone: 'primary' },
  { label: '处理中', value: 146, tone: 'success' },
  { label: '待确认', value: 48, tone: 'warning' },
  { label: '已解决', value: 52, tone: 'danger' }
];

const genericTableTheadList = [
  { key: 'id', title: '编号' },
  { key: 'title', title: '名称' },
  { key: 'status', title: '状态' },
  { key: 'priority', title: '级别' },
  { key: 'time', title: '更新时间', cardVisible: false }
];

const genericTableList = [
  { id: 'TASK-001', title: '待处理事项', status: '进行中', priority: '中', time: '15:20' },
  { id: 'TASK-002', title: '待确认事项', status: '待确认', priority: '低', time: '15:18' },
  { id: 'TASK-003', title: '异常事项', status: '待处理', priority: '高', time: '15:05' },
  { id: 'TASK-004', title: '已完成事项', status: '已完成', priority: '中', time: '14:50' }
];

const processTaskTableTheadList = [
  { key: 'id', title: '工单号' },
  { key: 'title', title: '标题' },
  { key: 'status', title: '状态' },
  { key: 'priority', title: '优先级' },
  { key: 'time', title: '更新时间', cardVisible: false }
];

const processTaskTableList = [
  { id: 'INC202607300128', title: '支付接口超时', status: '处理中', priority: '高', time: '15:20' },
  { id: 'INC202607300127', title: '用户登录失败', status: '新建', priority: '中', time: '15:18' },
  { id: 'REQ202607300126', title: '申请访问权限', status: '待确认', priority: '低', time: '15:05' },
  { id: 'INC202607300125', title: '报表数据异常', status: '已解决', priority: '中', time: '14:50' }
];

const favoriteServiceTableTheadList = [
  { key: 'name', title: '服务名称' }
];

const favoriteServiceTableList = [
  { id: 'service-1', name: '测试标准服务' },
  { id: 'service-2', name: '移动端服务申请' },
  { id: 'service-3', name: '测试指导服务' },
  { id: 'service-4', name: '数据采集服务' }
];

const typePreviewMap = {
  table: {
    tableTheadList: genericTableTheadList,
    tableList: genericTableList
  }
};

const previewKeyMap = {
  processTask: {
    tableTheadList: processTaskTableTheadList,
    tableList: processTaskTableList
  },
  processFavoriteService: {
    tableTheadList: favoriteServiceTableTheadList,
    tableList: favoriteServiceTableList
  }
};

export function getWorkbenchPreviewDemo(type, previewKey) {
  return {
    metricList,
    quickList,
    distributionList,
    ...(typePreviewMap[type] || {}),
    ...(previewKeyMap[previewKey] || {})
  };
}
