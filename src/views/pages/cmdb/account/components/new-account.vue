<template>
  <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
    <TsForm ref="form" :item-list="formConfig">
    </TsForm>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {},
  props: {
    id: { type: Number },
    title: String
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.title
      },
      tableData: {
        dataList: []
      },
      formConfig: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        name: {
          type: 'text',
          name: 'name',
          width: '100%',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.name')}), url: '/api/rest/resourcecenter/account/save', key: 'name' }]
        },
        account: {
          type: 'text',
          name: 'account',
          width: '100%',
          label: this.$t('page.username'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.username')})}]
        },
        passwordPlain: {
          type: 'password',
          name: 'passwordPlain',
          width: '100%',
          label: this.$t('page.password')
        },
        protocolId: {
          type: 'select',
          width: '100%',
          label: this.$t('page.protocol'),
          placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.protocol')}),
          dynamicUrl: 'api/rest/resourcecenter/account/protocol/search',
          dealDataByUrl: this.$utils.getProtocolDataList,
          params: {isExcludeTagent: 1}, // 是否排除tagent
          rootName: 'tbodyList',
          name: 'protocolId',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.protocol')}) }],
          transfer: true
        },
        isDefault: {
          type: 'switch',
          name: 'isDefault',
          label: this.$t('page.isdefault'), // 默认帐号
          validateList: ['required']
        },
        tagIdList: {
          type: 'select',
          name: 'tagIdList',
          width: '100%',
          label: this.$t('page.tag'),
          transfer: true,
          multiple: true,
          value: [],
          search: true,
          allowCreate: true,
          dynamicUrl: 'api/rest/resourcecenter/tag/list/forselect',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id'
        }
        // port: {
        //   type: 'text',
        //   name: 'port',
        //   width: '100%',
        //   label: this.$t('page.port'),
        //   maxlength: 50,
        //   tooltip: '主机帐号需要填写端口，应用帐号无需填写端口',
        //   validateList: [
        //     { name: 'port', message: this.$t('form.validate.inputcorrectport') }
        //   ]
        // }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getAccountType();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    save() {
      const form = this.$refs['form'];
      let data = this.$refs.form.getFormValue();
      if (!form.valid()) {
        return;
      }
      this.$api.cmdb.accountManage
        .saveAccount({...data, type: 'public'})
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        })
        .catch(error => {
          if (error.data.Message) {
            this.$Message.error(error.data.Message);
          } else {
            this.$Message.error(this.$t('message.savesuccess'));
          }
        });
    },
    close: function(needRefresh, formValue = null) {
      this.$emit('close', needRefresh, formValue);
    },
    getAccountType() {
      this.formConfig.passwordPlain.passwordPlain = false;
      if (this.id) {
        this.$api.cmdb.accountManage.getAccountById(this.id).then(res => {
          this.tableData = res.Return;
          for (let key in this.formConfig) {
            this.$set(this.formConfig[key], 'value', this.tableData[key]);            
          }
          if (this.tableData.tagList && this.tableData.tagList.length > 0) {
            let idList = [];
            this.tableData.tagList.forEach(v => {
              idList.push(v.id);
            });
            this.$set(this.formConfig.tagIdList, 'value', idList);   
          }
          this.accountValidate(this.tableData.protocolId);
        });
      } 
    }
  },
  computed: {},
  watch: {}
};
</script>
