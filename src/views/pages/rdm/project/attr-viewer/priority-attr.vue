<template>
  <div>
    <span v-if="priority">{{ priorityName }}</span>
    <span v-else>-</span>
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {
  },
  extends: AttrBase,
  props: {},
  data() {
    return {
      priorityName: this.issueData && this.issueData.priorityName,
      priority: (this.issueData && this.issueData.priority) || (this.valueList && this.valueList.length > 0 && this.valueList[0])
    };
  },
  beforeCreate() {},
  created() {
    if (this.priorityName == null && this.priority) {
      this.$api.rdm.priority.getPriorityById(this.priority).then(res => {
        if (res.Return) {
          this.priorityName = res.Return.name;
        }
      });
    }
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
<style lang="less"></style>
