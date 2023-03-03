<template>
  <div>
    <TsFormItem label="显示格式" labelPosition="top">
      <TsFormRadio
        :value="config.uploadType"
        :dataList="uploadTypeList"
        :disabled="disabled"
        @on-change="val => {
          setConfig('uploadType', val);
        }"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem
      label="附件模板"
      labelPosition="left"  
      contentAlign="right"
    >
      <TsFormSwitch
        :value="config.isTemplate"
        :disabled="disabled"
        @on-change="val => {
          setConfig('isTemplate', val);
        }"
      ></TsFormSwitch>
    </TsFormItem>
    <div>
      <TsUpLoad
        v-if="config.isTemplate"
        ref="upLoad"
        styleType="text"
        className="smallUpload"
        type="drag"
        :rowSpan="24"
        :uploadCount="1"
        :multiple="false"
        :defaultList="config.templateList || []"
        :disabled="disabled"
        @remove="remove"
        @getFileList="getFileList"
      >
        <span class="text-primary tsfont-upload text-action">上传模板</span>
      </TsUpLoad>
    </div>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      uploadTypeList: [
        { text: '单个附件', value: 'one' },
        { text: '多个附件', value: 'more' }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    remove: function(fileList) {
      this.setConfig('templateList', fileList);
    },
    getFileList(fileList) {
      this.setConfig('templateList', fileList);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
