<template>
  <TsForm :item-list="formConfig" labelPosition="top">
  </TsForm>
</template>
<script>

export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    dashboard: { type: Object }
  },
  data() {
    return {
      formConfig: {
        description: {
          type: 'textarea',
          label: this.$t('page.description'),
          value: this.dashboard.description,
          onChange: desc => {
            this.$set(this.dashboard, 'description', desc);
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
  },
  filter: {},
  computed: {},
  watch: {
    dashboard: {
      handler: function(val) {
        if (val) {
          for (let key in this.formConfig) {
            this.$set(this.formConfig[key], 'value', val[key]);
          }
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped></style>
