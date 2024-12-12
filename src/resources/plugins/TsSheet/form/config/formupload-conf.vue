<template>
  <div>
    <TsFormItem :label="$t('page.displayformat')" labelPosition="top">
      <TsFormRadio
        v-model="uploadType"
        :dataList="uploadTypeList"
        :disabled="disabled"
        @on-change="val => {
          changeType(val);
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
          if(!val){
            setConfig('templateList', []);
          }
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
        :uploadCount="config.uploadType == 'one'?1:5"
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
      uploadType: '',
      uploadTypeList: [
        { text: this.$t('page.onefile'), value: 'one' },
        { text: this.$t('page.morefile'), value: 'more', description: this.$t('form.validate.filecount', { target: '5' })}
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initConfig();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initConfig() {
      this.uploadType = (this.config && this.$utils.deepClone(this.config.uploadType)) || 'one';
    },
    remove: function(fileList) {
      this.setConfig('templateList', fileList);
    },
    getFileList(fileList) {
      this.setConfig('templateList', fileList);
    },
    changeType(type) {
      if (type === 'one' && this.config.templateList && this.config.templateList.length > 1) {
        this.$createDialog({
          title: '确定切换单个附件',
          content: '默认保存第一个附件模板文件。',
          'on-ok': vnode => {
            this.setConfig('uploadType', type);
            this.setConfig('templateList', this.config.templateList.slice(0, 1));
            vnode.isShow = false;
          },
          'on-close': vnode => {
            // 取消之后，激活状态变成修改之前状态
            this.uploadType = 'more';
            vnode.isShow = false;
          }
        });
      } else {
        this.setConfig('uploadType', type);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
