<template>
  <div>
    <TsFormItem :label="$t('page.displayformat')" labelPosition="top">
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
      :label="$t('page.filetemplate')"
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
        dataType="formuploadfiletemplate"
        @remove="remove"
        @getFileList="getFileList"
      >
        <span class="text-primary tsfont-upload text-action">{{ $t('page.uploadtemplace') }}</span>
      </TsUpLoad>
    </div>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
  extends: base,
  props: {},
  data() {
    return {
      uploadTypeList: [
        { text: this.$t('page.onefile'), value: 'one' },
        { text: this.$t('page.morefile'), value: 'more' }
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
