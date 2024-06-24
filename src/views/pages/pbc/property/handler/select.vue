<template>
  <div>
    <!--如果数据范例中包含逗号，则认为是可以多选-->
    <TsFormSelect
      ref="propertyHandler"
      :transfer="true"
      :dataList="property.enumList"
      :value="formatedValue"
      :multiple="property.example && property.example.includes(',')"
      :validateList="property.restraint == 'M' ? [{ name: 'required', message: ' ' }] : []"
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
    value: { type: String },
    property: { type: Object }
  },
  data() {
    return {};
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
    setData(val) {
      if (val && val instanceof Array && val.length > 0) {
        this.$emit('setData', val.join(','));
      } else {
        this.$emit('setData', val);
      }
    },
    valid() {
      return this.$refs['propertyHandler'].valid();
    }
  },
  filter: {},
  computed: {
    formatedValue() {
      if (this.value) {
        if (this.value.includes(',')) {
          return this.value.split(',');
        }
      }
      return this.value;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
