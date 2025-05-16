<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :title="dialogTitle"
      :ok-text="$t('page.confirm')"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <loading :loadingShow="loadingShow" type="fix"></loading>
          <TsForm
            v-if="!loadingShow"
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
import handleTimeMixin from '../app/components/handleTimeMixin.js';
import appEditAttrList from '../app/appEditAttrList.js';
export default {
  name: '', // 环境/实例列表
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  mixins: [handleTimeMixin, appEditAttrList],
  props: {
    params: {
      type: Object,
      default: () => {}
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    instanceData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loadingShow: true,
      dialogTitle: this.isEdit == true ? this.$t('dialog.title.edittarget', {target: this.$t('page.instance')}) : this.$t('dialog.title.addtarget', {target: this.$t('page.instance')}),
      formValue: {},
      formList: [],
      exampleList: [
        {
          name: 'instance',
          type: 'radio',
          label: this.$t('page.instance'),
          disabled: this.isEdit,
          dataList: [
            {
              text: this.isEdit == true ? this.$t('dialog.title.edittarget', {target: this.$t('page.instance')}) : this.$t('dialog.title.addtarget', {target: this.$t('page.instance')}),
              value: 1
            },
            {
              text: this.$t('term.deploy.selectexistexample'),
              value: 2
            }
          ],
          validateList: ['required'],
          transfer: true,
          onChange: (val) => {
            if (val && val == 1) {
              this.formList = this.exampleList.concat(this.addformList);
              this.formValue = {};
              this.formValue.instance = 1;
            } else {
              this.formList = this.exampleList.concat(this.existingFormList);
              this.formValue = {};
              this.formValue.instance = 2;
            }
          }
        }
      ],
      attrNameList: ['name', 'ip', 'port', 'maintenanceWindow'],
      addformList: [ // 添加实例
        {
          name: 'ciId',
          type: 'select',
          label: this.$t('term.deploy.configurationmodel'),
          validateList: ['required'],
          multiple: false,
          transfer: true,
          disabled: this.isEdit,
          dataList: []
        }
      ],
      existingFormList: [ // 现有实例
        {
          name: 'instanceIdList',
          label: this.$t('term.deploy.selectexample'),
          type: 'select',
          multiple: true,
          transfer: true,
          validateList: ['required'],
          params: {...this.params, isAutoConfig: 0},
          rootName: 'tbodyList',
          dynamicUrl: 'api/rest/deploy/app/config/instance/search',
          dealDataByUrl: (list) => this.dealDataByUrl(list)
        }
      ],
      ciId: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getAppInstanceCiAttrList();
    await this.getResourceEntityByCiId();
    this.formList = this.exampleList.concat(this.addformList);
    this.$set(this.formValue, 'instance', 1);
    if (this.isEdit == true && this.instanceData) {
      this.$set(this.formValue, 'ciId', this.instanceData.ciId);
      this.$set(this.formValue, 'id', this.instanceData.id);
      this.$set(this.formValue, 'name', this.instanceData.name);
      this.$set(this.formValue, 'ip', this.instanceData.ip);
      this.$set(this.formValue, 'port', this.instanceData.port);
      if (this.instanceData.maintenanceWindow) {
        this.$set(this.formValue, 'maintenanceWindow', this.handleMaintenanceWindowValue([this.instanceData.maintenanceWindow]));
      }
    }
    this.getCiList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getAppInstanceCiAttrList() {
      let params = {
        isAll: 0,
        attrNameList: this.attrNameList
      };
      // 获取应用实例模型属性列表
      //此接口查询的属性列表里的控件，现在from控件大部分都支持，有不支持，如 附件、表格、表达式、超链接
      await this.$api.deploy.applicationConfig.getAppInstanceCiAttrList(params).then((res) => {
        if (res.Status == 'OK') {
          this.addformList = this.addformList.concat(this.getAppCiAttrList(res.Return, this.attrNameList, 'APPIns'));
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    dealDataByUrl(nodeList) {
      let dataList = [];
      if (nodeList) {
        let filterNodeList = nodeList.filter(item => item.ip);
        if (filterNodeList.length > 0) {
          dataList = filterNodeList.map((item) => {
            let baseText = item.ip;
            if (item.port) {
              baseText += `:${item.port}`;
            }
            if (item.name) {
              baseText += `[${item.name}]`;
            }
            return {
              value: item.id,
              text: baseText
            };
          });
        }
      }
      return dataList;
    },
    getResourceEntityByCiId() {
      return this.$api.cmdb.applicationManage.getResourceEntityByName('scence_appinstance_env_appmodule_appsystem').then(res => {
        if (res.Return && res.Return.ciId) {
          this.ciId = res.Return.ciId;
        }
      });
    },
    getCiList() {
      if (!this.ciId) {
        return false;
      }
      this.$api.cmdb.ci.getCiList({idList: [this.ciId], needChildren: 1, isAbstract: 0}).then((res) => {
        if (res && res.Status == 'OK') {
          this.addformList.forEach((item) => {
            if (item.name == 'ciId') {
              item.dataList = res.Return || [];
            }
          });
        }
      });
    },
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      let formValue = this.$utils.deepClone(this.formValue);
      if (formValue) {
        delete formValue.instance;
      }
      let params = {
        ...formValue,
        ...this.params
      };
      if (formValue && formValue.maintenanceWindow) {
        params.maintenanceWindow = this.setMaintenanceWindowValue(formValue.maintenanceWindow);
      }
      if (this.isEdit == true) {
        params.id = this.instanceData.id;
      }
      this.$api.deploy.applicationConfig.saveEnvInstance(params).then((res) => {
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
