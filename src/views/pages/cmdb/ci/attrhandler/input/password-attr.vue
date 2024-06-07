<template>
  <div>
    <TsFormInput
      ref="handler"
      :value="value"
      :disabled="disabled"
      :validateList="validateList"
      type="password"
      @change="setData"
    ></TsFormInput>
  </div>
</template>
<script>
export default {
  name: '',
  components: { TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput') },
  props: {
    disabled: {type: Boolean, default: false},
    attrEntity: {type: Object},
    attrData: { type: Object },
    valueList: { type: Array }
  },
  data() {
    return {
      value: '',
      validateList: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.attrData) {
      if (this.attrData.isRequired || this.attrData.isCiUnique) {
        this.validateList.push('required');
      }
    }
    if (this.valueList && this.valueList.length > 0) {
      if (this.attrEntity && this.attrEntity.ciEntityId) {
        this.$api.cmdb.cientity.getPasswordPlaintext(this.attrEntity.ciEntityId, this.attrData.id).then(res => {
          this.value = res.Return;
        });
      } else {
        this.value = this.valueList[0];
      }
    }
  },
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
      this.$emit('setData', [val]);
      this.$emit('setValue', [val]);
    },
    valid() {
      //验证数据合法性
      const handler = this.$refs['handler'];
      return handler.valid();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
