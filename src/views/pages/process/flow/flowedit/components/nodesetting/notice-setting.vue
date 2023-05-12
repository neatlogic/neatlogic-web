<template>
  <div class="settingList">
    <div v-if="showTitle" class="control-box">
      <div class="control-setting">
        <span class="label">
          <span>{{ $t('page.noticesetting') }}</span>
        </span>
        <span class="control-btn">
          <span
            v-if="hasGlobal && nodeConfig"
            class="tip"
            :class="isActive == 1?'text-tip':'text-href'"
            @click="gotoNodeSetting(isActive == 1,nodeConfig.handler,'inform')"
          >{{ isActive==1?$t('page.custom'):$t('page.referenceglobal') }}</span>
          <i-switch
            v-model="isActive"
            :true-value="1"
            :false-value="0"
            @on-change="changeSwitch"
          ></i-switch>
        </span>
      </div>
    </div>
    <div v-if="isActive == 1" class="permission-list">
      <div class="bg-block " :class="{'notice':showTitle}">
        <div class="notice-setting">
          <div class="list">
            <TsRow>
              <Col span="18">
                <TsFormSelect
                  ref="notifyPolicy"
                  v-model="notifyPolicyConfig.policyId"
                  v-bind="notifySelectConfig"
                  @first="gotoAddNotify()"
                  @on-change="notifySelectChange()"
                >
                </TsFormSelect>
              </Col>
              <Col span="6">
                <span class="tsfont-rotate-right notify-icon text-tip-active" :title="$t('page.refresh')" @click="refreshNotify(notifyPolicyConfig.policyId,notifyPolicyConfig.paramMappingList) "></span>
                <span
                  v-if="notifyPolicyConfig.policyId"
                  class="tsfont-edit notify-icon text-tip-active"
                  :title="$t('page.edit')"
                  @click="gotoAddNotify(notifyPolicyConfig.policyId)"
                ></span>
              </Col>
            </TsRow>
            <span v-if="notifyPolicyConfig.policyId" class="text-primary show-text" @click="showNotify()">
              {{ controlShow ? $t('term.process.showparams'): $t('term.process.hideparams') }}
            </span>
            <div class="wrapper">
              <div
                v-for="(notify,notifyIndex) in paramList"
                :key="notifyIndex"
                class="status-list"
                :class="notify.isHidden ? 'isHidden':'isShow'"
              >
                <span class="status-left overflow" :title="notify.label+'('+notify.name+')'">{{ notify.name }}</span>
                <span class="status-center">
                  <img src="~@/resources/assets/images/itsm/btn-relevance.png" />
                </span>
                <span class="status-right" :class="{ 'input-border': border }">
                  <template v-if="notify.paramType != 'date'">
                    <TsFormSelect
                      ref="notifySelect"
                      v-model="notify.value"
                      search
                      clearable
                      filterable
                      transfer
                      allow-create
                      :placeholder="notify.label"
                      :dataList="paramTypeConfig[notify.paramType]"
                      border="border"
                    >
                    </TsFormSelect>
                  </template>
                  <template v-else>
                    <TimeSelect
                      v-model="notify.value"
                      type="datetime"
                      format="yyyy/MM/dd HH:mm:ss"
                      :placeholder="notify.label"
                      :dataList="paramTypeConfig[notify.paramType]"
                      style="display:block"
                      border="border"
                    ></TimeSelect>
                  </template>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import itemmixin from '../itemmixin.js';
