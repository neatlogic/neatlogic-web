<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
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
    orgId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      formValue: {},
      dialogSetting: {
        title: this.$t('dialog.title.addtarget', {'target': this.$t('page.user')}),
        type: 'modal',
        isShow: true
      },
      formConfig: {
        userIdList: {
          type: 'select',
          label: this.$t('page.user'),
          transfer: true,
          multiple: true,
          dynamicUrl: '/api/rest/user/search',
          validateList: ['required'],
          rootName: 'tbodyList',
          valueName: 'userId',
          textName: 'name'
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
    okDialog() {
      if (!this.$refs.form?.valid()) {
        return false;
      }
      this.$api.dr.organizationalStructure.saveOrganizationUser({orgId: this.orgId, ...this.formValue}).then(res => {
        if (res.Status == 'OK') {
          this.$emit('close', true);
        }
      });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
