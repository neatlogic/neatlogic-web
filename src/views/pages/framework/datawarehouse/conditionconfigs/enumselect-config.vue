<template>
  <div>
    <TsForm
      ref="form"
      :item-list="formConfig"
    ></TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    config: {type: Object}
  },
  data() {
    return {
      formConfig: {
        enum: {
          type: 'select',
          label: '枚举',
          transfer: true,
          value: this.config.enum,
          validateList: ['required'],
          dynamicUrl: '/api/rest/universal/enum/search',
          onChange: val => {
            this.$set(this.config, 'enum', val);
          }
        },
        isMultiple: {
          type: 'radio',
          value: this.config.isMultiple,
          dataList: [{value: 1, text: '是'}, {value: 0, text: '否'}],
          validateList: ['required'],
          label: '多选',
          onChange: val => {
            this.$set(this.config, 'isMultiple', val);
          }
        }
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
    valid() {
      return this.$refs['form'].valid();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
