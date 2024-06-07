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
            :item-list="formItemList"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import handleTimeMixin from '../app/components/handleTimeMixin.js';
export default {
  name: '', // 复制配置
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  mixins: [handleTimeMixin],
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dialogSetting: {
        type: 'modal',
        isShow: true,
        title: this.$t('term.deploy.copymodule'),
        okText: this.$t('page.confirm'),
        width: 'medium'
      },
      formValue: {
        actionType: 'add'
      },
      formItemList: [],
      copyFormList: [
        {
          name: 'actionType',
          type: 'radio',
          label: this.$t('term.deploy.copystrategy'),
          dataList: [
            {
              text: this.$t('dialog.title.addtarget', {target: this.$t('page.module')}),
              value: 'add'
            },
            {
              text: this.$t('term.deploy.copytoexistingmodule'),
              value: 'copy'
            }
          ],
          validateList: ['required'],
          transfer: true,
          onChange: (actionType) => {
            if (actionType && actionType == 'add') {
              this.formItemList = this.copyFormList.concat(this.addFormList);
              this.formValue = {};
              this.formValue.actionType = 'add';
            } else {
              this.formItemList = this.copyFormList.concat(this.existedFormList);
              this.formValue = {};
              this.formValue.actionType = 'copy';
            }
          }
        }
      ],
      addFormList: [ // 添加模块
        {
          name: 'abbrName',
          type: 'text',
          label: this.$t('term.deploy.abbreviation'),
          validateList: ['required', 'key-special'],
          maxlength: 50
        },
        {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50
        },
        {
          name: 'stateIdList',
          type: 'select',
          label: this.$t('term.deploy.useofstate'),
          url: '/api/rest/deploy/app/attr/search',
          params: {attrName: 'state', ciName: 'APPComponent'},
          textName: 'name',
          valueName: 'id',
          transfer: true
        },
        {
          name: 'ownerIdList',
          type: 'select',
          label: this.$t('page.responsibleperson'),
          url: '/api/rest/deploy/app/attr/search',
          params: {attrName: 'owner', ciName: 'APPComponent'},
          textName: 'name',
          valueName: 'id',
          search: true,
          multiple: true,
          transfer: true
        },
        {
          name: 'maintenanceWindow',
          type: 'timerange',
          format: 'HH:mm:ss',
          label: this.$t('term.autoexec.maintenanceperiod'),
          transfer: true
        },
        {
          name: 'description',
          type: 'textarea',
          label: this.$t('page.memo'),
          maxlength: 500
        }
      ],
      existedFormList: [ // 现有模块
        {
          name: 'toAppModuleIdList',
          label: this.$t('term.deploy.objectmodule'),
          type: 'select',
          multiple: true,
          transfer: true,
          validateList: ['required'],
          params: {...this.params},
          textName: 'abbrName',
          valueName: 'id',
          url: '/api/rest/deploy/app/config/without/config/module/list',
          desc: this.$t('term.deploy.objectmoduledesc')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.formItemList = this.copyFormList.concat(this.addFormList);
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
      let {appSystemId, appModuleId} = this.params;
      let params = {};
      params = {
        appSystemId,
        fromAppModuleId: appModuleId,
        ...this.formValue,
        stateIdList: this.formValue.stateIdList ? [this.formValue.stateIdList] : [],
        isAdd: (this.formValue && this.formValue.actionType == 'copy') ? 0 : 1
      };
      if (params && params.actionType) {
        delete params.actionType;
      }
      if (this.formValue && this.formValue.maintenanceWindow) {
        params.maintenanceWindow = this.setMaintenanceWindowValue(this.formValue.maintenanceWindow);
      }
      this.$api.deploy.applicationConfig.saveCopyConfigModule(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          let toAppModuleId = (this.formValue && this.formValue.toAppModuleIdList && this.formValue.toAppModuleIdList.length > 0) ? this.formValue.toAppModuleIdList[0] : null;
          this.closeDialog(true, this.formValue.actionType == 'copy' ? toAppModuleId : res.Return);
        }
      });
    },
    closeDialog(needRefresh = false, appModuleId = null) {
      this.$emit('close', needRefresh, appModuleId);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
