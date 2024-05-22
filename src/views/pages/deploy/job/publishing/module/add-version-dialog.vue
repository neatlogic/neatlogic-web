<template>
  <div>
    <TsDialog
      :title="$t('dialog.title.addtarget', {target: $t('page.versions')})"
      type="modal"
      :isShow="true"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="versiondForm"
            v-model="formValue"
            :item-list="formList"
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      appSystemName: '',
      appModuleName: '',
      formValue: {
        isFreeze: 0
      },
      formList: [
        {
          label: this.$t('page.apply'),
          type: 'select',
          name: 'appSystemId',
          validateList: ['required'],
          search: true,
          transfer: true,
          dynamicUrl: 'api/rest/deploy/app/config/appsystem/search',
          params: {authorityActionList: ['versionAndProductManager']},
          dealDataByUrl: (nodeList) => { return this.dealDataByUrl(nodeList); },
          rootName: 'tbodyList',
          border: 'border',
          disabled: true
        },
        {
          label: this.$t('page.module'),
          type: 'select',
          name: 'appModuleId',
          validateList: ['required'],
          search: true,
          transfer: true,
          dynamicUrl: '/api/rest/deploy/app/config/module/list',
          params: {appSystemId: this.params.appSystemId},
          dealDataByUrl: (nodeList) => { return this.dealDataByUrl(nodeList); },
          border: 'border',
          disabled: true
        },
        {
          label: this.$t('page.versions'),
          type: 'text',
          name: 'version',
          maxlength: 50,
          validateList: [
            'required',
            'key-special',
            {
              name: 'searchUrl',
              url: '/api/rest/deploy/version/save',
              key: 'version',
              params: {
                appModuleId: this.params.appModuleId,
                appSystemId: this.params.appSystemId
              }
            }
          ]
        },
        {
          label: this.$t('term.deploy.sealplate'),
          type: 'switch',
          name: 'isFreeze',
          falseValue: 0,
          trueValue: 1,
          value: 0
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
      let versiondForm = this.$refs.versiondForm;
      if (versiondForm && !versiondForm.valid()) {
        return false;
      }
      this.$api.deploy.version.saveVersion(this.formValue).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true);
        }
      });
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    dealDataByUrl(nodeList) {
      let dataList = [];
      if (nodeList && nodeList.length > 0) {
        nodeList.forEach((item) => {
          dataList.push({
            text: item.abbrName ? (item.name ? `${item.abbrName}[${item.name}]` : item.abbrName) : '',
            value: item.id
          });
        });
      }
      return dataList;
    }
  },
  filter: {},
  computed: {},
  watch: {
    params: {
      handler(val) {
        if (val) {
          this.$set(this.formValue, 'appSystemId', val.appSystemId || null);
          this.$set(this.formValue, 'appModuleId', val.appModuleId || null);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
