<template>
  <div class="form-item radius-md" :class="{ 'bg-error-grey': showStatusIcon && (hasDataError || hasConfigError) }">
    <i v-if="isShowComponent && formItem.config && formItem.config.isRequired && !readonly && !formItem.config.isReadOnly" class="require-tip text-error">*</i>
    <!--编辑模式下的非container组件需要增加遮罩屏蔽所有操作，container组件需要接受拖拽组件进去，不需要遮罩-->
    <div v-if="(mode === 'edit' || mode === 'editSubform') && !formItem.isContainer" class="editor-mask"></div>
    <div v-if="mode != 'defaultvalue' && mode !== 'condition' && ((formItem.override_config && formItem.override_config.isMask) || (formItem.config && formItem.config.isMask))" class="mask">
      <!-- <span class="tsfont-eye-off"></span>
      <span class="mask-text text-grey">当前组件不可见</span>-->
    </div>
    <div v-if="showStatusIcon && hasConfigError" class="corner-icon">
      <Poptip
        word-wrap
        trigger="hover"
        :title="$t('page.exception')"
        transfer
      >
        <!--<span class="text-error tsfont-warning-s"></span>-->
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
        <!--<span class="text-error tsfont-danger-s"></span>-->
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
    <div v-if="clearable && mode == 'edit'" class="corner-close-icon tsfont-close-o text-tip-active" @mousedown.prevent.stop="$emit('delete')"></div>
    <div v-if="mode == 'edit' && formItem.config && formItem.config.isHide" class="corner-bottom-icon text-grey tsfont-eye-off"></div>
    <div v-if="needLabel" class="mb-xs">{{ formItem.label }}</div>
    <template v-if="isShowComponent && (!formItem.type || formItem.type === 'form')">
      <component
        :is="formItem.handler"
        v-if="isExistComponent && formItem.handler !== 'formcustom'"
        ref="formItem"
        :style="{ width: mode != 'defaultvalue' ? (formItem.config && formItem.config.width) || '100%' : '100%' }"
        :formItem="formItem"
        :formItemList="formItemList"
        :value="formItemValue"
        :mode="mode"
        :filter="filter"
        :readonly="(mode != 'defaultvalue' && mode != 'condition' ? formItem.config && formItem.config.isReadOnly : false) || readonly"
        :disabled="(mode != 'defaultvalue' && mode != 'condition' ? formItem.config && formItem.config.isDisabled : false) || disabled"
        :required="mode != 'defaultvalue' ? formItem.config && formItem.config.isRequired : false"
        :formData="formData"
        :readonlyTextIsHighlight="readonlyTextIsHighlight"
        :isClearEchoFailedDefaultValue="isClearEchoFailedDefaultValue"
        :isCustomValue="isCustomValue"
        :isClearSpecifiedAttr="isClearSpecifiedAttr"
        :externalData="externalData"
        :rowUuid="rowUuid"
        @setValue="setValue"
        @resize="$emit('resize')"
        @select="selectFormItem"
      ></component>
      <component
        :is="formItem.customName"
        v-else-if="isExistComponent && formItem.handler === 'formcustom'"
        ref="formItem"
        :style="{ width: mode != 'defaultvalue' ? (formItem.config && formItem.config.width) || '100%' : '100%' }"
        :formItem="formItem"
        :formItemList="formItemList"
        :value="formItemValue"
        :mode="mode"
        :filter="filter"
        :readonly="(mode != 'defaultvalue' && mode != 'condition' ? formItem.config && formItem.config.isReadOnly : false) || readonly"
        :disabled="(mode != 'defaultvalue' && mode != 'condition' ? formItem.config && formItem.config.isDisabled : false) || disabled"
        :required="mode != 'defaultvalue' ? formItem.config && formItem.config.isRequired : false"
        :formData="formData"
        :readonlyTextIsHighlight="readonlyTextIsHighlight"
        :isClearEchoFailedDefaultValue="isClearEchoFailedDefaultValue"
        :isCustomValue="isCustomValue"
        :isClearSpecifiedAttr="isClearSpecifiedAttr"
        :externalData="externalData"
        @setValue="setValue"
        @resize="$emit('resize')"
        @select="selectFormItem"
        @setExtendValue="setExtendValue"
      ></component>
      <div v-else class="text-warning">{{ $t('page.commercialcomponent') }}</div>
    </template>
    <CustomItem
      v-else-if="isShowComponent && formItem.type === 'custom'"
      ref="formItem"
      :style="{ width: (formItem.config && formItem.config.width) || '100%' }"
      :formItem="formItem"
      :formItemList="formItemList"
      :customFormItem="customFormItem"
      :value="formItemValue"
      :mode="mode"
      :filter="filter"
      :readonly="(mode != 'defaultvalue' ? formItem.config && formItem.config.isReadOnly : false) || readonly"
      :disabled="(mode != 'defaultvalue' ? formItem.config && formItem.config.isDisabled : false) || disabled"
      :readonlyTextIsHighlight="readonlyTextIsHighlight"
      :isClearSpecifiedAttr="isClearSpecifiedAttr"
      :externalData="externalData"
      @setValue="setValue"
      @resize="$emit('resize')"
      @select="selectFormItem"
    ></CustomItem>
    <div v-if="isShowComponent && formItem.config && formItem.config.description" class="tsfont-info-o text-tip">{{ formItem.config.description }}</div>
  </div>
