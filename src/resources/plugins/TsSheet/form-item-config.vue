<template>
  <div @keydown.stop>
    <div class="padding" style="position:relative">
      <span class="h3">{{ $t('dialog.title.edittarget',{'target':$t('page.component')}) }}</span>
      <div class="btn-closeedit tsfont-close text-tip-active" @click="closeEdit"></div>
    </div>
    <div class="pl-nm pr-sm pb-xs" style="overflow:auto;height:calc(100vh - 180px)">
      <TsFormItem
        v-if="formItem.hasOwnProperty('inherit')"
        :label="$t('term.framework.inheritscenesetting')"
        labelPosition="left"
        contentAlign="right"
      >
        <TsFormSwitch
          v-model="formItem.inherit"
          :trueValue="true"
          :falseValue="false"
          @on-change="changeInherit"
        ></TsFormSwitch>
      </TsFormItem>
      <TsForm labelPosition="top" :item-list="formConfig">
        <template v-slot:customConfig>
          <template v-if="formItem.type === 'form'">
            <component
              :is="formItem.handler"
              v-if="isExistComponent(formItem.handler)"
              :error="error"
              :formItem="formItem"
              :formItemList="formItemList"
              :disabled="!!formItem.inherit || disabled"
              :initFormItemList="initFormItemList"
              class="mb-sm"
              @editSubForm="editSubForm"
            ></component>
            <component
              :is="formItem.customName"
              v-else-if="formItem.handler === 'formcustom' && isExistComponent(formItem.customName)"
              :error="error"
              :formItem="formItem"
              :formItemList="formItemList"
              :disabled="!!formItem.inherit || disabled"
              :initFormItemList="initFormItemList"
              class="mb-sm"
              @editSubForm="editSubForm"
            ></component>
            <div v-else>
              <Alert show-icon>
                {{ $t('page.commercialcomponenttip') }}
              </Alert>
            </div>
          </template>
          <FormCustomItemConfig
            v-else-if="formItem.type === 'custom'"
            :error="error"
            :formItem="formItem"
            :customFormItem="customFormItem"
            :formItemList="formItemList"
            :disabled="!!formItem.inherit || disabled"
            class="mb-sm"
          ></FormCustomItemConfig>
        </template>
        <template v-if="formItem.hasValue" v-slot:defaultValue>
          <div class="padding-md radius-md bg-op">
            <FormItem
              :formItem="formItem"
              mode="defaultvalue"
              :value="formItem.config.defaultValue"
              :disabled="!!formItem.inherit || disabled"
              :isCustomValue="true"
              @change="
                val => {
                  setConfig('defaultValue', val);
                }
              "
            ></FormItem>
          </div>
        </template>
      </TsForm>
      <Button
        v-if="formItem.reaction && !$utils.isEmpty(formItem.reaction)"
        style="width:100%"
        :disabled="!!formItem.inherit || disabled"
        @click="openReactionDialog()"
      >
        <span class="tsfont-lightning">
          <span>{{ $t('term.framework.reactionsetting') }}</span>
          <span v-if="reactionCount" class="ml-xs">
            <Badge :count="reactionCount"></Badge>
          </span>
        </span>
      </Button>
    </div>
    <ReactionDialog
      v-if="isReactionShow"
      :formItem="formItem"
      :formItemList="formItemList"
      @close="closeReactionDialog"
    ></ReactionDialog>
  </div>
</template>
<script>
import formItemConfig from './form/config/index.js';
import { FORMITEMS } from './form/formitem-list.js';

