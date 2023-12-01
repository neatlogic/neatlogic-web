<template>
  <div>
    <TsDialog
      :title="$t('term.deploy.configrunnergroup')"
      type="modal"
      :isShow="true"
      :ok-text="$t('page.save')"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="form"
            v-model="formValue"
            :item-list="formConfig"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    runnerId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      formValue: {
        runnerGroupId: this.runnerId
      },
      formConfig: [
        {
          name: 'runnerGroupId',
          type: 'select',
          label: this.$t('term.deploy.runnergroup'),
          validateList: ['required'],
          url: '/api/rest/runnergroup/search',
          transfer: true,
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id'
        }
      ]
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
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      let params = {
        ...this.formValue,
        ...this.params
      };
      this.$api.deploy.applicationConfig.saveModuleRunnerGroup(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true);
        }
      });
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
