<template>
  <div v-if="valueList && valueList.length > 0">
    <Tag v-for="(v,index) in valueList" :key="index">
      {{ v }}
    </Tag>
  </div>
  <div v-else class="text-grey">-</div>
</template>
<script>
import { AttrBase } from './base-attr.js';
export default {
  name: '',
  components: {
  },
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
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
<style lang="less">
</style>
