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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
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
        title: '复制模块',
        okText: '确认',
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
          label: '复制策略',
          dataList: [
            {
              text: '添加模块',
              value: 'add'
            },
            {
              text: '复制到现有模块',
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
          label: '简称',
          validateList: ['required', 'key-special'],
          maxlength: 50
        },
        {
          name: 'name',
          type: 'text',
          label: '名称',
          maxlength: 50
        },
        {
          name: 'stateIdList',
          type: 'select',
          label: '使用状态',
          url: '/api/rest/deploy/app/attr/search',
          params: {attrName: 'state', ciName: 'APPComponent'},
          textName: 'name',
          valueName: 'id',
          transfer: true
        },
        {
          name: 'ownerIdList',
          type: 'select',
          label: '负责人',
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
          label: '维护期',
          transfer: true
        },
        {
          name: 'description',
          type: 'textarea',
          label: '备注',
          maxlength: 500
        }
      ],
      existedFormList: [ // 现有模块
        {
          name: 'toAppModuleIdList',
          label: '目标模块',
          type: 'select',
          multiple: true,
          transfer: true,
          validateList: ['required'],
          params: {...this.params},
          textName: 'abbrName',
          valueName: 'id',
          url: '/api/rest/deploy/app/config/without/config/module/list',
          desc: '仅支持将模块配置信息复制到未配置或已清空配置的模块'
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
          this.$Message.success(this.$t('message.content.savesuccess'));
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
