<template>
  <div v-if="valueList && valueList.length > 0">
    <div
      v-for="(file,index) in valueList"
      :key="index"
    >
      <Tag
        v-download="download(file.id)"
        class="tsfont-download"
        style="cursor:pointer"
      >{{ file.name }}
      </Tag>
    </div>
  </div>
  <div v-else class="text-grey">-</div>
</template>
<script>
import download from '@/resources/directives/download.js';
import { AttrBase } from './base-attr.js';
export default {
  name: '',
  components: {
  },
  directives: {download},
  extends: AttrBase,
  props: {},
  data() {
    return {};
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
  computed: {
  },
  watch: {}
};
</script>
<style lang="less">
</style>
