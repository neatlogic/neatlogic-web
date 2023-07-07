<template>
  <div>
    <TsDialog
      :title="$t('page.newversion')"
      type="modal"
      :isShow="true"
      :okText="$t('page.save')"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="form"
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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      formValue: {
        isFreeze: 0,
        ...this.params
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
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          onChange: (appSystemId) => {
            if (this.formValue && this.formValue.appModuleId) {
              this.$delete(this.formValue, 'appModuleId');
            }
            this.handleModuleParams(appSystemId);
          }
        },
        {
          label: this.$t('page.module'),
          type: 'select',
          name: 'appModuleId',
          validateList: ['required'],
          search: true,
          transfer: true,
          dynamicUrl: 'api/rest/resourcecenter/appmodule/list',
          params: {appSystemIdList: []},
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          disabled: false,
          disabledHoverTitle: ''
        },
        {
          label: this.$t('page.versions'),
          type: 'text',
          name: 'version',
          maxlength: 50,
          validateList: ['required', 'key-special', { 
            name: 'searchUrl', 
            url: '/api/rest/deploy/version/save', 
            key: 'version', 
            message: this.$t('form.validate.repeat', {target: this.$t('page.versions')}), 
            params: {} 
          }]
        },
        {
          label: this.$t('term.deploy.sealplate'),
          type: 'switch',
          name: 'isFreeze',
          falseValue: 0,
          trueValue: 1,
          value: 0
        },
        {
          label: this.$t('page.description'),
          type: 'textarea',
          name: 'description',
          maxlength: 1024,
          autosize: {minRows: 4, maxRows: 20}
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    let {appSystemId} = this.params;
    if (appSystemId) {
      this.handleModuleParams(appSystemId);
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
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      this.$api.deploy.version.saveVersion({...this.formValue}).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true);
        }
      });
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    handleModuleParams(appSystemId) {
      // 处理模块参数
      for (let key = 0; key < this.formList.length; key++) {
        if (this.formList[key]['name'] == 'appModuleId') {
          this.formList[key]['params']['appSystemIdList'] = appSystemId ? [appSystemId] : [];
          this.formList[key]['disabledHoverTitle'] = appSystemId ? '' : this.$t('form.placeholder.pleaseselect', {target: this.$t('page.apply')});
          this.formList[key]['disabled'] = !appSystemId;
          break;
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
