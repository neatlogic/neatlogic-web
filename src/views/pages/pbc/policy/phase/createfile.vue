<template>
  <div v-if="!phase.error">
    <div v-if="result && result.filePathList && result.filePathList.length > 0">{{ $t('page.filepath') }}：</div>
    <div v-for="(filePath, index) in result.filePathList" :key="index">
      <span v-if="filePath.id && filePath.name">
        <span v-download="downurl(filePath.id)" class="tsfont-download text-action"> {{ filePath.name }}</span>
      </span>
      <span v-else>{{ filePath }}</span>
    </div>
  </div>
  <div v-else>
    <Alert type="error">{{ phase.error }}</Alert>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';

export default {
  name: '',
  components: {},
  directives: { download },
  props: { phase: { type: Object } },
  data() {
    return {
      statistList: {}
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
  methods: {},
  filter: {},
  computed: {
    downurl() {
      return id => {
        return {
          url: 'api/binary/file/download',
          params: {
            id: id
          }
        };
      };
    },
    result() {
      if (this.phase.result) {
        return JSON.parse(this.phase.result);
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
