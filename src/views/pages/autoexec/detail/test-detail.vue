<template>
  <div class="runner-detail">
    <TsContain v-if="dataConfig" ref="main" border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ $t('term.autoexec.addjob') }}</span>
      </template>
      <template v-slot:topRight>
        <div class="div-btn-contain action-group text-right">
          <span class="action-item last">
            <Button type="primary" :loading="loading" @click="openExecuteSetting">
              <span :class="!loading ? 'tsfont-run btn-icon' : ''">{{ $t('page.execute') }}</span>
            </Button>
          </span>
        </div>
      </template>
      <div slot="content" class="contain pl-nm pr-nm">
        <div class="box-block">
          <Divider orientation="start">{{ $t('term.autoexec.jobname') }}</Divider>
          <div>
            <TsForm ref="nameForm" v-bind="nameForm"></TsForm>
          </div>
        </div>
        <div class="box-block">
          <Divider orientation="start">{{ $t('page.inputparam') }}</Divider>
          <div>
            <SetParam ref="param" :param="paramValue" :paramList="dataConfig.inputParamList"></SetParam>
          </div>
        </div>
        <div v-if="!$utils.isEmpty(argumentConfig)" class="box-block">
          <Divider orientation="start">{{ $t('term.autoexec.freeparameter') }}</Divider>
          <div>
            <ArgumentParams ref="argumentConfig" :config="argumentConfig"></ArgumentParams>
          </div>
        </div>
        <template v-if="targetShow && dataConfig">
          <div class="box-block">
            <Divider orientation="start">{{ $t('term.autoexec.executetarget') }}</Divider>
            <div>
              <!-- 流水线执行目标 -->
              <AddTarget
                :id="id"
                ref="addTarget"
                addType="node"
                :value="executeNodeConfig"
                canEdit
                :executeConfig="executeConfig"
                :defaultTagFilter="tagIdList"
              ></AddTarget>
            </div>
            <span class="text-tip">{{ $t('term.autoexec.executetargettips') }}</span>
          </div>
          <div class="box-block">
            <Divider orientation="start">{{ $t('term.autoexec.executeaccount') }}</Divider>
            <div>
              <TsForm
                ref="executeForm"
                v-model="executeConfig"
                v-bind="executeForm"
              >
                <template v-slot:executeUser>
                  <TsFormInput ref="executeUser" v-model="executeConfig.executeUser.value" :validateList="['required']"></TsFormInput>
                </template>
              </TsForm>
            </div>
          </div>
          <div class="box-block">
            <Divider orientation="start">{{ $t('page.autoexecparallel') }}</Divider>
            <div>
              <TsFormItem
                :label="$t('page.autoexecparallpolicy')"
                :labelWidth="100"
                labelPosition="left"
                :required="true"
              >
                <TsFormRadio
                  v-model="parallelPolicy"
                  :dataList="parallelPolicyDataList"
                  @on-change="changeParallelPolicy"
                ></TsFormRadio>
              </TsFormItem>
            </div>
            <div v-if="parallelPolicy === 'roundCount'">
              <TsFormItem
                :label="$t('term.autoexec.batchquantity')"
                :labelWidth="100"
                labelPosition="left"
                :required="true"
              >
                <TsFormSelect
                  ref="roundCountForm"
                  v-model="roundCount"
                  v-bind="roundCountForm"
                ></TsFormSelect>
              </TsFormItem>
            </div>
            <div v-else>
              <TsFormItem
                :label="$t('term.autoexec.parall')"
                :labelWidth="100"
                labelPosition="left"
                :required="true"
              >
                <TsFormSelect
                  ref="parallelForm"
                  v-model="parallelCount"
                  v-bind="parallelForm"
                ></TsFormSelect>
              </TsFormItem>
            </div>
          </div>
        </template>
        <div>
          <Divider orientation="start">{{ $t('term.deploy.actuatorgroup') }}</Divider>
          <div>
            <RunnerGroupSetting
              ref="runnerGroup"
              :config="runnerGroup"
              :isCreateJob="true"
              :disabled="false"
            ></RunnerGroupSetting>
          </div>
        </div>
      </div>
    </TsContain>
    <Loading v-else></Loading>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AddTarget: () => import('./runnerDetail/add-target.vue'),
    SetParam: () => import('./runnerDetail/param.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    ArgumentParams: () => import('./runnerDetail/argument-params.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    RunnerGroupSetting: () => import('@/views/pages/autoexec/detail/actionDetail/runnergroup-setting.vue')
  },
  filters: {},
  data() {
    return {
      id: null,
      type: this.$route.query.type,
      targetShow: true,
      paramsList: [],
      dataConfig: null,
      loading: false,
      nameForm: {
        labelWidth: 100,
        labelPosition: 'left',
        itemList: {
          name: {
            width: '100%',
            type: 'text',
            label: this.$t('term.autoexec.jobname'),
            value: '',
            validateList: ['required']
          }
        }
      },
      executeForm: {
        labelWidth: 100,
        labelPosition: 'left',
        itemList: {
          protocolId: {
            type: 'select',
            label: this.$t('page.protocol'),
            value: '',
            multiple: false,
            placeholder: this.$t('page.pleaseselect'),
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getProtocolDataList,
            validateList: ['required']
          },
          executeUser: {
            type: 'slot',
            label: this.$t('page.executeuser'),
            validateList: ['required']
          }
        }
      },
      executeConfig: {
        protocolId: null,
        executeUser: {
          mappingMode: 'constant',
          value: ''
        }
      },
      execMode: '',
      argumentConfig: {},
      jobId: null, //作业id,用于复制作业
      jobConfig: {},
      executeNodeConfig: {},
      paramValue: {},
      tagIdList: null,
      runnerGroup: {
        mappingMode: 'constant',
        value: '-1'
      },
      scriptId: null,
      roundCount: 32,
      parallelCount: 64,
      parallelPolicy: 'parallel',
      parallelPolicyDataList: [
        {
          text: this.$t('page.autoexecparall'),
          value: 'parallel'
        },
        {
          text: this.$t('page.autoexecbatchround'),
          value: 'roundCount'
        }
      ],
      roundCountForm: {
        placeholder: this.$t('page.selectinput'),
        border: 'border',
        dataList: this.getRoundCountList(),
        filterName: 'text',
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.roundcountdescrition'),
        validateList: ['required']
      },
      parallelForm: {
        placeholder: this.$t('page.selectinput'),
        border: 'border',
        dataList: this.getRoundCountList(),
        filterName: 'text',
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.paralldesc'),
        validateList: ['required']
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query) {
      if (this.$route.query.id) {
        this.id = parseInt(this.$route.query.id);
      }
      if (this.$route.query.scriptId) {
        this.scriptId = parseInt(this.$route.query.scriptId);
      }
      if (this.$route.query.type) {
        this.type = this.$route.query.type;
      }
      if (this.$route.query.execMode && (this.$route.query.execMode === 'runner' || this.$route.query.execMode == 'sqlfile')) {
        this.targetShow = false;
      }
      if (this.$route.query.jobId) {
        this.jobId = parseInt(this.$route.query.jobId);
      }
    }
  },
  beforeMount() {
    this.getInitData();
  },
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getInitData() {
      await this.getJobData();
      await this.initScriptId();
      this.getData();
      this.getArgument();
      this.setTestTagId();
    },
    async initScriptId() {
      // 输入参数接口使用脚本ID，测试执行和自由参数接口仍使用脚本版本ID，两者缺一时通过脚本详情补齐。
      if (this.type !== 'script' || (this.id && this.scriptId)) {
        return;
      }
      let param = this.scriptId ? { id: this.scriptId, status: 'passed' } : { versionId: this.id };
      await this.$api.autoexec.script.getScriptDetail(param).then(res => {
        if (res.Status == 'OK' && res.Return && res.Return.script) {
          const script = res.Return.script;
          this.scriptId = script.id;
          this.id = script.versionVo && script.versionVo.id;
        }
      });
    },
    getData() {
      //根据id获取详情
      if (!this.id && !this.scriptId) {
        return;
      }
      let param = {
        operationId: this.type === 'script' ? this.scriptId : this.id,
        operationType: this.type
      };
      this.$api.autoexec.script.getTestDetail(param).then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.dataConfig = res.Return;
          if (!this.jobId) {
            this.nameForm.itemList.name.value = this.dataConfig.name;
          }
        }
      });
    },
    getArgument() {
      if (!this.id && !this.scriptId) {
        return;
      }
      let param = { type: this.type };
      if (this.id) {
        param.id = this.id;
      } else if (this.scriptId) {
        param.scriptId = this.scriptId;
      }
      this.$api.autoexec.script.getArgument(param).then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.argumentConfig = res.Return || {};
        }
      });
    },
    openExecuteSetting() {
      //执行
      let isValid = true;
      isValid = this.$refs.param ? this.$refs.param.valid() && isValid : isValid;
      isValid = this.$refs.addTarget ? this.$refs.addTarget.valid() && isValid : isValid;
      isValid = this.$refs.executeForm ? this.$refs.executeForm.valid() && isValid : isValid;
      isValid = this.$refs.nameForm ? this.$refs.nameForm.valid() && isValid : isValid;
      isValid = this.$refs.argumentConfig ? this.$refs.argumentConfig.valid() && isValid : isValid;
      isValid = this.$refs.executeUser ? this.$refs.executeUser.valid() && isValid : isValid;
      if ((this.$refs.roundCountForm && !this.$refs.roundCountForm.valid()) || (this.$refs.parallelForm && !this.$refs.parallelForm.valid())) {
        isValid = false;
      }
      if (isValid) {
        this.executeAction();
      }
    },
    executeAction() {
      this.$set(this, 'runnerGroup', this.$refs.runnerGroup.save());
      //执行
      let val = {
        operationId: this.id,
        type: this.type,
        param: this.$refs.param.getValue(),
        name: this.nameForm.itemList.name.value,
        runnerGroup: this.runnerGroup
      };

      val.executeConfig = this.$refs.executeForm ? this.$refs.executeForm.getFormValue() : {};
      if (this.targetShow) {
        val.executeConfig.executeNodeConfig = this.$refs.addTarget.getValue();
        val.parallelPolicy = this.parallelPolicy;
        if (this.parallelPolicy === 'roundCount') {
          val.roundCount = this.roundCount;
        } else {
          val.parallelCount = this.parallelCount;
        }
      } else {
        val.executeConfig.executeNodeConfig = [];
      }
      if (this.$refs.argumentConfig) {
        val.argumentMappingList = this.$refs.argumentConfig.getValue();
      }
      this.loading = true;
      this.$api.autoexec.script.testScript(val).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess')); //保存成功
          //返回到列表页面
          this.$router.push({
            path: '/job-detail',
            query: {id: res.Return.jobId}
          });
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    getJobData() { //复制作业获取的数据
      if (!this.jobId) {
        return;
      }
      return this.$api.autoexec.job.getCreateJobData({ jobId: this.jobId}).then(res => {
        if (res.Status == 'OK') {
          this.jobConfig = res.Return || {};
          this.nameForm.itemList.name.value = this.jobConfig.name;
          this.id = this.jobConfig.operationId;
          this.type = this.jobConfig.type;
          this.paramValue = this.jobConfig.param || {};
          this.executeNodeConfig = this.jobConfig.executeConfig && this.jobConfig.executeConfig.executeNodeConfig ? this.jobConfig.executeConfig.executeNodeConfig : {};
          Object.keys(this.executeConfig).forEach(key => {
            if (this.jobConfig.executeConfig && this.jobConfig.executeConfig[key]) {
              this.executeConfig[key] = this.jobConfig.executeConfig[key];
            }
          });
          if (this.jobConfig.execMode === 'runner' || this.jobConfig.execMode == 'sqlfile') {
            this.targetShow = false;
          }
        }
      });
    },
    async setTestTagId() {
      // 查询“test”标签id
      let params = { name: 'test' };
      await this.$api.cmdb.tagManage.getTag(params).then(res => {
        if (res.Status == 'OK' && res.Return) {
          this.tagIdList = [res.Return.id];
        }
      });
      if (this.$utils.isEmpty(this.tagIdList)) {
        // 如果没有“test”标签，则新建一个“test”标签
        await this.$api.cmdb.tagManage.saveTag(params).then(res => {
          if (res.Status == 'OK' && res.Return) {
            this.tagIdList = [res.Return.id];
          }
        });
      }
    },
    getRoundCountList() {
      let list = [
        {
          value: -1,
          text: this.$t('term.autoexec.bluegreenexecute')
        }
      ];
      list.push(...this.$utils.getRoundCountList());
      return list;
    },
    changeParallelPolicy(val) {
      if (val && val == 'roundCount') {
        if (this.$utils.isEmpty(this.roundCount)) {
          this.roundCount = 64;
        }
      } else {
        if (this.$utils.isEmpty(this.parallelCount)) {
          this.parallelCount = 32;
        }
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.runner-detail {
  height: 100%;
  .action-title {
    display: inline-flex;
    flex-direction: column;
    &-name {
      display: inline-block;
      height: 21px;
      line-height: 21px;
      vertical-align: middle;
    }
    &-uk {
      display: inline-block;
      height: 16px;
      line-height: 16px;
      vertical-align: middle;
    }
  }
  ::v-deep .btn-icon {
    vertical-align: baseline;
    margin: 0px;
    &::before {
      margin-right: 5px;
    }
  }
}
.contain {
  .box-block {
    padding-bottom: 22px;
  }
}
</style>
