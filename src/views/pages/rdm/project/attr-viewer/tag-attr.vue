<template>
  <div v-if="tagList && tagList.length > 0">
    <span
      v-for="(tag, index) in tagList"
      :key="index"
      class="tsfont-label"
      :class="{ 'pl-xs': index > 0 }"
    >
      {{ tag }}
    </span>
  </div>
  <div v-else class="text-grey">-</div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';
export default {
  name: '',
  components: {},
  extends: AttrBase,
  props: {},
  data() {
    return {};
  },
  beforeCreate() {},
  created() {
    this.getTagList();
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
    getTagList() {
      if (this.issueData && this.issueData.tagList) {
        return this.issueData.tagList;
      } else if (this.valueList) {
        return this.valueList;
      }
    }
  },
  filter: {},
  computed: {
    tagList() {
      return this.getTagList(); 
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.tag {
  transform: scale(var(--scale));
}
</style>
