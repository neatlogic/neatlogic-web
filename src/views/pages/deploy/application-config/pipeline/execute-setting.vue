<template>
  <div>
    <TsForm
      ref="executeConfig"
      v-model="executeConfig"
      v-bind="formConfig"
    ></TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    defaultExecuteConfig: Object,
    canEdit: {
      type: Boolean,
      default: true
    },
    appSystemId: Number,
    appModuleId: Number,
    envId: Number
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
            type: 'text',
            name: 'executeUser',
            label: this.$t('page.executeuser'),
            value: '',
            validateList: ['required'],
            readonly: !this.canEdit || !!this.defaultExecuteConfig.inherit,
            onChange: (val) => {
              this.executeConfig.executeUser = val;
              this.changeExecuteConfig(this.executeConfig);
            }
          }
        }
      },
      executeConfig: {
        inherit: 0,
        protocolId: null,
        executeUser: ''
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
    dealDataByUrl(nodeList) { // ??????????????????????????????
      return this.dealDataFilter(nodeList);
    },
    dealDataFilter(nodeList) {
      // ??????????????????????????????
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
            current: 4, //??????step
            component: 'executeSetting' //??????tab
          });
        }
        if (!this.executeConfig.executeUser) {
          validList.push({
            text: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.executeuser')}),
            type: 'error',
            current: 4,
            component: 'executeSetting'
          });
        }
      }
      return validList;
    },
    async changeInherit(val) {
      this.formConfig.itemList.protocolId.readonly = !!val;
      this.formConfig.itemList.executeUser.readonly = !!val;
      if (val) {
        if (this.$utils.isEmpty(this.initExecuteConfig)) {
        //????????????????????????????????????????????????????????????????????????????????????
        //????????????????????????????????????????????????????????????????????????????????????
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
    }
  },
  filter: {},
  computed: {},
  watch: {
    canEdit: {
      handler(val) {
        this.formConfig.itemList.inherit.disabled = !val;
        //?????????????????????????????????????????????????????????
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
