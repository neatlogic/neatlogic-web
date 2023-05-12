<template>
  <div>
    <div v-if="isNeedContent" id="dispatchContent" class="bg-op radius-lg padding mb-nm list-block">
      <div class="title" :class="{'pb-nm':showDetailConfig.content}" @click="showDetailConfig.content = !showDetailConfig.content">
        <span>{{ $t('page.description') }}</span>
        <span v-show="ckeditorRequired" class="require-label"></span>
        <span class="detail-icon text-tip-active" :class="showDetailConfig.content?'tsfont-down':'tsfont-up'"></span>
      </div>
      <div v-show="showDetailConfig.content" class="editor">
        <TsCkeditor
          ref="TsCkeditor"
          v-model="workData.content"
          :showIconToggle="true"
          :editorDataS="workData.content"
          width="100%"
          class="editor"
          :validateList="ckeditorValidateList"
        ></TsCkeditor>
      </div>
    </div>
    <div v-if="isNeedUploadFile" class="bg-op radius-lg padding list-block">
      <div class="title" :class="{'pb-nm':showDetailConfig.file}" @click="showDetailConfig.file = !showDetailConfig.file">
        <span>{{ $t('page.accessory') }}</span>
        <span class="detail-icon text-tip-active" :class="showDetailConfig.file?'tsfont-down':'tsfont-up'"></span>
      </div>
      <TsUpLoad
        v-show="showDetailConfig.file"
        class="upload"
        data-type="itsm"
        styleType="button"
        className="smallUpload"
        :multiple="true"
        :defaultList="defaultFileList"
        @remove="getFileList"
        @getFileList="getFileList"
      ></TsUpLoad>
    </div>
  </div>
</template>
<script>
import {store} from './dispatchState.js';
export default {
  name: '',
  components: {
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve)
  },
  props: {
    draftData: Object
  },
  data() {
    return {
      defaultFileList: [],
      workData: {
        content: '',
        fileIdList: []
      },
      ckeditorValidateList: [],
      isNeedContent: true,
      isNeedUploadFile: true,
      ckeditorRequired: false
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (!this.$utils.isEmpty(this.draftData)) {
        if (!this.$utils.isEmpty(this.draftData.startProcessTaskStep)) {
          if (this.draftData.startProcessTaskStep.comment) {
            let content = this.draftData.startProcessTaskStep.comment.content || '';
            this.defaultFileList = this.draftData.startProcessTaskStep.comment.fileList || [];
            let fileIdList = [];
            if (this.defaultFileList.length > 0) {
              fileIdList = this.$utils.mapArray(this.defaultFileList, 'id');
            }
            this.$set(this.workData, 'content', content);
            this.$set(this.workData, 'fileIdList', fileIdList);
          }
          // 流程上报可配置隐藏描述框
          this.isNeedContent = this.draftData.startProcessTaskStep.hasOwnProperty('isNeedContent') ? !!this.draftData.startProcessTaskStep.isNeedContent : true;
          // 流程上报可配置隐藏上传文件
          this.isNeedUploadFile = this.draftData.startProcessTaskStep.hasOwnProperty('isNeedUploadFile') ? !!this.draftData.startProcessTaskStep.isNeedUploadFile : true;
          this.ckeditorRequired = !!this.draftData.startProcessTaskStep.isRequired;
          if (this.ckeditorRequired) this.ckeditorValidateList.push('required');
        }
      }
    },
    //获取上传文件列表
    getFileList(val) {
      let fileIdList = [];
      if (val && val.length > 0) {
        fileIdList = this.$utils.mapArray(val, 'id');
      }
      this.workData.fileIdList = fileIdList;
    },
    getData() {
      return this.workData;
    },
    valid() {
      let validList = [];
      if (this.$refs.TsCkeditor && !this.$refs.TsCkeditor.valid()) {
        validList.push({
          focus: '#dispatchContent',
          icon: 'tsfont-close-o',
          msg: this.$t('message.process.required', {target: this.$t('page.description')}),
          type: 'error',
          showDetail: 'content'
        });
      }
      return validList;
    }
  },
  filter: {},
  computed: {
    showDetailConfig() {
      return store.showDetailConfig;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.list-block {
  .title{
    position: relative;
  }
  .detail-icon {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