export default {
  name: '',
  components: {
    ...formItemConfig,
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    ReactionDialog: () => import('./form-item-reaction-dialog.vue'),
    FormCustomItemConfig: () => import('./form/config/customitem-config.vue'),
    FormItem: () => import('@/resources/plugins/TsSheet/form-item.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    error: { type: Array }, //异常列表
    formItem: { type: Object }, //当前表单组件
    formItemList: { type: Array }, //所有表单组件
    customFormItem: { type: Object }, //测试时直接从外部传入的组件数据
    disabled: {type: Boolean, default: false},
    initFormItemList: { //默认表单组件列表
      type: Array,
      default: () => []
    }
  },
  data() {
    const _this = this;
    return {
      formConfig: [
        {
          type: 'text',
          name: 'key',
          label: this.$t('page.englishname'),
          validateList: ['required',
            {
              name: 'regex',
              pattern: /^[A-Za-z\d_]+$/,
              message: this.$t('message.plugin.enName')
            }
          ],
          value: this.formItem.key,
          maxlength: 50,
          disabled: this.formItem.hasOwnProperty('inherit') || !!this.formItem.inherit,
          onChange: val => {
            this.$set(this.formItem, 'key', val);
          }
        },
        {
          type: 'text',
          name: 'label',
          label: this.$t('page.name'),
          validateList: ['required'],
          value: this.formItem.label,
          maxlength: 50,
          disabled: this.formItem.hasOwnProperty('inherit') || !!this.formItem.inherit,
          onChange: val => {
            this.$set(this.formItem, 'label', val);
          }
        },
        {
          type: 'text',
          name: 'config.description',
          label: this.$t('page.description'),
          disabled: !!this.formItem.inherit,
          onChange: val => {
            this.setConfig('description', val);
          }
        },
        {
          labelPosition: 'top',
          type: 'radio',
          name: 'config.width',
          label: this.$t('page.width'),
          dataList: [
            { text: '50%', value: '50%' },
            { text: '75%', value: '75%' },
            { text: '100%', value: '100%' }
          ],
          disabled: !!this.formItem.inherit,
          onChange: val => {
            this.setConfig('width', val);
          }
        },
        {
          labelPosition: 'left',
          contentAlign: 'right',
          type: 'switch',
          name: 'config.isReadOnly',
          label: this.$t('page.readonly'),
          trueValue: true,
          falseValue: false,
          disabled: !!this.formItem.inherit,
          onChange: val => {
            this.setConfig('isReadOnly', val);
          }
        },
        {
          labelPosition: 'left',
          contentAlign: 'right',
          type: 'switch',
          name: 'config.isDisabled',
          label: this.$t('page.disable'),
          trueValue: true,
          falseValue: false,
          disabled: !!this.formItem.inherit,
          onChange: val => {
            this.setConfig('isDisabled', val);
          }
        },
        {
          labelPosition: 'left',
          contentAlign: 'right',
          type: 'switch',
          name: 'config.isMask',
          label: this.$t('page.invisible'),
          trueValue: true,
          falseValue: false,
          disabled: !!this.formItem.inherit,
          onChange: val => {
            this.setConfig('isMask', val);
          }
        },
        {
          labelPosition: 'left',
          contentAlign: 'right',
          type: 'switch',
          name: 'config.isHide',
          label: this.$t('page.hide'),
          trueValue: true,
          falseValue: false,
          disabled: !!this.formItem.inherit,
          onChange: val => {
            //设置了隐藏，则不可见设置无效
            this.setConfig('isHide', val);
            const isMask = _this.formConfig.find(d => d.name === 'isMask');
            if (isMask) {
              if (val) {
                isMask.disabled = true;
                this.setConfig('isMask', false);
                this.$set(isMask, 'value', false);
              } else {
                isMask.disabled = false;
              }
            }
          }
        },
        {
          labelPosition: 'left',
          contentAlign: 'right',
          type: 'switch',
          name: 'config.isEmpty',
          label: this.$t('term.framework.hideclearval'),
          trueValue: true,
          falseValue: false,
          disabled: !!this.formItem.inherit,
          onChange: val => {
            this.setConfig('isEmpty', val);
          }
        },
        {
          labelPosition: 'left',
          contentAlign: 'right',
          type: 'switch',
          name: 'config.isRequired',
          label: this.$t('page.require'),
          trueValue: true,
          falseValue: false,
          disabled: !!this.formItem.inherit,
          onChange: val => {
            this.setConfig('isRequired', val);
          }
        },
        {
          labelPosition: 'top',
          type: 'radio',
          name: 'handler',
          label: this.$t('page.changehandler'),
          dataList: [],
          disabled: !!this.formItem.inherit,
          onChange: val => {
            this.setHandler(val);
          }
        },
        {
          hideLabel: true,
          type: 'slot',
          name: 'customConfig'
        },
        {
          label: this.$t('page.defaultvalue'),
          type: 'slot',
          name: 'defaultValue'
        }
      ],
      isReactionShow: false,
      keyBlacklist: ['formlabel', 'formtab', 'formcollapse', 'formdivider'] //不用设置英文名称的组件
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    init() {
      if (this.formItem.config) {
        //去掉config中没有的配置
        for (let i = this.formConfig.length - 1; i >= 0; i--) {
          const element = this.formConfig[i];
          if (element.name === 'defaultValue') {
            if (!this.formItem.hasValue || this.formItem.config.disableDefaultValue) {
              this.formConfig.splice(i, 1);
            }
          } else if (element.name === 'key') {
            if (this.keyBlacklist.includes(this.formItem.handler)) {
              this.formConfig.splice(i, 1);
            }
          } else {
            const configName = element.name.replace('config.', '');
            if (this.formItem.config.hasOwnProperty(configName)) {
              this.$set(element, 'value', this.formItem.config[configName]);
            } else {
              if (element.name.startsWith('config.')) {
                this.formConfig.splice(i, 1);
              }
            }
          }
        }
      }
      if (this.formItem.switchHandler && this.formItem.switchHandler.length > 0) {
        this.formConfig.forEach(element => {
          if (element.name === 'handler') {
            element.isHidden = false;
            element.dataList = [];
            this.$set(element, 'value', this.formItem.handler);
            this.formItem.switchHandler.forEach(handler => {
              const item = FORMITEMS.find(d => d.handler === handler);
              if (item) {
                element.dataList.push({ value: handler, text: item.label });
              }
            });
          }
        });
      } else {
        this.formConfig.forEach(element => {
          if (element.name === 'handler') {
            element.isHidden = true;
          }
        });
      }
      this.updateConfig();
    },
    //更新组件默认配置，补充新的配置
    updateConfig() {
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
    },

    openReactionDialog() {
      if (this.formItem.hasOwnProperty('inherit') && (this.formItem.inherit || this.disabled)) {
        return;
      }
      this.isReactionShow = true;
    },
    closeReactionDialog(reactionConf) {
      this.isReactionShow = false;
      if (reactionConf) {
        this.$set(this.formItem, 'reaction', reactionConf);
      }
    },
    setHandler(handler) {
      const newFormItem = FORMITEMS.find(d => d.handler === handler);
      this.$set(this.formItem, 'handler', handler);
      this.$set(this.formItem, 'config', newFormItem.config);
    },
    setConfig(attrName, attrValue) {
      if (attrName.indexOf('.') == -1) {
        this.$set(this.formItem.config, attrName, attrValue);
      } else {
        const str = attrName.split('.');
        let obj = this.formItem.config;
        for (let i = 0; i < str.length - 1; i++) {
          if (obj[str[i]]) {
            obj = obj[str[i]];
          } else {
            this.$set(obj, str[i], {});
          }
        }
        this.$set(obj, str[str.length - 1], attrValue);
      }
    },
    //校验控件参数是否完整，供外部调用
    valid() {},
    getErrorMessage() {
      this.formConfig.forEach(item => {
        let labelItem = this.error ? this.error.find(i => i.field === item.name) : null;
        if (labelItem) {
          item.errorMessage = labelItem.error;
        } else {
          item.errorMessage = '';
        }
      });
    },
    closeEdit() {
      this.$emit('close');
    },
    changeInherit(val) {
      this.formConfig.forEach(item => {
        //编辑场景时，组件的中、英文名称不可改
        if (item.name === 'key' || item.name === 'label') {
          this.$set(item, 'disabled', true);
        } else {
          this.$set(item, 'disabled', !!val);
        }
      });
      if (val) {
        this.$emit('inheritFormItem', this.formItem.uuid);
      }
    },
    editSubForm() {
      this.$emit('editSubForm');
    }
  },
  filter: {},
  computed: {
    //联动配置数量
    reactionCount() {
      let c = 0;
      if (!this.$utils.isEmpty(this.formItem.reaction)) {
        for (let action in this.formItem.reaction) {
          if (!this.$utils.isEmpty(this.formItem.reaction[action])) {
            c += 1;
          }
        }
      }
      return c;
    },
    needConfig() {
      return attr => {
        return this.formItem.config.hasOwnProperty(attr);
      };
    },
    isExistComponent() { //判断是否存在
      return (handler) => {
        let component = true;
        if (!formItemConfig[handler]) {
          component = false;
        }
        return component;
      };
    }
  },
  watch: {
    error: {
      handler() {
        this.getErrorMessage();
      },
      immediate: true,
      deep: true
    },
    disabled: {
      handler(val) {
        if (val) {
          this.formConfig.forEach(item => {
            this.$set(item, 'disabled', true);
          });
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.btn-closeedit {
  position: absolute;
  right: 0;
  top: 16px;
}
</style>
