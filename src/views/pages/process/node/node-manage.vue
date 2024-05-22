<template>
  <div>
    <Loading :loadingShow="nodeLoading" type="fix"></Loading>
    <TsContain @scroll="scroll">
      <template v-slot:topLeft>
        <TsFormSelect
          v-model="keyword"
          v-bind="selectConfig"
          @on-change="getNodeList"
        ></TsFormSelect>
      </template>
      <template v-slot:topRight>
        <div style="text-align:right"><Button type="primary" :disabled="saving" @click="saveConfig">{{ $t('page.save') }}</Button></div>
      </template>
      <div slot="content" class="content input-border">
        <template v-if="nodeList && nodeList.length>0">
          <div
            v-for="(node, index) in nodeList"
            :id="node.handler"
            :key="index"
            class="panle-contain bg-op"
          >
            <div class="title-left">
              <i :class="['type-icon', node.icon ]"></i>
              {{ node.name }}
            </div>
            <div class="contain-right">
              <div v-if="node.config.authorityList">
                <p class="text-title block-title">
                  <span class="bg-block" :class="{'text-primary':node.handler==nodeType && actionType=='auth'}">{{ $t('page.auth') }}</span>
                  <span class="border-line dividing-color" :class="{'border-primary':node.handler==nodeType && actionType=='auth'}"></span>
                </p>
                <Row class="block-div">
                  <Col
                    v-for="(authority, authorityIndex) in node.config.authorityList"
                    :key="authorityIndex"
                    class="col-span"
                    span="8"
                    style="padding-bottom: 4px;"
                  >
                    <span class="text-grey span-title">{{ authority.text }}</span>
                    <UserSelect
                      v-model="authority.acceptList"
                      :is-change-write="false"
                      :groupList="authority.groupList"
                      transfer
                    ></UserSelect>
                  </Col>
                </Row>
              </div>
              <template v-for="map in mapList">
                <div v-if="node.config[map.value]" :key="map.value">
                  <p class="text-title block-title">
                    <span class="bg-block" :class="{'text-primary':node.handler==nodeType && actionType=='button'}">{{ map.text }}</span>
                    <span class="border-line dividing-color" :class="{'border-primary':node.handler==nodeType && actionType=='button'}"></span>
                  </p>
                  <Row class="block-div">
                    <Col
                      v-for="(custom, customIndex) in node.config[map.value]"
                      :key="customIndex"
                      class="col-span custom-flex"
                      span="8"
                    >
                      <span class="custom-col-2 overflow" :title="custom.text">{{ custom.text }}</span>
                      <span class="custom-col-1">
                        <img src="~@/resources/assets/images/itsm/btn-relevance.png" />
                      </span>
                      <span class="custom-col-3" style="padding-left:10%">
                        <Input v-model="custom.value" :placeholder="custom.text" />
                      </span>
                    </Col>
                  </Row>
                </div>
              </template>

              <!-- <div v-if="node.config.notifyPolicyConfig">
                <p class="text-title block-title">
                  <span class="bg-block">
                    <span class="name" :class="{'text-primary':node.handler==nodeType && actionType=='inform'}">{{ $t('page.notify') }}</span>
                    <span class="select">
                      <TsFormSelect
                        v-model="node.config.notifyPolicyConfig.policyId"
                        v-bind="notifyConfig"
                        :params="{handler:node.config.notifyPolicyConfig.handler,timeUuid:node.timeUuid||null}"
                        @on-change="notifySelectChange(node)"
                      >
                        <template v-slot:first-ul>
                          <li class="tsfont-plus text-href first-slot" @click.stop="gotoAddNotify(node)">{{ $t('page.notificationstrategy') }}</li>
                        </template>
                      </TsFormSelect>
                    </span>
                    <span class="tsfont-rotate-right notify-icon" :title="$t('page.refresh')" @click="refreshNotifyList(node)"></span>
                    <span
                      v-if="node.config.notifyPolicyConfig.policyId"
                      class="tsfont-edit notify-icon"
                      :title="$t('page.edit')"
                      @click="editNotify(node.config.notifyPolicyConfig.policyId)"
                    ></span>
                  </span>
                  <span class="border-line dividing-color notify" :class="{'border-primary':node.handler==nodeType && actionType=='inform'}"></span>
                  <span
                    v-if="node.config.notifyPolicyConfig.policyId"
                    class="text-primary"
                    style="float:right;cursor: pointer;"
                    @click="showNotify(node)"
                  >
                    {{ node.config.notifyPolicyConfig.controlShow ? $t('term.process.hideparams') : $t('term.process.showparams') }}
                  </span>
                </p>
                <div v-if="node.config.notifyPolicyConfig && node.config.notifyPolicyConfig.myParamMappingList && node.config.notifyPolicyConfig.myParamMappingList.length > 0">
                  <Row class="block-div">
                    <Col
                      v-for="(notify,notifyIndex) in node.config.notifyPolicyConfig.myParamMappingList"
                      :key="notifyIndex"
                      class="col-span custom-flex"
                      span="8"
                      :class="notify.isHidden ? 'isHidden':'isShow'"
                    >
                      <span class="custom-col-1 overflow" :title="notify.name + ' ' +notify.label">{{ notify.name }}</span>
                      <span class="custom-col-1">
                        <img src="~@/resources/assets/images/itsm/btn-relevance.png" />
                      </span>
                      <span class="custom-col-2">
                        <template v-if="notify.paramType == 'array' || notify.paramType == 'string' || notify.paramType == 'number'">
                          <TsFormSelect
                            ref="notifySelect"
                            v-model="notify.value"
                            search
                            :clearable="false"
                            filterable
                            transfer
                            allow-create
                            :validateList="validateList"
                            :placeholder="notify.label"
                            :dataList="paramsDataList(node.config.notifyPolicyConfig.handler,notify.paramType)"
                          >
                          </TsFormSelect>
                        </template>

                        <template v-else-if="notify.paramType == 'date'">
                          <TimeSelect
                            ref="timeSelect"
                            v-model="notify.value"
                            :validateList="validateList"
                            type="daterange"
                            format="yyyy/MM/dd HH:mm:ss"
                            :placeholder="notify.label"
                            :dataList="paramsDataList(node.config.notifyPolicyConfig.handler,notify.paramType)"
                          ></TimeSelect>
                        </template>
                      </span>
                    </Col>
                  </Row>
                </div>
              </div> -->
            </div>
          </div>
        </template>
        <div v-else>
          <NoData></NoData>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'NodeManage',
  components: {
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
    // TimeSelect:()=>import('@/resources/components/TimeSelect/TimeSelect'),
  },
  props: [],
  data() {
    return {
      keyword: '',
      nodeLoading: true,
      nodeList: [],
      selectConfig: {
        // 节点名称下拉
        url: '/api/rest/process/step/handler/search',
        rootName: 'stepHandlerList',
        valueName: 'name',
        textName: 'name',
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.nodename')}),
        transfer: true,
        search: true,
        border: 'border'
      },
      // paramTypeConfig: {},
      // triggerList: [], //触发方式列表
      // handlerList: [], //通知方法列表
      // templateList: [], //通知模板列表
      // userList: [], //通知对象模板列表
      // notifyList: [], //策略列表
      // validateList: ['required'],
      // notifyConfig: {
      //   url: '/api/rest/notify/policy/search',
      //   search: true,
      //   clearable: false,
      //   transfer: true,
      //   valueName: 'id',
      //   textName: 'name',
      //   rootName: 'tbodyList'
      // },
      mapList: [{value: 'customButtonList', text: this.$t('term.process.btnmapping')}, {value: 'customStatusList', text: this.$t('term.process.statusmapping')}, {value: 'replaceableTextList', text: this.$t('term.process.othersmapping')}],
      saving: false,
      nodeType: null, //用于从别处过来的时候获取是哪一种节点类型
      actionType: null, //用于从别处过来的时候获取是哪一种参数
      isFinishscroll: true//判断定位到指定节点类型的事件是否完成
    };
  },
  beforeCreate() {},
  created() {

  },
  beforeMount() {},
  async mounted() {
    await this.getNodeList();
    let _this = this;
    if (this.$route.query && Object.keys(this.$route.query).length) {
      this.$route.query.nodeType && (this.nodeType = this.$route.query.nodeType);
      this.$route.query.actionType && (this.actionType = this.$route.query.actionType);
      this.$nextTick(() => {
        if (this.nodeType && this.$el.querySelector('#' + this.nodeType)) {
          _this.$el.querySelector('#' + this.nodeType).scrollIntoView(true);
          _this.isFinishscroll = false;
        }
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getNodeList() {
      let _this = this;
      return this.$api.process.process.getNodeList({ keywork: this.keyword }).then(res => {
        if (res.Status == 'OK') {
          _this.nodeList = res.Return.stepHandlerList;
          _this.nodeList.forEach(async(item) => {
            // if (item.config.notifyPolicyConfig) {
            //   item.config.notifyPolicyConfig.policyId && _this.notifySelectChange(item, true);
            //   item.config.notifyPolicyConfig.handler && await _this.getNotifyPolicyList(item.config.notifyPolicyConfig.handler);
            // }
            // if (!item.config.enableAuthority && item.config.authorityList && item.config.authorityList.length) { //enableAuthority 0:代表是初始化的数据，权限的值需要从默认值中获取，如果是1代表直接从acceptList中拿值
            //   item.config.authorityList.forEach(authority => {
            //     authority.acceptList = [...authority.defaultValue];
            //   });
            // }
            // item.config.enableAuthority = 1;
            if (item.config.authorityList && item.config.authorityList.length) {
              item.config.authorityList.forEach(authority => {
                // acceptList为null代表是初始化数据，用户没有设置过，这是将defaultValue的值赋给acceptList
                // acceptList为[]代表是用户设置为不授权给任何人
                if (authority.acceptList == null) {
                  this.$set(authority, 'acceptList', authority.defaultValue);
                }
              });
            }
          });
          _this.nodeLoading = false;
        }
      });
    },
    getValue(handler) {
      let valueList = [];

      this.nodeList && this.nodeList.forEach((item) => {
        if (handler && item.handler != handler) {
          return;
        }
        // let paramMappingList = [];
        // item.config &&
        //     item.config.notifyPolicyConfig &&
        //     item.config.notifyPolicyConfig.myParamMappingList &&
        //     item.config.notifyPolicyConfig.myParamMappingList.forEach(citem => {
        //       let data = {
        //         name: citem.name,
        //         value: citem.value || '',
        //         type: 'constant'
        //       };
        //       let handler = item.config.notifyPolicyConfig.handler;
        //       let paramItem = this.paramTypeConfig[handler][citem.paramType] ? this.paramTypeConfig[handler][citem.paramType].find(cc => cc.value == citem.value) : null;
        //       data.type = paramItem ? (paramItem.type || data.type) : data.type;
        //       if (citem.paramType == 'date' && !this.$utils.isEmpty(citem.value)) { //判断值为空的情况
        //         data.value = citem.value.startTime ? citem.value.startTime : citem.value.timeRange;
        //       }
        //       paramMappingList.push(data);
        //     });
        let data = {
          handler: item.handler,
          config: Object.assign({}, item.config, {
            authorityList: item.config.authorityList//,
            // notifyPolicyConfig: {
            //   policyId: item.config.notifyPolicyConfig.policyId,
            //   paramMappingList: paramMappingList,
            //   handler: item.config.notifyPolicyConfig.handler
            // }
          })
        };
          //映射字段处理
        this.mapList.forEach(cc => {
          data.config[cc.value] = item.config[cc.value];
        });
        valueList.push(data);
      });
      return valueList;
    },
    valid() {
      let isSubmit = true;
      // this.$refs.timeSelect &&
      //   this.$refs.timeSelect.forEach(a => {
      //     !a.valid() && (isSubmit = false);
      //   });
      // this.$refs.notifySelect &&
      //   this.$refs.notifySelect.forEach(d => {
      //     !d.valid() && (isSubmit = false);
      //   });
      if (!isSubmit) {
        this.$Message.warning(this.$t('form.validate.required', {target: this.$t('page.notificationstrategy')}));
        return;
      }
      return isSubmit;
    },
    saveConfig() {
      let nodeValueList = {
        processStepHandlerList: []
      };
      if (this.valid()) {
        nodeValueList.processStepHandlerList = this.getValue();
        if (!this.saving) {
          this.saving = true;
          this.$api.process.process.saveNode(nodeValueList).then(res => {
            this.saving = false;
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
            }
          }).catch(error => {
            this.saving = false;
            this.$Notice.error({ title: error.data.Message });
          });
        }
      }
    },
    // refreshNotifyList(node) {
    //   this.$set(node, 'timeUuid', this.$utils.setUuid());
    //   node.config.notifyPolicyConfig.paramMappingList = this.getValue(node.handler)[0].config.notifyPolicyConfig.paramMappingList;
    //   this.notifySelectChange(node, true);
    //   setTimeout(() => {
    //     this.$Message.success(this.$t('message.executesuccess'));
    //   });
    // },
    //通知下拉框选择
    // notifySelectChange(node, isFresh) {
    //   let val = node.config.notifyPolicyConfig.policyId;
    //   this.$set(node.config.notifyPolicyConfig, 'controlShow', false);
    //   if (!val) { //通知为空，清空数据
    //     node.config.notifyPolicyConfig.myParamMappingList = [];
    //     node.config.notifyPolicyConfig.paramMappingList = [];
    //     return;
    //   }

    //   const data = {
    //     policyId: val
    //   };
    //   this.$api.framework.tactics.notifyParamList(data).then(res => {
    //     if (res.Status == 'OK') {
    //       this.$set(node.config.notifyPolicyConfig, 'myParamMappingList', res.Return.paramList);
    //       this.$set(node.config.notifyPolicyConfig, 'controlShow', false);
    //       // 接口数据赋值 当选择与当前节点的PolicyId相同的下拉框时才赋值
    //       node.config.notifyPolicyConfig.myParamMappingList.forEach(ditem => {
    //         if (isFresh) {
    //           let dataList = node.config.notifyPolicyConfig.paramMappingList || [];
    //           dataList.find(key => {
    //             if (ditem.name == key.name) {
    //               let value = key.value;
    //               if (ditem.paramType == 'date' && typeof value == 'number') {
    //                 value = {startTime: value};
    //               } else if (ditem.paramType == 'date' && typeof key.value == 'string') {
    //                 value = {timeRange: value};
    //               }
    //               this.$set(ditem, 'value', value);
    //               return true;
    //             }
    //           });
    //         } else if (!ditem.isEditable) { //isEditable代表不会自动匹配数据 不会把name复制到value
    //           ditem.value = ditem.paramType == 'date' ? {timeRange: ditem.name} : ditem.name;
    //         } else {
    //           ditem.value = null;
    //         }
    //         if (ditem.value && !ditem.isEditable && (ditem.name == ditem.value || ditem.name == ditem.value.timeRange)) { //左边name和value相同时，同时isEditable为0时，需要隐藏这个参数
    //           this.$set(ditem, 'isHidden', !node.config.notifyPolicyConfig.controlShow);
    //         }
    //       });
    //     }
    //   });
    // },
    //显示已匹配参数
    // showNotify(node) {
    //   let config = node.config.notifyPolicyConfig;
    //   let controlShow = node.config.notifyPolicyConfig.controlShow;
    //   config && config.myParamMappingList && config.myParamMappingList.forEach(item => {
    //     if (item.value && !item.isEditable && (item.name == item.value || item.name == item.value.timeRange)) { //左边name和value相同时，同时isEditable为0时，需要隐藏这个参数
    //       this.$set(item, 'isHidden', controlShow);
    //     }
    //   });
    //   this.$set(node.config.notifyPolicyConfig, 'controlShow', !controlShow);
    // },
    //跳转策略编辑页面
    // gotoAddNotify(node) {
    //   let handler = node.config.notifyPolicyConfig.handler;
    //   window.open(HOME + '/framework.html#/notifytactics-overview?addNotify=' + true + '&handler=' + handler, '_blank');
    // },
    //编辑策略
    // editNotify(val) {
    //   window.open(HOME + '/framework.html#/notifytactics-edit?id=' + val, '_blank');
    // },
    scroll(e) {
      //一旦滚动，清除从别处带来的定位
      let _this = this;
      if (_this.$el && this.nodeType && _this.$el.querySelector('#' + this.nodeType)) {
        if (_this.$el.querySelector('#' + this.nodeType).offsetTop != e) {
          _this.nodeType = null;
          _this.actionType = null;
        }
      }
    }
    // getNotifyPolicyList(notifyPolicyHandler) { //获取参数对应的可选值
    //   let data = {
    //     notifyPolicyHandler: notifyPolicyHandler
    //   };
    //   return this.$api.process.process.getNotifyPolicyList(data).then(res => {
    //     if (res.Status == 'OK') {
    //       let paramTypeConfig = {};
    //       let tbodyList = res.Return.tbodyList || [];
    //       if (tbodyList.length) {
    //         tbodyList.forEach(param => {
    //           if (!paramTypeConfig[param.paramType]) {
    //             let arr = [];
    //             tbodyList.forEach(item => {
    //               if (param.paramType == item.paramType) {
    //                 arr.push({text: item.label, value: item.name, paramType: item.paramType, type: item.type});
    //               }
    //             });
    //             paramTypeConfig[param.paramType] = arr;
    //           }
    //         });
    //       }
    //       this.$set(this.paramTypeConfig, notifyPolicyHandler, paramTypeConfig);
    //     }
    //   });
    // }
  },
  filter: {},
  computed: {
    // paramsDataList() {
    //   return (handler, type) => {
    //     let dataList = [];
    //     if (this.paramTypeConfig[handler] && this.paramTypeConfig[handler][type]) {
    //       dataList = this.paramTypeConfig[handler][type];
    //     }
    //     return dataList;
    //   };
    // }
  },
  watch: {}
};
</script>

<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';

.content {
  .ivu-input-small {
    height: 24px !important;
    padding: 1px 7px !important;
  }

  .custom-flex {
    display: flex;
    align-items: center;
    padding-bottom: 10px;
    .custom-col-1 {
      flex: 1;
    }

    .custom-col-2 {
      flex: 2;
    }
    .custom-col-3 {
      flex: 3;
    }
  }
  .error-color {
    border-color: @error-color !important;
  }
  .text-href.tsfont-plus-o {
    &::before {
      padding-right: 5px;
    }
  }

  .panle-contain {
    position: relative;
    padding: 14px 14px 14px 150px;
    border-radius: 10px;
    margin-bottom: 12px;

    .block-title {
      position: relative;

      > .bg-block {
        position: relative;
        padding-right: 15px;
        z-index: 1;
        > .name {
          float: left;
          margin-right: 8px;
        }
        > .select {
          float: left;
        }
        .notify-icon {
          padding-left: 8px;
          cursor: pointer;
        }
      }

      > .border-line {
        border-top: 1px solid;
        height: 1px;
        position: absolute;
        left: 0;
        right: 0;
        top: 15px;
        &.notify {
          left: 200px;
          right: 110px;
        }
      }

      line-height: 2.4;
      padding-bottom: 6px;
    }

    .block-div {
      padding-bottom: 16px;
      > .isHidden {
        display: none;
      }
    }

    .title-left {
      position: absolute;
      width: 150px;
      left: 0px;
      padding-top: 50px;
      text-align: center;

      .type-icon {
        display: block;
        line-height: 35px;
        font-size: 20px;

        &::before {
          font-weight: normal;
        }
      }
    }

    .col-span {
      padding-right: 5%;
    }

    .notify-col {
      .notify-btn {
        visibility: hidden;
        opacity: 0.6;
        font-size: 12px;
        padding: 0px 5px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }
      }

      &:hover {
        .notify-btn {
          visibility: visible;
        }
      }
    }

    .span-title {
      line-height: 2;
    }

    .notify-panle {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 2px;
      box-shadow: 0px 0px 4px 0px @default-boxshadow-main;
    }
  }
}

// .list-item {
//   display: inline-block;
//   margin-right: 10px;
// }
// .list-enter-active {
//   transition: all 1s;
// }
// .list-enter-active, .list-leave-active {
//   transition: all 0.5s;
// }
// .list-enter, .list-leave-to {
//   opacity: 0;
//   transform: translateY(30px);
// }
</style>
