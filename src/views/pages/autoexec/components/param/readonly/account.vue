
<template>
  <div>
    <template v-if="value && !$utils.isEmpty(value)">
      <TsFormSelect
        ref="account"
        :value="value"
        v-bind="accountConfig"
      >
      </TsFormSelect>
    </template>
    <template v-else>{{ $t('page.notarget', {target: $t('page.defaultvalue')}) }}</template>
  </div>
</template>
<script>

import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {},
  props: {
    value: [Number, String]
  },
  data() {
    return {
      accountConfig: {
        dynamicUrl: '/api/rest/resourcecenter/account/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAccountNodeList,
        border: 'border',
        readonly: true
      }
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
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
