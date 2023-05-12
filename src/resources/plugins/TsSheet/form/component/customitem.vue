<template>
  <div v-if="!error">
    <CustomItem
      v-if="isReady"
      ref="customItem"
      :formItem="formItem"
      :formItemList="formItemList"
      :value="value"
      :mode="mode"
      :filter="filter"
      :readonly="readonly"
      :disabled="disabled"
      @setValue="
        val => {
          $emit('setValue', val);
        }
      "
      @resize="$emit('resize')"
    ></CustomItem>
  </div>
  <div v-else class="text-grey">{{ error }}</div>
</template>
<script>
import Vue from 'vue';
import ViewUI from 'techsure-ui/iview/index.js';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormCheckbox from '@/resources/plugins/TsForm/TsFormCheckbox';
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormSwitch from '@/resources/plugins/TsForm/TsFormSwitch';
import TsTable from '@/resources/components/TsTable/TsTable.vue';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';

import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: {},
  props: {
    mode: { type: String, default: 'edit' }, //表单的模式edit或read或condition,edut模式才会显示异常、联动等辅助图标
    value: { type: [Object, Array, String, Number] }, //当前表单组件的值
    formItem: { type: Object },
    formItemList: { type: Array }, //所有表单组件列表，用于filter联动
    filter: { type: Array }, //格式[{column:'矩阵属性uuid',expression:'equal',valueList:["value"]}]
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    customFormItem: {type: Object}//测试时直接从外部传入的组件数据
  },
  data() {
    return {
      isReady: false,
      templateData: {},
      error: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  errorCaptured(err, vm, info) {
    this.error = err;
    return false;
  },
  methods: {
    validDataBase() {
      return this.$refs['customItem'] && this.$refs['customItem'].validDataBase(); // 解决this.$refs['customItem']为空，控制台报错问题
    },
    validConfigBase() {
      return this.$refs['customItem'] && this.$refs['customItem'].validConfigBase(); // 解决this.$refs['customItem']为空，控制台报错问题
    },
    async init() {
      this.templateData.components = {
        ViewUI,
        TsFormInput,
        TsFormCheckbox,
        TsFormRadio,
        TsFormSelect,
        TsFormSwitch,
        TsFormDatePicker,
        TsTable
      };
      this.templateData.extends = base;
      this.templateData.mixins = [validmixin];
      let customFormItemData;
      if (this.formItem && !this.customFormItem) {
        await this.$api.framework.form.getCustomItemByName(this.formItem.handler).then(res => {
          customFormItemData = res.Return;
        });
      } else {
        customFormItemData = this.customFormItem;
      }
      if (customFormItemData) {
        if (customFormItemData.viewTemplate) {
          this.templateData.template = customFormItemData.viewTemplate;
        }
 
        if (customFormItemData.viewTemplateConfig) {
          try {
          // eslint-disable-next-line no-eval
            const config = eval('(' + customFormItemData.viewTemplateConfig + ')');
            if (config.methods) {
              this.templateData.methods = {};
              for (let name in config.methods) {
                this.templateData.methods[name] = config.methods[name];
              }
            }
            if (config.computed) {
              this.templateData.computed = {};
              for (let name in config.computed) {
                this.templateData.computed[name] = config.computed[name];
              }
            }
            if (config.data) {
              this.templateData.data = config.data;
            }
            //加载完毕调用resize
            this.templateData.mounted = () => {
              this.$emit('resize');
            };
          } catch (e) {
            console.error(e);
            this.error = e;
          }
        }
        if (this.templateData.template) {
        //替换资源文件路径
          await this.convertFilePath();
          try {
            Vue.component('CustomItem', this.templateData);
            this.isReady = true;
          } catch (e) {
            console.error(e);
            this.error = e;
          }
        }
      } else {
        this.error = this.$t('message.targetnoexist', {'target': this.$t('term.framework.customitem')});
      }
    },
    async convertFilePath() {
      if (this.fileList && this.fileList.length > 0 && this.templateData.template && this.templateData.template.includes('{file:')) {
        const fileMap = {};
        this.fileList.forEach(file => {
          fileMap[file.name] = file.id;
        });
        this.templateData.template = this.templateData.template.replace(/\{file:([^\}]+?)\}/g, (m, g1) => {
          return '/develop/api/binary/file/download?id=' + fileMap[g1];
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
