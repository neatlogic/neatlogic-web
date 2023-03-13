<template>
  <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
    <template v-slot:header>
      <div v-if="tableData.id">编辑帐号</div>
      <div v-if="!tableData.id">新建帐号</div>
    </template>
    <template v-slot>
      <TsForm ref="form" :item-list="formConfig"></TsForm>
    </template>
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
    id: { type: Number }
  },
  data() {
    let _this = this;
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true
      },
      tableData: {},
      formConfig: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        name: {
          type: 'text',
          name: 'name',
          label: '名称',
          maxlength: 50,
          validateList: [{ name: 'required', message: '请输入帐号名称', url: '/api/rest/resourcecenter/account/save', key: 'name' }, 'name-special']
        },
        account: {
          type: 'text',
          name: 'account',
          label: '用户名',
          maxlength: 50,
          validateList: [{ name: 'required', message: '请输入帐号用户名' }]
        },
        password: {
          type: 'password',
          name: 'password',
          showPassword: true,
          label: '密码',
          maxlength: 50,
          validateList: [{ name: 'required', message: '请输入帐号密码' }]
        },
        protocol: {
          type: 'select',
          label: '连接协议',
          value: '',
          multiple: false,
          transfer: true,
          url: 'api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.cmdb.enums.resourcecenter.Protocol' },
          validateList: [{ name: 'required', message: '请选择协议' }],
          onChange: function(val) {
            if (val === 'ssh') {
              _this.formConfig.port.isHidden = false;
            } else {
              _this.formConfig.port.isHidden = true;
            }
          }
        },
        port: {
          type: 'text',
          name: 'port',
          label: '端口',
          multiple: false,
          value: '',
          maxlength: 50,
          validateList: [
            { name: 'required', message: '请输入端口号' },
            { name: 'port', message: '请输入正确端口号' }
          ],
          isHidden: true
        }
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
      this.$api.cmdb.accountmanage
        .saveAccount(data)
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
            this.$Message.error('保存失败');
          }
        });
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    },
    getAccountType() {
      // this.formConfig.password.showPassword = false;
      if (this.id) {
        this.$api.accountmanage.getAccountById(this.id).then(res => {
          this.tableData = res.Return;
          for (let key in this.formConfig) {
            this.$set(this.formConfig[key], 'value', this.tableData[key]);
          }
          // this.formConfig.forEach(element => {
          //   this.$set(element, 'value', this.tableData[element.name]);
          // });
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
