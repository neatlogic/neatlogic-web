<template>
  <div>
    {{ new Date().getTime() }}
    <TsFormSelect v-bind="selectConfig"></TsFormSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    relData: { type: Object }
  },
  data() {
    return {
      selectConfig: {
        border: 'border',
        dynamicUrl: '/api/rest/cmdb/cientity/search',
        params: { ciId: this.relData.direction == 'from' ? this.relData.toCiId : this.relData.fromCiId },
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        onChange: (value) => {
          this.$emit('change', value);
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
  updated() {
  },
  activated() {
  },
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
