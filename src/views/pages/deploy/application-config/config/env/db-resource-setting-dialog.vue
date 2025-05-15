<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      :title="isNewData? $t('dialog.title.addtarget', {target: $t('page.database')}): $t('dialog.title.edittarget', {target: $t('page.database')})"
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
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    isNewData: { // 是否新增数据
      type: Boolean,
      default: false
    },
    dbResourceData: Object,
    params: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      loadingShow: false,
      dialogSetting: {
        isShow: true,
        type: 'modal',
        width: 'medium'
      },
      formValue: {
        ciId: null,
        name: null,
        ip: null,
        port: null
      },
      formList: [
        {
          name: 'ciId',
          type: 'select',
          label: this.$t('term.deploy.configurationmodel'),
          validateList: ['required'],
          multiple: false,
          transfer: true,
          disabled: !this.isNewData,
          dataList: []
        },
        {
          name: 'name',
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['name-special']
        },
        {
          name: 'ip',
          type: 'text',
          label: 'IP',
          validateList: ['ip']
        },
        {
          name: 'port',
          type: 'number',
          label: this.$t('page.port'),
          validateList: ['port']
        }
      ],
      ciId: null,
      attrNameList: ['name', 'ip', 'port']
    };
  },
  beforeCreate() {},
  created() {
    this.initData();
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
    async initData() {
      this.loadingShow = true;
      await this.getResourceEntityByCiId();
      await this.getAppInstanceCiAttrList(this.ciId);
      this.getCiList();
      if (!this.isNewData && !this.$utils.isEmpty(this.dbResourceData)) {
        this.$set(this.formValue, 'ciId', this.dbResourceData.typeId);
        this.$set(this.formValue, 'name', this.dbResourceData.name);
        this.$set(this.formValue, 'ip', this.dbResourceData.ip);
        this.$set(this.formValue, 'port', this.dbResourceData.port);
      }
      this.$nextTick(() => {
        this.loadingShow = false;
      });
    },
    getAppInstanceCiAttrList(ciId) {
      if (!this.ciId) {
        return false; 
      }
      let params = {
        isAll: 0,
        attrNameList: this.attrNameList,
        ciId: ciId
      };
      return this.$api.deploy.applicationConfig.getAppInstanceCiAttrList(params).then((res) => {
        if (res.Status == 'OK') {
          const attrObj = res.Return || {};
          const validMap = {
            name: ['name-special'],
            ip: ['ip'],
            port: ['port']
          };
          this.formList.forEach((item) => {
            if (attrObj[item.name]) {
              const attr = attrObj[item.name];
              let validateList = validMap[item.name] || [];
              if (attr.isRequired && attr.isRequired == 1) {
                validateList.push('required');
              } 
              this.$set(item, 'validateList', validateList);
            }
          });
        }
      });
    },
    getResourceEntityByCiId() {
      return this.$api.cmdb.applicationManage.getResourceEntityByName('scence_database_ip_port_env_appmodule').then(res => {
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
          this.formList.forEach((item) => {
            if (item.name == 'ciId') {
              item.dataList = res.Return || [];
            }
          });
        }
      });
    },
    okDialog() {
      if (!this.$refs.form.valid()) {
        return false; 
      }
      let data = {
        appSystemId: this.params.appSystemId,
        appModuleId: this.params.appModuleId,
        envId: this.params.envId,
        ciId: this.formValue.ciId,
        name: this.formValue.name,
        ip: this.formValue.ip,
        port: this.formValue.port
      };
      if (!this.$utils.isEmpty(this.dbResourceData)) {
        data.id = this.dbResourceData.id;
      }
      this.$api.deploy.env.saveEnvDbResource(data).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          const id = res.Return.id;
          this.closeDialog(id);
        }
      });
    },
    closeDialog(id) {
      this.$emit('close', id);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
