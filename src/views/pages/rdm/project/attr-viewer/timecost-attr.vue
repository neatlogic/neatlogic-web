<template>
  <div>
    <span v-if="timecost">
      {{ timecost }}
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
      timecost: (this.issueData && this.issueData.timecost) || (this.valueList && this.valueList.length > 0 && this.valueList[0])
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
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
