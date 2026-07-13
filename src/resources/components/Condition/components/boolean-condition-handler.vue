<template>
  <div>
    <TsFormRadio
      v-bind="$attrs"
      :value="value"
      :dataList="dataList"
      @change="changeValue"
    ></TsFormRadio>
  </div>
</template>
<script>
import { ConditionHandlerBase } from '@/resources/components/Condition/components/base-condition-handler.js';

export default {
  name: '',
  components: {
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
  },
  extends: ConditionHandlerBase,
  inheritAttrs: false,
  data() {
    return {
      dataList: [
        { value: true, text: this.$t('page.yes') },
        { value: false, text: this.$t('page.no') }
      ]
    };
  }
};
</script>
