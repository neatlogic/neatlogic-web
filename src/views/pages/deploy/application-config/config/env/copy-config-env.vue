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
            :item-list="formList"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 复制配置（环境层）
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      formValue: {
        actionType: 'add'
      },
      dialogSetting: {
        type: 'modal',
        isShow: true,
        title: this.$t('term.deploy.copyenv'),
        okText: this.$t('page.confirm'),
        width: 'medium'
      },
      formList: [],
      copyList: [
        {
          name: 'actionType',
          type: 'radio',
          label: this.$t('term.deploy.copystrategy'),
          dataList: [
            {
              text: this.$t('dialog.title.addtarget', {target: this.$t('page.environment')}),
              value: 'add'
            },
            {
              text: this.$t('term.deploy.copytotheexistingenvironment'),
              value: 'copy'
            }
          ],
          validateList: ['required'],
          transfer: true,
          onChange: (actionType) => {
            if (actionType && actionType == 'add') {
              this.formList = this.copyList.concat(this.addformList);
              this.formValue = {};
              this.formValue.actionType = 'add';
            } else {
              this.formList = this.copyList.concat(this.existingFormList);
              this.formValue = {};
              this.formValue.actionType = 'copy';
            }
          }
        }
      ],
      addformList: [ // 添加环境
        {
          name: 'toEnvIdList',
          type: 'select',
          label: this.$t('term.deploy.targetenvironment'),
          validateList: ['required'],
          multiple: true,
          transfer: true,
          valueName: 'id',
          textName: 'name',
          params: {...this.params, isHasEnv: 0},
          url: '/api/rest/deploy/app/config/env/list'
        }
      ],
      existingFormList: [ // 现有环境
        {
          name: 'toEnvIdList',
          label: this.$t('term.deploy.targetenvironment'),
          type: 'select',
          multiple: true,
          transfer: true,
          validateList: ['required'],
          textName: 'name',
          valueName: 'id',
          params: {...this.params},
          url: '/api/rest/deploy/app/config/without/config/env/list',
          desc: this.$t('term.deploy.notconfigenvdesc')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.formList = this.copyList.concat(this.addformList);
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
      let {appSystemId, appModuleId, envId} = this.params;
      let {toEnvIdList, actionType} = this.formValue;
      let params = {
        appSystemId,
        appModuleId,
        fromEnvId: envId,
        toEnvIdList,
        isAdd: actionType == 'copy' ? 0 : 1
      };
      this.$api.deploy.applicationConfig.saveCopyConfigEnv(params).then((res) => {
        if (res && res.Status == 'OK') {
          let toEnvId = (toEnvIdList && toEnvIdList.length > 0) ? toEnvIdList[0] : null;
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true, toEnvId);
        }
      });
    },
    closeDialog(needRefresh = false, toEnvId = null) {
      this.$emit('close', needRefresh, toEnvId);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
