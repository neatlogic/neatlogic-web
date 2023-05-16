<template>
  <div v-if="tagList && tagList.length > 0">
    <span v-for="(tag, index) in tagList" :key="index" class="icon-padding">
      <Tag>
        <span class="tsfont-label">{{ tag }}</span>
      </Tag>
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
    return { tagList: [] };
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
        this.tagList = this.issueData.tagList;
      } else if (this.valueList) {
        this.tagList = this.valueList;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
