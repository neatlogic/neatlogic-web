<template>
  <div class="settingList">
  
    <div class="control-box">
      <div class="control-setting">
        <span class="label">
          <span>{{ $t('term.process.actionsetting') }}</span>
          <div v-if="isActive == 1" class="add-btn tsfont-plus click-tag" @click.stop="editAction('add')">{{ $t('page.actions') }}</div>
        </span>
        <span class="control-btn">
          <!-- <span class="tip">{{ isActive ? '自定义' : '引用全局' }}</span> -->
          <i-switch
            v-model="isActive"
            :true-value="1"
            :false-value="0"
            @on-change="changeSwitch"
          ></i-switch>
        </span>
      </div>
      <div>
        <ul v-if="isActive == 1" class="actionlist-ul">
          <li v-for="(action, aindex) in actionsettingList" :key="aindex" class="actionlist-li border-color">
            <div class="title overflow">
              {{ setActiontxt(action.trigger) }}
              <div class="btn-list">
                <i class="tsfont-edit text-action" @click.stop="editAction('edit', action,aindex)"></i>
                <i class="tsfont-close btn-remove" @click.stop="removeAction(aindex)"></i>
              </div>
            </div>
            <div class="contain">
              <div class="form-block">
                <div class="block-left">{{ $t('term.process.externalcall') }}：</div>
                <div class="block-right text">{{ setIntegration(action.integrationUuid) || '-' }}</div>
              </div>
              <div v-if="action.paramMappingList && action.paramMappingList.length > 0" class="form-block">
                <div class="block-left">{{ $t('term.autoexec.paramsvalue') }}：</div>
                <div class="block-right text">
                  <div v-for="(param, pindex) in action.paramMappingList" :key="pindex">{{ param.name }}<span class="text-tip"> = </span>{{ setParam(param.value) }}</div>
                </div>
              </div>
              <div v-if="action.successCondition && action.successCondition.name" class="form-block">
                <div class="block-left">{{ $t('page.successjudgment') }}：</div>
                <div class="block-right text">
                  {{ action.successCondition.name || '-' }}
                  <span class="text-icon">{{ setExpress(action.successCondition.expression) || '-' }}</span>
                  {{ action.successCondition.value || '-' }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <ActionEdit 
      v-if="edittype" 
      :isShow="showEdit" 
      :triggerList="triggerList" 
      :editList="editList" 
      :type="edittype" 
      :integrationHandler="integrationHandler"
      :paraConditionList="paraConditionList"
      @close="updateAction"
    ></ActionEdit>
  </div>
</template>
<script>
export default {
  name: 'ActionSetting', // 动作设置
  components: {
    ActionEdit: resolve => require(['./action/action-edit.vue'], resolve)
  },
  props: {
    actionList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    formConfig: Object,
    handler: String,
    integrationHandler: String,
    defaultIsActive: {
      // 开关是否开启
      type: Number,
      default: 0
    }
  },
  data() {
    let _this = this;
    return {
      isActive: _this.defaultIsActive, //是否打开自定义开关
      actionsettingList: [],
      showEdit: false,
      triggerList: [], //触发条件列表
      edittype: null, //编辑弹窗的类型，add:新增；edit:编辑已有
      editList: [], //编辑弹窗的数据
      integrationList: [], //外部数据源选中列表
      editIndex: null, //当前编辑的数据的索引值
      paraConditionList: [], //流程条件列表
      expressionList: [] //表达式列表
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.actionList && this.actionList.length > 0) {
      this.isActive = 1;
    }
    this.actionsettingList = this.actionList;
    this.getExpressionlist();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editAction(type, data, index) {
      this.showEdit = true;
      this.edittype = type;
      this.editList = this.$utils.deepClone(data) || false;
      this.editIndex = type == 'add' ? null : index;
    },
    updateAction(type, data) {
      if (type) {
        this.$emit('updateaction', type, data, this.editIndex);
      }
      this.edittype = null;
      this.editList = [];
      this.showEdit = false;
    },
    removeAction(index) {
      this.$emit('updateaction', 'remove', null, index);
    },
    getTriggerlist() {
      let param = {
        handler: this.handler
      };
      this.$api.process.process.nodetriggerList(param).then(res => {
        this.$set(this, 'triggerList', res.Return || []);
      });
    },
    getParaConditionList(uuid) {
      //参数条件选择
      let data = {};
      if (uuid) {
        data.formUuid = uuid;
      }
      this.paraConditionList = [];
      this.$api.process.process.processParamList(data).then(res => {
        if (res.Status == 'OK') {
          this.$set(this, 'paraConditionList', res.Return || []);
        }
      });
    },
    getIntegrationList(val) {
      //获取外部数据源选中的列表回显需要的列表
      this.integrationList = [];
      this.$api.process.process.searchIntegration({ defaultValue: val || [] }).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this, 'integrationList', res.Return.tbodyList);
        }
      });
    },
    getExpressionlist() {
      this.$api.process.process.getExpressionlist().then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this, 'expressionList', res.Return);
        }
      });
    },
    changeSwitch(val) {
      this.isActive = val;
      this.$emit('updateActionSetting', val);
    }
  },
  filter: {},
  computed: {
    setActiontxt() {
      return function(val) {
        let txt = '';
        this.triggerList.length > 0 &&
          this.triggerList.forEach(tr => {
            if (tr.trigger == val) {
              txt = tr.triggerName;
            }
          });
        return txt;
      };
    },
    setIntegration() {
      return function(id) {
        let txt = '';
        this.integrationList.length > 0 &&
          this.integrationList.forEach(tr => {
            if (tr.uuid == id) {
              txt = tr.name;
            }
          });
        return txt;
      };
    },
    setExpress() {
      return function(val) {
        let txt = '';
        this.expressionList.length > 0 &&
          this.expressionList.forEach(ex => {
            if (ex.expression == val) {
              txt = ex.expressionName;
            }
          });
        return txt;
      };
    },
    setParam() {
      return function(val) {
        let txt = '-';
        txt = val;
        this.paraConditionList.length > 0 &&
          this.paraConditionList.forEach(pa => {
            if (pa.name == val) {
              txt = pa.label;
            }
          });
        return txt;
      };
    }
  },
  watch: {
    actionList: {
      handler: function(val) {
        this.isActive = !this.$utils.isEmpty(val) ? 1 : 0;
        this.actionsettingList = val || [];
      },
      deep: true
    },
    actionsettingList: {
      handler: function(val) {
        let uuidList = [];
        if (val && val.length > 0) {
          val.forEach(v => {
            uuidList.push(v.integrationUuid);
          });
        }
        if (uuidList.length > 0) {
          this.getIntegrationList(uuidList);
        } else {
          this.$set(this, 'integrationList', []);
        }
      },
      deep: true,
      immediate: true
    },
    'formConfig.uuid': {
      handler: function(val, oldval) {
        this.getParaConditionList(val);
      },
      deep: true,
      immediate: true
    },
    'handler': {
      handler(val) {
        if (val) {
          this.getTriggerlist();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.actionlist-li {
  margin-bottom: 10px;
  border: 1px solid;
  border-radius: 6px;
  .title {
    height: 26px;
    line-height: 26px;
    padding-left: 8px;
    padding-right: 38px;
    position: relative;
    .btn-list {
      position: absolute;
      top: 0;
      right: 4px;
      display: none;
      .btn-remove {
        margin-left: 4px;
        cursor: pointer;
      }
    }
  }
  .contain {
    padding: 4px;
    .form-block {
      margin-bottom: 4px;
      padding-left: 100px;
      .block-left {
        width: 100px;
        line-height: 20px;
        padding-right: 2px;
      }
      .block-right.text {
        line-height: 20px;
      }
    }
  }
  &:hover {
    .btn-list {
      display: block;
    }
  }
}
</style>
