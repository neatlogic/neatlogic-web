import { $t } from '@/resources/init.js';

function getMetricList() {
  return [
    { label: $t('term.workbench.totalworkorders'), value: 328, tone: 'primary', trend: '8.3%' },
    { label: $t('term.workbench.averageresponse'), value: 18, unit: $t('term.workbench.minutes'), tone: 'success', trend: '12%' },
    { label: $t('term.workbench.firstcontactresolution'), value: 92, unit: '%', tone: 'primary', trend: '5%' },
    { label: $t('term.workbench.satisfaction'), value: 4.6, unit: '/5', tone: 'success', trend: '0.2' }
  ];
}

function getQuickList() {
  return [
    { id: 'quick-1', title: $t('term.workbench.createworkorder'), icon: 'tsfont-plus', tone: 'primary' },
    { id: 'quick-2', title: $t('term.workbench.vpnrequest'), icon: 'tsfont-lock', tone: 'primary' },
    { id: 'quick-3', title: $t('term.workbench.permissionrequest'), icon: 'tsfont-user', tone: 'primary' },
    { id: 'quick-4', title: $t('term.workbench.changerequest'), icon: 'tsfont-change', tone: 'primary' },
    { id: 'quick-5', title: $t('term.workbench.assetquery'), icon: 'tsfont-ci', tone: 'primary' },
    { id: 'quick-6', title: $t('term.workbench.moreservices'), icon: 'tsfont-apps', tone: 'primary' }
  ];
}

function getDistributionList() {
  return [
    { label: $t('term.workbench.new'), value: 82, tone: 'primary' },
    { label: $t('term.workbench.processing'), value: 146, tone: 'success' },
    { label: $t('term.workbench.pendingconfirmation'), value: 48, tone: 'warning' },
    { label: $t('term.workbench.resolved'), value: 52, tone: 'danger' }
  ];
}

function getGenericTableDemo() {
  return {
    tableTheadList: [
      { key: 'id', title: $t('term.workbench.identifier') },
      { key: 'title', title: $t('page.name') },
      { key: 'status', title: $t('page.status') },
      { key: 'priority', title: $t('page.level') },
      { key: 'time', title: $t('term.workbench.updatedtime'), cardVisible: false }
    ],
    tableList: [
      { id: 'TASK-001', title: $t('term.workbench.pendingitem'), status: $t('term.workbench.inprogress'), priority: $t('page.medium'), time: '15:20' },
      { id: 'TASK-002', title: $t('term.workbench.confirmationitem'), status: $t('term.workbench.pendingconfirmation'), priority: $t('term.workbench.low'), time: '15:18' },
      { id: 'TASK-003', title: $t('term.workbench.exceptionitem'), status: $t('term.workbench.pending'), priority: $t('term.workbench.high'), time: '15:05' },
      { id: 'TASK-004', title: $t('term.workbench.completeditem'), status: $t('page.completed'), priority: $t('page.medium'), time: '14:50' }
    ]
  };
}

function getProcessTaskDemo() {
  return {
    tableTheadList: [
      { key: 'id', title: $t('page.workordernumber') },
      { key: 'title', title: $t('page.title') },
      { key: 'status', title: $t('page.status') },
      { key: 'priority', title: $t('page.priority') },
      { key: 'time', title: $t('term.workbench.updatedtime'), cardVisible: false }
    ],
    tableList: [
      { id: 'INC202607300128', title: $t('term.workbench.paymentapitimeout'), status: $t('term.workbench.processing'), priority: $t('term.workbench.high'), priorityTone: 'error', time: '15:20' },
      { id: 'INC202607300127', title: $t('term.workbench.userloginfailed'), status: $t('term.workbench.new'), priority: $t('page.medium'), priorityTone: 'warning', time: '15:18' },
      { id: 'REQ202607300126', title: $t('term.workbench.accessrequest'), status: $t('term.workbench.pendingconfirmation'), priority: $t('term.workbench.low'), priorityTone: 'grey', time: '15:05' },
      { id: 'INC202607300125', title: $t('term.workbench.reportdataexception'), status: $t('term.workbench.resolved'), priority: $t('page.medium'), priorityTone: 'warning', time: '14:50' }
    ]
  };
}

function getFavoriteServiceDemo() {
  return {
    tableTheadList: [
      { key: 'name', title: $t('page.servicename') }
    ],
    tableList: [
      { id: 'service-1', name: $t('term.workbench.standardtestservice') },
      { id: 'service-2', name: $t('term.workbench.mobileservicerequest') },
      { id: 'service-3', name: $t('term.workbench.testguidanceservice') },
      { id: 'service-4', name: $t('term.workbench.datacollectionservice') }
    ]
  };
}

export function getWorkbenchPreviewDemo(type, previewKey) {
  const typeDemo = type === 'table' ? getGenericTableDemo() : {};
  const previewDemo = previewKey === 'processTask'
    ? getProcessTaskDemo()
    : (previewKey === 'processFavoriteService' ? getFavoriteServiceDemo() : {});
  return {
    metricList: getMetricList(),
    quickList: getQuickList(),
    distributionList: getDistributionList(),
    ...typeDemo,
    ...previewDemo
  };
}
