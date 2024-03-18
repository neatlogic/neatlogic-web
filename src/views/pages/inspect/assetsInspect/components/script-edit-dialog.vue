
<template>
  <div class="add-script-wrap">
    <TsDialog v-bind="dialogSetting" @on-ok="okDialog" @on-close="closeDialog">
      <template v-slot>
        <div>
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <TsForm ref="form" v-model="formValue" :item-list="formList">
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 脚本管理
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {},
  props: {
    resourceId: {
      // 资源id主键
      type: Number,
      default: null,
      required: true
    },
    isEdit: {
      // 是否是编辑 可选：true/false
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formValue: {resourceId: this.resourceId, configMethod: 'script', expandConfig: ''},
      isRequired: false,
      loadingShow: false,
      dialogSetting: {
        type: 'modal',
        title: this.$t('term.inspect.scriptmanage'),
        isShow: true
      },
      formList: [
        {
          type: 'radio',
          label: this.$t('term.deploy.configmode'),
          name: 'configMethod',
          dataList: [
            {
              text: this.$t('dialog.title.choosetarget', {target: this.$t('page.script')}),
              value: 'script'
            },
            {
              text: this.$t('term.inspect.urlconfig'),
              value: 'urlConfig'
            }
          ],
          onChange: (configMethod) => {
            this.isRequired = false;
            this.$set(this.formValue, 'configMethod', configMethod);
            this.handleConfigMethods(configMethod);
          }
        },
        {
          type: 'select',
          label: this.$t('term.inspect.scriptlist'),
          transfer: true,
          name: 'scriptId',
          dynamicUrl: '/api/rest/autoexec/script/list',
          params: {versionStatus: 'passed', typeIdList: [1]},
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          validateList: ['required'],
          isHidden: false
        },
        {
          type: 'codemirror',
          label: this.$t('term.inspect.expandconfig'),
          name: 'expandConfig',
          isHidden: true,
          validateList: ['required'],
          tooltip: `${this.$t('term.inspect.urlconfigexample')}：
[
        {
            "name": "${this.$t('page.inquire')}1",
            "url": "http://abc.com.cn",
            "method": "POST-FORM|POST_JSON|GET",
            "data": {"key1": "value1", "key2": "value2"},
            "proxy": "http://proxy.com:8080",
            "matchKey": ["(key1)|(key2)", "key3", "key4"],
            "extractConf": {"varname1": "patter1n", "varname2": "pattern2"}
        },
        {
            "name": "${this.$t('page.inquire')}2",
            "url": "http://abc.com.cn",
            "method": "POST-FORM|POST_JSON|GET",
            "data": {"key1": "value1", "key2": "${'varname1'}"},
            "proxy": "http://proxy.com:8080",
            "matchKey": ["(key1)|(key2)", "key3", "key4"],
            "extractConf": {"varname1": "patter1n", "varname2": "pattern2"}
        }
    ]`
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.isEdit) {
      this.getScriptInfo();
    } else {
      this.handleConfigMethods(this.formValue.configMethod);
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
    handleConfigMethods(configMethod) {
      // 配置方式：
      // 是脚本列表，就显示脚本列表
      // 是配置URL拨测，就显示拓展配置
      if (configMethod == 'script') {
        // 脚本列表
        this.formList && this.formList.forEach((item) => {
          if (item.name == 'scriptId') {
            this.$set(item, 'isHidden', false);
          } else if (item.name == 'expandConfig') {
            this.$set(item, 'isHidden', true);
          }
        });
        this.$set(this.formValue, 'expandConfig', ''); // 清空值
      } else if (configMethod == 'urlConfig') {
        // 拓展配置
        this.formList && this.formList.forEach((item) => {
          if (item.name == 'scriptId') {
            this.$set(item, 'isHidden', true);
          } else if (item.name == 'expandConfig') {
            this.$set(item, 'isHidden', false);
          }
        });
        this.$set(this.formValue, 'scriptId', null); // 清空值
      }
    },
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      let formValue = this.$utils.deepClone(this.formValue);
      let params = {
        resourceId: this.resourceId
      };
      if (formValue && formValue.scriptId) {
        // 脚本列表
        params.config = {
          config: {
            type: 'script',
            script: formValue.scriptId
          },
          type: formValue.configMethod
        };
      }
      if (formValue && formValue.expandConfig) {
        // 配置url拨测
        params.config = {
          config: this.handleStringToArray(formValue.expandConfig),
          type: formValue.configMethod
        };
      }
      this.$api.inspect.assetsInspect.saveScript(params).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog();
        }
      });
    },
    handleStringToArray(expandConfig) {
      // 把字符串中的换行符去掉，然后转成纯数组
      return expandConfig ? JSON.parse(expandConfig.replace(/[\n\r]/g, '')) : [];
    },
    handleArrayToString(expandConfig) {
      // 将数组转成字符串
      return (expandConfig && expandConfig.length > 0) ? JSON.stringify(expandConfig) : '';
    },
    closeDialog() {
      this.$emit('close');
    },
    getScriptInfo() {
      // 获取脚本信息
      if (!this.resourceId) {
        return false;
      }
      this.loadingShow = true;
      this.$api.inspect.assetsInspect.getScript(this.resourceId).then((res) => {
        if (res.Status == 'OK') {
          let config = res.Return ? (res.Return.config ? res.Return.config.config : {}) : {};
          if (config && !this.$utils.isEmptyObj(config)) {
            if (config.type && config.script) {
              this.$set(this.formValue, 'scriptId', config.script);
              this.$set(this.formValue, 'configMethod', 'script');
              this.handleConfigMethods('script');
            } else {
              this.$set(this.formValue, 'expandConfig', this.handleArrayToString(config));
              this.$set(this.formValue, 'configMethod', 'urlConfig');
              this.handleConfigMethods('urlConfig');
            }
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
