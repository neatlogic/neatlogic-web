<template>
  <TsDialog v-bind="setting" @on-close="close" @on-ok="saveEdit">
    <template v-slot>
      <div>
        <TsForm ref="editform" :itemList="formConfig">
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
      vaild: ['required'],
      setting: {
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('term.process.catalog')}) : this.$t('page.newtarget', {'target': this.$t('term.process.catalog')}),
        maskClose: false,
        isShow: true
      },
      formConfig: [{
        type: 'select',
        label: this.$t('page.type'),
        transfer: true,
        name: 'type',
        validateList: ['required'],
        dataList: [
          { text: 'GITLAB', value: 'gitlab' },
          { text: 'SVN', value: 'svn' }
        ],
        onChange: (val) => {
          this.initSvnsetting(val);
        }
      },
      {
        type: 'hidden',
        label: 'id',
        name: 'id',
        isHidden: true,
        value: this.id
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
        validateList: ['required']
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
    saveEdit() {
      if (this.$refs.editform.valid()) {
        let param = this.$refs.editform.getFormValue();
        if (param && param.type != 'svn') {
          this.$delete(param, 'agentUrl');
          this.$delete(param, 'agentUsername');
          this.$delete(param, 'agentPassword');
        }
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
          this.updataVal(res.Return);
        }
      });      
    },
    updataVal(data) {
      this.formConfig.forEach(form => {
        if (form.name) {
          if (data.type == 'svn' && form.aliasName) {
            this.$set(form, 'value', data['codehubAgentVo'] && data['codehubAgentVo'][form.aliasName] || '');
            this.initSvnsetting(data.type);
          } else {
            this.$set(form, 'value', data[form.name]);
          }
        }
      });
    },
    initSvnsetting(type) {
      let list = ['agentUrl', 'agentUsername', 'agentPassword'];
      this.formConfig.forEach((form) => {
        if (list.includes(form.name)) {
          this.$set(form, 'isHidden', type != 'svn');
          if (type != 'svn') {
            this.$set(form, 'value', '');
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
