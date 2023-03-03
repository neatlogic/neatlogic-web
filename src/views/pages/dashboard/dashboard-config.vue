<template>
  <TsForm :item-list="formConfig" labelPosition="top">
  </TsForm>
</template>
<script>

export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    dashboard: { type: Object }
  },
  data() {
    return {
      formConfig: {
        type: {
          type: 'radio',
          label: '类型',
          dataList: [{value: 'system', text: '系统面板', disabled: !this.$AuthUtils.hasRole('DASHBOARD_MODIFY')}, {value: 'custom', text: '个人面板'}],
          value: this.dashboard.type,
          onChange: type => {
            this.$set(this.dashboard, 'type', type);
          }
        },
        authList: {
          type: 'userselect',
          groupList: ['role', 'user', 'team'],
          label: '授权',
          isHidden: this.dashboard.type != 'system',
          transfer: true,
          multiple: true,
          value: this.dashboard.authList,
          onChange: auth => {
            this.$set(this.dashboard, 'authList', auth);
          }
        },
        description: {
          type: 'textarea',
          label: '说明',
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
    },
    'dashboard.type': {
      handler: function(val) {
        if (val == 'system') {
          this.formConfig.authList.isHidden = false;
        } else {
          this.formConfig.authList.isHidden = true;
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped></style>
