<template>
  <div>
    <div v-if="attrEntity.actualValueList && attrEntity.actualValueList.length > 0" class="clearfix">
      <div v-for="(file, index) in attrEntity.actualValueList" :key="index">
        <Tag v-download="download(file.id)" class="tsfont-download" style="cursor:pointer">{{ file.name }}</Tag>
      </div>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  directives: { download },
  components: {},
  props: {
    mode: { type: String, default: 'list' },
    attrEntity: { type: Object }
  },
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
    download(id) {
      return {
        url: 'api/binary/file/download',
        params: {
          id: id
        }
      };
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
