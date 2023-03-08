<template>
  <div class="notice-setting">
    <div class="list">
      <TsRow>
        <Col span="18">
          <TsFormSelect
            v-model="notifyPolicyConfig.policyId"
            v-bind="notifySelectConfig"
            @on-change="notifySelectChange"
          >
            <template v-slot:first-ul>
              <li class="tsfont-plus text-href first-slot" @click="gotoAddNotify">策略</li>
            </template>
          </TsFormSelect>
        </Col>
        <Col span="6">
          <span class="tsfont-rotate-right notify-icon text-tip-active" title="刷新" @click="refreshNotify(notifyPolicyConfig.policyId,notifyPolicyConfig.paramMappingList) "></span>
          <span
            v-if="notifyPolicyConfig.policyId"
            class="tsfont-edit notify-icon text-tip-active"
            title="编辑"
            @click="editNotify(notifyPolicyConfig.policyId)"
          ></span>
        </Col>
      </TsRow>
      <span v-if="notifyPolicyConfig.policyId" class="text-primary show-text" @click="showNotify()">
        {{ controlShow ? '隐藏已匹配参数' : '显示已匹配参数' }}
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
            <template v-if="notify.paramType == 'array' || notify.paramType == 'string' || notify.paramType == 'number'">
              <TsFormSelect
                ref="notifySelect"
                v-model="notify.value"
                search
                clearable
                filterable
                transfer
                allow-create
                :placeholder="notify.label"
                :data="setNotifyArray(notify.isEditable, notifyIndex, notify.paramType)"
                :dataList="notify.customList"
                @on-create="arrayAddTag($event, notify.customList, notify, notify.paramType === 'number')"
              >
              </TsFormSelect>
            </template>
            <template v-else-if="notify.paramType == 'date'">
              <TimeSelect
                v-model="notify.value"
                type="datetime"
                format="yyyy/MM/dd HH:mm:ss"
                :placeholder="notify.label"
                :data="setNotifyArray(notify.isEditable, notifyIndex, notify.paramType)"
                :dataList="notify.customList"
                style="display:block"
              ></TimeSelect>
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoticeSetting',
  components: {
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
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
    border: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const _this = this;
    return {
      notifyPolicyConfig: {},
      nodePolicyId: '', //选中ID
      conditionNodeList: [], //右边下拉框数据
      paramList: [], //参数列表
      controlShow: false, //是否显示参数
      notifySelectConfig: {
        url: '/api/rest/notify/policy/search',
        filterable: true,
        transfer: true,
        border: 'border',
        valueName: 'id',
        textName: 'name',
        rootName: 'tbodyList',
        params: {handler: this.config.handler}
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
    stopPropagation(event) {
      return false;
    },
    //跳转策略编辑页面
    gotoAddNotify() {
      window.open(HOME + '/framework.html#/notifytactics-overview?addNotify=' + true + '&handler=' + this.config.handler, '_blank');
    },
    refreshNotify(val, dataList) {
      this.$set(this.notifySelectConfig.params, 'time', this.$utils.setUuid());
      if (val) {
        this.notifySelectChange(val, dataList);
      }
      this.$Message.success(this.$t('message.content.executesuccess'));
    },
    //编辑策略
    editNotify(val) {
      window.open(HOME + '/framework.html#/notifytactics-edit?id=' + val, '_blank');
    },
    //通知下拉框选择
    notifySelectChange(val, dataList) { //dataList为原先已经填的参数，主要用来值的回显
      const data = {
        policyId: val,
        needPage: false
      };
      this.$api.framework.tactics.notifyParamList(data).then(res => {
        if (res.Status == 'OK') {
          this.paramList = res.Return.paramList;
          console.log('this.paramList', this.paramList);
          this.controlShow = false;
          // 接口数据赋值 当选择与当前节点的PolicyId相同的下拉框时才赋值
          if (dataList && val == this.nodePolicyId) {
            dataList.forEach(key => {
              this.paramList.forEach(ditem => {
                if (ditem.name == key.name && ditem.paramType == 'date') {
                  let obj = {};
                  if (typeof key.value == 'number') {
                    obj = {
                      startTime: key.value
                    };
                  } else if (typeof key.value == 'string') {
                    obj = {
                      timeRange: key.value
                    };
                  }
                  this.$set(ditem, 'value', obj);
                } else if (ditem.name == key.name) {
                  this.$set(ditem, 'value', key.value);
                }
                //判断隐藏的条件为 右侧下拉框有值 == 参数name && 为系统参数 && 值匹配
                if (ditem.name == key.name && ditem.isEditable == 0 && (ditem.value == ditem.name || ditem.value.timeRange == ditem.name)) {
                  this.$set(ditem, 'isHidden', key.value != '');
                }
              });
            });
            //判断下拉列表中是否有value值相等的字段，没有则添加
            this.$nextTick(() => {
              this.paramList.forEach(ditem => {
                if (ditem.customList) {
                  const KEY = ditem.customList.find(d => d.value == ditem.value);
                  if (!KEY && ditem.value && ditem.paramType != 'date') {
                    const valueObj = {
                      text: ditem.value,
                      value: ditem.value,
                      type: 'constant'
                    };
                    ditem.customList.push(valueObj);
                  }
                }
              });
            });
          }
        }
      });
    },
    //获取array类型下拉列表
    setNotifyArray(val, notifyIndex, type) {
      let list = [];
      //系统参数isEditable = 0
      if (!this.paramList[notifyIndex].customList) {
        this.conditionNodeList.filter(d => d.paramType == type).forEach((node, nindex) => {
          const obj = {
            text: node.label,
            value: node.name,
            type: node.type
          };
          list.push(obj);
        });
        this.$set(this.paramList[notifyIndex], 'customList', list);
        //判断是否是系统参数，如果是系统参数自动匹配对应值
        this.$nextTick(() => {
          this.paramList.forEach(citem => {
            //如果为系统参数并且customList有对应相等的值
            if (citem.isEditable == 0 && citem.customList.find(a => a.value == citem.name) && citem.value == undefined) {
              if (citem.paramType != 'date') {
                citem.value = citem.name;
              } else {
                citem.value = { timeRange: citem.name };
              }
              this.$set(citem, 'isHidden', citem.value != '');
            }
          });
        });
      }
    },
    getConditionNode() {
      let formData = { formUuid: this.formUuid };
      this.notifySelectConfig.params.handler = this.config.handler;
      this.$api.process.process.notifyParam(formData).then(res => {
        if (res.Status == 'OK') {
          this.conditionNodeList = res.Return;
          const dataList = this.config.paramMappingList;
          this.nodePolicyId = this.config.policyId;
          this.notifyPolicyConfig.policyId = this.nodePolicyId;
          this.notifyPolicyConfig.paramMappingList = dataList;
          if (this.nodePolicyId) {
            this.notifySelectChange(this.config.policyId, dataList);
          }
        }
      });
    },
    getParamTypeList() {
      let paramTypeConfig = {};
      if (this.paramList.length && this.conditionNodeList.length) {
        this.paramList.forEach(param => {
          if (!paramTypeConfig[param.paramType]) {
            paramTypeConfig[param.paramType] = this.conditionNodeList.map(item => param.paramType == item.paramList);
          }
        });
      }
      this.paramTypeConfig = paramTypeConfig;
    },
    //显示已匹配参数
    showNotify() {
      this.paramList.map(item => {
        if (!this.controlShow) {
          return (item.isHidden = false);
        } else {
          if (item.value && (item.value == item.name || item.value.timeRange == item.name)) {
            return (item.isHidden = true);
          }
        }
      });
      this.controlShow = !this.controlShow;
    },
    getData() {
      let data = this.$utils.deepClone(this.config);
      let paramMappingList = [];
      if (this.notifyPolicyConfig && this.notifyPolicyConfig.policyId) {
        this.paramList && this.paramList.forEach(citem => {
          let type = '';
          if (citem.value && citem.customList.find(d => d.value == citem.value.timeRange) != undefined) {
            type = citem.customList.find(d => d.value == citem.value.timeRange).type;
          } else if (citem.value && citem.customList.find(d => d.value == citem.value) != undefined) {
            type = citem.customList.find(d => d.value == citem.value).type;
          } else {
            type = 'constant';
          }
          let data = {
            name: citem.name,
            value: citem.value || '',
            type: type || ''
          }; 
          if (citem.paramType != 'date') {
            data.value = citem.value || '';
          } else {
            if (citem.value) {
              //判断值为空的情况
              data.value = citem.value.startTime ? citem.value.startTime : citem.value.timeRange;
            } else {
              data.value = '';
            }
          }

          if (citem.paramType == 'date' && this.$utils.isEmpty(citem.value)) {
            data.value = citem.value.startTime ? citem.value.startTime : citem.value.timeRange;
          } 
          paramMappingList.push(data);
        });
      }
      return Object.assign(data, {
        policyId: this.notifyPolicyConfig.policyId || undefined,
        'paramMappingList': paramMappingList || []
      });
    },
    valid() {
      const validList = [];
      const data = this.getData();
      data.paramMappingList.forEach(item => {
        if (!item.value) {
          validList.push(false);
        }
      });
      if (validList.length > 0) {
        return false;
      } else {
        return true;
      }
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
        if (newVal) {
          this.getConditionNode();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
@import '~@/resources/assets/css/variable.less';
.notice-setting {
  .notify-icon {
    padding-left: @space-xs;
    padding-top: 6px;
    cursor: pointer;
  }
  .show-text {
    margin-top: 8px;
    cursor: pointer;
    display: inline-block;
  }
  .isHidden {
    display: none;
  }
  .list {
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
        position: relative;
        width: 100%;
        height: 40px;
        line-height: 40px;

        .status-left {
          display: inline-block;
          width: 36%;
        }

        .status-center {
          display: inline-block;
          width: 15%;
        }

        .status-right {
          float: right;
          width: 40%;

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
