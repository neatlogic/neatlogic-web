<template>
  <div>
    <TsUpLoad
      styleType="button"
      dataType="rdm"
      className="smallUpload"
      type="drag"
      rowSpan="24"
      :multiple="isMultiple"
      :defaultList="valueList"
      @remove="changeValue"
      @getFileList="changeValue"
    ></TsUpLoad>
  </div>
</template>
<script>
import { AttrBase } from './base-attr.js';
export default {
  name: '',
  components: {
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve)
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
      fileList: []
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.fileList = this.valueList || [];
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    valid() {
      if (this.mode === 'input') {
        if (this.isRequired && (!this.fileList || this.fileList.length <= 0)) {
          return false;
        } else {
          return true;
        }
      } 
      return true;
    },
    changeValue(fileList) {
      if (fileList && fileList.length > 0) {
        if (this.isMultiple) {
          fileList.forEach(element => {
            if (!this.fileList.find(f => f.id == element.id)) {
              this.fileList.push({id: element.id, name: element.name });
            }
          });
        } else {
          const element = fileList[fileList.length - 1];//如果单选，只取最后一个附件
          if (!this.fileList.find(f => f.id == element.id)) {
            if (this.fileList.length > 0) {
              this.fileList = [];
            }
            this.fileList.push({id: element.id, name: element.name });
          }
        }
      }
      for (let i = this.fileList.length - 1; i >= 0; i--) {
        const file = this.fileList[i];
        if (!fileList.find(f => f.id === file.id)) {
          this.fileList.splice(i, 1);
        }
      }
      this.$emit('setValue', this.fileList, this.fileList);
    }
  },
  filter: {},
  computed: {
    isRequired() {
      return !!this.attrConfig.isRequired;
    },
    isMultiple() {
      if (this.mode !== 'input' || (this.attrConfig && this.attrConfig?.config?.isMultiple)) {
        return true;
      }
      return false;
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
