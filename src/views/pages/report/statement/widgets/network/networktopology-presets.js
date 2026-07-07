import { $t } from '@/resources/init.js';

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
  { value: 'coreAccess', text: $t('term.report.coreaccess') },
  { value: 'star', text: $t('term.report.startopology') },
  { value: 'tree', text: $t('term.report.treetopology') },
  { value: 'layer', text: $t('term.report.layertopology') },
  { value: 'ring', text: $t('term.report.ringtopology') }
];

export const NETWORK_TOPOLOGY_PRESETS = {
  coreAccess: {
    nodes: [
      { id: 'cloud', label: $t('term.report.publiccloud'), type: NODE.cloud, status: STATUS.normal, x: 500, y: 70 },
      { id: 'firewall', label: $t('term.report.edgefirewall'), type: NODE.firewall, status: STATUS.warning, x: 500, y: 170 },
      { id: 'coreA', label: $t('term.report.coreswitcha'), type: NODE.switch, status: STATUS.normal, x: 365, y: 285 },
      { id: 'coreB', label: $t('term.report.coreswitchb'), type: NODE.switch, status: STATUS.normal, x: 635, y: 285 },
      { id: 'accessA', label: $t('term.report.accessswitcha'), type: NODE.switch, status: STATUS.normal, x: 210, y: 430 },
      { id: 'accessB', label: $t('term.report.accessswitchb'), type: NODE.switch, status: STATUS.critical, x: 500, y: 430 },
      { id: 'accessC', label: $t('term.report.accessswitchc'), type: NODE.switch, status: STATUS.normal, x: 790, y: 430 }
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
      { id: 'router', label: $t('term.report.corerouter'), type: NODE.router, status: STATUS.normal, x: 500, y: 300 },
      { id: 'db', label: $t('term.report.database'), type: NODE.database, status: STATUS.normal, x: 500, y: 95 },
      { id: 'srv1', label: $t('term.report.app01'), type: NODE.server, status: STATUS.normal, x: 205, y: 180 },
      { id: 'srv2', label: $t('term.report.app02'), type: NODE.server, status: STATUS.warning, x: 795, y: 180 },
      { id: 'term1', label: $t('term.report.terminala'), type: NODE.terminal, status: STATUS.normal, x: 245, y: 470 },
      { id: 'term2', label: $t('term.report.terminalb'), type: NODE.terminal, status: STATUS.offline, x: 755, y: 470 }
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
      { id: 'cloud', label: $t('term.report.businesscloud'), type: NODE.cloud, status: STATUS.normal, x: 500, y: 70 },
      { id: 'router', label: $t('term.report.egressrouter'), type: NODE.router, status: STATUS.normal, x: 500, y: 180 },
      { id: 'sw1', label: $t('term.report.aggregationswitcha'), type: NODE.switch, status: STATUS.normal, x: 300, y: 315 },
      { id: 'sw2', label: $t('term.report.aggregationswitchb'), type: NODE.switch, status: STATUS.warning, x: 700, y: 315 },
      { id: 'srv1', label: $t('term.report.ticketservice'), type: NODE.server, status: STATUS.normal, x: 165, y: 470 },
      { id: 'srv2', label: $t('term.report.monitorservice'), type: NODE.server, status: STATUS.normal, x: 430, y: 470 },
      { id: 'db', label: $t('term.report.configdb'), type: NODE.database, status: STATUS.critical, x: 630, y: 470 },
      { id: 'term', label: $t('term.report.opsterminal'), type: NODE.terminal, status: STATUS.normal, x: 835, y: 470 }
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
      { id: 'internet', label: $t('term.report.internet'), type: NODE.cloud, status: STATUS.normal, x: 500, y: 70 },
      { id: 'fw1', label: $t('term.report.firewalla'), type: NODE.firewall, status: STATUS.normal, x: 360, y: 180 },
      { id: 'fw2', label: $t('term.report.firewallb'), type: NODE.firewall, status: STATUS.normal, x: 640, y: 180 },
      { id: 'app1', label: $t('term.report.appclustera'), type: NODE.server, status: STATUS.normal, x: 250, y: 325 },
      { id: 'app2', label: $t('term.report.appclusterb'), type: NODE.server, status: STATUS.warning, x: 500, y: 325 },
      { id: 'app3', label: $t('term.report.appclusterc'), type: NODE.server, status: STATUS.normal, x: 750, y: 325 },
      { id: 'db1', label: $t('term.report.primarydb'), type: NODE.database, status: STATUS.normal, x: 375, y: 485 },
      { id: 'db2', label: $t('term.report.standbydb'), type: NODE.database, status: STATUS.offline, x: 625, y: 485 }
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
      { id: 'n1', label: $t('term.report.corea'), type: NODE.switch, status: STATUS.normal, x: 500, y: 75 },
      { id: 'n2', label: $t('term.report.coreb'), type: NODE.switch, status: STATUS.normal, x: 750, y: 160 },
      { id: 'n3', label: $t('term.report.egressrouter'), type: NODE.router, status: STATUS.warning, x: 835, y: 360 },
      { id: 'n4', label: $t('term.report.database'), type: NODE.database, status: STATUS.normal, x: 635, y: 505 },
      { id: 'n5', label: $t('term.report.appservice'), type: NODE.server, status: STATUS.critical, x: 365, y: 505 },
      { id: 'n6', label: $t('term.report.firewall'), type: NODE.firewall, status: STATUS.normal, x: 165, y: 360 },
      { id: 'n7', label: $t('term.report.officenetwork'), type: NODE.terminal, status: STATUS.normal, x: 250, y: 160 }
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
