<template>
  <div>
    <TsFormSelect
      ref="propertyHandler"
      :transfer="true"
      :dataList="categoryList"
      :value="value"
      valueName="id"
      textName="name"
      :validateList="property.restraint == 'M'?[{name:'required',message:' '}]:[]"
      @on-change="setData"
    ></TsFormSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue')
  },
  props: {
    value: {type: String},
    property: {type: Object}
  },
  data() {
    return {
      categoryList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCategoryList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getCategoryList() {
      if (this.property && this.property.interfaceId) {
        this.$api.pbc.category.getCategoryByInterfaceId(this.property.interfaceId).then(res => {
          this.categoryList = res.Return;
        });
      }
    },
    setData(val) {
      this.$emit('setData', val);
    },
    valid() {
      return this.$refs['propertyHandler'].valid();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
