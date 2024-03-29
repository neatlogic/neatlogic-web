<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div v-if="isEdit">{{ $t('dialog.title.edittarget', {target: $t('page.authority')}) }}</div>
        <div v-else>{{ $t('dialog.title.addtarget', {target: $t('page.authority')}) }}</div>
      </template>
      <template v-slot>
        <div>
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <TsForm
            v-if="!loadingShow"
            ref="form"
            v-model="authConfig"
            :labelWidth="80"
            :item-list="formConfig"
          >
            <template v-slot:actionList>
              <ul>
                <li class="bg-op radius-sm mb-nm">
                  <div class="padding">
                    <div class="text-grey auth-text">{{ $t('term.deploy.operationauth') }}</div>
                    <AuthEdit
                      v-model="authConfig.operationAuthList"
                      :authSetting="authSetting"
                      :isEdit="isEdit"
                      operationType="operation"
                    ></AuthEdit>
                  </div>
                </li>
                <li v-if="canShowEnvScenario" class="bg-op radius-sm mb-nm">
                  <div class="padding">
                    <div class="text-grey auth-text">{{ $t('term.deploy.envauth') }}</div>
                    <AuthEdit
                      v-model="authConfig.envAuthList"
                      :authSetting="authSetting"
                      :isEdit="isEdit"
                      operationType="env"
                    ></AuthEdit>
                  </div>
                </li>
                <li v-if="canShowEnvScenario" class="bg-op radius-sm mb-nm">
                  <div class="padding">
                    <div class="text-grey auth-text">{{ $t('term.deploy.scenarioauth') }}</div>
                    <AuthEdit
                      v-model="authConfig.scenarioAuthList"
                      :authSetting="authSetting"
                      :isEdit="isEdit"
                      operationType="scenario"
                    ></AuthEdit>
                  </div>
                </li>
              </ul>
              <span v-if="authRequired" class="text-danger">{{ $t('term.deploy.pleaseselectatleastonepermission') }}</span>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 应用权限编辑
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    AuthEdit: resolve => require(['./components/auth-edit'], resolve)
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    isEdit: Number, // 是否是编辑：0否 1是
    hideFucntionExcludeAppModuleRunner: {
      //  codehub新增应用配置入口，为了维护应用和模块，应用权限以及模块对应的runner组,发布其他功能全部屏蔽
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogSetting: {
        type: 'slider',
        isShow: true,
        width: 'medium',
        okText: this.$t('page.save')
      },
      authConfig: {
        authorityStrList: [],
        operationAuthList: [], // 操作权限列表
        scenarioAuthList: [], // 场景权限列表
        envAuthList: [] // 环境权限列表
      },
      authSetting: {},
      authRequired: false, // 权限必填
      loadingShow: true,
      defaultoperationAuthList: [], // 权限列表，用户回显操作
      defaultscenarioAuthList: [],
      defaultenvAuthList: [],
      formConfig: {
        authorityStrList: {
          label: this.$t('page.user'),
          type: 'userselect',
          validateList: ['required'],
          multiple: true,
          groupList: ['user', 'team', 'role', 'common']
        },
        actionList: {
          label: this.$t('page.authority'),
          type: 'slot',
          value: [],
          validateList: ['required']
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    this.loadingShow = true; 
    await this.getAuthList();
    if (this.isEdit) {
      this.getAuthInfoById();
    } else {
      this.loadingShow = false;
    }
  },
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
      if (this.authConfig && (this.authConfig.operationAuthList.length == 0 && this.authConfig.envAuthList.length == 0 && this.authConfig.scenarioAuthList.length == 0)) {
        this.authRequired = true; // 权限至少选择一个
        return false;
      }
      let {authorityStrList} = this.authConfig;
      let params = {
        authorityStrList,
        appSystemId: this.params.appSystemId,
        isEdit: this.isEdit,
        actionList: this.handleActionList(this.authConfig),
        includeActionList: this.canShowEnvScenario ? [] : ['view', 'edit']
      };
      this.$api.deploy.applicationConfig.saveAppConfigAuth(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true);
        }
      });
    },
    handleActionList(authConfig) {
      let {operationAuthList, envAuthList, scenarioAuthList} = authConfig;
      let actionList = [];
      if (operationAuthList && (operationAuthList.includes('all') || (operationAuthList.length > 0 && (operationAuthList.length == this.defaultoperationAuthList.length)))) {
        actionList.push({
          action: 'all',
          type: 'operation'
        });
      } else if (operationAuthList && !operationAuthList.includes('all')) {
        operationAuthList && operationAuthList.forEach((item) => {
          actionList.push({
            action: item,
            type: 'operation'
          });
        });
      }
      if (envAuthList && (envAuthList.includes('all') || (envAuthList.length > 0 && (envAuthList.length == this.defaultenvAuthList.length)))) {
        actionList.push({
          action: 'all',
          type: 'env'
        });
      } else if (envAuthList && !envAuthList.includes('all')) {
        envAuthList && envAuthList.forEach((item) => {
          actionList.push({
            action: item,
            type: 'env'
          });
        });
      }
      if (scenarioAuthList && (scenarioAuthList.includes('all') || (scenarioAuthList.length > 0 && (scenarioAuthList.length == this.defaultscenarioAuthList.length)))) {
        actionList.push({
          action: 'all',
          type: 'scenario'
        });
      } else if (scenarioAuthList && !scenarioAuthList.includes('all')) {
        scenarioAuthList && scenarioAuthList.forEach((item) => {
          actionList.push({
            action: item,
            type: 'scenario'
          });
        });
      }

      return actionList;
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    getAuthInfoById() {
      let params = {
        ...this.params
      };
      this.loadingShow = true;
      this.$api.deploy.applicationConfig.getAppConfigAuthList(params).then((res) => {
        if (res && res.Status == 'OK') {
          if (res.Return && res.Return.tbodyList) {
            let authInfo = res.Return.tbodyList[0];
            this.authConfig.authorityStrList = authInfo ? [`${authInfo['authType']}#${authInfo['authUuid']}`] : [];
            for (let key in authInfo) {
              if (key && this.defaultoperationAuthList.includes(key)) {
                this.authConfig.operationAuthList.push(key);
              } else if (key && this.defaultscenarioAuthList.includes(parseInt(key))) {
                this.authConfig.scenarioAuthList.push(parseInt(key));
              } else if (key && this.defaultenvAuthList.includes(parseInt(key))) {
                this.authConfig.envAuthList.push(parseInt(key));
              }
            }
            for (let key in this.formConfig) {
              if (key == 'authorityStrList') {
                this.$set(this.formConfig[key], 'disabled', true);
              }
            }
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getAuthList() {
      return this.$api.deploy.applicationConfig.getAuthList({appSystemId: this.params.appSystemId, includeActionList: this.canShowEnvScenario ? [] : ['view', 'edit']}).then((res) => {
        if (res && res.Status == 'OK') {
          this.authSetting = res.Return || {};
          for (let key in res.Return) {
            if (key && res.Return[key]) {
              res.Return[key].forEach((item) => {
                this[`default${key}`].push(item.value);
              });
            }
          }
        }
      });
    }
  },
  filter: {},
  computed: {
    canShowEnvScenario() {
      // 显示环境场景
      return !this.hideFucntionExcludeAppModuleRunner;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.auth-text {
  line-height: 17px;
  margin-bottom: 6px;
}
</style>
