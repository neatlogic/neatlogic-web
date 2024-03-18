
<template>
  <div class="runner-manage">
    <TsDialog
      v-bind="addTsDialogs"
      @on-close="closeDialog"
      @on-ok="saveRunner"
    >
      <TsForm
        ref="form"
        v-model="formData"
        :item-list="formSetting"
      >
      </TsForm>
      <TsForm
        v-if="runnerAuthList.length > 0"
        ref="authForm"
        v-model="formData.runnerAuthList[0]"
        :item-list="runnerAuthList"
      >
      </TsForm>
    </TsDialog>
  </div>

</template>
<script>
export default {
  name: 'RunnerAdd', // runner管理
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  filters: {},
  props: {
    runnerData: {
      type: Object,
      default: function() {
        return {};
      }
    },
    isGroupAdd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: this.$utils.isEmptyObj(this.runnerData) ? {runnerAuthList: []} : this.runnerData,
      runnerAuthList: [],
      addTsDialogs: {
        type: 'modal',
        isShow: true,
        title: this.$utils.isEmptyObj(this.runnerData) ? this.$t('dialog.title.addtarget', {target: this.$t('term.deploy.actuator')}) : this.$t('dialog.title.edittarget', {target: this.$t('term.deploy.actuator')})
      },
      formSetting: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true,
          label: this.$t('page.primarykey')
        },
        name: {
          type: 'text',
          label: this.$t('page.name'),
          value: '',
          maxlength: 50,
          validateList: ['required']
        },
        host: {
          type: 'text',
          label: 'HOST',
          value: '',
          validateList: ['required']
        },
        protocol: {
          type: 'select',
          label: this.$t('page.protocol'),
          value: '',
          defaultValueIsFirst: true, // 默认选中第一个
          url: '/api/rest/universal/enum/get',
          params: {enumClass: 'neatlogic.framework.dto.runner.RunnerVo$HttpProtocol'},
          transfer: true
        },      
        port: {
          type: 'text',
          label: this.$t('term.deploy.commandport'),
          value: '',
          validateList: ['required']
        },
        nettyPort: {
          type: 'text',
          label: this.$t('term.deploy.heartbeatport'),
          value: '',
          validateList: ['required']
        },        
        isAuth: {
          label: this.$t('term.framework.externalauthen'),
          type: 'switch',
          falseValue: 0,
          trueValue: 1,
          value: 0,
          onChange: (val) => {
            this.externalAuth(val);
          }
        }

      }
    };
  },
  beforeCreate() {},
  created() {
    this.editRunner();
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
    editRunner() {
      this.runnerAuthList = [];
      if (!this.$utils.isEmptyObj(this.runnerData)) { 
        this.addTsDialogs.isShow = true;
        this.formData = this.runnerData;
        this.externalAuth(this.runnerData.isAuth);
        let authType = this.runnerData.runnerAuthList.length > 0 ? this.runnerData.runnerAuthList[0].authType : '';
        if (authType == 'basic') {
          this.runnerAuthList[0].value = authType;
          this.runnerAuthList.push(
            {
              type: 'text',
              label: this.$t('page.account'),
              name: 'accessKey',
              value: '',
              validateList: ['required']
            },
            {
              type: 'password',
              label: this.$t('page.password'),
              name: 'accessSecret',
              value: '',
              validateList: ['required']
            }
          );
        }
      }
    },
    addRunner() {
      if (this.isGroupAdd) {
        window.open(HOME + '/framework.html#/runner-manage?type=add', '_blank'); // 跳转页面传递参数
      } else {
        this.addTsDialogs.isShow = true;
        this.runnerAuthList = [];
        this.formData = {
          id: '',
          name: '',
          host: '',
          protocol: '',
          nettyPort: '',
          isAuth: 0,
          runnerAuthList: []
        };
      }
    },
    closeDialog(needRefresh) {
      this.$emit('close', needRefresh);
    },
    saveRunner() {
      // 点击弹框确认按钮
      const form = this.$refs['form'];
      let authForm = this.$refs['authForm'];
      if (!form.valid()) { 
        return false;
      }
      if (this.runnerAuthList.length > 0) {
        // 外部认证
        if (!authForm.valid()) {
          return false;
        }
      }
      let params = {
        ... form.getFormValue(),
        runnerAuthList: authForm ? [authForm.getFormValue()] : []
      };
      this.$api.framework.runner.saveRunner(params)
        .then((res) => {
          this.$Message.success(this.$t('message.savesuccess'));
          form.clearForm();
          this.closeDialog(true);
        });
    },
    externalAuth(val) {
      if (val === 1) {
        this.runnerAuthList = [];
        this.runnerAuthList.push(
          {
            type: 'select',
            label: this.$t('term.framework.authenprotocol'),
            value: '',
            validateList: ['required'],
            name: 'authType',
            dynamicUrl: '/api/rest/universal/enum/get',
            params: {enumClass: 'neatlogic.framework.tagent.enums.RunnerAuthType'},
            transfer: true,
            onChange: (value) => {
              if (value == 'basic') {
                this.runnerAuthList.push(
                  {
                    type: 'text',
                    label: this.$t('page.account'),
                    name: 'accessKey',
                    value: '',
                    validateList: ['required']
                  },
                  {
                    type: 'password',
                    label: this.$t('page.password'),
                    name: 'accessSecret',
                    value: '',
                    validateList: ['required']
                  }
                );
              } else {
                this.runnerAuthList.splice(1, 2);
              }
            }
          }
        );
      } else {
        this.runnerAuthList = [];
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
