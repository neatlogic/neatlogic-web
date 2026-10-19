<template>
  <TsForm
    class="service-basic-info"
    :dataConfig="$utils.deepClone(value)"
    :itemList="itemList"
    itemWidth="33.333333%"
  ></TsForm>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import { getServiceBasicInfoItemList } from '../model/service-info.js';
export default {
  name: 'ServiceBasicInfo',
  components: { TsForm },
  props: { value: { type: Object, default: () => ({}) } },
  computed: {
    itemList() {
      return getServiceBasicInfoItemList({ readonly: true });
    }
  }
};
</script>
<style lang="less" scoped>
.service-basic-info {
  ::v-deep > .tsform-item {
    min-width: 0;
  }
  @media (max-width: 1024px) {
    ::v-deep > .tsform-item {
      width: 50% !important;
    }
  }
  @media (max-width: 640px) {
    ::v-deep > .tsform-item {
      width: 100% !important;
    }
  }
}
</style>
