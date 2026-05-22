const NODE = {
  switch: 'switch',
  router: 'router',
  firewall: 'firewall',
  server: 'server',
  database: 'database',
  cloud: 'cloud',
  terminal: 'terminal'
};

const STATUS = {
  normal: 'normal',
  warning: 'warning',
  critical: 'critical',
  offline: 'offline',
  congested: 'congested',
  disconnected: 'disconnected'
};

export const NETWORK_TOPOLOGY_PRESET_LIST = [
  { value: 'coreAccess', text: '核心-接入' },
  { value: 'star', text: '星型拓扑' },
  { value: 'tree', text: '树型拓扑' },
  { value: 'layer', text: '分层拓扑' },
  { value: 'ring', text: '环形拓扑' }
];

export const NETWORK_TOPOLOGY_PRESETS = {
  coreAccess: {
    nodes: [
      { id: 'cloud', label: '公网云', type: NODE.cloud, status: STATUS.normal, x: 500, y: 70 },
      { id: 'firewall', label: '边界防火墙', type: NODE.firewall, status: STATUS.warning, x: 500, y: 170 },
      { id: 'coreA', label: '核心交换A', type: NODE.switch, status: STATUS.normal, x: 365, y: 285 },
      { id: 'coreB', label: '核心交换B', type: NODE.switch, status: STATUS.normal, x: 635, y: 285 },
      { id: 'accessA', label: '接入交换A', type: NODE.switch, status: STATUS.normal, x: 210, y: 430 },
      { id: 'accessB', label: '接入交换B', type: NODE.switch, status: STATUS.critical, x: 500, y: 430 },
      { id: 'accessC', label: '接入交换C', type: NODE.switch, status: STATUS.normal, x: 790, y: 430 }
    ],
    links: [
      { source: 'cloud', target: 'firewall', status: STATUS.normal, label: 'Internet' },
      { source: 'firewall', target: 'coreA', status: STATUS.warning, label: 'HA-1' },
      { source: 'firewall', target: 'coreB', status: STATUS.normal, label: 'HA-2' },
      { source: 'coreA', target: 'coreB', status: STATUS.normal, label: 'Trunk' },
      { source: 'coreA', target: 'accessA', status: STATUS.normal },
      { source: 'coreA', target: 'accessB', status: STATUS.congested },
      { source: 'coreB', target: 'accessB', status: STATUS.critical },
      { source: 'coreB', target: 'accessC', status: STATUS.normal }
    ]
  },
  star: {
    nodes: [
      { id: 'router', label: '核心路由', type: NODE.router, status: STATUS.normal, x: 500, y: 300 },
      { id: 'db', label: '数据库', type: NODE.database, status: STATUS.normal, x: 500, y: 95 },
      { id: 'srv1', label: '应用01', type: NODE.server, status: STATUS.normal, x: 205, y: 180 },
      { id: 'srv2', label: '应用02', type: NODE.server, status: STATUS.warning, x: 795, y: 180 },
      { id: 'term1', label: '终端A', type: NODE.terminal, status: STATUS.normal, x: 245, y: 470 },
      { id: 'term2', label: '终端B', type: NODE.terminal, status: STATUS.offline, x: 755, y: 470 }
    ],
    links: [
      { source: 'router', target: 'db', status: STATUS.normal },
      { source: 'router', target: 'srv1', status: STATUS.normal },
      { source: 'router', target: 'srv2', status: STATUS.warning },
      { source: 'router', target: 'term1', status: STATUS.normal },
      { source: 'router', target: 'term2', status: STATUS.disconnected }
    ]
  },
  tree: {
    nodes: [
      { id: 'cloud', label: '业务云', type: NODE.cloud, status: STATUS.normal, x: 500, y: 70 },
      { id: 'router', label: '出口路由', type: NODE.router, status: STATUS.normal, x: 500, y: 180 },
      { id: 'sw1', label: '汇聚A', type: NODE.switch, status: STATUS.normal, x: 300, y: 315 },
      { id: 'sw2', label: '汇聚B', type: NODE.switch, status: STATUS.warning, x: 700, y: 315 },
      { id: 'srv1', label: '工单服务', type: NODE.server, status: STATUS.normal, x: 165, y: 470 },
      { id: 'srv2', label: '监控服务', type: NODE.server, status: STATUS.normal, x: 430, y: 470 },
      { id: 'db', label: '配置库', type: NODE.database, status: STATUS.critical, x: 630, y: 470 },
      { id: 'term', label: '运维终端', type: NODE.terminal, status: STATUS.normal, x: 835, y: 470 }
    ],
    links: [
      { source: 'cloud', target: 'router', status: STATUS.normal },
      { source: 'router', target: 'sw1', status: STATUS.normal },
      { source: 'router', target: 'sw2', status: STATUS.warning },
      { source: 'sw1', target: 'srv1', status: STATUS.normal },
      { source: 'sw1', target: 'srv2', status: STATUS.normal },
      { source: 'sw2', target: 'db', status: STATUS.critical },
      { source: 'sw2', target: 'term', status: STATUS.normal }
    ]
  },
  layer: {
    nodes: [
      { id: 'internet', label: '互联网', type: NODE.cloud, status: STATUS.normal, x: 500, y: 70 },
      { id: 'fw1', label: '防火墙A', type: NODE.firewall, status: STATUS.normal, x: 360, y: 180 },
      { id: 'fw2', label: '防火墙B', type: NODE.firewall, status: STATUS.normal, x: 640, y: 180 },
      { id: 'app1', label: '应用集群A', type: NODE.server, status: STATUS.normal, x: 250, y: 325 },
      { id: 'app2', label: '应用集群B', type: NODE.server, status: STATUS.warning, x: 500, y: 325 },
      { id: 'app3', label: '应用集群C', type: NODE.server, status: STATUS.normal, x: 750, y: 325 },
      { id: 'db1', label: '主库', type: NODE.database, status: STATUS.normal, x: 375, y: 485 },
      { id: 'db2', label: '备库', type: NODE.database, status: STATUS.offline, x: 625, y: 485 }
    ],
    links: [
      { source: 'internet', target: 'fw1', status: STATUS.normal },
      { source: 'internet', target: 'fw2', status: STATUS.normal },
      { source: 'fw1', target: 'app1', status: STATUS.normal },
      { source: 'fw1', target: 'app2', status: STATUS.warning },
      { source: 'fw2', target: 'app2', status: STATUS.normal },
      { source: 'fw2', target: 'app3', status: STATUS.normal },
      { source: 'app1', target: 'db1', status: STATUS.normal },
      { source: 'app2', target: 'db1', status: STATUS.normal },
      { source: 'app2', target: 'db2', status: STATUS.disconnected },
      { source: 'app3', target: 'db2', status: STATUS.warning }
    ]
  },
  ring: {
    nodes: [
      { id: 'n1', label: '核心A', type: NODE.switch, status: STATUS.normal, x: 500, y: 75 },
      { id: 'n2', label: '核心B', type: NODE.switch, status: STATUS.normal, x: 750, y: 160 },
      { id: 'n3', label: '出口路由', type: NODE.router, status: STATUS.warning, x: 835, y: 360 },
      { id: 'n4', label: '数据库', type: NODE.database, status: STATUS.normal, x: 635, y: 505 },
      { id: 'n5', label: '应用服务', type: NODE.server, status: STATUS.critical, x: 365, y: 505 },
      { id: 'n6', label: '防火墙', type: NODE.firewall, status: STATUS.normal, x: 165, y: 360 },
      { id: 'n7', label: '办公网', type: NODE.terminal, status: STATUS.normal, x: 250, y: 160 }
    ],
    links: [
      { source: 'n1', target: 'n2', status: STATUS.normal },
      { source: 'n2', target: 'n3', status: STATUS.warning },
      { source: 'n3', target: 'n4', status: STATUS.normal },
      { source: 'n4', target: 'n5', status: STATUS.critical },
      { source: 'n5', target: 'n6', status: STATUS.normal },
      { source: 'n6', target: 'n7', status: STATUS.normal },
      { source: 'n7', target: 'n1', status: STATUS.normal },
      { source: 'n1', target: 'n4', status: STATUS.congested },
      { source: 'n2', target: 'n6', status: STATUS.normal }
    ]
  }
};
