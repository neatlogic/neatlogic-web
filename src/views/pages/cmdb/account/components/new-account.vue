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
    isHidden: Boolean,
    title: String
  },
  data() {
    let _this = this;
    return {
      operateType: 'addTag',
      protocolAndPort: '', // 协议端口
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: _this.title
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
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.username')})}],
          isHidden: _this.isHidden
        },
        passwordPlain: {
          type: 'password',
          name: 'passwordPlain',
          width: '100%',
          label: this.$t('page.password'),
          maxlength: 50
        },
        protocolId: {
          type: 'select',
          width: '100%',
          label: this.$t('page.protocol'),
          placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.protocol')}),
          dynamicUrl: '',
          dataList: [],
          name: 'protocolId',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.protocol')}) }],
          transfer: true,
          onChange: function(val) {
            _this.accountValidate(val);
          },
          onChangelabel: (label) => {
            this.protocolAndPort = label;
          }
        },
        isDefault: {
          type: 'switch',
          name: 'isDefault',
          label: _this.$t('page.defaultaccount'), // 默认帐号
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
    this.getdataList();
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
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.close(true);
          }
        })
        .catch(error => {
          if (error.data.Message) {
            this.$Message.error(error.data.Message);
          } else {
            this.$Message.error(this.$t('message.content.savesuccess'));
          }
        });
    },
    accountValidate(val) {
      let requiredData = [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.accounts')}), url: '/api/rest/resourcecenter/account/save', key: 'name' }];
      if (val == '478184378212353') {
        // 如果选择为 tagent 的时候，用户名为非必填
        this.formConfig.account.validateList = [];
        this.formConfig.account.isHidden = true; // 隐藏帐号字段
      } else {
        this.formConfig.account.validateList = requiredData;
        this.formConfig.account.isHidden = false;
      }
    },
    getdataList() {
      let data = {
        keyword: ''
      };
      let that = this;
      that.$api.cmdb.accountManage.searchlistresourcecenter(data)
        .then(res => {
          if (res.Status == 'OK') {
            let resData = res.Return.tbodyList;
            let newObj = [];            
            resData.forEach(v => {
              let name = v.name;
              if (v.id == '445524809146368') {
                newObj.push(
                  {text: name, value: v.id, _disabled: true}
                );
              } else {
                newObj.push(
                  {text: name, value: v.id, _disabled: false}
                );
              }
            });
            this.$nextTick(() => {
              this.formConfig.protocolId.dataList = newObj;
            });
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
      } else {
        this.tableData = {};
        for (let key in this.formConfig) {
          this.$set(this.formConfig[key], 'value', this.tableData[key]);
        }
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
