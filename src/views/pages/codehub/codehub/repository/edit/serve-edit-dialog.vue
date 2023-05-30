<template>
  <TsDialog v-bind="setting" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="editform" v-model="editData" :itemList="formConfig">
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :disabled="saving" @click="saveEdit">{{ $t('page.confirm') }}</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  props: {
    uuid: {type: [String, Boolean]}
  },
  data() {
    return {
      vaild: ['required'],
      setting: {
        title: this.uuid ? this.$t('dialog.title.edittarget', {'target': this.$t('term.process.catalog')}) : this.$t('page.newtarget', {'target': this.$t('term.process.catalog')}),
        maskClose: false,
        isShow: true
      },
      editData: {
        type: '',
        address: '',
        name: '',
        username: '',
        password: '',
        agentUrl: '',
        agentPassword: '',
        agentUsername: ''
      },
      formConfig: [{
        type: 'select',
        label: this.$t('page.type'),
        transfer: true,
        value: '',
        name: 'type',
        validateList: ['required'],
        dataList: [
          { text: 'GITLAB', value: 'gitlab' },
          { text: 'SVN', value: 'svn' }
        ],
        onChange: (val) => {
          this.serviceType = val;
        }
      },
      {
        type: 'hidden',
        label: 'uuid',
        name: 'uuid',
        isHidden: true,
        value: this.uuid
      },
      {
        type: 'text',
        label: this.$t('page.address'),
        name: 'address',
        maxlength: 100,
        value: '',
        validateList: ['required']
      },
      {
        type: 'text',
        label: this.$t('term.process.catalogname'),
        name: 'name',
        value: '',
        maxlength: 100,
        validateList: ['required']
      },
      {
        type: 'text',
        label: this.$t('page.user'),
        name: 'username',
        value: '',
        validateList: ['required']
      },
      {
        type: 'password',
        label: this.$t('page.password'),
        name: 'password',
        value: '',
        validateList: ['required']
      },
      {
        type: 'text',
        label: this.$t('term.codehub.proxyaddress'),
        name: 'agentUrl',
        aliasName: 'agentUrl',
        placeholder: this.$t('term.codehub.proxyaddressdesc'),
        isHidden: true
      },
      {
        type: 'text',
        label: this.$t('term.codehub.agentusername'),
        name: 'agentUsername',
        aliasName: 'username',
        isHidden: true
      },
      {
        type: 'password',
        label: this.$t('term.codehub.agentpassword'),
        name: 'agentPassword',
        aliasName: 'password',
        isHidden: true
      }
      ],
      serviceType: null,
      runningtest: false,
      saving: false,
      address: ''//地址
    };
  },
  beforeCreate() {},
  created() {
    if (this.uuid) {
      this.getDetail(this.uuid);
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
    close() {
      this.$emit('close');
    },
    test() {
      let editForm = this.$refs.editform;
      if (editForm && !editForm.valid()) {
        return false;
      }
      let list = this.editData;
      let param = {
        type: list.type,
        address: this.address || ''
      };
      this.runningtest = true;
      this.$api.codehub.service.check(param).then(res => {
        this.runningtest = false;
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.searchList();
        } else {
          this.$Notice.error({
            title: this.$t('message.executefailed'),
            desc: res.Message
          });
        }
      }).catch((e) => {
        this.runningtest = false;
      });
    },
    saveEdit() {
      if (this.$refs.editform.valid()) {
        let param = this.$refs.editform.getFormValue();
        if (this.serviceType != 'svn') {
          this.$delete(param, 'agentUrl');
          this.$delete(param, 'agentUsername');
          this.$delete(param, 'agentPassword');
        }
        Object.assign(param, {
          address: this.address
        });
        this.saving = true;
        this.$api.codehub.service.save(param).then(res => {
          this.saving = false;
          if (res && res.Status == 'OK') {
            this.$emit('close', true);
          }
        }).catch((e) => {
          this.saving = false;
        });
      }
    },
    getDetail(uuid) {
      this.$api.codehub.service.getDetail({uuid: uuid}).then(res => {
        if (res && res.Status == 'OK') {
          this.updataVal(res.Return);
        }
      });      
    },
    updataVal(data) {
      this.formConfig.forEach(form => {
        if (form.name) {
          if (data.type == 'svn' && form.aliasName) {
            this.$set(form, 'value', data['codehubAgentVo'] && data['codehubAgentVo'][form.aliasName] || '');
          } else {
            this.$set(form, 'value', data[form.name]);
          }
        }
      });
      this.address = data.address;
      this.serviceType = data.type;
    },
    initSvnsetting(isShow) {
      let items = ['agentUrl', 'agentUsername', 'agentPassword'];
      this.formConfig.forEach((form) => {
        if (items.indexOf(form.name) > -1) {
          this.$set(form, 'isHidden', !isShow);
          if (!isShow) {
            this.$set(form, 'value', '');
            this.$set(this.editData, form.name, '');
          }
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    serviceType: {
      handler: function(val) {
        this.initSvnsetting(!!(val && val == 'svn'));
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
