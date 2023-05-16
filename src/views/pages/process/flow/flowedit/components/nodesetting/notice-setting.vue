<template>
  <div class="settingList">
    <div v-if="showTitle" class="control-box">
      <div class="control-setting">
        <span class="label">
          <span>{{ $t('page.noticesetting') }}</span>
          <span class="pl-xs text-href" @click="openPersonSettingDialog">{{ $t('page.personalizationsettings') }}</span>
        </span>
        <span class="control-btn">
          <span
            class="tip text-tip"
          >{{ isActive ==1 ? $t('page.custom'): $t('term.framework.defaultpolicy') }}</span>
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
          </div>
        </div>
      </div>
    </div>
    <PersonSettingsDialog
      v-if="isShowPersonSettingDialog"
      :policyId="notifyPolicyConfig.policyId"
      :border="border"
      :conditionNodeList="conditionNodeList"
      :paramMappingList="notifyPolicyConfig.paramMappingList"
    ></PersonSettingsDialog>
  </div>

</template>

<script>
import itemmixin from '../itemmixin.js';
export default {
  name: 'NoticeSetting',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    PersonSettingsDialog: resolve => require(['./notice/person-settings-dialog'], resolve) // 个性设置
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
    hasGlobal: {// 是否自定义通知设置
      type: Boolean,
      default: false
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
    return {
      isActive: 0,
      notifyPolicyConfig: {},
      nodePolicyId: '', //选中ID
      conditionNodeList: [], //右边下拉框数据
      paramList: [], //参数列表
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
      },
      isShowPersonSettingDialog: false
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
      this.$Message.success(this.$t('message.executesuccess'));
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
          this.notifyPolicyConfig.isCustom = this.config.isCustom; // 是否自定义通知策略
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
        this.notifyPolicyConfig.paramMappingList = [];
      }
      this.$emit('change', this.isActive);
    },
    openPersonSettingDialog() {
      this.isShowPersonSettingDialog = true;
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
