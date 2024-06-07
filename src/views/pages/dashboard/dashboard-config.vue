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
        type: {
          type: 'radio',
          label: this.$t('page.type'),
          dataList: [{value: 'system', text: this.$t('term.dashboard.systemdashboard'), disabled: !this.$AuthUtils.hasRole('DASHBOARD_MODIFY')}, {value: 'custom', text: this.$t('term.dashboard.personaldashboard')}],
          value: this.dashboard.type,
          onChange: type => {
            this.$set(this.dashboard, 'type', type);
          }
        },
        authList: {
          type: 'userselect',
          groupList: ['role', 'user', 'team', 'common'],
          label: this.$t('page.auth'),
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
