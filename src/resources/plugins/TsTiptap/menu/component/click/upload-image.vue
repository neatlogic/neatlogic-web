<template>
  <div>
    <input
      ref="fileInput"
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
    handleFileChange(e) {
      const files = e.target.files;
      console.log(files);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
