<template>
  <div ref="uploadVideoRef" @click.stop>
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
    async handleFileChange(event) {
      const file = event?.target?.files?.[0];
      if (!file) {
        return false;
      }
      this.$emit('uploadSuccess', file);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
