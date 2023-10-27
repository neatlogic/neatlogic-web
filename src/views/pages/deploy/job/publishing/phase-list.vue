<template>
  <div class="box-block">
    <Divider orientation="start">
      <span>{{ $t('term.autoexec.pipeline') }}</span>
      <i class="text-tip-active pr-sm" :class="isShowStepList? 'tsfont-up' : 'tsfont-down'" @click="isShowStepList=!isShowStepList"></i>
    </Divider>
    <div v-if="isShowStepList" class="step-main">
      <Tabs 
        class="block-tabs2"
        :animated="false"
        name="phase"
        @on-click="changeTabValue"
      >
        <TabPane
          v-for="tab in moduleList"
          :key="tab.id"
          :label="(tab.abbrName? tab.abbrName: '')+ (tab.name? '['+tab.name+']' : '')"
          :name="'id_'+tab.id"
          tab="phase"
        >
          <div v-if="currentStep" class="content">
            <Loading :loadingShow="loadingShow" type="fix"></Loading>
            <div class="step-list dividing-color">
              <StepList
                :stepList="selectStepList"
                :canEdit="false"
                :execModeList="execModeList"
                :isRunner="true"
                @change="changeSelectStep"
              ></StepList>
            </div>
            <div class="step-tool">
              <div v-if="currentConfig">
                <!-- 阶段配置 -->
                <StepConfig
                  ref="stepConfig"
                  :currentStep="currentStep"
                  :config="currentConfig"
                  :paramList="runtimeParamList"
                  :paramsTypeList="paramsTypeList"
                  :list="currentConfig.config.phaseOperationList"
                  :execModeList="execModeList"
                  :execMode="currentConfig.execMode"
                  :canEdit="false"
                  :prevStepList="getPrev(currentConfig, selectStepList)"
                  :isRunner="true"
                ></StepConfig>
              </div>
            </div>
            <div class="step-group pl-nm pt-sm">
              <div class="bg-op padding radius-lg">
                <StepGroup
                  :currentGroupConfig="currentGroupConfig"
                  :canEdit="false"
                  :runtimeParamList="runtimeParamList"
                ></StepGroup>
              </div>
            </div>
          </div>
          <div v-else>
            <NoData></NoData>
          </div>
        </TabPane>
      </Tabs>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    StepList: resolve => require(['@/views/pages/autoexec/detail/actionDetail/step/step-list.vue'], resolve),
    StepConfig: resolve => require(['@/views/pages/autoexec/detail/actionDetail/step/step-config.vue'], resolve),
    StepGroup: resolve => require(['@/views/pages/deploy/application-config/pipeline/step-group'], resolve)
  },
  props: {
    appSystemId: Number,
    envId: Number,
    moduleList: Array,
    combopPhaseNameList: Array
  },
  data() {
    return {
      isShowStepList: false,
      combopPhaseList: [],
      runtimeParamList: [],
      combopGroupList: [],
      execModeList: [],
      currentStep: null,
      currentConfig: null,
      currentGroupConfig: null,
      selectStepList: [],
      paramsTypeList: [],
      loadingShow: true
    };
  },
  beforeCreate() {},
  created() {
    this.getExecModeList();
    this.getParamsTypeLit();
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
    changeTabValue(val) {
      this.getAppPipeline(parseInt(val.split('_')[1]));
    },
    getAppPipeline(appModuleId) { //流水线
      let data = {
        appSystemId: this.appSystemId,
        appModuleId: appModuleId,
        envId: this.envId,
        isDeleteDisabledPhase: true
      };
      this.loadingShow = true;
      this.$api.deploy.apppipeline.getAppPipeline(data).then(res => {
        if (res && res.Status == 'OK') {
          let data = res.Return || {};
          this.combopPhaseList = data.config.combopPhaseList || [];
          this.combopGroupList = data.config.combopGroupList || [];
          this.runtimeParamList = data.config.runtimeParamList || [];
          this.getSelectStepList();
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getSelectStepList() { //获取选中的阶段列表
      let stepList = [];
      this.combopPhaseList.forEach(s => {
        if (this.combopPhaseNameList.indexOf(s.name) > -1) {
          stepList.push(s);
        }
      });
      this.selectStepList = stepList;
      if (!this.$utils.isEmpty(this.selectStepList)) {
        this.currentStep = this.selectStepList[0].uuid;
        this.currentConfig = this.selectStepList[0];
        if (this.combopGroupList.length > 0) {
          this.currentGroupConfig = this.combopGroupList[0];
        }
      } else {
        this.currentStep = null;
        this.currentConfig = null;
        this.currentGroupConfig = null;
      }
    },
    getExecModeList() {
      return this.$api.autoexec.action.getParamsTypeLit({enumClass: 'ExecMode'}).then(res => {
        if (res.Status == 'OK') {
          this.execModeList = res.Return;
        }
      });
    },
    getParamsTypeLit() { //选择组件类型
      return this.$api.autoexec.action.getParamsTypeLit({enumClass: 'ScriptParamTypeFactory'}).then(res => {
        if (res.Status == 'OK') {
          this.paramsTypeList = res.Return;
        }
      });
    },
    changeSelectStep(uuid, item) {
      if (uuid) {
        this.currentStep = uuid;
        this.currentConfig = this.selectStepList.find(s => {
          return s.uuid === uuid;
        });
        if (item && item.groupUuid) {
          let findGroup = this.combopGroupList.find(c => c.uuid == item.groupUuid);
          findGroup && (this.currentGroupConfig = findGroup);
        }
      }
    }
  },
  filter: {},
  computed: {
    getPrev() {
      return function(config, list) {
        let uk = config.uuid;
        let index = list.findIndex(l => {
          return l.uuid == uk;
        });
        return list.filter((s, sindex) => {
          return sindex < index;
        });
      };
    }
  },
  watch: {
    moduleList: {
      handler(val) {
        if (val && val.length > 0) {
          this.getAppPipeline(val[0].id);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.box-block {
  .li-box {
    margin-bottom: -10px;
    .li-item {
      padding: 6px 16px;
      border-radius: 4px;
      text-align: center;
      margin-bottom: 10px;
    }
  }
  .appModule-title {
    display: flex;
    align-items: center;
    height: 20px;
  }
}
.step-main {
  margin-left: -15px;
  .content {
    position: relative;
    display: flex;
    .step-list {
      width: 230px;
    }
    .step-tool {
      padding: 10px 0 10px 10px;
      flex-grow:1;  
    }
    .step-group {
      width: 280px;
    }
  }
}
</style>
