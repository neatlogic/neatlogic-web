<template>
  <div>
    <span v-if="endDate">{{ endDate }}</span>
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
     
    };
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
    endDate() {
      return (this.issueData && this.issueData.endDate) || (this.valueList && this.valueList.length > 0 && this.valueList[0]);
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