export default {
  name: 'NoticeSetting',
  components: {
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  mixins: [itemmixin],
  model: {
    prop: 'defaultIsActive',
    event: 'change'
  },
  props: {
    formUuid: {
      type: String || Number,
      default: ''
    },
    config: {
      type: Object,
      default: () => {
        return {};
      }
    },
    handler: String, //搜索通知策略的handler 统一先从config里面取，如果没有才看handler 这个主要是为了兼容实效策略
    hasGlobal: {//是否显示全局引用
      type: Boolean,
      default: true
    },
    defaultIsActive: Number, //是否打开通知设置
    border: {
      type: String,
      default: 'border'
    },
    nodeConfig: {
      type: Object
    },
    showTitle: {//是否显示头部
      type: Boolean,
      default: true
    }
  },
  data() {
    const _this = this;
    return {
      isActive: 0,
      notifyPolicyConfig: {},
      nodePolicyId: '', //选中ID
      conditionNodeList: [], //右边下拉框数据
      paramTypeConfig: {}, //不同参数类型来面可选右边数据
      paramList: [], //参数列表
      controlShow: true, //是否隐藏参数
      firstText: this.$t('term.process.policy'),
      firstLi: true,
      notifySelectConfig: {
        dynamicUrl: '/api/rest/notify/policy/search',
        filterable: true,
        transfer: true,
        border: this.border,
        valueName: 'id',
        textName: 'name',
        rootName: 'tbodyList',
        params: {handler: this.config.handler || this.handler}
      }
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {},

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    //跳转策略编辑页面
    gotoAddNotify(val) {
      if (val) {
        window.open(HOME + '/framework.html#/notifytactics-edit?id=' + val, '_blank');
      } else {
        let handler = this.config.handler || this.handler;
        window.open(HOME + '/framework.html#/notifytactics-overview?addNotify=' + true + '&handler=' + handler, '_blank');
      }
    },
    refreshNotify() { //刷新通知策略
      this.notifyPolicyConfig.paramMappingList = this.getData().paramMappingList;
      this.$refs.notifyPolicy.initDataListByUrl();
      this.notifySelectChange(true);
      this.$Message.success(this.$t('message.executesuccess'));
    },
    notifySelectChange(isFresh) { //初始化通知策略参数     isFresh 代表是否刷新页面
      if (!this.notifyPolicyConfig.policyId) {
        this.paramList = [];
        return;
      }
      let param = {
        id: this.notifyPolicyConfig.policyId
      };
      this.$api.framework.tactics.editNotify(param).then(res => {
        if (res.Status == 'OK') {
          let obj = res.Return;
          this.notifyPolicyConfig.policyName = obj.name;
          this.notifyPolicyConfig.policyPath = obj.path;
        }
      });
      const data = {
        policyId: this.notifyPolicyConfig.policyId,
        needPage: false
      };
      this.$api.framework.tactics.notifyParamList(data).then(res => {
        if (res.Status == 'OK') {
          this.paramList = res.Return.paramList;
          this.controlShow = true;
          this.getParamTypeList();
          this.paramList.forEach(ditem => {
            if (isFresh) {
              this.notifyPolicyConfig.paramMappingList.find(key => {
                if (ditem.name == key.name) {
                  let value = key.value;
                  if (ditem.paramType == 'date' && typeof value == 'number') {
                    value = {startTime: value};
                  } else if (ditem.paramType == 'date' && typeof key.value == 'string') {
                    value = {timeRange: value};
                  }
                  this.$set(ditem, 'value', value);
                  return true;
                }
              });
            } else if (!ditem.isEditable) { //isEditable代表不会自动匹配数据 不会把name复制到value
              ditem.value = ditem.paramType == 'date' ? {timeRange: ditem.name} : ditem.name;
            }
            if (ditem.value && !ditem.isEditable && (ditem.name == ditem.value || ditem.name == ditem.value.timeRange)) { //左边name和value相同时，同时isEditable为0时，需要隐藏这个参数
              this.$set(ditem, 'isHidden', this.controlShow);
            }
          });
        }
      });
    },
    getConditionNode() { //获取参数对应的可选值 条件
      let handler = this.config.handler || this.handler;
      if (!this.config || !handler) {
        return;
      }
      let formData = { formUuid: this.formUuid, notifyPolicyHandler: handler};
      this.notifySelectConfig.params.handler = handler;
      this.$api.process.process.getNotifyPolicyList(formData).then(res => {
        if (res.Status == 'OK') {
          this.conditionNodeList = res.Return.tbodyList || [];
          const dataList = this.config.paramMappingList;
          this.notifyPolicyConfig.policyId = this.config.policyId;
          this.notifyPolicyConfig.paramMappingList = dataList;
          this.notifySelectChange(true);
          this.getParamTypeList();
        }
      });
    },
    getParamTypeList() { //对左侧的条件参数进行分类，方便根据不同的paramType来选中不同的参数值
      let paramTypeConfig = {};
      if (this.paramList.length && this.conditionNodeList.length) {
        this.paramList.forEach(param => {
          if (!paramTypeConfig[param.paramType]) {
            let arr = [];
            this.conditionNodeList.forEach(item => {
              if (param.paramType == item.paramType) {
                arr.push({text: item.label, value: item.name, paramType: item.paramType, type: item.type});
              }
            });
            paramTypeConfig[param.paramType] = arr;
          }
        });
      }
      this.paramTypeConfig = paramTypeConfig;
    },
    showNotify() { //显示已匹配参数
      this.controlShow = !this.controlShow;
      this.paramList.forEach(item => {
        if (item.value && !item.isEditable && (item.name == item.value || item.name == item.value.timeRange)) { //左边name和value相同时，同时isEditable为0时，需要隐藏这个参数
          this.$set(item, 'isHidden', this.controlShow);
        }
      });
    },
    getData() { //获取数据
      let data = this.$utils.deepClone(this.config);
      let paramMappingList = [];
      if (this.notifyPolicyConfig && this.notifyPolicyConfig.policyId) {
        this.paramList && this.paramList.forEach(citem => {
          let data = {
            name: citem.name,
            value: citem.value || '',
            type: 'constant'
          }; 
          let paramItem = this.paramTypeConfig[citem.paramType] ? this.paramTypeConfig[citem.paramType].find(cc => cc.value == citem.value) : null;
          data.type = paramItem ? (paramItem.type || data.type) : data.type;
          if (citem.paramType == 'date' && !this.$utils.isEmpty(citem.value)) { //判断值为空的情况
            data.value = citem.value.startTime ? citem.value.startTime : citem.value.timeRange;
          }
          paramMappingList.push(data);
        });
      }
      return Object.assign(data, {
        policyId: this.notifyPolicyConfig.policyId || undefined,
        policyName: this.notifyPolicyConfig.policyName || undefined,
        policyPath: this.notifyPolicyConfig.policyPath || undefined,
        handler: this.config?.handler ? this.config.handler : this.handler,
        paramMappingList: paramMappingList
      });
    },
    valid() { //校验
      const validList = [];
      const data = this.getData();
      data.paramMappingList.forEach(item => {
        if (!item.value) {
          validList.push(false);
        }
      });
      return !validList.length;
    },
    changeSwitch() {
      if (!this.isActive) {
        this.notifyPolicyConfig.policyId = undefined;
        this.paramList = [];
        this.notifyPolicyConfig.paramMappingList = [];
      }
      this.$emit('change', this.isActive);
    }
  },
  filter: {},
  computed: {},
  watch: {
    formUuid(newVal) {
      this.formUuid = newVal;
      this.getConditionNode();
    },
    config: {
      handler(newVal) {
        this.getConditionNode();
      },
      deep: true,
      immediate: true
    },
    defaultIsActive: {
      handler(val) {
        this.isActive = val;
      },
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
@import '~@/resources/assets/css/variable.less';
.notice-setting {
  .notify-icon {
    line-height: 32px;
    cursor: pointer;
    &:not(:last-of-type){
      padding-right: @space-sm;
    }
  }
  .show-text {
    margin-top: 8px;
    cursor: pointer;
    display: inline-block;
  }
  .isHidden {
    display: none !important;
  }
  .list {
     width: 100%;
    .second-title {
      padding-bottom: 8px;
    }

    .wrapper {
      .text-list {
        position: relative;
        width: 100%;
        line-height: 40px;

        .title {
          // display: inline-block;
          position: absolute;
          text-align: left;

          &.text-right {
            width: 70px;
            text-align: right;
          }
        }

        .text {
          padding-left: 48px;
          display: block;
          line-height: 40px;

          &.custom-select {
            padding-left: 80px;
            width: 94%;
          }
        }
      }

      .status-list {
        display: flex;
        position: relative;
        width: 100%;
        // height: 40px;
        // line-height: 40px;
        padding-top: 10px;
        .status-left {
          display: inline-block;
          width: 36%;
        }

        .status-center {
          display: inline-block;
          width: 16%;
        }

        .status-right {
          float: right;
          width: 48%;

          .ivu-input {
            height: @line-height-chart;
            text-align: center;
          }
        }
      }

      .form-list {
        height: 40px;
        line-height: 40px;
        overflow: hidden;
        position: relative;

        .select-style {
          width: 45%;
          float: left;
        }

        .removePermission {
          cursor: pointer;
          position: absolute;
          right: 0;
          top: 0;

          &:hover {
            color: @default-primary-color;
          }
        }
      }
    }
  }
}
</style>
