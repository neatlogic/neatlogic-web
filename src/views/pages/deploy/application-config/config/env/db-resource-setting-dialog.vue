<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      :title="isAddDbResource? $t('dialog.title.addtarget', {target: $t('page.database')}): $t('dialog.title.edittarget', {target: $t('page.database')})"
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
    isAddDbResource: {
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
          textName: 'label',
          valueName: 'id',
          disabled: !this.isAddDbResource,
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
          validateList: ['required', 'ip']
        },
        {
          name: 'port',
          type: 'number',
          label: this.$t('page.port'),
          validateList: ['port']
        }
      ],
      mainCi: null
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
      await this.getResourceEntityByCiid();
      this.getCiList();
      if (!this.$utils.isEmpty(this.dbResourceData)) {
        this.$set(this.formValue, 'ciId', this.dbResourceData.typeId);
        this.$set(this.formValue, 'name', this.dbResourceData.name);
        this.$set(this.formValue, 'ip', this.dbResourceData.ip);
        this.$set(this.formValue, 'port', this.dbResourceData.port);
      }
    },
    getResourceEntityByCiid() {
      return this.$api.cmdb.applicationManage.getResourceEntityByName('scence_database_ip_port_env_appmodule').then(res => {
        if (res.Return && res.Return.config && res.Return.config.mainCi) {
          this.mainCi = res.Return.config.mainCi;
        }
      });
    },
    getCiList() {
      if (!this.mainCi) {
        return false;
      }
      this.$api.common.updateCmdbMenu({ciNameList: [this.mainCi], isAbstract: 0}).then((res) => {
        if (res && res.Status == 'OK') {
          this.formList.forEach((item) => {
            if (item.name == 'ciId') {
              item.dataList = res.Return ? res.Return[0]['ciList'] : [];
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
