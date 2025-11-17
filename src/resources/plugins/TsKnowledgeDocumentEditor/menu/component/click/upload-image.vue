<template>
  <div @click.stop>
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
