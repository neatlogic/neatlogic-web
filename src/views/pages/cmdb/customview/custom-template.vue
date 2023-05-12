<template>
  <div>
    <CustomItem
      v-if="isReady"
      :pageSize="pageSize"
      :currentPage="currentPage"
      :dataList="actualDataList"
      :hasMoreData="hasMoreData"
      @changePageSize="changePageSize"
      @changeCurrentPage="changeCurrentPage"
      @reload="getData"
    ></CustomItem>
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
    id: { type: Number }
  },
  data() {
    return {
      isReady: false,
      dataList: null,
      currentPage: 1,
      pageSize: 20,
      templateData: {},
      error: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.init();
    this.getData();
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
    changeCurrentPage(page) {
      if (page && page > 0) {
        this.currentPage = page;
        this.getData();
      }
    },
    changePageSize(pageSize) {
      if (pageSize && pageSize > 0) {
        this.pageSize = pageSize;
        this.currentPage = 1;
        this.getData();
      }
    },
    getData() {
      this.isReady = false;
      this.$api.cmdb.customview
        .searchCustomViewData({
          id: this.id,
          searchMode: 'data',
          currentPage: this.currentPage,
          pageSize: this.pageSize
        })
        .then(res => {
          this.dataList = res.Return.dataList;
          this.pageSize = res.Return.pageSize;
          this.currentPage = res.Return.currentPage;
          this.isReady = true;
        });
    },
    async init() {
      let customViewTemplateData;
      if (this.id) {
        await this.$api.cmdb.customview.getCustomViewTemplateById(this.id).then(res => {
          customViewTemplateData = res.Return;
        });
      }
      if (customViewTemplateData) {
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
        this.templateData.props = {
          dataList: { type: Array },
          currentPage: { type: Number, default: 1 },
          pageSize: { type: Number, default: 20 },
          hasMoreData: {type: Boolean, default: false}
        };

        if (customViewTemplateData.template) {
          this.templateData.template = customViewTemplateData.template;
        }

        if (customViewTemplateData.config) {
          try {
            // eslint-disable-next-line no-eval
            const config = eval('(' + customViewTemplateData.config + ')');
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
        this.error = '自定义模板不存在';
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
    actualDataList() {
      if (this.dataList && this.dataList.length > 0) {
        if (this.dataList.length > this.pageSize) {
          return this.dataList.slice(0, this.pageSize);
        } else {
          return this.dataList.slice(0);
        }
      }
      return [];
    },
    hasMoreData() {
      if (this.dataList && this.dataList.length > 0) {
        if (this.dataList.length > this.pageSize) {
          return true;
        }
      }
      return false;
    }
  },
  watch: {}
};
</script>
