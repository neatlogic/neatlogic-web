<template>
  <div>
    <TsUpLoad
      styleType="button"
      dataType="cmdb"
      className="smallUpload"
      type="drag"
      rowSpan="24"
      :disabled="disabled"
      :multiple="isMultiple"
      :defaultList="fileList"
      @remove="setData"
      @getFileList="setData"
    ></TsUpLoad>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
  props: {
    disabled: { type: Boolean, default: false },
    attrData: { type: Object },
    attrEntity: { type: Object },
    valueList: { type: Array }
  },
  data() {
    return {
      isRequired: false,
      fileList: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.attrData) {
      if (this.attrData.isRequired || this.attrData.isCiUnique) {
        this.isRequired = true;
      }
    }
  },
  beforeMount() {},
  mounted() {
    this.getFileByIdList();
    this.fileList = (this.attrEntity && this.attrEntity.actualValueList) || [];
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    valid() {
      //验证数据合法性
      if (this.isRequired && (!this.fileList || this.fileList.length <= 0)) {
        this.$Message.warning('请上传附件：' + this.attrData.label);
        return false;
      } else {
        return true;
      }
    },
    getFileByIdList() {
      if (this.valueList && this.valueList.length > 0) {
        this.$api.cmdb.cientity.getFileByIdList(this.valueList).then(res => {
          this.fileList = res.Return;
        });
      }
    },
    setData(fileList) {
      let fileIdList = [];
      if (fileList && fileList.length > 0) {
        if (this.isMultiple) {
          fileList.forEach(element => {
            if (!this.fileList.find(f => f.id == element.id)) {
              this.fileList.push({ id: element.id, name: element.name });
            }
          });
        } else {
          const element = fileList[fileList.length - 1]; //如果单选，只取最后一个附件
          if (!this.fileList.find(f => f.id == element.id)) {
            if (this.fileList.length > 0) {
              this.fileList = [];
            }
            this.fileList.push({ id: element.id, name: element.name });
          }
        }
      }
      for (let i = this.fileList.length - 1; i >= 0; i--) {
        const file = this.fileList[i];
        if (!fileList.find(f => f.id === file.id)) {
          this.fileList.splice(i, 1);
        }
      }
      this.fileList.forEach(element => {
        fileIdList.push(element.id);
      });
      this.$emit('setData', fileIdList, this.fileList);
    }
  },
  filter: {},
  computed: {
    isMultiple: function() {
      if (this.attrData && this.attrData.config && this.attrData.config.isMultiple) {
        return true;
      }
      return false;
    }
  },
  watch: {
    /*attrData: {
      handler: function() {
        this.isRequired = false;
        if (this.attrData && this.attrData.isRequired == 1) {
          this.isRequired = true;
        }
      },
      deep: true,
      immediate: true
    }*/
  }
};
</script>
<style lang="less"></style>
