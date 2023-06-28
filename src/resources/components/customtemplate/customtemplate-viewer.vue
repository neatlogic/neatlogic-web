<template>
  <div>
    <div v-if="!error" id="div">
      <CustomtemplateViewer v-if="isReady"></CustomtemplateViewer>
    </div>
    <div v-else>{{ error }}</div>
  </div>
</template>
<script>
import Vue from 'vue';
import ViewUI from 'neatlogic-ui/iview/index.js';
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
      isReady: false,
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
      let data = {};
      if (this.data) {
        if (!(this.data instanceof Array)) {
          Object.keys(this.data).forEach(key => {
            data[key] = this.data[key];
          });
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
          //new Vue()没有定义$t,导致翻译报错
          // const component = new Vue(this.templateData);
          // component.$mount('#div');

          Vue.component('CustomtemplateViewer', {
            data() {
              return data;
            },
            ...this.templateData
          });
          this.isReady = true;
        } catch (e) {
          console.error(e);
          this.error = this.$t('message.report.widgetcreatefail');
        }
      } else {
        this.error = this.$t('message.report.definetemplate');
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
