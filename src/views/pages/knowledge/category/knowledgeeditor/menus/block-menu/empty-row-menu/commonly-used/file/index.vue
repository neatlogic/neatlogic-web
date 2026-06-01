<template>
  <div class="file-box" @click.stop>
    <div class="icon-box" @click="openFileDialog">
      <span class="tsfont-file-single icon-image"></span>
      <span class="icon-text">文件</span>
    </div>
    <input
      ref="fileRef"
      type="file"
      style="display:none"
      @change="handleFileChange"
    />
  </div>
</template>
<script>
import utils from '@/resources/assets/js/util.js';

export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {};
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
    openFileDialog() {
      const fileRef = this.$refs.fileRef;
      if (fileRef) {
        fileRef.value = '';
        fileRef.click();
      }
    },
    isImageOrVideo(file) {
      const fileName = file?.name || '';
      const mimeType = file?.type || '';
      return mimeType.startsWith('image/') ||
        mimeType.startsWith('video/') ||
        utils.isImage(fileName) ||
        utils.isVideo(fileName);
    },
    handleFileChange(event) {
      const file = event?.target?.files?.[0];
      if (!file) {
        return;
      }
      if (this.isImageOrVideo(file)) {
        this.$Message && this.$Message.warning('不支持上传图片或视频');
        return;
      }
      this.$emit('click-menu', { commandName: 'file', options: { file: file } });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.file-box {
  .icon-box {
    display: flex;
    align-items: center;
    .icon-image {
      margin-right: 14px;
      font-size: 16px;
    }
    .icon-text {
      font-size: 14px;
    }
  }
}
</style>
