<template>
  <div>
    <span v-if="priority">
      <span :style="{ color: priorityColor }" class="mr-xs">●</span>
      <span>{{ priorityName }}</span>
    </span>
    <span v-else class="text-grey">-</span>
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {},
  extends: AttrBase,
  props: {},
  data() {
    return {
      issuePriorityName: '',
      issuePriorityColor: ''
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
    priorityName() {
      return this.issueData && this.issueData.priorityName || this.issuePriorityName;
    },
    priorityColor() {
      return this.issueData && this.issueData.priorityColor || this.issuePriorityColor;
    },
    priority() {
      return (this.issueData && this.issueData.priority) || (this.valueList && this.valueList.length > 0 && this.valueList[0]);
    },
    getPriorityInfo() {
      return this.priorityName == null && this.priority;
    }
  },
  watch: {
    getPriorityInfo: {
      handler(val) {
        if (!val) {
          return false;
        }
        this.$api.rdm.priority.getPriorityById(this.priority).then(res => {
          if (res.Return) {
            this.issuePriorityName = res.Return.name;
            this.issuePriorityColor = res.Return.color;
          }
        });
      },
      immediate: true,
      deep: true
      
    }
  }
};
</script>
<style lang="less"></style>