</template>
<script>
import formItems from './form/component/index.js';
import conditionMixin from './form/conditionexpression/condition-mixin.js';
import { REACTION } from './form/reaction/index.js';
import { FORMITEMS } from './form/formitem-list.js';
export default {
  name: '',
  components: {
    ...formItems,
    CustomItem: () => import('./form/component/customitem.vue')
  },
  inject: {
    enqueueReaction: {
      from: 'enqueueReaction',
      default: null
    }
  },
  mixins: [conditionMixin],
  props: {
    needLabel: { type: Boolean, default: false }, //是否需要展示label，一般用在移动端或子组件
    showStatusIcon: { type: Boolean, default: true }, //是否显示异常等状态图标，在TsSheet中引用时才需要，否则布局会有问题
    mode: { type: String, default: 'edit' }, //表单的模式edit或read或condition或defaultvalue,edit模式才会显示异常、联动等辅助图标
    formItem: { type: Object },
    formItemList: { type: Array }, //所有表单组件列表，用于filter联动
    value: { type: [Object, Array, String, Number] }, //当前表单组件的值
    formData: { type: Object }, //所有表单控件的值，用于联动时监听其他组件的数据，不传入这个参数不会激活监听
    customFormItem: { type: Object }, //测试时直接从外部传入的组件数据
    clearable: { type: Boolean, default: true },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    formHighlightData: {
      type: Object,
      default: function() {
        return {};
      }
    },
    isClearEchoFailedDefaultValue: {
      // 默认值对应不上下列列表时，是否需要清空默认值
      type: Boolean,
      default: false
    },
    isCustomValue: {
      // 是否自定义值，单个字符串(value:1)可以自定义返回{text:1,value:1}，数组[1]可以自定义返回[{text:1,value:1}]
      type: Boolean,
      default: false
    },
    formExtendData: {
      type: Object,
      default: () => {}
    },
    isEnableDefaultValue: {
      //默认启用组件赋值(应用在工单详情页，用户无流转权限，设为false)
      type: Boolean,
      default: true
    },
    isClearSpecifiedAttr: {
      //工单权限用户编辑表单时，需要清除表单设置的只读，禁用，隐藏等规则属性
      type: Boolean,
      default: false
    },
    externalData: {
      // 外部数据，非表单数据，例如工单上报人数据等
      type: Object,
      default: () => {}
    },
    rowUuid: { type: String } //行uuid，表格组件引用时需要
  },
  data() {
    return {
      componentUuid: this.$utils.setUuid(),
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
      isShowErrorMessage: true
    };
  },
  beforeCreate() {},
  created() {
    this.updateConfig();
    this.initStatus();
    this.initReactionWatch();
  },
  beforeMount() {},
  mounted() {
    // if (this.mode === 'edit') {
    this.$emit('resize');
    // }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
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
      if (!this.$utils.isEmpty(this.formItem.override_config)) {
        if (this.formItem.override_config.isHide) {
          this.formItem.config.isHide = true;
        }
        if (this.formItem.override_config.isReadOnly) {
          this.formItem.config.isReadOnly = true;
        }
        if (this.formItem.override_config.isDisabled) {
          this.formItem.config.isDisabled = true;
        }
        if (this.formItem.override_config.isMask) {
          this.formItem.config.isMask = true;
        }
        if (this.formItem.override_config.isRequired) {
          this.formItem.config.isRequired = true;
        }
      }
    },
    //根据联动配置初始化watch
    initReactionWatch() {
      if (this.mode === 'read' || this.mode === 'readSubform') {
        this.needWatch = false;
        if (this.formItem.reaction) {
          for (let key in this.formItem.reaction) {
            if (!this.$utils.isEmpty(this.formItem.reaction[key])) {
              this.needWatch = true;
              break;
            }
          }
        }
        if (this.needWatch && this.formData) {
          this.$watch(
            'formDataForWatch',
            (newValue, oldValue) => {
              this.enqueueReaction(this.componentUuid, () => {
                // console.log('开始单个处理');
                const newVal = newValue && JSON.parse(newValue);
                const oldVal = oldValue && JSON.parse(oldValue);
                for (let action in this.formItem.reaction) {
                  //如果override_config有配置，则相关联动不生效
                  const overrideConfig = this.formItem.override_config || {};
                  const reaction = this.formItem.reaction[action];
                  if (reaction && !this.$utils.isEmpty(reaction) && this.isConditionDataChange(action, reaction, newVal, oldVal, this.formItem.uuid)) {
                    const result = this.executeReaction(reaction, newVal, oldVal);
                    if (this.REACTION[action]) {
                      //联动操作
                      this.REACTION[action]({ overrideConfig: overrideConfig, reaction: reaction, result: result, view: this });
                    }
                  }
                }
                if (this.formItem.config && this.formItem.config.isHide && this.formItem.config.isRequired) {
                  // 拿到隐藏+必填表单uuid
                  this.$emit('updateHiddenComponentList', newVal, this.formItem.uuid);
                }
                //此语句移到了TsSheet的executeReaction方法中，批量执行完毕后再强制重绘
                //this.$forceUpdate();
              });
            },
            { immediate: true } //组件设置默认值时，联动需要立即执行一次
          );
        }
      }
    },
    handleFilterValue(value, column, formItem = {}) {
      let tmpText, tmpValue;
      let { handler = '', config = {} } = formItem || {};
      let { dataList = [] } = config;
      if (typeof value === 'string') {
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
    //检查条件涉及的值是否发生变化，如果没变化则不触发联动
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
    },
    showFormItem() {
      this.$set(this.formItem.config, 'isHide', false);
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
      //formData不一定会提供，例如在联动设置中就不会传入formData，只有在表单正式使用过程中才会有formData
      if (this.formData) {
        this.$set(this.formData, this.formItem.uuid, val);
      }
      this.$emit('change', val);
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
    setExtendValue(val) {
      if (this.formExtendData) {
        this.$set(this.formExtendData, this.formItem.uuid, val);
      }
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
    }
  },
  filter: {},
  computed: {
    //如果reaction直接监听formData，由于都是同一个对象，所以watch无法获取前后值变化，需要用此计算属性转换一下数据
    formDataForWatch() {
      if (this.needWatch && this.formData) {
        const str = JSON.stringify(this.formData);
        // console.log('formDataForWatch', new Date());
        return str;
      }
      return null;
    },
    //由于condition的valueList类型是数组，所以不能直接在script中以字符串的方式复制
    conditionData() {
      return uuid => {
        const conditionData = {};
        if (this.formItem.reaction) {
          for (let key in this.formItem.reaction) {
            const reaction = this.formItem.reaction[key];
            if (reaction && !this.$utils.isEmpty(reaction) && reaction.conditionGroupList) {
              reaction.conditionGroupList.forEach(cg => {
                if (cg.conditionList) {
                  cg.conditionList.forEach(c => {
                    conditionData[c.uuid] = c;
                  });
                }
              });
            }
          }
        }
        return conditionData[uuid];
      };
    },
    //当前控件的值
    formItemValue() {
      if (this.value) {
        return this.value;
      } else if (this.formData) {
        return this.formData[this.formItem.uuid];
      }
      return null;
    },
    //是否配置联动
    hasReaction() {
      if (!this.$utils.isEmpty(this.formItem.reaction)) {
        for (let action in this.formItem.reaction) {
          if (!this.$utils.isEmpty(this.formItem.reaction[action])) {
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
      const formItem = this.formItem;
      let isShow = true;
      if (((this.mode === 'read' || this.mode === 'readSubform') && formItem.config && formItem.config.isHide) || formItem.isEditing || (formItem.override_config && formItem.override_config.isHide)) {
        isShow = false;
      }
      return isShow;
    },
    readonlyTextIsHighlight() {
      // 只读模式下，工单详情时间线，有变更的数据，需要高亮显示
      let readonlyTextIsHighlight = false;
      if (!this.$utils.isEmpty(this.formHighlightData) && this.formHighlightData[this.formItem.uuid]) {
        readonlyTextIsHighlight = true;
      }
      return readonlyTextIsHighlight;
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
  watch: {}
};
</script>
<style lang="less" scoped>
@import './form-item.less';
</style>
