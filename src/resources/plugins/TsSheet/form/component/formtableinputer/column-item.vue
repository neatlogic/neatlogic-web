<template>
  <div class="form-item radius-md" :class="{ 'bg-error-grey': showStatusIcon && (hasDataError || hasConfigError) }">
    <div v-if="(mode === 'edit' || mode === 'editSubform') && !formItem.isContainer" class="editor-mask"></div>
    <div v-if="mode != 'defaultvalue' && mode !== 'condition' && ((formItem.override_config && formItem.override_config.isMask) || (formItem.config && formItem.config.isMask) || currentItemReaction?.currentItemMask)" class="mask">
    </div>
    <div v-if="showStatusIcon && hasConfigError" class="corner-icon">
      <Poptip
        word-wrap
        trigger="hover"
        :title="$t('page.exception')"
        transfer
      >
        <Tag color="error">
          <b>{{ configErrorList.length }}</b>
          个异常
        </Tag>
        <div slot="content">
          <ul>
            <li v-for="(error, index) in configErrorList" :key="index">{{ error.error }}</li>
          </ul>
        </div>
      </Poptip>
    </div>
    <div v-else-if="showStatusIcon && mode === 'edit' && hasReaction" class="corner-icon tsfont-lightning text-warning"></div>
    <div v-else-if="showStatusIcon && hasDataError" class="corner-icon">
      <Poptip
        v-if="isShowErrorMessage"
        word-wrap
        trigger="hover"
        :title="$t('page.exception')"
        transfer
      >
        <Tag color="error" closable @on-close="handleCloseErrorMessage">
          <b>{{ dataErrorList.length }}</b>
          个异常
        </Tag>
        <div slot="content">
          <ul>
            <li v-for="(error, index) in dataErrorList" :key="index">{{ error.error }}</li>
          </ul>
        </div>
      </Poptip>
    </div>
    <div v-if="mode == 'edit'" class="corner-close-icon tsfont-close-o text-tip-active" @mousedown.prevent.stop="$emit('delete')"></div>
    <div v-if="mode == 'edit' && formItem.config && formItem.config.isHide" class="corner-bottom-icon text-grey tsfont-eye-off"></div>
    <template v-if="isShowComponent(formItem)">
      <template v-if="isFormType">
        <component
          :is="formItem.handler"
          v-if="canRenderHandler"
          ref="formItem"
          :style="componentStyle"
          :formItem="formItem"
          :formItemList="formItemList"
          :value="formItemValue"
          :mode="mode"
          :filter="filter"
          :readonly="componentReadonly"
          :disabled="componentDisabled"
          :required="componentRequired"
          :formData="formData"
          :isClearEchoFailedDefaultValue="isClearEchoFailedDefaultValue"
          :isCustomValue="isCustomValue"
          :isClearSpecifiedAttr="isClearSpecifiedAttr"
          :externalData="externalData"
          :rowUuid="rowUuid"
          :extendConfigList="Object.freeze(extendConfigList)"
          :formDataForWatch="formDataForWatch"
          :extraFormItemList="extraFormItemList"
          @setValue="setValue"
          @select="selectFormItem"
          @dropHideComponent="dropHideComponent"
        ></component>
        <div v-else class="text-warning">
          {{ getComponentTip }}
        </div>
      </template>
      <div v-if="formItem.config && formItem.config.description" class="tsfont-info-o text-tip">{{ formItem.config.description }}</div>
    </template>
  </div>
