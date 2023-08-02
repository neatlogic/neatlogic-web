<template>
  <div v-if="valueList && valueList.length > 0">
    <span
      v-for="(v, index) in valueList"
      :key="index"
      class="tsfont-check-o"
      :class="{ 'pl-xs': index > 0 }"
    >
      {{ v }}
    </span>
  </div>
  <div v-else class="text-grey">-</div>
</template>
<script>
import { AttrBase } from './base-attr.js';
export default {
  name: '',
  components: {},
  extends: AttrBase,
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.tag {
  transform: scale(var(--scale));
}
</style>
