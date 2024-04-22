
<template>
  <div>
    <template v-if="value && !$utils.isEmpty(value)">
      <TsFormSelect
        ref="runnerGroup"
        :value="value || -1"
        v-bind="runnerGroupConfig"
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
      runnerGroupConfig: {
        dynamicUrl: '/api/rest/resourcecenter/tag/list/forselect',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
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
  methods: {
  },
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
