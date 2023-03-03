var data1 = {
  layout: { layout: 'gather' },
  canvas: {
    x: 100,
    y: 200,
    k: 1.5
  },
  nodes: [
    {
      uuid: '66_10211466-1109-5b1a-aa13-6e2bf00aaa35',
      icon: '324213423阿是的发送到发送到发',
      shape: 'rect',
      ciId: 66,
      ciuuid: '10211466-1109-5b1a-aa13-6e2bf00aaa35'
    },
    {
      uuid: '66_10211466-1109-5b1a-aa13-6e2bf00aaa351',
      type: 'rel',
      icon: '324213423asdfasdfasdfasd',
      shape: 'rect',
      ciId: 66,
      ciuuid: '10211466-1109-5b1a-aa13-6e2bf00aaa35'
    },
    {
      uuid: '3_99229c82-d54f-5a85-a8be-eded559c4b8b',
      shape: 'rect',
      ciId: 3,
      ciuuid: '99229c82-d54f-5a85-a8be-eded559c4b8b'
    },
    {
      icon: '包含VS',
      uuid: '3_r_70_99229c82-d54f-5a85-a8be-eded559c4b8b',
      shape: 'rect',
      ciId: 3,
      ciuuid: '99229c82-d54f-5a85-a8be-eded559c4b8b'
    },
    {
      uuid: '5_ab5dbc01-6b63-5731-938c-89504306a250',
      shape: 'rect',
      ciId: 5,
      ciuuid: 'ab5dbc01-6b63-5731-938c-89504306a250'
    },
    {
      icon: '包含PoolMember',
      uuid: '5_r_73_ab5dbc01-6b63-5731-938c-89504306a250',
      shape: 'rect',
      ciId: 5,
      ciuuid: 'ab5dbc01-6b63-5731-938c-89504306a250'
    },
    {
      icon: '包含PoolMember',
      uuid: '5_r_73_ab5dbc01-6b63-5731-938c-89504306a2501',
      type: 'rel',
      shape: 'rect',
      ciId: 5,
      ciuuid: 'ab5dbc01-6b63-5731-938c-89504306a250'
    },
    {
      uuid: '4_b55854a1-fc54-5082-957a-d6ab9deb826a',
      shape: 'rect',
      ciId: 4,
      ciuuid: 'b55854a1-fc54-5082-957a-d6ab9deb826a'
    },
    {
      icon: 'VS_IP',
      uuid: '4_a_16_b55854a1-fc54-5082-957a-d6ab9deb826a',
      shape: 'rect',
      ciId: 4,
      ciuuid: 'b55854a1-fc54-5082-957a-d6ab9deb826a'
    },
    {
      icon: '生产环境ip',
      uuid: '66_a_492_10211466-1109-5b1a-aa13-6e2bf00aaa35',
      shape: 'rect',
      ciId: 66,
      ciuuid: '10211466-1109-5b1a-aa13-6e2bf00aaa35'
    },
    {
      icon: '包含Pool',
      uuid: '4_r_71_b55854a1-fc54-5082-957a-d6ab9deb826a',
      shape: 'rect',
      ciId: 4,
      ciuuid: 'b55854a1-fc54-5082-957a-d6ab9deb826a'
    },
    {
      uuid: '6_d5a198c5-10c3-11ea-a4f2-00ffd6d75e26',
      shape: 'rect',
      ciId: 6,
      ciuuid: 'd5a198c5-10c3-11ea-a4f2-00ffd6d75e26'
    }
  ],
  links: [
    {
      name: '',
      mode: 'horVertical',
      source: '3_r_70_99229c82-d54f-5a85-a8be-eded559c4b8b',
      target: '4_b55854a1-fc54-5082-957a-d6ab9deb826a'
    },
    {
      name: '包含Pool',
      mode: 'horVertical',
      source: '4_r_71_b55854a1-fc54-5082-957a-d6ab9deb826a',
      target: '5_ab5dbc01-6b63-5731-938c-89504306a250'
    }
  ],
  groups: [
    {
      ciId: 66,
      uuid: '10211466-1109-5b1a-aa13-6e2bf00aaa35',
      isStart: 1,
      contain: ['66_10211466-1109-5b1a-aa13-6e2bf00aaa35', '66_10211466-1109-5b1a-aa13-6e2bf00aaa351', '66_a_492_10211466-1109-5b1a-aa13-6e2bf00aaa35'],
      x: 100,
      y: 200
    },
    {
      ciId: 3,
      uuid: '99229c82-d54f-5a85-a8be-eded559c4b8b',
      contain: ['3_r_70_99229c82-d54f-5a85-a8be-eded559c4b8b', '3_99229c82-d54f-5a85-a8be-eded559c4b8b'],
      x: 300,
      y: 200
    },
    {
      ciId: 5,
      uuid: 'ab5dbc01-6b63-5731-938c-89504306a250',
      contain: ['5_ab5dbc01-6b63-5731-938c-89504306a250', '5_r_73_ab5dbc01-6b63-5731-938c-89504306a250', '5_r_73_ab5dbc01-6b63-5731-938c-89504306a2501'],
      x: 200,
      y: 400
    },
    {
      ciId: 4,
      uuid: 'b55854a1-fc54-5082-957a-d6ab9deb826a',
      contain: ['4_b55854a1-fc54-5082-957a-d6ab9deb826a', '4_a_16_b55854a1-fc54-5082-957a-d6ab9deb826a', '4_r_71_b55854a1-fc54-5082-957a-d6ab9deb826a'],
      x: 500,
      y: 400
    },
    {
      ciId: 6,
      uuid: 'd5a198c5-10c3-11ea-a4f2-00ffd6d75e26',
      contain: ['6_d5a198c5-10c3-11ea-a4f2-00ffd6d75e26'],
      x: 300,
      y: 700
    }
  ]
};

