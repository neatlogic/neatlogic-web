<template>
  <div>
    <TsForm
      ref="form"
      v-model="formValue"
      :item-list="formList"
    >
      <template v-slot:versionRule>
        <div class="bg-op radius-lg pt-nm pb-nm pr-nm">
          <TsForm
            ref="versionRule"
            v-model="formValue.versionRule"
            :item-list="versionFormList"
          >
          </TsForm>
        </div>
      </template>
      <template v-slot:scenes>
        <div class="pt-sm li-box">
          <Row :gutter="16">
            <Col
              v-for="(item,index) in scenarioList"
              :key="index"
              :xs="12"
              :sm="8"
              :md="6"
              :lg="4"
              :xl="3"
              :xxl="2"
            >
              <div
                v-if="hasScenarioAuth(item.scenarioId)"
                class="li-item text-action"
                :class="scenarioId == item.scenarioId?'li-active li-text border-primary':'border-base bg-op'"
                @click="switchSceneAndEnv('scenario',item)"
              >{{ item.scenarioName }}</div>
              <Tooltip
                v-else
                placement="top"
                max-width="400"
                theme="light"
                transfer
                class="tooltips-box"
              >
                <div class="width-box li-item text-action text-disabled border-base bg-op">{{ item.scenarioName }}</div>
                <div slot="content">
                  <div>您没有[{{ item.scenarioName }}]场景权限，请联系管理员授权</div>
                </div>
              </Tooltip>
            </Col>
          </Row>
        </div>
      </template>
      <template v-slot:env>
        <div class="pt-sm li-box">
          <Row :gutter="16">
            <Col
              v-for="(item,index) in envList"
              :key="index"
              :xs="12"
              :sm="8"
              :md="6"
              :lg="4"
              :xl="3"
              :xxl="2"
            >
              <div
                v-if="hasEnvAuth(item.envId)"
                class="li-item text-action"
                :class="envId == item.envId?'li-active li-text border-primary':'border-base bg-op'"
                @click="switchSceneAndEnv('env',item)"
              >{{ item.envName }}</div>
              <Tooltip
                v-else
                placement="top"
                max-width="400"
                theme="light"
                transfer
                class="tooltips-box"
              >
                <div class="width-box li-item text-action text-disabled border-base bg-op">{{ item.envName }}</div>
                <div slot="content">
                  <div>您没有[{{ item.envName }}]环境权限，请联系管理员授权</div>
                </div>
              </Tooltip>
            </Col>
          </Row>
        </div>
      </template>
      <template v-if="formValue.instanceFilter" v-slot:instanceFilterList>
        <div class="bg-op radius-lg padding">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <template v-if="instanceList && instanceList.length > 0">
            <Checkbox
              :indeterminate="indeterminate"
              :value="checkAll"
              @click.prevent.native="handleCheckAll"
            >全选</Checkbox>
            <CheckboxGroup v-model="formValue.instanceFilterList" @on-change="changeCheckboxGroup">
              <Row :gutter="16">
                <Col
                  v-for="item in instanceList"
                  :key="item.id"
                  :xs="12"
                  :sm="8"
                  :md="6"
                >
                  <div class="overflow">
                    <Checkbox
                      :label="item.id"
                      class="pr-nm pb-sm"
                    >{{ `${item.name || ''}[${item.ip}]` }}</Checkbox>
                  </div>
                </Col>
              </Row>
            </CheckboxGroup>
          </template>
          <div v-else class="text-tip">模块在{{ envName }}环境下没有实例</div>
        </div>
      </template>
      <template v-slot:jobParam>
        <div class="bg-op radius-lg padding">
          <SetParam
            ref="jobParams"
            :paramList="runtimeParamList"
            :phaseList="combopPhaseList"
          ></SetParam>
        </div>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    SetParam: resolve => require(['@/views/pages/autoexec/detail/runnerDetail/param.vue'], resolve)
  },
  props: {
    appSystemId: {
      // 应用id，做为查找场景和环境列表的条件
      type: Number,
      default: null
    },
    appModuleId: {
      // 模块id，做为查找场景和环境列表的条件
      type: Number,
      default: null
    },
    value: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      loadingShow: false,
      indeterminate: true,
      checkAll: false,
      scenarioId: null,
      envId: null,
      envName: '',
      formValue: {instanceFilter: 0, versionRule: {useCommitId: 0}},
      scenarioList: [],
      envList: [],
      instanceList: [], // 实例过滤列表
      defaultInstanceList: [], // 用于保存时，数据处理
      defaultInstanceIdList: [], // 默认的实例Id列表，用于全选做数据处理
      runtimeParamList: [],
      combopPhaseList: [],
      authInfo: {},
      authList: [],
      formList: [
        {
          name: 'scenes',
          type: 'slot',
          label: '场景',
          dataList: []
        },
        {
          name: 'env',
          type: 'slot',
          label: this.$t('term.deploy.env'),
          dataList: []
        },
        {
          name: 'versionRule',
          type: 'slot',
          label: '版本号'
        },
        {
          name: 'instanceFilter',
          type: 'switch',
          label: '实例筛选',
          trueValue: 1,
          falseValue: 0,
          onChange: (isTrue) => {
            if (isTrue) {
              this.getInstanceList().then(() => {
                this.$set(this.formValue, 'instanceFilterList', this.defaultInstanceIdList);
              });
            }
          }
        },
        {
          name: 'instanceFilterList', // 实例筛选打开，才显示
          type: 'slot',
          label: ''
        },
        {
          name: 'roundCount',
          type: 'select',
          label: '分批数量',
          desc: '将执行目标按数量等分为N个批次，先后执行',
          dataList: this.$utils.getRoundCountList(),
          filterName: 'text'
        },
        {
          name: 'jobParam',
          type: 'slot',
          label: '作业参数'
        }
      ],
      versionFormList: [
        {
          name: 'versionPrefix',
          type: 'text',
          label: '版本前缀',
          maxlength: 64,
          desc: '指定要创建版本的前缀，可不填'
        },
        {
          name: 'versionRegex',
          type: 'text',
          label: '截取规则',
          validateList: ['required'],
          desc: '正则表达式，指定使用分支的哪个部分作为主版本，不给定或正则表达式匹配失败，则使用分支名。合法的正则表达式必须包含成对的"("、")"，示例：develop(\d+(\.\d+)*\.\d+)提取develop1.2.3分支中的1.2.3作为主版本号'
        },
        {
          name: 'useCommitId',
          type: 'select',
          label: '拼接commitID',
          validateList: ['required'],
          desc: '在版本号中拼接最近一次提交的 commit ID',
          dataList: [
            {
              text: '不拼接',
              value: 0
            },
            {
              text: '拼接',
              value: 1
            }
          ]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (!this.value || !this.$utils.isEmptyObj(this.value)) {
      this.setFormValue();
    }
    if (this.appModuleId) {
      // 编辑配置
      this.getScenarioAndEnvList();
      this.getPipilineJobParams();
      this.getAuthInfo();
    }
    this.isHiddenScenesEnvByAppModuleId(this.appModuleId);
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
    setFormValue() {
      let currentValue = this.$utils.deepClone(this.value) || {};
      if (this.value && this.value.config) {
        if (this.value.config.selectNodeList && this.value.config.selectNodeList.length > 0) {
          // 处理过滤实例回显
          this.defaultInstanceList = this.value.config.selectNodeList || [];
          let defaultInstanceIdList = [];
          this.value.config.selectNodeList.forEach((item) => {
            this.defaultInstanceIdList.push(item.id);
            defaultInstanceIdList.push(item.id);
          });
          this.$set(currentValue, 'instanceFilter', 1); // selectNodeList 有值，就打开实例过滤按钮
          this.$set(currentValue, 'instanceFilterList', defaultInstanceIdList);
          this.instanceList = defaultInstanceIdList;
        }
        this.$set(currentValue, 'roundCount', this.value.config.roundCount);
        this.envId = this.value.config.envId;
        this.scenarioId = this.value.config.scenarioId;
        delete currentValue.config;
      }
      this.formValue = Object.assign({}, this.formValue, currentValue);
    },
    switchSceneAndEnv(type, item) {
      if (type == 'env') {
        this.envId = item.envId;
        this.envName = item.envName;
        this.getInstanceList();
      } else if (type == 'scenario') {
        this.scenarioId = item.scenarioId;
      }
    },
    getFormValue() {
      let formValue = this.$utils.deepClone(this.formValue) || {};
      formValue.config = {};
      let selectNodeList = [];
      let deleteFields = ['instanceFilter', 'instanceFilterList', 'roundCount']; // 删除多余的字段
      if (formValue.roundCount) {
        this.$set(formValue.config, 'roundCount', formValue.roundCount || 0);
      }
      if (formValue.instanceFilterList) {
        // 单独处理实例过滤列表，处理传递给后端的数据
        selectNodeList = this.defaultInstanceList && this.defaultInstanceList.filter((item) => {
          return formValue.instanceFilterList.includes(item.id);
        });
        // 实例过滤选中的实例
        this.$set(formValue.config, 'selectNodeList', selectNodeList);
      }
      if (this.$refs.jobParams) {
        // 作业参数
        this.$set(formValue.config, 'param', this.$refs.jobParams.getValue());
      }
      if (this.envId) {
        this.$set(formValue.config, 'envId', this.envId);
      }
      if (this.envId) {
        this.$set(formValue.config, 'scenarioId', this.scenarioId);
      }
      for (let key in formValue) {
        if (deleteFields.includes(key)) {
          delete formValue[key];
        }
      }
      return formValue;
    },
    getScenarioAndEnvList() {
      // 获取场景和环境列表
      if (this.appSystemId && this.appModuleId) {
        this.$api.deploy.integrated.getScenarioAndEnvList({appSystemId: this.appSystemId, appModuleId: this.appModuleId}).then(res => {
          if (res && res.Status == 'OK') {
            let {scenarioList = [], envList = []} = res.Return;
            if (!this.envId) {
              this.envId = envList && envList.length > 0 ? envList[0].envId : null; // 默认选中首次环境
            }
            envList.forEach(element => {
              if (this.envId == element.envId) {
                this.envName = element.envName;
              }
            }); // 实例筛选提示环境名称
            if (!this.scenarioId) {
              this.scenarioId = scenarioList && scenarioList.length > 0 ? scenarioList[0].scenarioId : null; // 默认选中首个场景
            }
            this.envList = envList || [];
            this.scenarioList = scenarioList || [];
            this.getInstanceList();
          }
        });
      }
    },
    async getInstanceList() {
      if (this.appSystemId && this.appModuleId && this.envId) {
        this.loadingShow = true;
        this.defaultInstanceList = [];
        this.defaultInstanceIdList = [];
        this.instanceList = [];
        let params = {
          appSystemId: this.appSystemId,
          appModuleId: this.appModuleId,
          envId: this.envId
        };
        await this.$api.deploy.applicationConfig.getEnvInfo(params).then((res) => {
          if (res && res.Status == 'OK') {
            let {instanceList = []} = res.Return;
            this.instanceList = instanceList;
            instanceList.forEach((item) => {
              if (item && item.id) {
                this.defaultInstanceIdList.push(item.id);
              }
              this.defaultInstanceList.push({
                id: item.id || null,
                ip: item.ip || '',
                port: item.port || null,
                name: item.name || ''
              });
            });
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      }
    },
    handleCheckAll() {
      if (this.indeterminate) {
        this.checkAll = false;
      } else {
        this.checkAll = !this.checkAll;
      }
      this.indeterminate = false;
      if (this.checkAll) {
        this.$set(this.formValue, 'instanceFilterList', this.defaultInstanceIdList); // 默认所有的值
      } else {
        this.$set(this.formValue, 'instanceFilterList', []);
      }
    },
    changeCheckboxGroup(checkedList) {
      if (checkedList.length == this.defaultInstanceIdList.length) {
        this.checkAll = true;
        this.indeterminate = false;
      } else {
        this.checkAll = false;
        this.indeterminate = true;
      }
    },
    valid() {
      let isValid = true;
      let formList = ['form', 'versionRule', 'jobParams'];
      formList.forEach((item) => {
        if (!this.$refs[item].valid()) {
          isValid = false;
        }
      });
      return isValid;
    },
    getPipilineJobParams() { // 获取流水线作业参数
      if (this.appSystemId && this.appModuleId) {
        let params = {
          appSystemId: this.appSystemId,
          appModuleId: this.appModuleId
        };
        this.$api.deploy.apppipeline.getAppPipeline(params).then(res => {
          if (res && res.Status == 'OK') {
            let data = res.Return || {};
            if (data.config) {
              this.runtimeParamList = data.config.runtimeParamList || [];
              this.combopPhaseList = data.config.combopPhaseList || [];
              this.runtimeParamList.forEach((item) => {
                if (item && (this.value && this.value.hasOwnProperty('config') && this.value.config.hasOwnProperty('param')) && (this.value['config']['param'].hasOwnProperty(item.key))) {
                  // 作业参数值回显
                  this.$set(item, 'defaultValue', this.value['config']['param'][item.key]);
                }
              });
            }
          }
        });
      }
    },
    getAuthInfo() {
      // 获取环境和场景权限信息
      if (this.appSystemId && this.appModuleId) {
        let params = {
          appSystemIdList: [this.appSystemId],
          appModuleIdList: [this.appModuleId],
          authorityActionList: ['view']
        };
        this.$api.deploy.applicationConfig.searchAppSystemList(params).then(res => {
          if (res && res.Status == 'OK') {
            this.authInfo = res.Return && res.Return.tbodyList.length > 0 ? res.Return.tbodyList[0] : null;
            this.authList = (res.Return && res.Return.tbodyList.length > 0 && res.Return.tbodyList[0].authActionSet) ? res.Return.tbodyList[0].authActionSet : [];
          }
        });
      }
    },
    isHiddenScenesEnvByAppModuleId(appModuleId) {
      // 模块id为空，隐藏环境和场景，否则显示
      let hiddenList = ['scenes', 'env'];
      if (appModuleId) {
        this.formList && this.formList.forEach((item) => {
          if (hiddenList.includes(item.name)) {
            this.$set(item, 'isHidden', false);
          }
        });
      } else {
        this.formList && this.formList.forEach((item) => {
          if (hiddenList.includes(item.name)) {
            this.$set(item, 'isHidden', true);
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    hasScenarioAuth() {
      // 场景权限
      return (scenarioId) => {
        if ((this.authInfo && (this.authInfo.isHasAllAuthority || !this.authInfo.isConfigAuthority)) || (scenarioId && this.authList.includes(`scenario#${scenarioId}`)) || this.authList.includes('scenario#all')) {
          return true;
        } 
        return false;
      };
    },
    hasEnvAuth() {
      // 环境权限
      return (envId) => {
        if ((this.authInfo && (this.authInfo.isHasAllAuthority || !this.authInfo.isConfigAuthority)) || (envId && this.authList.includes(`env#${envId}`)) || this.authList.includes('env#all')) {
          return true;
        } 
        return false;
      };
    }
  },
  watch: {
    appModuleId(val) {
      if (val) {
        this.getScenarioAndEnvList();
        this.getPipilineJobParams();
        this.getAuthInfo();
      }
      this.isHiddenScenesEnvByAppModuleId(val);
    },
    value: {
      handler() {
        this.setFormValue();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.li-box {
      margin-bottom: -10px;
      .li-item {
        border-radius: 4px;
        text-align: center;
        margin-bottom: 10px;
      }
  }
  .tooltips-box {
    /deep/ &.ivu-tooltip {
      width: 100%;
    }
    /deep/ .ivu-tooltip-rel {
      width: 100%;
    }
    .width-box {
      width: 100%;
    }
  }
</style>
