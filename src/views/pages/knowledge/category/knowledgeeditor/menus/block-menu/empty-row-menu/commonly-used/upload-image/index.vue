<template>
  <div class="upload-image-box" @click.stop>
    <div class="icon-box" @click="openFileDialog">
      <span class="tsfont-image icon-image"></span>
      <span class="icon-text">图片</span>
    </div>
    <input
      ref="fileRef"
      type="file"
      multiple
      accept=".png,.jpg,.jpeg"
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
    handleFileChange(event) {
      const file = event?.target?.files?.[0];
      this.$emit('click-menu', { commandName: 'uploadImage', options: { file: file } });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@warning-color) {
  .icon-image {
    color: @warning-color;
  }
}
.upload-image-box {
  .theme(@default-warning-color);
  .theme-dark & {
    .theme(@dark-warning-color);
  }
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
