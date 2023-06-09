<template>
  <TsDialog v-bind="dialogSetting" @on-close="close" @on-ok="saveService">
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="formValue" :itemList="formConfig">
        </TsForm>
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
    id: {type: Number}
  },
  data() {
    return {
      formValue: {
        id: this.id,
        type: '',
        address: '',
        name: '',
        username: '',
        password: '',
        agentUrl: '',
        agentUsername: '',
        agentPassword: ''
      },
      dialogSetting: {
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('term.process.catalog')}) : this.$t('page.newtarget', {'target': this.$t('term.process.catalog')}),
        maskClose: false,
        isShow: true
      },
      formConfig: [
        {
          type: 'hidden',
          label: 'id',
          name: 'id',
          isHidden: true
        },
        {
          type: 'select',
          label: this.$t('page.type'),
          transfer: true,
          name: 'type',
          validateList: ['required'],
          dataList: [
            { text: 'GITLAB', value: 'gitlab' },
            { text: 'SVN', value: 'svn' }
          ],
          onChange: (type) => {
            this.formValue.type = type;
            this.initSvnSetting(type);
          }
        },
        {
          type: 'text',
          label: this.$t('page.address'),
          name: 'address',
          maxlength: 100,
          validateList: ['required']
        },
        {
          type: 'text',
          label: this.$t('term.process.catalogname'),
          name: 'name',
          maxlength: 50,
          validateList: [
            'required', 
            'name-special',
            { name: 'searchUrl',
              url: '/api/rest/codehub/repositoryservice/save', 
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('page.name')}),
              params: { id: this.id}
            }]
        },
        {
          type: 'text',
          label: this.$t('page.user'),
          name: 'username',
          maxlength: 50,
          validateList: ['required']
        },
        {
          type: 'password',
          label: this.$t('page.password'),
          name: 'password',
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
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.getServiceDetail(this.id);
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
    saveService() {
      if (this.$refs.form.valid()) {
        let param = this.formValue;
        this.$api.codehub.service.save(param).then(res => {
          if (res && res.Status == 'OK') {
            this.$emit('close', true);
          }
        });
      }
    },
    getServiceDetail(id) {
      this.$api.codehub.service.getDetail({id: id}).then(res => {
        if (res && res.Status == 'OK') {
          let dataInfo = res.Return;
          this.formConfig.forEach(item => {
            if (item.name) {
              this.formValue[item.name] = dataInfo[item.name];
              if (this.formValue.type == 'svn' && item.aliasName) {
                this.formValue[item.name] = dataInfo['codehubAgentVo'] && dataInfo['codehubAgentVo'][item.aliasName] || ''; // 代理对象赋值
                this.initSvnSetting(this.formValue.type);
              }
            }
          });
        }
      });      
    },
    initSvnSetting(type) {
      let list = ['agentUrl', 'agentUsername', 'agentPassword'];
      this.formConfig.forEach((form) => {
        if (list.includes(form.name)) {
          this.$set(form, 'isHidden', type != 'svn');
          if (type != 'svn') {
            this.formValue[form.name] = '';
          }
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
