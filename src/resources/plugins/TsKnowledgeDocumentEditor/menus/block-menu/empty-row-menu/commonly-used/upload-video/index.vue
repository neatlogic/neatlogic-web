<template>
  <div ref="uploadVideoRef" class="upload-video-box" @click.stop>
    <div class="icon-box" @click="openFileDialog">
      <span class="tsfont-play icon-image"></span>
      <span class="icon-text">视频</span>
    </div>
    <input
      ref="fileRef"
      type="file"
      accept="video/mp4,video/mkv,video/avi,video/mov,video/webm,video/flv,video/f4v,video/mpg,video/mpeg,video/ts,video/m2ts,video/mts,video/wmv,video/rm,video/rmvb,video/3pg,video/3g2"
      style="display:none"
      @change="handleFileChange"
    />
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
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
    openFileDialog() {
      const fileRef = this.$refs.fileRef;
      if (fileRef) {
        fileRef.value = '';
        fileRef.click();
      }
    },
    handleFileChange(event) {
      const file = event?.target?.files?.[0];
      this.$emit('click-menu', {
        commandName: 'uploadVideo',
        value: { file: file }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.upload-video-box {
  .icon-box {
    display: flex;
    align-content: center;
    .icon-image {
      font-size: 16px;
      margin-right: 14px;
    }
    .icon-text {
      font-size: 14px;
    }
  }
}
</style>
