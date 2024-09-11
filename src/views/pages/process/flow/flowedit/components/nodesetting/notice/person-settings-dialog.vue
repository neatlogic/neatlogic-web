<template>
  <div>
    <TsDialog
      :title="$t('term.process.notificationpolicysettings')"
      type="modal"
      width="medium"
      :isShow.sync="isshowDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <Tabs
            v-if="policyId"
            v-model="tabValue"
            class="block-tabs"
            :animated="false"
          >
            <TabPane :label="$t('term.process.triggertiming')" name="triggerTiming">
              <div v-if="!$utils.isEmpty(triggerList)" style="display: flex; width: 100%; flex-wrap: wrap" class="padding">
                <div
                  v-for="item in triggerList"
                  :key="item.trigger"
                  style="display: flex; width: 30%"
                  class="pb-nm"
                >
                  <span class="pr-sm">{{ item.triggerName }}</span>
                  <TsFormSwitch v-model="item.triggerValue" style="width: 100px"></TsFormSwitch>
                </div>
              </div>
              <NoData v-else></NoData>
            </TabPane>
            <TabPane :label="$t('term.process.templateparametermapping')" name="templateParametermapping">
              <div v-if="!$utils.isEmpty(paramList)" class="padding">
                <div
                  v-for="(notify, notifyIndex) in paramList"
                  :key="notifyIndex"
                  class="status-list mb-sm"
                  :class="notify.isHidden ? 'isHidden' : 'isShow'"
                >
                  <span class="status-left overflow" :title="notify.label + '(' + notify.name + ')'">{{ notify.name }}</span>
                  <span class="status-center">
                    <img src="~@/resources/assets/images/itsm/btn-relevance.png" />
                  </span>
                  <span class="status-right" :class="{ 'input-border': border }">
                    <template v-if="notify.type == 'custom'">
                      <TsFormInput v-model="notify.value" :placeholder="notify.label" border="border"></TsFormInput>
                    </template>
                    <TsFormInput
                      v-else
                      :disabled="true"
                      :value="getValueByNotifyName(paramTypeConfig[notify.paramType], notify.name)"
                      border="border"
                    ></TsFormInput>
                  </span>
                </div>
              </div>
              <NoData v-else></NoData>
            </TabPane>
          </Tabs>
          <NoData v-else>
            <div>
              <span v-if="$utils.isUserHasAuth('NOTIFY_POLICY_MODIFY')" class="text-href" @click="gotoAddNotify()">请设置默认通知策略</span>
              <span v-else>没有默认通知策略，请联系管理员</span>
            </div>
          </NoData>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    policyId: {
      // 策略id
      type: [Number, String],
      default: null
    },
    paramMappingList: {
      type: Array,
      default: () => []
    },
    conditionNodeList: {
      type: Array,
      default: () => []
    },
    excludeTriggerList: {
      // 触发时机，隐藏的字段
      type: Array,
      default: () => []
    },
    border: {
      type: String,
      default: 'border'
    }
  },
  data() {
    return {
      loadingShow: true,
      isshowDialog: true,
      controlShow: true, //是否隐藏参数
      tabValue: 'triggerTiming',
      paramList: [],
      paramTypeConfig: {}, //不同参数类型来面可选右边数据
      triggerList: [] // 触发时机列表
    };
  },
  beforeCreate() {},
  created() {
    this.getTactInfo();
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
    okDialog() {
      let saveData = {
        excludeTriggerList: [],
        paramMappingList: []
      };
      this.triggerList.forEach(item => {
        if (item && !item.triggerValue) {
          saveData.excludeTriggerList.push(item.trigger);
        }
      });
      if (this.policyId) {
        this.paramList &&
          this.paramList.forEach(v => {
            let data = {
              name: v.name,
              value: this.getDefaultValue(v),
              type: 'constant'
            };
            let paramItem = this.paramTypeConfig[v.paramType] ? this.paramTypeConfig[v.paramType].find(cc => cc.value == data.value) : null;
            data.type = paramItem ? paramItem.type || data.type : data.type;
            saveData.paramMappingList.push(data);
          });
      }
      this.$emit('close', true, saveData);
    },
    getDefaultValue(obj) {
      let {type = '', name = '', value = ''} = obj || {};
      if (type == 'custom') {
        return value;
      }
      let findItem = this.defaultParamList && this.defaultParamList.find(item => item.name == name);
      if (this.$utils.isEmpty(findItem)) {
        return '';
      }
      if (!this.$utils.isEmpty(findItem.value)) {
        if (findItem.paramType == 'date') {
          return findItem.value.startTime ? findItem.value.startTime : findItem.value.timeRange;
        } else {
          return findItem.value;
        }
      } else {
        return '';
      }
    },
    closeDialog() {
      this.$emit('close', false);
    },
    getTactInfo() {
      // 获取通知策略信息
      let data = {
        id: this.policyId
      };
      this.loadingShow = true;
      if (!this.policyId) {
        this.loadingShow = false;
        return false;
      }
      this.$api.framework.tactics
        .editNotify(data)
        .then(res => {
          if (res.Status == 'OK') {
            let config = (res.Return && res.Return.config) || {};
            if (this.$utils.isEmpty(config)) {
              return false;
            }
            const {triggerList = [], paramList = []} = config;
            this.triggerList = triggerList;
            this.triggerList &&
                this.triggerList.forEach(item => {
                  this.$set(item, 'triggerValue', this.excludeTriggerList.includes(item.trigger) ? 0 : 1); // 有隐藏的值，需要关闭按钮，否则默认按钮全部打开
                });
            this.paramList = paramList;
            if (!this.$utils.isEmpty(this.paramList) && !this.$utils.isEmpty(this.paramMappingList)) {
              let paramMappingData = {};
              this.paramMappingList.forEach(item => {
                if (item.name) {
                  paramMappingData[item.name] = item.value; // 获取模板映射关系回显值
                }
              });
              this.paramList.forEach(item => {
                // 值回显
                if (item.name && paramMappingData[item.name]) {
                  item.value = paramMappingData[item.name];
                }
              });
              this.defaultParamList = this.$utils.deepClone(this.paramList); // 默认参数列表
            }
            this.getParamTypeList();
          }
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    getParamTypeList() {
      //对左侧的条件参数进行分类，方便根据不同的paramType来选中不同的参数值
      let paramTypeConfig = {};
      if (this.paramList.length && this.conditionNodeList.length) {
        this.paramList.forEach(param => {
          if (!paramTypeConfig[param.paramType]) {
            let arr = [];
            this.conditionNodeList.forEach(item => {
              if (param.paramType == item.paramType) {
                arr.push({ text: item.label, value: item.name, paramType: item.paramType, type: item.type });
              }
            });
            paramTypeConfig[param.paramType] = arr;
          }
        });
      }
      this.paramTypeConfig = paramTypeConfig;
    },
    //跳转策略编辑页面
    gotoAddNotify(val) {
      if (val) {
        window.open(HOME + '/framework.html#/notifytactics-edit?id=' + val, '_blank');
      } else {
        window.open(HOME + '/framework.html#/notifytactics-overview', '_blank');
      }
    }
  },
  filter: {},
  computed: {
    getValueByNotifyName() {
      return (dataList, name) => {
        if (this.$utils.isEmpty(dataList)) {
          return '';
        }
        let findItem = dataList.find(item => item.value == name);
        if (findItem) {
          return findItem.text;
        } else {
          return '';
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
.status-list {
  display: flex;
  width: 100%;
  .status-left {
    display: inline-block;
    width: 30%;
  }
  .status-center {
    display: inline-block;
    width: 16%;
  }
  .status-right {
    float: right;
    width: 48%;
  }
}
</style>
