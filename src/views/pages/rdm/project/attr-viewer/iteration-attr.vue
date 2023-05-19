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
      iterationName: this.issueData && this.issueData.iterationName,
      iteration: (this.issueData && this.issueData.iteration) || (this.valueList && this.valueList.length > 0 && this.valueList[0])
    };
  },
  beforeCreate() {},
  created() {
    if (this.iterationName == null && this.iteration) {
      this.$api.rdm.iteration.getIterationById(this.iteration).then(res => {
        if (res.Return) {
          this.iterationName = res.Return.name;
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
