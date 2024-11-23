
<template>
  <div>
    <template v-if="value && !$utils.isEmpty(value)">
      <TsFormSelect
        ref="runnerGroupTag"
        :value="value || -1"
        v-bind="runnerGroupTagConfig"
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
    value: [Number, String, Array]
  },
  data() {
    return {
      runnerGroupTagConfig: {
        dynamicUrl: '/api/rest/tag/search?type=runnergroup',
        rootName: 'tagList',
        dealDataByUrl: this.$utils.getRunnerGroupTagList,
        border: 'border',
        clearable: true,
        multiple: true,
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
