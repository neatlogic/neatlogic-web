<template>
  <div>
    <div v-if="!error" id="div"></div>
    <div v-else>{{ error }}</div>
  </div>
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
export default {
  name: '',
  components: {},
  props: {
    fileList: {type: Array, default: null}, //资源列表，包含附件id和附件名称
    config: { type: [Object, String] }, //对应vue组件的配置信息
    template: { type: String }, //模板内容
    data: { type: [Object, Array] }, //数据
    id: { type: Number }
  },
  data() {
    return {
      error: null,
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
        TsFormInput,
        TsFormCheckbox,
        TsFormRadio,
        TsFormSelect,
        TsFormSwitch,
        TsFormDatePicker,
        TsTable
      };
      if (this.data) {
        if (!(this.data instanceof Array)) {
          this.templateData.data = this.data;
        } else {
          console.log(JSON.stringify(this.data, null, 2));
        }
      }
      if (this.id) {
        await this.$api.autoexec.customtemplate.getCustomTemplateById(this.id).then(res => {
          const customTemplateData = res.Return;
          if (customTemplateData.template) {
            this.templateData.template = customTemplateData.template;
          }

          if (customTemplateData.config) {
            try {
              // eslint-disable-next-line no-eval
              const config = eval('(' + customTemplateData.config + ')');
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
            } catch (e) {
              console.error(e);
            }
          }
        });
      } else {
        this.templateData.template = this.template;
        if (this.config) {
          let config = this.config;
          if (typeof config == 'string') {
            // eslint-disable-next-line no-eval
            config = eval('(' + config + ')');
          }
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
        }
      }
      if (this.templateData.template) {
        //替换资源文件路径
        await this.convertFilePath();
        try {
          const component = new Vue(this.templateData);
          component.$mount('#div');
        } catch (e) {
          console.error(e);
          this.error = '组件创建失败，请打开开发者模式查看异常详情。';
        }
      } else {
        this.error = '请定义模板内容';
      }
    },
    async convertFilePath() {
      if (this.fileList && this.fileList.length > 0 && this.templateData.template && this.templateData.template.includes('{file:')) {
        const fileMap = {};
        this.fileList.forEach(file => {
          fileMap[file.name] = file.id;
        });
        this.templateData.template = this.templateData.template.replace(/\{file:([^\}]+?)\}/g, (m, g1) => {
          return BASEURLPREFIX + '/api/binary/file/download?id=' + fileMap[g1];
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    data: {
      handler: function(val) {
        Object.assign(this.templateData.data, val);
      },
      deep: true
    }
  }
};
</script>
