<template>
  <div>
    <TsContain border="border">
      <template slot="top">
        <Button type="primary" @click="saveView()">{{ $t('page.save') }}</Button>
        &nbsp;
        <Button type="primary" @click="toggleStatus()">{{ $t('term.process.changenodestatus') }}</Button>
         &nbsp;
        <Button type="primary" @click="updateLineText()">{{ $t('term.process.changelinename') }}</Button>
        &nbsp;
        <Button type="primary" @click="addNode()">{{ $t('dialog.title.addtarget', {target: $t('page.node')}) }}</Button>
      </template>
      <div slot="content" class="content border-color">
        <div class="middle">
          <div class="middle-main">
            <div class="middle-block bg-block">
              <div ref="topo"></div>
            </div>
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
import '@/views/pages/process/flow/topoComponent/index.js';
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      leftHeight: 0,
      ciTypeList: [], //左边模型类型列表
      ciAttrList: [],
      ciRelList: [],
      topoData: {
        'canvas': {
          'uuid': '5a9bd29525b04a11a2c26199cea6eaa1'
        },
        'nodes': [
          {
            'uuid': '8bC9Kgj4cdY9hEUQcC5NH2ddSCznWiEq',
            'x': 200,
            'y': 360,
            'icon': '#tsfont-solid-circle',
            'fill': 'RGBA(129, 213, 83, .1)',
            'stroke': 'RGBA(129, 213, 83, .1)',
            'class': '',
            'type': 'Start'
          },
          {
            'uuid': '2R9QcQYjn4kXbYURTfRIC3TpiBOc9CJG',
            'x': 1062.0000610351562,
            'y': 360,
            'icon': '#tsfont-solid-circle',
            'fill': 'RGBA(255, 98, 90, .1)',
            'stroke': 'RGBA(255, 98, 90, .1)',
            'class': '',
            'type': 'End'
          },
          {
            'uuid': 'b34ef60f9cf04307bce1d8bb9f694ac1',
            'x': 337,
            'y': 360,
            'icon': '#tsfont-circle-o',
            'class': '',
            'name': '通用1',
            'config': {
              'handler': 'omnipotent',
              'name': '通用1',
              'stepConfig': {
                'workerPolicyConfig': {
                  'isNeedContent': 1,
                  'isRequired': 0,
                  'executeMode': 'batch',
                  'autoStart': 1
                },
                'actionConfig': {
                  'handler': 'neatlogic.framework.process.notify.handler.TaskStepNotifyPolicyHandler',
                  'integrationHandler': '',
                  'actionList': []
                }
              },
              'uuid': 'b34ef60f9cf04307bce1d8bb9f694ac1'
            },
            'type': 'Process'
          },
          {
            'uuid': 'e807798c7d4a46fb86dde8555d273144',
            'x': 473,
            'y': 360,
            'icon': '#tsfont-circle-o',
            'class': '',
            'name': '通用2',
            'config': {
              'handler': 'omnipotent',
              'name': '通用2',
              'stepConfig': {
                'workerPolicyConfig': {
                  'isRequired': 0,
                  'isNeedContent': 1,
                  'executeMode': 'batch',
                  'policyList': [
                    {
                      'name': '由前置步骤处理人指定',
                      'type': 'prestepassign',
                      'isChecked': 0,
                      'config': {
                        'isRequired': 0,
                        'processStepUuidList': []
                      }
                    },
                    {
                      'name': '复制前置步骤处理人',
                      'type': 'copy',
                      'isChecked': 0,
                      'config': {
                        'processStepUuidList': ''
                      }
                    },
                    {
                      'name': '表单值',
                      'type': 'form',
                      'isChecked': 0,
                      'config': {
                        'attributeUuid': ''
                      }
                    },
                    {
                      'name': '分派器',
                      'type': 'automatic',
                      'isChecked': 0,
                      'config': {
                        'handler': '',
                        'handlerConfig': {}
                      }
                    },
                    {
                      'name': '自定义',
                      'type': 'assign',
                      'isChecked': '1',
                      'config': {
                        'workerList': [
                          'processUserType#owner'
                        ]
                      }
                    }
                  ],
                  'defaultWorker': 'user#02cd8afbd4814b80bb6e527da82c07fc',
                  'autoStart': 1
                },
                'actionConfig': {
                  'handler': 'neatlogic.framework.process.notify.handler.TaskStepNotifyPolicyHandler',
                  'integrationHandler': '',
                  'actionList': []
                }
              },
              'uuid': 'e807798c7d4a46fb86dde8555d273144'
            },
            'type': 'Process'
          },
          {
            'uuid': '83a87b5cdad7424a9d8666ca2759787c',
            'x': 762,
            'y': 251,
            'icon': '#tsfont-circle-o',
            'class': '',
            'name': '通用3',
            'config': {
              'handler': 'omnipotent',
              'name': '通用3',
              'stepConfig': {
                'workerPolicyConfig': {
                  'isRequired': 0,
                  'isNeedContent': 1,
                  'executeMode': 'batch',
                  'policyList': [
                    {
                      'name': '由前置步骤处理人指定',
                      'type': 'prestepassign',
                      'isChecked': 0,
                      'config': {
                        'isRequired': 0,
                        'processStepUuidList': []
                      }
                    },
                    {
                      'name': '复制前置步骤处理人',
                      'type': 'copy',
                      'isChecked': 0,
                      'config': {
                        'processStepUuidList': ''
                      }
                    },
                    {
                      'name': '表单值',
                      'type': 'form',
                      'isChecked': 0,
                      'config': {
                        'attributeUuid': ''
                      }
                    },
                    {
                      'name': '分派器',
                      'type': 'automatic',
                      'isChecked': 0,
                      'config': {
                        'handler': '',
                        'handlerConfig': {}
                      }
                    },
                    {
                      'name': '自定义',
                      'type': 'assign',
                      'isChecked': '1',
                      'config': {
                        'workerList': [
                          'user#20f120b897cf11ea94ff005056c00001'
                        ]
                      }
                    }
                  ],
                  'defaultWorker': 'user#02cd8afbd4814b80bb6e527da82c07fc',
                  'autoStart': 1
                },
                'actionConfig': {
                  'handler': 'neatlogic.framework.process.notify.handler.TaskStepNotifyPolicyHandler',
                  'integrationHandler': '',
                  'actionList': []
                },
                'authorityList': [
                  {
                    'action': 'view',
                    'groupList': [
                      'common',
                      'user',
                      'team',
                      'role'
                    ],
                    'text': '查看节点信息',
                    'acceptList': [
                      'common#alluser'
                    ]
                  },
                  {
                    'action': 'transfercurrentstep',
                    'groupList': [
                      'common',
                      'processUserType',
                      'user',
                      'team',
                      'role'
                    ],
                    'text': '转交',
                    'acceptList': [
                      'user#20f2fbfe97cf11ea94ff005056c00001'
                    ]
                  },
                  {
                    'action': 'retreatcurrentstep',
                    'groupList': [
                      'common',
                      'processUserType',
                      'user',
                      'team',
                      'role'
                    ],
                    'text': '撤回',
                    'acceptList': [
                      'processUserType#major'
                    ]
                  }
                ]
              },
              'uuid': '83a87b5cdad7424a9d8666ca2759787c'
            },
            'type': 'Process'
          },
          {
            'uuid': '981d7bb36b384e908157a41340c19426',
            'x': 585,
            'y': 360,
            'icon': '#tsfont-shunt',
            'class': '',
            'name': '分流',
            'config': {
              'handler': 'distributary',
              'name': '分流',
              'stepConfig': {},
              'uuid': '981d7bb36b384e908157a41340c19426'
            },
            'type': 'Converge'
          },
          {
            'uuid': '8e141f8bc2ec450d8a05ec2e93f4b1ae',
            'x': 762,
            'y': 360,
            'icon': '#tsfont-circle-o',
            'class': '',
            'name': '通用4',
            'config': {
              'handler': 'omnipotent',
              'name': '通用4',
              'stepConfig': {
                'workerPolicyConfig': {
                  'isRequired': 0,
                  'isNeedContent': 1,
                  'executeMode': 'batch',
                  'policyList': [
                    {
                      'name': '由前置步骤处理人指定',
                      'type': 'prestepassign',
                      'isChecked': 0,
                      'config': {
                        'isRequired': 0,
                        'processStepUuidList': []
                      }
                    },
                    {
                      'name': '复制前置步骤处理人',
                      'type': 'copy',
                      'isChecked': 0,
                      'config': {
                        'processStepUuidList': ''
                      }
                    },
                    {
                      'name': '表单值',
                      'type': 'form',
                      'isChecked': 0,
                      'config': {
                        'attributeUuid': ''
                      }
                    },
                    {
                      'name': '分派器',
                      'type': 'automatic',
                      'isChecked': 0,
                      'config': {
                        'handler': '',
                        'handlerConfig': {}
                      }
                    },
                    {
                      'name': '自定义',
                      'type': 'assign',
                      'isChecked': '1',
                      'config': {
                        'workerList': [
                          'processUserType#owner'
                        ]
                      }
                    }
                  ],
                  'defaultWorker': 'user#02cd8afbd4814b80bb6e527da82c07fc',
                  'autoStart': 1
                },
                'actionConfig': {
                  'handler': 'neatlogic.framework.process.notify.handler.TaskStepNotifyPolicyHandler',
                  'integrationHandler': '',
                  'actionList': []
                },
                'authorityList': [
                  {
                    'action': 'view',
                    'groupList': [
                      'common',
                      'user',
                      'team',
                      'role'
                    ],
                    'text': '查看节点信息',
                    'acceptList': [
                      'common#alluser'
                    ]
                  },
                  {
                    'action': 'transfercurrentstep',
                    'groupList': [
                      'common',
                      'processUserType',
                      'user',
                      'team',
                      'role'
                    ],
                    'text': '转交',
                    'acceptList': [
                      'user#02cd8afbd4814b80bb6e527da82c07fc'
                    ]
                  },
                  {
                    'action': 'retreatcurrentstep',
                    'groupList': [
                      'common',
                      'processUserType',
                      'user',
                      'team',
                      'role'
                    ],
                    'text': '撤回',
                    'acceptList': [
                      'processUserType#major'
                    ]
                  }
                ]
              },
              'uuid': '8e141f8bc2ec450d8a05ec2e93f4b1ae'
            },
            'type': 'Process'
          },
          {
            'uuid': 'c980b2e65c8b46278964ea1dbde4a7eb',
            'x': 762,
            'y': 478.0000305175781,
            'icon': '#tsfont-circle-o',
            'class': '',
            'name': '通用5',
            'config': {
              'handler': 'omnipotent',
              'name': '通用5',
              'stepConfig': {
                'workerPolicyConfig': {
                  'isRequired': 0,
                  'isNeedContent': 1,
                  'executeMode': 'batch',
                  'policyList': [
                    {
                      'name': '由前置步骤处理人指定',
                      'type': 'prestepassign',
                      'isChecked': 0,
                      'config': {
                        'isRequired': 0,
                        'processStepUuidList': []
                      }
                    },
                    {
                      'name': '复制前置步骤处理人',
                      'type': 'copy',
                      'isChecked': 0,
                      'config': {
                        'processStepUuidList': ''
                      }
                    },
                    {
                      'name': '表单值',
                      'type': 'form',
                      'isChecked': 0,
                      'config': {
                        'attributeUuid': ''
                      }
                    },
                    {
                      'name': '分派器',
                      'type': 'automatic',
                      'isChecked': 0,
                      'config': {
                        'handler': '',
                        'handlerConfig': {}
                      }
                    },
                    {
                      'name': '自定义',
                      'type': 'assign',
                      'isChecked': '1',
                      'config': {
                        'workerList': [
                          'user#20f120b897cf11ea94ff005056c00001'
                        ]
                      }
                    }
                  ],
                  'defaultWorker': 'user#02cd8afbd4814b80bb6e527da82c07fc',
                  'autoStart': 1
                },
                'actionConfig': {
                  'handler': 'neatlogic.framework.process.notify.handler.TaskStepNotifyPolicyHandler',
                  'integrationHandler': '',
                  'actionList': []
                },
                'authorityList': [
                  {
                    'action': 'view',
                    'groupList': [
                      'common',
                      'user',
                      'team',
                      'role'
                    ],
                    'text': '查看节点信息',
                    'acceptList': [
                      'common#alluser'
                    ]
                  },
                  {
                    'action': 'transfercurrentstep',
                    'groupList': [
                      'common',
                      'processUserType',
                      'user',
                      'team',
                      'role'
                    ],
                    'text': '转交',
                    'acceptList': [
                      'user#20f2fbfe97cf11ea94ff005056c00001'
                    ]
                  },
                  {
                    'action': 'retreatcurrentstep',
                    'groupList': [
                      'common',
                      'processUserType',
                      'user',
                      'team',
                      'role'
                    ],
                    'text': '撤回',
                    'acceptList': [
                      'processUserType#major'
                    ]
                  }
                ]
              },
              'uuid': 'c980b2e65c8b46278964ea1dbde4a7eb'
            },
            'type': 'Process'
          },
          {
            'uuid': 'fe4f8ea13bb041e3b546885503ee822d',
            'x': 903,
            'y': 360,
            'icon': '#tsfont-circle-o',
            'class': '',
            'name': '通用6',
            'config': {
              'handler': 'omnipotent',
              'name': '通用6',
              'stepConfig': {
                'workerPolicyConfig': {
                  'isRequired': 0,
                  'isNeedContent': 1,
                  'executeMode': 'batch',
                  'policyList': [
                    {
                      'name': '由前置步骤处理人指定',
                      'type': 'prestepassign',
                      'isChecked': 0,
                      'config': {
                        'isRequired': 0,
                        'processStepUuidList': []
                      }
                    },
                    {
                      'name': '复制前置步骤处理人',
                      'type': 'copy',
                      'isChecked': 0,
                      'config': {
                        'processStepUuidList': ''
                      }
                    },
                    {
                      'name': '表单值',
                      'type': 'form',
                      'isChecked': 0,
                      'config': {
                        'attributeUuid': ''
                      }
                    },
                    {
                      'name': '分派器',
                      'type': 'automatic',
                      'isChecked': 0,
                      'config': {
                        'handler': '',
                        'handlerConfig': {}
                      }
                    },
                    {
                      'name': '自定义',
                      'type': 'assign',
                      'isChecked': '1',
                      'config': {
                        'workerList': [
                          'processUserType#owner'
                        ]
                      }
                    }
                  ],
                  'defaultWorker': 'user#02cd8afbd4814b80bb6e527da82c07fc',
                  'autoStart': 1
                },
                'actionConfig': {
                  'handler': 'neatlogic.framework.process.notify.handler.TaskStepNotifyPolicyHandler',
                  'integrationHandler': '',
                  'actionList': []
                }
              },
              'uuid': 'fe4f8ea13bb041e3b546885503ee822d'
            },
            'type': 'Process'
          }
        ],
        'links': [
          {
            'uuid': '7ydbjWzgnKu7zpbI30LioKWblbyOkCA4',
            'type': 'forward',
            'style': 'soild',
            'name': 'asdadaff',
            'target': 'b34ef60f9cf04307bce1d8bb9f694ac1',
            'source': '8bC9Kgj4cdY9hEUQcC5NH2ddSCznWiEq',
            'tAnchor': {
              'y1': 0,
              'x1': -34,
              'dir': 'L'
            },
            'sAnchor': {
              'y1': 0,
              'x1': 20,
              'dir': 'R'
            }
          },
          {
            'uuid': 'ENhi1bOhb2pma3mEuhXK6mAREC9TIBG3',
            'type': 'forward',
            'style': 'soild',
            'target': 'e807798c7d4a46fb86dde8555d273144',
            'source': 'b34ef60f9cf04307bce1d8bb9f694ac1',
            'tAnchor': {
              'y1': 0,
              'x1': -34,
              'dir': 'L'
            },
            'sAnchor': {
              'y1': 0,
              'x1': 34,
              'dir': 'R'
            }
          },
          {
            'uuid': 'AnShiqcOzbWjNyKu7hLRXWIGEHeWmTOd',
            'type': 'forward',
            'style': 'soild',
            'target': '981d7bb36b384e908157a41340c19426',
            'source': 'e807798c7d4a46fb86dde8555d273144',
            'tAnchor': {
              'y1': 0,
              'x1': -34,
              'dir': 'L'
            },
            'sAnchor': {
              'y1': 0,
              'x1': 34,
              'dir': 'R'
            }
          },
          {
            'uuid': 'Ig3WgQIVmJG0leJUDO3A8cn7k1REAOWs',
            'type': 'forward',
            'style': 'soild',
            'target': '83a87b5cdad7424a9d8666ca2759787c',
            'source': '981d7bb36b384e908157a41340c19426',
            'tAnchor': {
              'y1': 0,
              'x1': -34,
              'dir': 'L'
            },
            'sAnchor': {
              'y1': -34,
              'x1': 0,
              'dir': 'T'
            }
          },
          {
            'uuid': '6GXb6rRl3GacDViNjH8pN8slHERo4BH4',
            'type': 'forward',
            'style': 'soild',
            'target': '8e141f8bc2ec450d8a05ec2e93f4b1ae',
            'source': '981d7bb36b384e908157a41340c19426',
            'tAnchor': {
              'y1': 0,
              'x1': -34,
              'dir': 'L'
            },
            'sAnchor': {
              'y1': 0,
              'x1': 34,
              'dir': 'R'
            }
          },
          {
            'uuid': 'LYh70QXdvITLCF9y5J2D9c3O4YPUM4fa',
            'type': 'forward',
            'style': 'soild',
            'target': 'c980b2e65c8b46278964ea1dbde4a7eb',
            'source': '981d7bb36b384e908157a41340c19426',
            'tAnchor': {
              'y1': 0,
              'x1': -34,
              'dir': 'L'
            },
            'sAnchor': {
              'y1': 34,
              'x1': 0,
              'dir': 'B'
            }
          },
          {
            'uuid': 'SVvMnsTEdxVDZsyY1QtOEQVH6SYPMmZn',
            'type': 'forward',
            'style': 'soild',
            'target': 'fe4f8ea13bb041e3b546885503ee822d',
            'source': '83a87b5cdad7424a9d8666ca2759787c',
            'tAnchor': {
              'y1': -20,
              'x1': 0,
              'dir': 'T'
            },
            'sAnchor': {
              'y1': 0,
              'x1': 34,
              'dir': 'R'
            }
          },
          {
            'uuid': 'svwHwxrJFU4aPhJCXmtwWsaY1bDrRDK9',
            'type': 'forward',
            'style': 'soild',
            'target': 'fe4f8ea13bb041e3b546885503ee822d',
            'source': '8e141f8bc2ec450d8a05ec2e93f4b1ae',
            'tAnchor': {
              'y1': 0,
              'x1': -34,
              'dir': 'L'
            },
            'sAnchor': {
              'y1': 0,
              'x1': 34,
              'dir': 'R'
            }
          },
          {
            'uuid': 'tIggVULKsFcihxfCczgSvKFJ6UjcdkWo',
            'type': 'forward',
            'style': 'soild',
            'target': 'fe4f8ea13bb041e3b546885503ee822d',
            'source': 'c980b2e65c8b46278964ea1dbde4a7eb',
            'tAnchor': {
              'y1': 20,
              'x1': 0,
              'dir': 'B'
            },
            'sAnchor': {
              'y1': 0,
              'x1': 34,
              'dir': 'R'
            }
          },
          {
            'uuid': 'Z6pX2sXO6OqM6MDcpfD91eyysW6NQgyb',
            'type': 'forward',
            'style': 'soild',
            'target': '2R9QcQYjn4kXbYURTfRIC3TpiBOc9CJG',
            'source': 'fe4f8ea13bb041e3b546885503ee822d',
            'tAnchor': {
              'y1': 2.4492935982947065e-15,
              'x1': -20,
              'dir': 'L'
            },
            'sAnchor': {
              'y1': 0,
              'x1': 34,
              'dir': 'R'
            }
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    const width = this.$refs.topo.offsetWidth;
    const height = this.$refs.topo.offsetHeight;
    this.topo = new Topo(this.$refs.topo, {
      'canvas.width': 1000, 
      'canvas.height': 1000,
      'canvas.autoadjust': true, //显示辅助线
      'anchor.size': 4, //连接点大小
      // 'link.deleteable': false,
      // 'link.selectable': false,
      // 'node.selectable': false,
      // 'node.dragable': false,
      // 'node.deleteable': false,
      // 'node.connectable': false,
      'node.selectedFn': (d) => {
        alert(d.getName() + '选中事件');
      },
      'node.unselectFn': (d) => {
        alert(d.getName() + '反选事件');
      },
      'node.removeFn': (d) => {
        alert(d.getName() + '删除事件');
      },
      'link.removeFn': (d) => {
        alert(d.getUuid() + '删除事件');
      }
    });
    this.topo.draw();
    this.topo.fromJson(this.topoData);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: { 
    saveView() {
      console.log(JSON.stringify(this.topo.toJson(), null, 2));
    },
    toggleStatus() {
      this.topoData.nodes.forEach((node, index) => {
        if (node.type === 'Process') {
          if (!node.loadingcolor) {
            node['fill'] = 'green';
            node['loadingcolor'] = '#fff';
          } else {
            node['fill'] = null;
            node['loadingcolor'] = null;
          }
        }
      });
    },
    updateLineText() {
      this.topoData.links.forEach((link, index) => {
        link.name = new Date().getTime();
      });
    },
    addNode() {
      this.topo.addNode({
        'x': 400,
        'y': 460,
        'icon': '#tsfont-solid-circle',
        'fill': 'RGBA(129, 213, 83, .1)',
        'stroke': 'RGBA(129, 213, 83, .1)',
        'type': 'Process'
      });
    },
    checkAttr(attr) {
      if (attr.isChecked) {
        this.drawAttr(attr);
      } else {
        this.removeAttr(attr);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    topoData: {
      handler: function(val) {
        console.log(JSON.stringify(val, null, 2));
      },
      deep: true
    }
  }
};
</script>
<style lang="less" >
</style>
