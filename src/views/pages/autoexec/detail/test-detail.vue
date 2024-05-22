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
        <div class="div-btn-contain action-group" style="text-align: right;">
          <span class="action-item last">
            <Button
              type="primary"
              @click="openExecuteSetting"
            >
              <span class="tsfont-run btn-icon">{{ $t('page.execute') }}</span> </Button>
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
        </template>
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
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')

  },
  filters: {},
  data() {
    let _this = this;
    return {
      id: null,
      type: this.$route.query.type,
      targetShow: true,
      paramsList: [],
      dataConfig: null,
      loading: true,
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
            label: _this.$t('page.protocol'),
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
            label: _this.$t('page.executeuser'),
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
      tagIdList: null
    };
  },
  beforeCreate() {
  },
  created() {
    if (this.$route.query) {
      if (this.$route.query.id) {
        this.id = parseInt(this.$route.query.id);
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
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getInitData() {
      await this.getJobData();
      this.getData();
      this.getArgument();
      this.setTestTagId();
    },
    getData() {
      //根据id获取详情
      if (!this.id) {
        return;
      }
      let param = { id: this.id, type: this.type};
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
      if (!this.id) {
        return;
      }
      let param = { id: this.id, type: this.type};
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
      if (isValid) {
        this.executeAction();
      }
    },
    executeAction() {
      //执行
      let val = {
        operationId: this.id,
        type: this.type,
        param: this.$refs.param.getValue(),
        name: this.nameForm.itemList.name.value
      };

      val.executeConfig = this.$refs.executeForm ? this.$refs.executeForm.getFormValue() : {};
      if (this.targetShow) {
        val.executeConfig.executeNodeConfig = this.$refs.addTarget.getValue();
      } else {
        val.executeConfig.executeNodeConfig = [];
      }
      if (this.$refs.argumentConfig) {
        val.argumentMappingList = this.$refs.argumentConfig.getValue();
      }
      this.$api.autoexec.script.testScript(val).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess')); //保存成功
          //返回到列表页面
          this.$router.push({
            path: '/job-detail',
            query: {id: res.Return.jobId}
          });
        }
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
    }
  },
  computed: {},
  watch: {
  }
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
  /deep/.btn-icon{
    vertical-align: baseline;
    margin: 0px;
    &::before{
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
