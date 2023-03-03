<template>
  <div v-if="config && config.isChecked">
    <div class="fz-h1">{{ config.title }}</div>
    <div v-if="config.fileList.length > 0">
      <div v-for="(file, flindex) in config.fileList" :key="flindex" class="file-list">
        <Checkbox v-model="file.isChecked" :true-value="1" :false-value="0"></Checkbox>
        <span v-download="downurl('/api/binary/file/download', file.id)" class="tsfont-attachment text-action">
          {{ file.name }}
          <i class="tsfont-download"></i>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    // TsFormCheckbox: resolve => require(['@/resources/plugins/TsForm/TsFormCheckbox'], resolve)
  },
  directives: { download },
  filters: {},
  props: {
    config: Object
  },
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
    getData() {}
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.file-list {
  padding: 0 12px 8px;
}
</style>
