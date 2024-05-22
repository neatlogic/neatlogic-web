<template>
  <div class="upLoadRequire">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <div :style="{width: setting.config.width}">
      <TsUpLoad
        ref="upLoad"
        styleType="button"
        className="smallUpload"
        :rowStyle="{marginTop: '-20px'}"
        type="drag"
        :rowSpan="24"
        :uploadCount="uploadCount"
        :multiple="isMultiple"
        :disabled="isReadonly || false"
        :defaultList="filterNoTemplateList()"
        @remove="remove"
        @getFileList="getFileList"
      >
        <div slot="tips">
          <div v-for="(item,index) in templateList" :key="index" class="text-tip pt-xs">
            附件规范请参考&nbsp;<span v-download="downloadUrl(item.id)" class="text-href text-action">附件模板</span>
          </div>
        </div>
      </TsUpLoad>
      <div v-if="isRequired" class="text-error">请选择需要上传的附件</div>
    </div>
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
import download from '@/resources/directives/download.js';
export default {
  name: 'FormViewUpload',
  components: {
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
  directives: { download },
  mixins: [sheetCompontMixins],
  props: {
    setting: Object,
    value: [Array, String],
    isReadonly: Boolean,
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    componentList: {
      //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    let _this = this;
    return {
      currentValue: _this.value,
      isMultiple: false,
      uploadCount: 1,
      isRequired: false,
      templateList: [] // 附件模板列表
    };
  },
  created() {},
  mounted() {
    this.setUploadCount();
    this.filterTemplateList();
  },
  methods: {
    updatethis: function(val) {
      this.$emit('update', val);
    },
    updateValue: function(val) {
      this.$set(this, 'currentValue', val);
    },
    getValue(val) {
      return this.currentValue;
    },
    remove: function(fileList) {
      let config = this.setting.config;
      if (config.isRequired && fileList.length === 0) {
        this.isRequired = true;
      } else {
        this.isRequired = false;
      }
      this.handleFileList(fileList);
    },
    handleFileList(fileList) {
      let filesList = [];
      if (!this.$utils.isEmpty(fileList)) {
        fileList.forEach(v => {
          filesList.push({id: v.id, name: v.name});
        });
      }
      this.currentValue = filesList;
      this.updatethis(filesList);
    },
    getFileList: function(fileList) {
      this.handleFileList(fileList);
      this.isRequired = false;
    },
    validateValue: function() {
      let isVaild = true;
      let config = this.setting.config;
      if (config.isRequired && this.currentValue.length === 0) {
        isVaild = false;
        this.isRequired = true;
      }
      return isVaild;
    },
    setUploadCount() {
      let config = this.setting.config || null;
      if (config) {
        if (config.uploadType === 'one') {
          this.isMultiple = false;
          this.uploadCount = 1;
        } else {
          this.isMultiple = true;
          this.uploadCount = 5;
        }
      }
    },
    filterTemplateList() {
      // 过滤模板列表
      this.templateList = [];
      let defaultValueList = this.$utils.deepClone(this.setting.config.defaultValueList);
      if (defaultValueList && !this.$utils.isEmpty(defaultValueList)) {
        this.templateList = defaultValueList.filter((item) => {
          return item.isTemplate;
        });
      }
    },
    filterNoTemplateList() {
      // 过滤不是模板列表
      let list = [];
      if (this.currentValue && !this.$utils.isEmpty(this.currentValue)) {
        list = this.currentValue.filter((item) => {
          return !item.isTemplate;
        });
      }
      return list;
    }
  },
  computed: {
    getConfig: function() {
      let config = this.defaultSelfJson;
      config.validateList = this.setting.config.isRequired ? ['required'] : [];
      config.readonlyClass = '';
      return config;
    },
    downloadUrl() {
      return function(id) {
        let param = null;
        param = {
          url: '/api/binary/file/download?id=' + id,
          method: 'post',
          params: {}
        };
        return param;
      };
    }
  },
  watch: {
    value: function(newValue) {
      if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
        this.currentValue = this.value;
      }
    },
    'setting.config.defaultValueList': {
      handler: function() {
        this.setUploadCount();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.upLoadRequire{
  position: relative;
  .require-tip{
    top: 16px!important;
  }
}

.component-tips {
  text-align: left;
  font-size: 90%;
  opacity: 0.6;
  word-break: break-all;
  display: block;
  &:before {
    margin-right: 3px;
  }
}
</style>
