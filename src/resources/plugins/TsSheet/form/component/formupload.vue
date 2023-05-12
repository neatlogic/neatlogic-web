<template>
  <div>
    <div :style="{width: config.width}">
      <TsUpLoad
        ref="formitem"
        styleType="button"
        className="smallUpload"
        type="drag"
        :rowSpan="24"
        :uploadCount="config.uploadType == 'one'?1:5"
        :multiple="config.uploadType == 'one'? false : true"
        :disabled="readonly || disabled" 
        :defaultList="actualValue"
        :readonlyTextIsHighlight="readonlyTextIsHighlight"
        @remove="remove"
        @getFileList="getFileList"
      >
        <div slot="tips">
          <div v-for="(item,index) in config.templateList" :key="index" class="text-tip pt-xs">
            {{ $t('term.framework.filestandard') }}&nbsp;<span v-download="downloadUrl(item.id)" class="text-href text-action">{{ $t('page.filetemplate') }}</span>
          </div>
        </div>
      </TsUpLoad>
    </div>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import download from '@/resources/directives/download.js';
import TsUpLoad from '@/resources/components/UpLoad/UpLoad.vue';
export default {
  name: '',
  components: {
    TsUpLoad
  },
  directives: { download },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {
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
    remove(fileList) {
      this.setValue(fileList);
    },
    getFileList(fileList) {
      this.setValue(fileList);
    }
  },
  filter: {},
  computed: {
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
    },
    actualValue() {
      if (this.value && this.value instanceof Array) {
        return this.value;
      } 
      return [];
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
