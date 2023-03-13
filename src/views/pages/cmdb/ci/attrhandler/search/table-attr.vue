<template>
  <div>
    <TsFormSelect
      ref="handler"
      v-bind="searchConfig"
      :value="valueList"
    ></TsFormSelect>
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
    valueList: {type: Array}
  },
  data() {
    return {
      multiple: false,
      validateList: [],
      searchConfig: {
        border: 'border',
        multiple: true,
        search: true,
        width: '100%',
        dynamicUrl: '/api/rest/cmdb/cientity/search',
        params: {ciId: this.attrData.targetCiId},
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        idListName: 'idList',
        transfer: true,
        onChange: (val, opt) => {
          if (opt) {
            if (Array.isArray(opt)) {
              this.$emit('setData', val, opt.filter(d => d.text));
            } else {
              this.$emit('setData', val, opt.text);
            }
          } else {
            this.$emit('setData', '', '');
          }
        }
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
