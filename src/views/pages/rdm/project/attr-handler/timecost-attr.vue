<template>
  <div>
    <div>
      <TsFormInput
        ref="handler"
        type="number"
        :value="timecost"
        :border="border"
        :readonly="readonly"
        :validateList="validateList"
        :min="0"
        @change="
          val => {
            $emit('setValue', 'timecost', val, val);
          }
        "
      ></TsFormInput>
    </div>
    <div v-if="timecostSum" class="keep">
      <div class="text-grey">{{ $t('term.rdm.usedtimecost') }}</div>
      <div>{{ timecostSum }}</div>
      <div v-if="timecost && timecostSum - timecost > 0" class="text-grey">{{ $t('term.rdm.exceedtimecost') }}</div>
      <div v-if="timecost && timecostSum - timecost > 0" class="text-error">{{ timecostSum - timecost }}</div>
      <div v-if="finishRate != null" class="text-grey">{{ $t('page.completrate') }}</div>
      <div v-if="finishRate != null"><Progress :percent="finishRate" status="active" /></div>
    </div>
  </div>
</template>
<script>
import { AttrBase } from './base-privateattr.js';

export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
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
  methods: {
    valid() {
      return this.$refs['handler'].valid();
    }
  },
  filter: {},
  computed: {
    validateList() {
      if (this.mode === 'input' && this.attrConfig.isRequired) {
        return [{ name: 'required', message: ' ' }];
      }
      return [];
    },
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
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@default-bg) {
  .keep {
    background: @default-bg !important;
  }
}
html {
  .theme(@default-background,);
  &.theme-dark {
    .theme(@dark-background,);
  }
}
</style>