var data2 = {
  layout: { ranker: 'network-tree' },
  nodes: [
    {
      remark: '11',
      icon: '#ts-dev-app',
      uuid: '0fa77dfbebe7f1fb2f19dfe3112e88fc',
      shape: 'rect',
      root: 'true',
      ciName: '信息系统',
      ciEntityId: 39930,
      name: '移动设备管理平台1613121239',
      isShow: true,
      isEdit: true,
      status: 0,
      ru: 1,
      rd: 3
    },
    {
      remark: null,
      icon: '#ts-dev-bars',
      uuid: '00e4dc4429c33ce59b9c066b95b5df15',
      shape: 'rect',
      ciName: '动态文本框',
      ciEntityId: 38563,
      name: null,
      isShow: true,
      isEdit: true,
      ru: 0,
      rd: 1
    },
    {
      remark: '移动设备管理平台1613121239',
      icon: '#ts-dev-app',
      uuid: 'da95d3480225e346b8500c0f399dda16',
      shape: 'rect',
      ciName: '信息系统',
      ciEntityId: 38868,
      name: '移动设备管理平台1613121239',
      isShow: true,
      isEdit: true,
      ru: 2,
      rd: 0
    },
    {
      remark: '移动设备管理平台1613121239',
      icon: '#ts-dev-app',
      uuid: 'bc0a9db3891d4486d96da90cbfa0ebb1',
      shape: 'rect',
      ciName: '信息系统',
      ciEntityId: 39928,
      name: '移动设备管理平台1613121239',
      isShow: true,
      isEdit: true,
      ru: 2,
      rd: 0
    },
    {
      remark: '产品组合管理平台61161111213',
      icon: '#ts-dev-app',
      uuid: '54e830a5095f0e2e3a35b67a53a46a59',
      shape: 'rect',
      ciName: '信息系统',
      ciEntityId: 38867,
      name: '产品组合管理平台61161111213',
      isShow: true,
      isEdit: true,
      ru: 1,
      rd: 0
    },
    {
      remark: '去微軟',
      icon: '#ts-dev-dell',
      uuid: '155b4090e5c212696488a4d2cea275b4',
      shape: 'rect',
      ciName: '事务审计',
      ciEntityId: 39954,
      name: '去微軟',
      isShow: true,
      isEdit: true,
      status: '1',
      ru: 3,
      rd: 4
    },
    {
      remark: '搬迁项目15',
      icon: '#ts-dev-network',
      uuid: 'a54df28f50e78ad378ce4f7887dd8ab1',
      shape: 'rect',
      ciName: '安全设备',
      ciEntityId: 38550,
      name: '搬迁项目15',
      isShow: true,
      isEdit: true,
      ru: 0,
      rd: 2
    },
    {
      remark: '搬迁项目3',
      icon: '#ts-dev-network',
      uuid: '4167c045867df1480d6ea9cd89b2f99f',
      shape: 'rect',
      ciName: '安全设备',
      ciEntityId: 38549,
      name: '搬迁项目3',
      isShow: true,
      isEdit: true,
      ru: 0,
      rd: 2
    },
    {
      remark: '搬迁项目6',
      icon: '#ts-dev-network',
      uuid: '5f952f9912ff5a6eeae2af28af015449',
      shape: 'rect',
      ciName: '安全设备',
      ciEntityId: 38548,
      name: '搬迁项目6',
      isShow: true,
      isEdit: true,
      ru: 0,
      rd: 2
    },
    {
      remark: '192.168.0.33-hostname2',
      icon: '#ts-dev-os',
      uuid: 'f8572798074324965d260fdb3be386b5',
      shape: 'rect',
      ciName: '操作系统',
      ciEntityId: 37817,
      name: '192.168.0.33-hostname2',
      isShow: true,
      isEdit: true,
      ru: 1,
      rd: 0
    },
    {
      remark: '10.5.101.950-qwerqwe',
      icon: '#ts-dev-os',
      uuid: '4b3a94b00fa290a12cad542bb73d1510',
      shape: 'rect',
      ciName: '操作系统',
      ciEntityId: 37793,
      name: '10.5.101.950-qwerqwe',
      isShow: true,
      isEdit: true,
      ru: 1,
      rd: 1
    }
  ],
  links: [
    {
      name: '信息系统',
      mode: 'vertical',
      relation: [1, '信息系统'],
      source: '00e4dc4429c33ce59b9c066b95b5df15',
      target: '0fa77dfbebe7f1fb2f19dfe3112e88fc'
    },
    {
      name: '信息系统2',
      mode: 'vertical',
      relation: [1, '信息系统2'],
      source: '0fa77dfbebe7f1fb2f19dfe3112e88fc',
      target: 'da95d3480225e346b8500c0f399dda16'
    },
    {
      name: '信息系统2',
      mode: 'vertical',
      relation: [1, '信息系统2'],
      source: '0fa77dfbebe7f1fb2f19dfe3112e88fc',
      target: 'bc0a9db3891d4486d96da90cbfa0ebb1'
    },
    {
      name: '信息系统2',
      mode: 'vertical',
      relation: [1, '信息系统2'],
      source: '0fa77dfbebe7f1fb2f19dfe3112e88fc',
      target: '54e830a5095f0e2e3a35b67a53a46a59'
    },
    {
      name: '信息系統',
      mode: 'vertical',
      relation: [1, '信息系統'],
      source: '155b4090e5c212696488a4d2cea275b4',
      target: 'bc0a9db3891d4486d96da90cbfa0ebb1'
    },
    {
      name: '审计',
      mode: 'vertical',
      relation: [3, '审计'],
      source: 'a54df28f50e78ad378ce4f7887dd8ab1',
      target: '155b4090e5c212696488a4d2cea275b4'
    },
    {
      name: '审计',
      mode: 'vertical',
      relation: [1],
      source: '4167c045867df1480d6ea9cd89b2f99f',
      target: '155b4090e5c212696488a4d2cea275b4'
    },
    {
      name: '审计',
      mode: 'vertical',
      relation: [4],
      source: '5f952f9912ff5a6eeae2af28af015449',
      target: '155b4090e5c212696488a4d2cea275b4'
    },
    {
      name: '操作系统',
      mode: 'vertical',
      relation: [2, '操作系统'],
      source: '155b4090e5c212696488a4d2cea275b4',
      target: 'f8572798074324965d260fdb3be386b5'
    },
    {
      name: '操作系统',
      mode: 'vertical',
      relation: [5, '操作系统'],
      source: '155b4090e5c212696488a4d2cea275b4',
      target: '4b3a94b00fa290a12cad542bb73d1510'
    }
  ]
};

export default {
  data1: data1,
  data2
};
