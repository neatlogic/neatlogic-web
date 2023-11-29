<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div v-if="appSystemId">{{ $t('dialog.title.edittarget', {target: $t('page.apply')}) }}</div>
        <div v-else>{{ $t('dialog.title.addtarget', {target: $t('page.apply')}) }}</div>
      </template>
      <template v-slot>
        <div>
          <loading :loadingShow="loadingShow" type="fix"></loading>
          <TsForm
            ref="form"
            v-model="formValue"
            :item-list="formConfig"
          >
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import handleTimeMixin from './handleTimeMixin.js';
import appEditAttrList from '../appEditAttrList.js';
export default {
  name: '', // 编辑模块
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  mixins: [handleTimeMixin, appEditAttrList],
  props: {
    appSystemId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loadingShow: true,
      dialogSetting: {
        type: 'modal',
        isShow: true,
        width: 'medium',
        okText: this.$t('page.confirm')
      },
      attrNameList: ['abbrName', 'name', 'state', 'owner', 'maintenanceWindow', 'description'],
      formValue: {},
      formConfig: [
        {
          label: 'id',
          name: 'id',
          isHidden: true
        } 
      ]
    };
  },
  beforeCreate() {},
  async created() {
    await this.getAppSystemCiAttrList();
    if (this.appSystemId) {
      this.getAppSystemById(this.appSystemId);
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
    getAppSystemCiAttrList() {
      let params = {
        isAll: 0,
        attrNameList: this.attrNameList
      };
      //获取应用系统模型属性列表
      //此接口查询的属性列表里的控件，现在from控件大部分都支持，有个别不支持，如附件、表格、表达式、超链接
      return this.$api.deploy.applicationConfig.getAppSystemCiAttrList(params).then((res) => {
        if (res.Status == 'OK') {
          this.formConfig = this.formConfig.concat(this.getAppCiAttrList(res.Return, this.attrNameList, 'APP'));
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      let params = {
        ...this.formValue,
        appSystemId: this.appSystemId
      };
      if (this.formValue && this.formValue.maintenanceWindow) {
        params.maintenanceWindow = this.setMaintenanceWindowValue(this.formValue.maintenanceWindow);
      }
      let {state} = this.formValue;
      params.state = state ? (state instanceof Array ? state : [state]) : []; // 处理使用状态单选的情况
      let {owner} = this.formValue;
      params.owner = owner ? (owner instanceof Array ? owner : [owner]) : []; // 处理负责人单选的情况
      this.$api.deploy.applicationConfig.saveAppSystem(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true, res.Return);
        }
      });
    },
    getAppSystemById(id) {
      this.$api.deploy.applicationConfig.getAppSystem(id).then((res) => {
        if (res && res.Status == 'OK') {
          let dataInfo = res.Return || {};
          if (dataInfo && !this.$utils.isEmpty(dataInfo)) {
            this.formConfig && this.formConfig.forEach((item) => {
              if (dataInfo[item.name]) {
                this.$set(this.formValue, item.name, item.name == 'maintenanceWindow' ? this.handleMaintenanceWindowValue(dataInfo[item.name]) : dataInfo[item.name]);
              }
            });
          }
        }
      });
    },
    closeDialog(needRefresh = false, appSystemId = null) {
      this.$emit('close', needRefresh, appSystemId);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
