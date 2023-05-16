<template>
  <div>
    <TsDialog
      title="通知策略设置"
      type="modal"
      width="medium"
      :isShow.sync="isshowDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Tabs v-model="tabValue" :animated="false" @on-click="changeTab">
            <TabPane label="触发时机" name="triggerTiming">
          
            </TabPane>

            <TabPane label="模板参数映射" name="templateParameter mapping">
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
                      ></TimeSelect>
                    </template>
                  </span>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect'], resolve)
  },
  props: {
    policyId: {
      // 策略id
      type: Number,
      default: null
    },
    paramMappingList: {
      type: Array,
      default: () => ([])
    },
    conditionNodeList: {
      type: Array,
      default: () => ([])
    },
    border: {
      type: String,
      default: 'border'
    }
  },
  data() {
    return {
      isshowDialog: true,
      controlShow: true, //是否隐藏参数
      tabValue: 'triggerTiming',
      paramList: [],
      paramTypeConfig: {} //不同参数类型来面可选右边数据
    };
  },
  beforeCreate() {},
  created() {
    this.getNotifyInfo();
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

    },
    closeDialog() {

    },
    changeTab() {

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
    getNotifyInfo(isFresh) { //初始化通知策略参数     isFresh 代表是否刷新页面
      if (!this.policyId) {
        this.paramList = [];
        return;
      }
      const data = {
        policyId: this.policyId,
        needPage: false
      };
      this.$api.framework.tactics.notifyParamList(data).then(res => {
        if (res.Status == 'OK') {
          this.paramList = res.Return.paramList;
          this.controlShow = true;
          this.getParamTypeList();
          this.paramList.forEach(ditem => {
            if (isFresh) {
              this.paramMappingList.find(key => {
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
