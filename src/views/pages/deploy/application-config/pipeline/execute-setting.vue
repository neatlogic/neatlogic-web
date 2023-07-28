<template>
  <div>
    <TsForm
      ref="executeConfig"
      v-model="executeConfig"
      v-bind="formConfig"
    >
      <template v-slot:executeUser>
        <ExecuteuserSetting
          ref="executeUser"
          :config="executeConfig.executeUser"
          :readonly="!canEdit || !!defaultExecuteConfig.inherit"
          :runtimeParamList="runtimeParamList"
          :isEditRuntimeParam="isEditRuntimeParam"
          isRequired
          @change="changeExecuteUser"
        ></ExecuteuserSetting>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    ExecuteuserSetting: resolve => require(['@/views/pages/autoexec/detail/actionDetail/executeuser-setting.vue'], resolve)
  },
  props: {
    defaultExecuteConfig: Object,
    canEdit: {
      type: Boolean,
      default: true
    },
    appSystemId: Number,
    appModuleId: Number,
    envId: Number,
    runtimeParamList: Array,
    isEditRuntimeParam: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formConfig: {
        labelPosition: 'left',
        labelWidth: 80,
        itemList: {
          inherit: {
            type: 'switch',
            name: 'inherit',
            label: this.$t('page.inherit'),
            isHidden: !this.appModuleId && !this.envId,
            disabled: !this.canEdit,
            onChange: (val) => {
              this.executeConfig.inherit = val;
              this.changeInherit(val);
            }
          },
          protocolId: {
            type: 'select',
            name: 'protocolId',
            label: this.$t('page.protocol'),
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            dealDataByUrl: this.dealDataByUrl || null,
            multiple: false,
            rootName: 'tbodyList',
            search: true,
            clearable: false,
            transfer: true,
            validateList: ['required'],
            readonly: !this.canEdit || !!this.defaultExecuteConfig.inherit,
            onChange: (val) => {
              this.executeConfig.protocolId = val;
              this.changeExecuteConfig(this.executeConfig);
            }
          },
          executeUser: {
            type: 'slot',
            name: 'executeUser',
            label: this.$t('page.executeuser'),
            validateList: ['required']
          }
        }
      },
      executeConfig: {
        inherit: 0,
        protocolId: null,
        executeUser: {}
      },
      initExecuteConfig: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    dealDataByUrl(nodeList) { // 处理默认值的数据结构
      return this.dealDataFilter(nodeList);
    },
    dealDataFilter(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];           
      nodeList.forEach(v => {
        let text = '';
        if (v.port) {
          text = v.name + '(' + v.port + ')';
        } else {
          text = v.name;
        }
        columlist.push(
          {text: text, value: v.id}
        );
      });
      return columlist;
    },
    getValidList() {
      let validList = [];
      if (!this.$refs.executeConfig.valid()) {
        if (!this.executeConfig.protocolId) {
          validList.push({
            text: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.protocol')}),
            type: 'error',
            current: 4, //定位step
            component: 'executeSetting' //定位tab
          });
        }
      }
      if (!this.$refs.executeUser.valid()) {
        validList.push({
          text: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.executeuser')}),
          type: 'error',
          current: 4,
          component: 'executeSetting'
        });
      }
      return validList;
    },
    async changeInherit(val) {
      this.formConfig.itemList.protocolId.readonly = !!val;
      this.formConfig.itemList.executeUser.readonly = !!val;
      if (val) {
        if (this.$utils.isEmpty(this.initExecuteConfig)) {
        //如果当前是环境层，取消继承时需要获取模块层的执行账号信息
        //如果当前是模块层，取消继承时需要获取应用层的执行账号信息
          let data = {
            appSystemId: this.appSystemId
          };
          if (this.envId) { 
            this.$set(data, 'appModuleId', this.appModuleId);
          }
          let res = await this.$api.deploy.apppipeline.getAppPipeline(data);
          if (res.Status == 'OK') {
            this.initExecuteConfig = res.Return.config.executeConfig || {};
          }
        }
        this.executeConfig.protocolId = this.initExecuteConfig.protocolId;
        this.executeConfig.executeUser = this.initExecuteConfig.executeUser;
      }
      this.changeExecuteConfig(this.executeConfig);
    },
    changeExecuteConfig(config) {
      this.$emit('updateExecuteConfig', config);
    },
    changeReadonly(val) {
      this.formConfig.itemList.protocolId.readonly = !!val;
      this.formConfig.itemList.protocolId.readonly = !!val;
    },
    changeExecuteUser(executeUser) {
      this.$set(this.executeConfig, 'executeUser', executeUser);
      this.$emit('updateExecuteConfig', this.executeConfig);
    }
  },
  filter: {},
  computed: {},
  watch: {
    canEdit: {
      handler(val) {
        this.formConfig.itemList.inherit.disabled = !val;
        //模块层和环境层继承时，执行账号不可编辑
        this.formConfig.itemList.protocolId.readonly = !val || !!this.defaultExecuteConfig.inherit;
        this.formConfig.itemList.executeUser.readonly = !val || !!this.defaultExecuteConfig.inherit;
      }, 
      immediate: true
    },
    defaultExecuteConfig: {
      handler(val) {
        if (val) {
          this.executeConfig = Object.assign(this.executeConfig, val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
