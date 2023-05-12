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
    valueList: { type: Array }
  },
  data() {
    return {
      multiple: false,
      validateList: [],
      searchConfig: {
        multiple: true,
        border: 'border',
        search: true,
        width: '100%',
        dynamicUrl: '/api/rest/cmdb/attr/targetci/search?attrId=' + this.attrData.id,
        textName: 'name',
        valueName: 'id',
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
