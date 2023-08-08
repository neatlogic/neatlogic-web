<template>
  <div>
    <span v-if="timecost">
      <span style="display: inline-block">
        <span>{{ timecost }}</span>
        <span v-if="timecostSum">/{{ $t('term.rdm.used') }}:{{ timecostSum }}</span>
        <span v-if="timecostSum - timecost > 0" class="text-error">/{{ $t('term.rdm.exceed') }}:{{ timecostSum - timecost }}</span>
      </span>
      <span v-if="finishRate != null" class="ml-xs" style="display: inline-block; width: 66px">
        <Progress
          style="font-size: 12px"
          :stroke-width="17"
          text-inside
          :percent="finishRate"
          status="active"
        />
      </span>
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
  computed: {
    timecostSum() {
      let sum = 0;
      if (this.issueData && this.issueData.costList && this.issueData.costList.length) {
        this.issueData.costList.forEach(c => {
          sum += c.timecost;
        });
      }
      return sum;
    },
    finishRate() {
      let fr = null;
      if (this.issueData && this.issueData.timecost) {
        fr = Math.min((this.timecostSum / this.issueData.timecost) * 100, 100);
        fr = parseFloat(fr.toFixed(2));
      }
      return fr;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
