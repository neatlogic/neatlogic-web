<template>
  <div class="selectContent">
    <!-- start_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <!-- end_必填 -->

    <div class="formsetting-block">
      <label class="formsetting-label text-grey">附件数量</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.uploadType" class="col-2" @on-change="change">
          <Radio label="one">单个附件</Radio>
          <Radio label="more">多个附件</Radio>
        </RadioGroup>
      </div>
    </div>

    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        <span v-if="setting.isTemplate" class="text-error">*</span>
        <span>附件模板</span>
        <span v-if="setting.isTemplate" class="text-primary tsfont-upload text-action ml-md mr-md">上传模板</span>
        <i-switch
          v-model="setting.isTemplate"
          class="label-right"
          @on-change="templateUpload"
        />
      </label>
      <TsUpLoad
        v-if="setting.isTemplate"
        ref="upLoad"
        styleType="text"
        dataType="formuploadfiletemplate"
        className="smallUpload"
        type="drag"
        :rowSpan="24"
        :uploadCount="uploadCount"
        :multiple="isMultiple"
        :light="setting.defaultValueList"
        :defaultList="setting.defaultValueList"
        @remove="remove"
        @getFileList="getFileList"
      >
      </TsUpLoad>
    </div>
  </div>
</template>
<script>
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
export default {
  name: 'FormEditUpload',
  components: {
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve)
  },
  mixins: [sheetCompontMixins],
  props: {
    uuid: String,
    setting: Object
  },

  data() {
    return {
      isMultiple: false,
      // required: ['required'],
      uploadCount: 1
    };
  },
  mounted() {},
  created() {},
  destroyed() {},
  methods: {
    remove: function(fileList) {
      this.setting.defaultValueList = fileList;
    },
    getFileList: function(fileList) {
      this.setting.defaultValueList = [];
      fileList.forEach(v => {
        this.setting.defaultValueList.push({id: v.id, name: v.name, isTemplate: true}); // isTemplate 附件模板的标识，用于预览区分是否是附件模板
      });
    },
    change() {
      let uploadType = this.setting.uploadType;
      if (uploadType === 'one') {
        this.isMultiple = false;
      } else {
        this.isMultiple = true;
      }
    },
    templateUpload(status) {
      if (!status) {
        this.setting.defaultValueList = [];
      }
    },
    validComponent() {
      let validList = [];
      if (this.setting.isTemplate && this.setting.defaultValueList.length === 0) {
        validList.push('请选择需要上传的附件模板');
      }
      return validList;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.formsetting-block{
  position: relative;
}
/deep/.ivu-upload{
  position: absolute;
  top: 3px;
  left: 32px;
  opacity: 0;
  display: inline-block;
}
.text-error{
  margin-right: 1px !important;
  font-size: 14px;
}
</style>
