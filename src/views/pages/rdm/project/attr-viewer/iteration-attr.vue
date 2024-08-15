<template>
  <div>
    <span v-if="iteration">{{ iterationName }}</span>
    <span v-else class="text-grey">-</span>
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
      issueIterationName: ''
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
  },
  filter: {},
  computed: {
    iterationName() {
      return (this.issueData && this.issueData.iterationName) || this.issueIterationName;
    },
    iteration() {
      return (this.issueData && this.issueData.iteration) || (this.valueList && this.valueList.length > 0 && this.valueList[0]);
    },
    needAjax() {
      return (this.iterationName == null) && this.iteration;
    }
  },
  watch: {
    needAjax: {
      handler(val) {
        if (val) {
          this.$api.rdm.iteration.getIterationById(this.iteration).then(res => {
            if (res.Return) {
              this.issueIterationName = res.Return.name;
            }
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
