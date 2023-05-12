<template>
  <div>
    <CustomItemConfig
      v-if="isReady"
      :error="error"
      :formItem="formItem"
      :formItemList="formItemList"
      :disabled="disabled"
    ></CustomItemConfig>
  </div>
</template>
<script>
import Vue from 'vue';
import ViewUI from 'neatlogic-ui/iview/index.js';
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormCheckbox from '@/resources/plugins/TsForm/TsFormCheckbox';
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormSwitch from '@/resources/plugins/TsForm/TsFormSwitch';
import TsTable from '@/resources/components/TsTable/TsTable.vue';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
import base from './base-config.vue';

export default {
  name: '',
  components: {},
  props: {
    error: { type: Array }, //异常列表
    formItem: { type: Object }, //当前表单组件
    formItemList: { type: Array }, //所有表单组件
    customFormItem: {type: Object}//测试时直接从外部传入的组件数据
  },
  data() {
    return {
      isReady: false,
      templateData: {}
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
  methods: {
    async init() {
      this.templateData.components = {
        ViewUI,
        TsFormItem,
        TsFormInput,
        TsFormCheckbox,
        TsFormRadio,
        TsFormSelect,
        TsFormSwitch,
        TsFormDatePicker,
        TsTable
      };
      this.templateData.extends = base;
      let customFormItemData;
      if (this.formItem && !this.customFormItem) {
        await this.$api.framework.form.getCustomItemByName(this.formItem.handler).then(res => {
          customFormItemData = res.Return;
        });
      } else {
        customFormItemData = this.customFormItem;
      }
      if (customFormItemData) {
        if (customFormItemData.configTemplate) {
          this.templateData.template = customFormItemData.configTemplate;
        }
      
        if (customFormItemData.configTemplateConfig) {
          try {
          // eslint-disable-next-line no-eval
            const config = eval('(' + customFormItemData.configTemplateConfig + ')');
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
          } catch (e) {
            console.error(e);
          }
        }
        if (this.templateData.template) {
        //替换资源文件路径
          await this.convertFilePath();
          try {
            Vue.component('CustomItemConfig', this.templateData);
            this.isReady = true;
          } catch (e) {
            console.error(e);
          }
        }
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
  computed: {
    config() {
      return this.formItem.config || {};
    }
  },
  watch: {
  }
};
</script>
