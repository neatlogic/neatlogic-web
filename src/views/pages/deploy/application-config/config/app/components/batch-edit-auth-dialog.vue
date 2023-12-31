<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
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
                      :appSystemId="params.appSystemId"
                      :isEdit="isEdit"
                      operationType="operation"
                    ></AuthEdit>
                  </div>
                </li>
                <li class="bg-op radius-sm mb-nm">
                  <div class="padding">
                    <div class="text-grey auth-text">{{ $t('term.deploy.envauth') }}</div>
                    <AuthEdit
                      v-model="authConfig.envAuthList"
                      :appSystemId="params.appSystemId"
                      :isEdit="isEdit"
                      operationType="env"
                    ></AuthEdit>
                  </div>
                </li>
                <li class="bg-op radius-sm mb-nm">
                  <div class="padding">
                    <div class="text-grey auth-text">{{ $t('term.deploy.scenarioauth') }}</div>
                    <AuthEdit
                      v-model="authConfig.scenarioAuthList"
                      :appSystemId="params.appSystemId"
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
  name: '', // 批量编辑权限
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    AuthEdit: resolve => require(['./auth-edit'], resolve)
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
      isEdit: 1,
      authRequired: false, // 权限必填
      loadingShow: false,
      authConfig: {
        authorityStrList: [],
        operationAuthList: [],
        envAuthList: [],
        scenarioAuthList: []
      },
      dialogSetting: {
        type: 'slider',
        title: this.$t('term.deploy.batcheditpermission'),
        isShow: true,
        width: 'medium',
        okText: this.$t('button.save')
      },
      formConfig: {
        authorityStrList: {
          label: this.$t('page.user'),
          type: 'userselect',
          validateList: ['required'],
          multiple: true,
          disabled: true,
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
  mounted() {
    this.getAuthList();
    this.getAuthInfoById();
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
        actionList: this.handleActionList(this.authConfig)
      };
      this.$api.deploy.applicationConfig.saveAppConfigAuth(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.savesuccess'));
          this.closeDialog(true);
        }
      });
    },
    handleActionList(authConfig) {
      let {operationAuthList, envAuthList, scenarioAuthList} = authConfig;
      let actionList = [];
      if (operationAuthList && operationAuthList.includes('all')) {
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
      if (envAuthList && envAuthList.includes('all')) {
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
      if (scenarioAuthList && scenarioAuthList.includes('all')) {
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
      this.loadingShow = true;
      this.$api.deploy.applicationConfig.getAppConfigAuthList({...this.params}).then((res) => {
        if (res && res.Status == 'OK') {
          if (res.Return && res.Return.tbodyList) {
            let tbodyList = res.Return.tbodyList || [];
            let authorityStrList = [];
            tbodyList && tbodyList.forEach((item) => {
              if (item.authUuid && item.authUuid) {
                authorityStrList.push(`${item.authType}#${item.authUuid}`);
              }
            });
            this.authConfig.authorityStrList = authorityStrList;
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getAuthList() {
      this.$api.deploy.applicationConfig.getAuthList({appSystemId: this.params.appSystemId}).then((res) => {
        if (res && res.Status == 'OK') {
          for (let key in res.Return) {
            if (key && res.Return[key]) {
              res.Return[key].forEach((item) => {
                this.authConfig[key].push(item.value);
              });
            }
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
.auth-text {
  line-height: 17px;
  margin-bottom: 6px;
}
</style>
