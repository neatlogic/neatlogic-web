<template>
  <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
    <template v-slot:header>
      <div v-if="tableData.id">{{ $t('dialog.title.edittarget',{'target':$t('page.account')}) }}</div>
      <div v-if="!tableData.id">{{ $t('dialog.title.addtarget',{'target':$t('page.account')}) }}</div>
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
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.name')}), url: '/api/rest/resourcecenter/account/save', key: 'name' }, 'name-special']
        },
        account: {
          type: 'text',
          name: 'account',
          label: this.$t('page.username'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.username')}) }]
        },
        password: {
          type: 'password',
          name: 'password',
          showPassword: true,
          label: this.$t('page.password'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.password')}) }]
        },
        protocol: {
          type: 'select',
          label: this.$t('term.inspect.connectionagreement'),
          value: '',
          multiple: false,
          transfer: true,
          url: 'api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.cmdb.enums.resourcecenter.Protocol' },
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.inspect.connectionagreement')}) }],
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
          label: this.$t('page.port'),
          multiple: false,
          value: '',
          maxlength: 50,
          validateList: [
            { name: 'required', message: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.port')}) },
            { name: 'port', message: this.$t('message.pleaseentertruetarget', {target: this.$t('page.portnumber')}) }
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
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        })
        .catch(error => {
          if (error.data.Message) {
            this.$Message.error(error.data.Message);
          } else {
            this.$Message.error(this.$t('message.savefailed'));
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
