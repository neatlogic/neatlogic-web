<template>
  <div class="catalog-viewprocess">
    iiiiiiiii
    <div class="col-topo bg-op">
      <div ref="topo" class="sitemapMain" style="height:100%"></div>
    </div>
    <div class="col-right-contain dividing-color bg-grey col-contain tsscroll-container">
      <div v-if="slaList.length > 0">
        <div
          v-for="(item, index) in slaList"
          :key="index"
          class="sla_content"
          @mouseenter="slamouseenter(item)"
          @mouseleave="slamouseenter"
        >
          <div class="top">
            <div class="title text-default">
              <span>{{ item.name }}</span>
            </div>
          </div>
          <div class="content">
            <div class="bg-block bg-border-radius">
              <div class="step border-color">
                <span class="title text-grey">{{ $t('term.process.associatedsteps') }}</span>
                <span v-for="(citem, cindex) in item.processStepUuidList" :key="cindex" class="name text-default">{{ correlationList[citem] }}</span>
              </div>

              <div class="step border-color overflow">
                <span class="title text-grey">{{ $t('page.computationrules') }}</span>
                <span :title="getCalculateHandlerName(item.calculateHandler)">{{ getCalculateHandlerName(item.calculateHandler) }}</span>
              </div>
            </div>
            <div v-for="(citem, cindex) in item.calculatePolicyList" :key="cindex" class="condition_wrapper">
              <div class="bg-block bg-border-radius">
                <div v-show="citem.conditionGroupList && citem.conditionGroupList.length > 0" class="condition border-color">
                  <!-- <div class="con_left">
                <div v-if="citem.ruleList.length == '1'" class="left_text">如果</div>
                <div v-else class="left_text" v-html="citem.connectType == 'and' ? '并且' : '或者'"></div>
              </div> -->
                  <div class="con_cli text-grey">
                    <div v-for="(ditem, dindex) in citem.conditionGroupList" :key="dindex" class="group-list">
                      <p v-for="(ccitem, ccindex) in ditem.conditionList" :key="ccindex" class="condition-list">
                        <span v-if="getConditiontValue(ccitem) != ''">
                          <span class="three">{{ conditionShow(ccitem) || '' }}</span>
                          <span style="padding:0 4px">{{ expressionShow(ccitem) || '' }}</span>
                          000000
                          <span
                            :is="handlerType(ccitem.name)"
                            v-model="ccitem.valueList"
                            :config="getselectConfig(ccitem.name)"
                            :readonly="true"
                            style="display: inline-block;"
                          ></span>
                        </span>
                        <TsRow v-show="ditem.conditionList.length-1 > ccindex">
                          <Col span="4">
                          </Col>
                          <Col span="18">
                            <div v-if="ditem.conditionRelList[ccindex]" class="condition-joinType text-primary">
                              {{ getConditionJoinType(ditem.conditionRelList,ccitem,ccindex) }}
                            </div>
                          </Col>
                        </TsRow>
                      </p>
                      <div>
                        <TsRow v-show="citem.conditionGroupList.length-1 >dindex">
                          <Col span="1">
                          </Col>
                          <Col span="20">
                            <div v-if="citem.conditionGroupRelList[dindex]" class="condition-joinType text-primary">
                              {{ getConditionJoinType(citem.conditionGroupRelList,ditem,dindex) }}
                            </div>
                          </Col>
                        </TsRow>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="(citem.enablePriority && citem.priorityList.length > 0) || !citem.enablePriority" class="time">
                  <div v-if="citem.enablePriority">
                    <div v-for="(ccitem, ccindex) in citem.priorityList" :key="ccindex" class="time_block border-color">
                      <span class="title text-grey overflow" :title="getPriorityValue(ccitem.priorityUuid)">{{ getPriorityValue(ccitem.priorityUuid) }}</span>
                      <span class="text-default">{{ ccitem.time }}</span>
                      <span class="text-default">{{ timeArray[ccitem.unit] }}</span>
                    </div>
                  </div>
                  <div v-else>
                    <div class="time_block text-default">
                      <span class="title text-grey">{{ $t('page.effectivenesstime') }}</span>
                      <span>{{ citem.time }}</span>
                      <span>{{ timeArray[citem.unit] }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-show="item.notifyPolicyList && item.notifyPolicyList.length > 0">
            <div class="bg-block bg-border-radius">
              <div v-for="(citem, cindex) in item.notifyPolicyList" :key="cindex" class="notice border-color">
                <div class="condition border-color text-default">
                  <span v-html="citem.expression == 'after' ? $t('page.aftertimeout') : $t('page.beforetimeout')"></span>
                  <span>{{ citem.time }}</span>
                  <span>{{ timeArray[citem.unit] }}</span>
                  <span class="line">—</span>
                  <span class="policyName" :title="getPolicyName(citem.notifyPolicyConfig.policyId)">{{ getPolicyName(citem.notifyPolicyConfig.policyId) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-show="item.transferPolicyList && item.transferPolicyList.length > 0">
            <div class="bg-block bg-border-radius">
              <div v-for="(citem, cindex) in item.transferPolicyList" :key="cindex" class="notice">
                <div class="condition border-color text-default">
                  <span v-html="citem.expression == 'after' ? $t('page.aftertimeout') : $t('page.beforetimeout')"></span>
                  <span>{{ citem.time }}</span>
                  <span>{{ timeArray[citem.unit] }}</span>
                  <span class="line">—</span>
                  <span>{{ $t('page.transfer') }}</span>
                </div>
                <div class="object border-color text-default">
                  <span class="title text-grey">{{ $t('term.process.transferuser') }}</span>
                  <span class="item">
                    <div class="usertxt-ul">
                      <!-- <span class="usertxt-li">
                        {{setUsertxt(citem.transferTo)}}
                      </span> -->
                      <UserSelect
                        v-model="citem.transferTo"
                        :multiple="false"
                        width="100%"
                        :readonly="true"
                        :groupList="['processUserType', 'user', 'team']"
                        class="usertxt-ul"
                      ></UserSelect>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="text-center">
          <span>{{ $t('page.notarget',{target:$t('page.effectivenesstime')}) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '@/views/pages/process/flow/topoComponent/index.js';
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';
import Items from '@/resources/components/FormItems';
export default {
  name: 'CatalogViewprocess',
  components: {
    UserSelect,
    ...Items
  },
  props: {
    uuid: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      calculateHandlerList: [], // 计算规则列表
      slaList: [],
      processConfig: {},
      formAllData: [],
      formDataList: [], //表单数据
      commonDataList: [], //common数据
      formSelectList: [], //表单值选择数组
      expressionList: [], //条件选择数组
      formText: {}, //表单控件显示数组
      userList: [],
      timeArray: {
        day: this.$t('page.day'),
        hour: this.$t('page.hour'),
        minute: this.$t('page.minute')
      },
      correlationList: [],
      canvasNodeList: [],
      selectLeft: [],
      showhandler: [],
      noticeList: [],
      notifyList: []
    };
  },

  beforeCreate() {},

  created() {
    this.getProcess(this.uuid);
    // this.getUserList();
    this.getPriority();
    this.getHandle();
    // this.noticeSerch();
    this.getNotifyList();
    this.getCalculateHandlerList();
  },

  beforeMount() {},

  mounted() {},

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    getCalculateHandlerList() {
      // 获取计算规则列表
      this.$https.post('/api/rest/universal/enum/get', {enumClass: 'neatlogic.framework.process.sla.core.SlaCalculateHandlerFactory'}).then((res) => {
        if (res.Status == 'OK') {
          this.calculateHandlerList = res.Return;
        }
      });
    },
    getCalculateHandlerName(id) {
      // 获取计算规则名称
      let calculateName = '';
      let arr = this.calculateHandlerList;
      if (!this.$utils.isEmpty(arr)) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].value == id) {
            calculateName = arr[i].text;
            break;
          }
        }
      }
      return calculateName;
    },
    //获取策略列表
    getNotifyList() {
      const data = {
        handler: 'neatlogic.module.process.notify.handler.SlaNotifyPolicyHandler',
        needPage: false
      };
      this.$api.framework.tactics.searchNotifyList(data).then(res => {
        if (res.Status == 'OK') {
          this.notifyList = res.Return.tbodyList;
        }
      });
    },
    //获取流程信息
    getProcess(val) {
      let data = {
        uuid: val
      };
      this.$api.process.process.getProcess(data).then(res => {
        if (res.Status == 'OK') {
          let formUuid = res.Return.formUuid;
          let config = res.Return.config;
          this.slaList = config.process.slaList;
          this.canvasNodeList = config.topo.nodes;
          this.getFormItem(formUuid);
          this.processConfig = config;
          this.$nextTick(() => {
            this.initTopo(this.processConfig); //绘制流程图
          });
        }
      });
    },
    //获取流程图
    initTopo(config, action) {
      if (!config) return;
      let data = config;
      var topodata = data.topo || { nodes: startEndNode, links: [] };
      this.$topoVm = new Topo(this.$refs.topo, {
        'canvas.autoadjust': true, //显示辅助线
        'anchor.size': 4, //连接点大小
        'link.deleteable': false,
        'link.selectable': false,
        'node.selectable': false,
        'node.dragable': false,
        'node.deleteable': false,
        'node.connectable': false
      });
      this.$topoVm.draw();
      topodata.links.forEach(link => { link.type = link.dirType || link.type; });
      this.$topoVm.fromJson(JSON.parse(JSON.stringify(topodata)));
      this.$topoVm.center(0);
    },
    getUserList() {
      let data = {};
      this.$api.process.process
        .userList(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.userList = res.Return;
          } else {
            this.$Message.warning({ content: this.$t('message.failed', {target: this.$t('page.authlist')}) });
          }
        });
    },
    //获取关联表单组件
    getFormItem(data) {
      let formData = {
        formUuid: data
      };
      let _this = this;
      this.$api.process.process
        .conditionList(formData)
        .then(res => {
          if (res.Status == 'OK') {
            let plugin = res.Return;
            _this.formDataList = plugin.filter(d => d.type == 'form');
            _this.commonDataList = plugin.filter(d => d.type == 'common');
            if (plugin && plugin.length > 0) {
              plugin.forEach(item => {
                if (item.type == 'common') {
                  item.handler = 'form' + item.controller;
                }
              });
            }
            _this.formAllData = plugin;
          }
        })
        .catch(error => {
          console.log(error);
          // this.$Message.error('获取表单数据失败');
        });
    },
    //获取优先级列表
    getPriority: function() {
      let data = {
        needPage: false
      };
      this.$api.process.priority.search(data).then(res => {
        if (res.Status == 'OK') {
          let priorityList = res.Return.tbodyList;
          this.selectLeft = priorityList;
        }
      });
    },
    //获取动作列表
    getHandle: function() {
      let data = {};
      this.$api.process.notice.getHandle(data).then(res => {
        if (res.Status == 'OK') {
          let list = res.Return;
          this.handlerList = list;
          let newArr = {};
          list.forEach(item => {
            let text = item.text;
            let value = item.value;
            newArr[value] = text;
          });
          this.showhandler = newArr;
        }
      });
    },
    //获取模板
    noticeSerch: function() {
      this.$api.process.notice.templateListForSelect().then(res => {
        if (res.Status == 'OK') {
          this.noticeList = res.Return;
        }
      });
    },
    slamouseenter(item) {
      var uuidList = (item.processStepUuidList && item.processStepUuidList.map(d => d)) || [];
      if (Array.isArray(uuidList)) {
        var nodes = this.$topoVm.getNodes(uuidList);
        this.$topoVm.highlight(uuidList);
        nodes.forEach(vm => {
          vm.highlight && vm.highlight('opacity');
        });
      }
    },
    slamouseleave() {},
    getConditiontValue(obj) {
      let valueList = obj.valueList;
      let key = obj.name;
      let type = obj.type;
      let newValue = null;
      let controller = '';
      this.formAllData.forEach(item => {
        if (item.name == key) {
          controller = item.controller;
        }
      });
      return controller;
    },
    conditionShow(val) {
      let value = val.name;
      let type = val.type;
      let text = '';
      this.formAllData.forEach(item => {
        if (item.name == value) {
          text = item.label;
        }
      });
      return text;
    },
    expressionShow(val) {
      let value = val.name;
      let type = val.type;
      let expression = val.expression;
      let expressionText = '';
      let expressionList = [];
      this.formAllData.forEach(item => {
        if (item.name == value) {
          expressionList = item.expressionList;
        }
      });
      expressionList.forEach(item => {
        if (item.expression == expression) {
          expressionText = item.expressionName;
        }
      });
      return expressionText;
    },
    getConditionJoinType(relList, item, index) {
      //页面条件展示
      let joinText = '';
      let joinType = relList[index].joinType;
      if (joinType == 'or') {
        joinText = this.$t('page.or');
      } else {
        joinText = this.$t('page.and');
      }
      return joinText;
    }
  },

  filter: {},

  computed: {
    setUsertxt() {
      return function(val) {
        let showtxt = '';
        let list = [];
        if (typeof val == 'object') {
          list = val;
        } else {
          list.push(val);
        }
        this.userList.forEach(user => {
          if (user.dataList && user.dataList.length > 0) {
            let userli = user.dataList;
            userli.forEach(uli => {
              for (let i in list) {
                if (uli.value == list[i]) {
                  showtxt += uli.text + '、';
                }
              }
            });
          }
        });
        if (showtxt.charAt(showtxt.length - 1) == '、') {
          showtxt = showtxt.substring(0, showtxt.length - 1);
        }
        return showtxt;
      };
    },
    getPriorityValue() {
      return uuid => {
        let obj = this.selectLeft.find(d => d.uuid == uuid);
        let text = '';
        if (obj != undefined) {
          text = obj.name;
        }
        return text;
      };
    },
    getPolicyName() {
      return function(val) {
        const obj = this.notifyList.find(d => d.id === val);
        if (obj) {
          return obj.name;
        } else {
          return '';
        }
      };
    },
    handlerType() {
      return function(name) {
        let type = 'forminput';
        let selectConfig = this.formAllData.find(d => d.name == name);
        if (selectConfig) {
          type = selectConfig.handler;
        }
        return type;
      };
    },
    getselectConfig() {
      return function(name) {
        let config = {};
        let selectConfig = this.formAllData.find(d => d.name == name);
        if (selectConfig) {
          if (selectConfig.config) {
            this.$set(selectConfig.config, 'sperateText', '、');
          }
          config = selectConfig;
        }
        return config;
      };
    }
  },

  watch: {
    canvasNodeList: {
      handler: function(newVal) {
        let nodeList = newVal.filter(d => d.type !== 'start' && d.type !== 'end' && d.type !== 'converge');
        let newArr = [];
        let textList = {};
        nodeList.forEach(item => {
          let arr = {
            name: item.name,
            uuid: item.uuid
          };
          textList[item.uuid] = item.name;
          newArr.push(arr);
        });
        this.correlationList = textList;
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.catalog-viewprocess {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  .col-topo {
    flex: 1;
  }
  .col-right-contain {
    width: 340px;
    margin-left: @space-md;
    .sla_content {
      overflow: hidden;
      position: relative;
      &:hover {
        .top {
          .title {
            color: @primary-color;
          }
        }
      }
      .top {
        width: 100%;
        height: 32px;
        display: flex;
        align-items: center;
        .operation {
          margin-left: auto;
          > i {
            margin-left: 20px;
            cursor: pointer;
          }
        }
      }
      .content {
        .step {
          height: 40px;
          line-height: 40px;
          border-bottom: 1px solid;
          margin: 0 16px;
          > .title {
            width: 52px;
            padding-right: 12px;
          }
          > .name {
            padding-right: 5px;
          }
        }
        .condition_wrapper {
          position: relative;
          .condition-joinType {
            position: relative;
            width: 60px;
            height: 28px;
            line-height: 28px;
            &:before,
            &:after {
              content: '';
              position: absolute;
              left: 14px;
              width: 0px;
              height: 6px;
              border-left: 1px solid;
              z-index: 9;
            }
            &:before {
              top: 0;
            }
            &:after {
              bottom: 0;
            }
          }
          .condition {
            border-bottom: 1px solid;
            position: relative;
            min-height: 30px;
            margin: 0 16px;
            .con_left {
              width: 64px;
              height: 100%;
              position: absolute;
              display: flex;
              align-items: center;
              justify-content: center;
              .left_text {
                width: 24px;
                height: 24px;
                line-height: 24px;
                text-align: center;
                border-radius: 2px;
                color: @primary-color;
                font-size: @font-size-small;
              }
            }
            .con_cli {
              padding: 8px 0;
              overflow: hidden;
              .group-list {
                position: relative;

                .condition-list {
                  position: relative;
                  .condition-text {
                    width: 100%;
                    border-bottom: 1px solid;
                    display: inline-block;
                  }
                }
              }
              > p {
                > span {
                  padding: 4px 0;
                  display: block;
                  width: 100%;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  .three {
                    padding-right: 4px;
                    display: inline;
                    > .cli {
                      padding-right: 4px;
                    }
                  }
                }
                // &:first-child {
                //   > span {
                //     border: none;
                //   }
                // }
                .usertxt-ul {
                  display: inline-block;
                  position: relative;
                  top: -1px;
                }
              }
              .divider {
                margin: 0;
              }
            }
          }
          .time {
            margin: 0 16px;
            .time_block {
              height: 40px;
              line-height: 40px;
              &:not(:last-child) {
                border-bottom: 1px solid;
              }
              > .title {
                width: 64px;
                display: inline-block;
                padding-right: 12px;
              }
            }
          }
        }
      }
      .notice {
        &:not(:last-child) {
          .condition {
            border-bottom: 1px solid;
          }
        }
        &:first-child {
          margin-top: 8px;
        }
        .condition {
          height: 40px;
          line-height: 40px;
          margin: 0 16px;
          &:not(:last-child) {
            border-bottom: 1px solid;
          }
          > span {
            display: inline-block;
          }
          .line {
            margin: 0 5px;
          }
          .policyName {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 60%;
          }
        }
        .object {
          line-height: 40px;
          margin: 0 16px;
          .title {
            width: 64px;
            display: inline-block;
            padding-right: 12px;
          }
          .item {
            display: inline-block;
            margin-right: 8px;
            position: relative;
            &:not(:last-child) {
              &::before {
                position: absolute;
                bottom: 0;
                right: -14px;
                text-align: center;
                z-index: 2;
                content: '、';
              }
            }
          }
        }
      }
    }
  }
}
</style>