</template>
<script>
import formItems from '@/resources/plugins/TsSheet/form/component/index.js';
import conditionMixin from '@/resources/plugins/TsSheet/form/conditionexpression/condition-mixin.js';
import { REACTION } from '@/resources/plugins/TsSheet/form/reaction/index.js';
import { FORMITEMS } from '@/resources/plugins/TsSheet/form/formitem-list.js';
export default {
  name: '',
  components: {
    ...formItems
  },
  mixins: [conditionMixin],
  inject: [
    'getFormDataForWatch',
    'extraFormItemList',
    'extendConfigList',
    'formItemList',
    'externalData',
    'isClearSpecifiedAttr',
    'isClearEchoFailedDefaultValue',
    'isCustomValue',
    'showStatusIcon',
    'readonly',
    'disabled',
    'mode'
  ],
  props: {
    rowUuid: { type: String }, //行uuid，表格组件引用时需要
    extraUuid: {type: String},
    rowData: {
      type: Object,
      default: () => {}
    },
    reactionData: {
      type: Object,
      default: () => {}
    },
    reactionValueData: {
      type: Object,
      default: () => {}
    },
    expressionData: {
      // 表达式的值
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      configErrorList: [],
      dataErrorList: [],
      isMask: false,
      needWatch: false,
      executeCount: {
        mask: 0,
        hide: 0,
        display: 0,
        readonly: 0,
        disable: 0,
        setvalue: 0,
        emit: 0,
        require: 0,
        allowAdd: 0,
        allowEdit: 0,
        allowDelete: 0
      }, //记录操作执行次数
      isFirstLoad: true, //是否第一次加载，用于比较表单数据新旧值时，第一次触发一次操作
      filter: [], //格式[{column:'矩阵属性uuid',expression:'equal',valueList:["value"]}]
      REACTION: REACTION, //联动规则
      isShowErrorMessage: true,
      reactionFormItemUuidMap: {}, //规格内需要的表单组件值
      currentItemReaction: { //(针对表格组件嵌套子组件)
        currentItemHide: false, //当前组件是否隐藏
        currentItemDisabled: false, //当前组件是否禁用
        currentItemMask: false, //当前组件是否不可见
        currentItemReadonly: false, //当前组件是否只读
        cunrrentRequire: false //
      },
      formItem: {}
    };
  },
  beforeCreate() {},
  created() {
    this.formItem = this.extraFormItemList.find(d => d.uuid === this.extraUuid);
    this.initReactionFormItemUuid();
    this.updateConfig();
    this.initStatus();
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
    updateCurrentRow(reactionData) {
      this.$emit('getCurrentRowData', { reactionData: reactionData, rowData: this.rowData});
    },
    dropHideComponent(event) {
      this.$emit('dropHideComponent', event);
    },
    initReactionFormItemUuid() { //获取规则内用到的表单组件uuid
      this.needWatch = false;
      if (this.reaction) {
        for (let key in this.reaction) {
          if (!this.$utils.isEmpty(this.reaction[key])) {
            this.needWatch = true;
            break;
          }
        }
      }
      if (this.mode === 'read' || this.mode === 'readSubform') {
        if (!this.$utils.isEmpty(this.reactionFormItemUuidMap) || !this.needWatch) {
          return;
        }
        if (this.reaction && !this.$utils.isEmpty(this.reaction)) {
          for (let action in this.reaction) {
            const reaction = this.reaction[action];
            if (action !== 'filter') {
              let ruleList = [];
              if (Array.isArray(reaction)) {
                ruleList = reaction;
              } else {
                ruleList.push(reaction);
              }
              ruleList.forEach(rule => {
                const conditinoGroupList = rule['conditionGroupList'];
                if (conditinoGroupList && conditinoGroupList.length > 0) {
                  for (let i = 0; i < rule['conditionGroupList'].length; i++) {
                    const conditionGroup = rule['conditionGroupList'][i];
                    const conditionList = conditionGroup['conditionList'];
                    if (conditionList && conditionList.length > 0) {
                      for (let j = 0; j < conditionList.length; j++) {
                        const condition = conditionList[j];
                        const uuidList = condition['formItemUuid'].split('#');
                        const formItemUuid = uuidList[0];
                        if (!this.reactionFormItemUuidMap.hasOwnProperty(formItemUuid)) {
                          this.$set(this.reactionFormItemUuidMap, formItemUuid, null);
                        }
                      }
                    }
                  }
                }
              });
            } else {
              const ruleList = reaction['ruleList'];
              if (ruleList && ruleList.length > 0) {
                for (let i = 0; i < reaction['ruleList'].length; i++) {
                  const rule = reaction['ruleList'][i];
                  let list = rule['formItemUuid'].split('#');
                  let ruleFormItemUuid = list[0];
                  if (!this.reactionFormItemUuidMap.hasOwnProperty(ruleFormItemUuid)) {
                    this.$set(this.reactionFormItemUuidMap, ruleFormItemUuid, null);
                  }
                }
              }
            }
          }
        }
        if (!this.$utils.isEmpty(this.reactionFormItemUuidMap) && this.formData) {
          Object.keys(this.reactionFormItemUuidMap).forEach((key) => {
            this.$set(this.reactionFormItemUuidMap, key, this.formData[key]);
          });
        }
        this.executionReaction(this.reactionFormItemUuidMap);
      }
    },
    executionReaction(newVal, oldVal) { //规则
      for (let action in this.reaction) {
        //如果override_config有配置，则相关联动不生效
        const overrideConfig = this.formItem.override_config || {};
        const reaction = this.reaction[action];
        if (!this.$utils.isEmpty(reaction)) {
          let ruleList = [];
          if (Array.isArray(reaction)) {
            ruleList = reaction;
          } else {
            ruleList = [reaction];
          }
          ruleList.forEach(rule => {
            if (this.isConditionDataChange(action, rule, newVal, oldVal, this.formItem.uuid)) {
              const result = this.executeReaction(rule, newVal, oldVal);
              if (this.REACTION[action]) {
                //联动操作
                this.REACTION[action]({ overrideConfig: overrideConfig, reaction: rule, result: result, view: this });
              }
            }
          });
        }
      }
    },
    selectFormItem(formItem) {
      this.$emit('select', formItem);
    },
    //给container添加组件
    addComponent(item) {
      const formItem = this.$refs['formItem'];
      if (formItem) {
        formItem.addComponent(item);
      }
    },
    //初始化组件状态
    initStatus() {
      const { formItem } = this;
      if (this.$utils.isEmpty(formItem?.override_config)) {
        return false;
      }
      const keyList = ['isHide', 'isReadOnly', 'isDisabled', 'isMask', 'isRequired'];
      keyList.forEach((v) => {
        if (formItem.override_config[v]) {
          formItem.config[v] = true;
        }
      });
    },
    handleFilterValue(value, column, formItem = {}) {
      let tmpText, tmpValue;
      let { handler = '', config = {} } = formItem || {};
      let { dataList = [] } = config;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        tmpText = tmpValue = value;
        if (handler == 'formuserselect') {
          tmpText = tmpValue = this.handleUserSelectValue(value);
        } else if (!this.$utils.isEmpty(dataList)) {
          const findData = dataList.find(f => f.value === value);
          tmpText = findData ? findData.text : value;
        }
      } else if (typeof value === 'object') {
        tmpText = value.text;
        tmpValue = value[column];
        if (handler == 'formuserselect') {
          tmpText = this.handleUserSelectValue(tmpText);
          tmpValue = this.handleUserSelectValue(tmpValue);
        } else if (!this.$utils.isEmpty(dataList) && tmpValue) {
          const findData = dataList.find(f => f[column] === tmpValue);
          tmpText = findData ? findData.text : tmpText;
        }
      }
      return { text: tmpText, value: tmpValue };
    },
    handleUserSelectValue(value) {
      // 处理用户下拉组件的值，去掉前缀
      let prefixList = ['user#', 'team#', 'role#'];
      let currentValue = this.$utils.deepClone(value);
      let uuid = '';
      let parts = [];
      prefixList.some(v => {
        if (!this.$utils.isEmpty(currentValue) && currentValue.includes(v)) {
          parts = currentValue.split(v) || [];
          if (parts.length > 1) {
            uuid = parts[1] || '';
            return true;
          }
        }
        return false;
      });
      return uuid;
    },
    isConditionDataChange(action, reaction, newFormData, oldFormData, formItemUuid) {
      if (!newFormData) {
        newFormData = {};
      }
      if (!oldFormData) {
        oldFormData = {};
      }
      if (reaction && !this.$utils.isEmpty(reaction)) {
        if (action !== 'filter') {
          const conditinoGroupList = reaction['conditionGroupList'];
          if (conditinoGroupList && conditinoGroupList.length > 0) {
            for (let i = 0; i < reaction['conditionGroupList'].length; i++) {
              const conditionGroup = reaction['conditionGroupList'][i];
              const conditionList = conditionGroup['conditionList'];
              if (conditionList && conditionList.length > 0) {
                for (let j = 0; j < conditionList.length; j++) {
                  const condition = conditionList[j];
                  const uuidList = condition['formItemUuid'].split('#');
                  const formItemUuid = uuidList[0];
                  if (newFormData[formItemUuid] != oldFormData[formItemUuid]) {
                    return true;
                  } else if (this.isFirstLoad) {
                    this.isFirstLoad = false;
                    return true;
                  }
                }
              }
            }
          } else {
            //如果没有条件，则比较所有数据是否一致
            if (formItemUuid) {
              if (!this.$utils.isSame(newFormData[formItemUuid], oldFormData[formItemUuid])) {
                return true;
              } else if (this.isFirstLoad) {
                this.isFirstLoad = false;
                return true;
              }
            } else {
              if (!this.$utils.isSame(newFormData, oldFormData)) {
                return true;
              } else if (this.isFirstLoad) {
                this.isFirstLoad = false;
                return true;
              }
            }
          }
        } else {
          const ruleList = reaction['ruleList'];
          if (ruleList && ruleList.length > 0) {
            for (let i = 0; i < reaction['ruleList'].length; i++) {
              const rule = reaction['ruleList'][i];
              let list = rule['formItemUuid'].split('#');
              let ruleFormItemUuid = list[0];
              if (!this.$utils.isSame(newFormData[ruleFormItemUuid], oldFormData[ruleFormItemUuid])) {
                return true;
              } else if (this.isFirstLoad) {
                this.isFirstLoad = false;
                return true;
              }
            }
          } else if (this.isFirstLoad) {
            this.isFirstLoad = false;
            return true;
          }
        }
      }
      return false;
    },
    hideFormItem() {
      this.$set(this.formItem.config, 'isHide', true);
      this.currentItemReaction.currentItemHide = true;
    },
    showFormItem() {
      this.$set(this.formItem.config, 'isHide', false);
      this.currentItemReaction.currentItemHide = false;
    },
    //验证配置是否完整
    validConfig() {
      if (this.$refs['formItem']) {
        this.configErrorList = this.$refs['formItem'].validConfigBase();
        if (this.configErrorList && this.configErrorList.length > 0) {
          return this.configErrorList;
        }
      }
      return [];
    },
    //验证数据是否满足校验规则
    async validData(validConifg) {
      this.isShowErrorMessage = true;
      if (this.$refs['formItem']) {
        this.dataErrorList = await this.$refs['formItem'].validDataBase(validConifg);
        if (this.dataErrorList && this.dataErrorList.length > 0) {
          return this.dataErrorList;
        }
      }
      return [];
    },
    setValue(val) {
      this.$emit('change', { value: val, extraUuid: this.extraUuid, row: this.rowData});
    },
    call(name, ...args) {
      const formItem = this.$refs['formItem'];
      if (formItem && formItem[name] && typeof formItem[name] === 'function') {
        formItem[name](...args);
      }
    },
    addExecuteCount(action) {
      if (!this.executeCount.hasOwnProperty(action)) {
        this.executeCount[action] = 0;
      }
      this.executeCount[action] = this.executeCount[action] + 1;
    },
    saveFormExtendConfig() {
      let list = [];
      if (this.$refs['formItem'] && this.$refs['formItem'].saveFormExtendConfig) {
        list = this.$refs['formItem'].saveFormExtendConfig();
      }
      return list;
    },
    updateConfig() {
      if (this.mode === 'edit') {
        //更新配置
        const newFormItem = FORMITEMS.find(d => d.handler === this.formItem.handler && d.category === this.formItem.category);
        if (!newFormItem) {
          return;
        }
        Object.keys(newFormItem).forEach(key => {
          if (!this.formItem.hasOwnProperty(key)) {
            this.$set(this.formItem, key, newFormItem[key]);
          } else if (!this.$utils.isEmpty(newFormItem[key]) && typeof newFormItem[key] === 'object') {
            Object.keys(newFormItem[key]).forEach(subKey => {
              if (!this.formItem[key].hasOwnProperty(subKey)) {
                this.$set(this.formItem[key], subKey, newFormItem[key][subKey]);
              }
            });
          }
        });
      }
    },
    handleCloseErrorMessage() {
      this.isShowErrorMessage = false;
    },
    isExistComponent() {
      let handler = '';
      if (this.formItem.handler === 'formcustom') {
        handler = this.formItem.customName;
      } else {
        handler = this.formItem.handler;
      }
      let component = true;
      if (!handler || !formItems[handler]) {
        component = false;
      }
      return component;
    }
  },
  filter: {},
  computed: {
    componentStyle() {
      return { width: this.mode != 'defaultvalue' ? (this.formItem.config && this.formItem.config.width) || '100%' : '100%' };
    },
    componentReadonly() {
      const configIsReadOnly = this.formItem.config && this.formItem.config.isReadOnly;
      const currentItemReactionIsReadOnly = this.currentItemReaction && this.currentItemReaction.currentItemReadonly;
      return (this.mode != 'defaultvalue' && this.mode != 'condition' ? configIsReadOnly : false) || this.readonly || currentItemReactionIsReadOnly;
    },
    componentDisabled() {
      return (this.mode != 'defaultvalue' && this.mode != 'condition' ? this.formItem.config && this.formItem.config.isDisabled : false) || this.disabled || this.currentItemReaction?.currentItemDisabled;
    },
    componentRequired() {
      const configIsRequired = this.formItem.config && this.formItem.config.isRequired;
      const currentItemReactionIsRequired = this.currentItemReaction && this.currentItemReaction.cunrrentRequire;
      return (this.mode != 'defaultvalue' ? configIsRequired : false) || currentItemReactionIsRequired;
    },
    canRenderHandler() {
      return this.isExistComponent && this.formItem.handler !== 'formcustom';
    },
    isFormType() {
      return (!this.formItem.type || this.formItem.type === 'form');
    },
    getComponentTip() {
      const { label = '', customName = '' } = this.formItem || {};
      const nameParts = customName.split('-');
      const componentName = nameParts.length > 1 ? nameParts[0] : customName;
      return `【${label}(${componentName})】${this.$t('term.framework.componentnoexist')}`;
    },
    reaction() {
      return this.formItem && this.formItem.reaction;
    },
    //由于condition的valueList类型是数组，所以不能直接在script中以字符串的方式复制
    conditionData() {
      return uuid => {
        const conditionData = {};
        if (this.reaction) {
          for (let key in this.reaction) {
            let reactionList = [];
            const reaction = this.reaction[key];
            if (!this.$utils.isEmpty(reaction)) {
              if (!Array.isArray(reaction)) {
                reactionList.push(reaction);
              } else {
                reactionList = this.$utils.deepClone(reaction);
              }
              if (reactionList && reactionList.length > 0) {
                reactionList.forEach(item => {
                  if (item && !this.$utils.isEmpty(item) && item.conditionGroupList) {
                    item.conditionGroupList.forEach(cg => {
                      if (cg.conditionList) {
                        cg.conditionList.forEach(c => {
                          conditionData[c.uuid] = c;
                        });
                      }
                    });
                  }
                });
              }
            }
          }
        }
        return conditionData[uuid];
      };
    },
    //当前控件的值
    formItemValue() {
      const { formItemUuid = '', formData = {} } = this;
      if (formData.hasOwnProperty(formItemUuid)) {
        return formData[formItemUuid];
      }
      return null;
    },
    //是否配置联动
    hasReaction() {
      if (!this.$utils.isEmpty(this.reaction)) {
        for (let action in this.reaction) {
          if (!this.$utils.isEmpty(this.reaction[action])) {
            return true;
          }
        }
      }
      return false;
    },
    hasConfigError() {
      return this.configErrorList && this.configErrorList.length > 0;
    },
    hasDataError() {
      return this.dataErrorList && this.dataErrorList.length > 0;
    },
    isShowComponent() {
      return (formItem) => {
        let isShow = true;
        if (this?.currentItemReaction?.currentItemHide || (formItem && (this.mode === 'read' || this.mode === 'readSubform') && formItem.config && formItem.config.isHide) || formItem.isEditing || (formItem.override_config && formItem.override_config.isHide)) {
          isShow = false;
        }
        return isShow;
      };
    },
    formData() {
      return {...(this.reactionValueData || {}), ...(this.rowData || {}), ...(this.expressionData || {})};
    },
    formItemUuid() {
      return this.formItem && this.formItem.uuid;
    },
    formDataForWatch() {
      return this.getFormDataForWatch();
    }
  },
  watch: {
    reactionData: {
      handler(val, oldVal) {
        if (val && (this.mode === 'read' || this.mode === 'readSubform')) {
          if (!this.$utils.isEmpty(this.reactionFormItemUuidMap) && !this.$utils.isSame(val, this.reactionFormItemUuidMap)) {
            this.executionReaction(val, this.reactionFormItemUuidMap);
            this.reactionFormItemUuidMap = this.$utils.deepClone(val);
            this.isFirstLoad = false;
          }
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/resources/plugins/TsSheet/form-item.less';
</style>
