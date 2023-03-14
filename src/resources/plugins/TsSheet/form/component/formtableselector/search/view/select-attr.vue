<template>
  <div>
    <template v-if="!$utils.isEmpty(valueList)">
      <TsFormSelect
        ref="handler"
        v-bind="searchConfig"
        :value="valueList"
      ></TsFormSelect>
    </template>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  props: {
    attrData: {type: Object},
    valueList: { type: Array }
  },
  data() {
    return {
      multiple: false,
      validateList: [],
      searchConfig: {
        border: 'border',
        search: true,
        width: '100%',
        dynamicUrl: '/api/rest/cmdb/attr/targetci/search?attrId=' + this.attrData.id,
        textName: 'name',
        valueName: 'id',
        transfer: true,
        readonly: true
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
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
  watch: {
  }
};
</script>
<style lang="less">
</style>
