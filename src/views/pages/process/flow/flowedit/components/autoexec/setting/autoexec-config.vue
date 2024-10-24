<template>
  <div class="detail">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <Alert v-if="autoexecConfig.createJobPolicy==='batch' && !isValidTable" type="error" show-icon>{{ $t('message.process.batchcreatejobpolicyvalid') }}</Alert>
    <!-- 表单标签 -->
    <FormTagSetting
      :formUuid="formUuid"
      :defaultFormTag="autoexecConfig.formTag"
      labelPosition="left"
      class="pb-nm"
      @updateFormTag="changeFormTag"
    ></FormTagSetting>
    <TsForm
      ref="formConfig"
      v-model="autoexecConfig"
      :item-list="formConfig"
      labelPosition="left"
    ></TsForm>
    <div v-if="autoexecConfig.autoexecCombopId && !loadingShow" class="pt-sm">
      <TsFormItem :label="$t('page.namepre')" labelPosition="left">
        <TsFormSelect
          v-model="autoexecConfig.jobNamePrefix"
          :dataList="autoexecParamsList"
          textName="name"
          valueName="key"
          :placeholder="$t('term.process.targetparams')+' / '+ $t('term.autoexec.jobparam')"
          transfer
        ></TsFormSelect>
      </TsFormItem>
      <div>
        <TsRow
          :gutter="8"
          class="item-list pb-sm"
        >
          <Col span="4">
            <div class="text-title require-label">{{ $t('term.deploy.actuatorgroup') }}</div>
          </Col>
          <Col span="20">
            <TsRow :gutter="8">
              <Col span="14" style="padding:0">
                <template v-if="autoexecConfig.runnerGroup.mappingMode==='constant'">
                  <TsFormSelect
                    ref="runnerGroup"
                    v-model="autoexecConfig.runnerGroup.value"
                    dynamicUrl="/api/rest/runnergroup/search"
                    rootName="tbodyList"
                    :dealDataByUrl="$utils.getRunnerGroupList"
                    width="100%"
                    :validateList="validateList"
                    :firstSelect="false"
                    transfer
                    readonly
                    border="border"
                  ></TsFormSelect>
                </template>
                <template v-else>
                  <span class="text-tip pr-sm">{{ $t('term.autoexec.jobparam') }}</span>
                  <span>{{ getruntimeParamListText(autoexecConfig.runnerGroup.value) }}</span>
                </template>
                <p><span v-if="isRunnerGroupDeprecated" class="text-error">{{ $t('term.autoexec.runnergroupdeprecatedtips') }}</span></p>
              </Col>
            </TsRow>
          </Col>
        </TsRow>
      </div>
      <TsFormItem :label="$t('term.process.jobpolicy')" labelPosition="left">
        <RadioGroup v-model="autoexecConfig.createJobPolicy" @on-change="changeJobPolicy">
          <Radio v-for="policy in jobPolicyTypeList" :key="policy.value" :label="policy.value">
            <span>{{ policy.text }}</span>
            <Tooltip
              v-if="policy.value === 'batch'"
              max-width="660"
              theme="light"
              placement="bottom"
              transfer
            >
              <span class="text-href tsfont-info-o"></span>
              <div slot="content">
                <div class="pb-sm">{{ $t('message.process.batchjobpolicytip') }}</div>
                <div class="tip-eg">
                  <div style="width:200px">
                    <TsTable :theadList="theadList" :tbodyList="tbodyList"></TsTable>
                  </div>
                  <div class="center-text">
                    {{ $t('dialog.title.batchcreatetarget',{target:$t('term.autoexec.job')}) }}
                  </div>
                  <div style="width:100px">
                    <TsTable :theadList="[{ title: $t('page.autoexecjob'),key: 'jop'}]" :tbodyList="[{jop:$t('term.autoexec.job') + 'A'},{jop: $t('term.autoexec.job') + 'B'}]"></TsTable>
                  </div>
                </div>
              </div>
            </Tooltip>
          </Radio>
        </RadioGroup>
      </TsFormItem>
      <template v-if="autoexecConfig.createJobPolicy === 'batch'">
        <Batchjobpolicy ref="jobPolicyConfig" :config="autoexecConfig" :allFormitemList="allFormitemList"></Batchjobpolicy>
      </template>
      <template v-else>
        <Singlejobpolicy ref="jobPolicyConfig" :config="autoexecConfig" :allFormitemList="allFormitemList"></Singlejobpolicy>
      </template>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    Batchjobpolicy: () => import('./joppolicy/batchjobpolicy.vue'),
    Singlejobpolicy: () => import('./joppolicy/singlejobpolicy.vue'),
    FormTagSetting: () => import('@/views/pages/process/flow/flowedit/components/nodesetting/form-tag-setting.vue') // 表单扩展数据标签
  },
  props: {
    formUuid: String,
    defaultAllFormitemList: Array,
    config: Object
  },
  data() {
    return {
      allFormitemList: [],
      loadingShow: true,
      validateList: ['required'],
      isRunnerGroupDeprecated: false, //runnerGroup是否过期需要重新保存刷新
      autoexecConfig: {
        formTag: '',
        autoexecCombopId: null,
        jobName: '',
        jobNamePrefix: '',
        createJobPolicy: 'single',
        runtimeParamList: [], //作业参数列表
        executeParamList: [], //执行参数列表:执行目标、连接协议、执行用户、分批数量
        exportParamList: [],
        scenarioList: [], // 场景列表
        scenarioParamList: [], // 场景参数列表
        formAttributeList: [],
        runnerGroup: {} //执行器组
      },
      formConfig: {
        autoexecCombopId: {
          label: this.$t('term.autoexec.combinationtool'),
          type: 'select',
          multiple: false,
          search: true,
          dynamicUrl: '/api/rest/autoexec/combop/list',
          params: {isActive: 1},
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          transfer: true,
          border: 'border',
          validateList: ['required'],
          onChange: (val) => {
            this.changeAutoexecCombopId(val);
          }
        },
        jobName: {
          type: 'text',
          label: this.$t('term.autoexec.jobname'),
          validateList: ['required']
        }
      },
      jobPolicyTypeList: [
        {
          value: 'single',
          text: this.$t('term.process.singlecreatejob')
        },
        {
          value: 'batch',
          text: this.$t('dialog.title.batchcreatetarget', {'target': this.$t('term.autoexec.job')})
        }
      ],
      theadList: [
        {
          title: 'IP',
          key: 'IP'
        },
        {
          title: this.$t('page.use'),
          key: 'use'
        },
        {
          title: this.$t('page.versions'),
          key: 'versions'
        }
      ],
      tbodyList: [
        {
          IP: 'A',
          use: 'X',
          versions: 'X'
        }, {
          IP: 'B',
          use: 'X',
          versions: 'X'
        }
      ],
      isFirst: true,
      isValidTable: true, //批量创建作业:是否存在表格组件
      autoexecCombop: {}, //组合工具数据,
      includesKeyList: ['runtimeParamList', 'executeParamList', 'exportParamList', 'scenarioList', 'scenarioParamList'] //组合工具获取数据key
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async init() {
      this.allFormitemList = this.$utils.deepClone(this.defaultAllFormitemList) || [];
      if (!this.$utils.isEmpty(this.config)) {
        this.changeFormTag(this.config['formTag']);
        if (this.config.autoexecCombopId) {
          try {
            await this.getAutoexecCombop(this.config.autoexecCombopId);
            Object.keys(this.config).forEach(key => {
              this.$set(this.autoexecConfig, key, this.config[key]);
            });
            if (this.autoexecConfig.runnerGroup.mappingMode != this.autoexecCombop.runnerGroup.mappingMode || this.autoexecConfig.runnerGroup.value != this.autoexecCombop.runnerGroup.value) {
              this.isRunnerGroupDeprecated = true;
            } else {
              this.isRunnerGroupDeprecated = false;
            }
            //执行器组只需要只读，从组合工具带出即可
            this.$set(this.autoexecConfig, 'runnerGroup', {});
            if (!this.$utils.isEmpty(this.autoexecCombop.runnerGroup)) {
              Object.keys(this.autoexecCombop.runnerGroup).forEach(key => {
                this.$set(this.autoexecConfig.runnerGroup, key, this.autoexecCombop.runnerGroup[key]);
              });
            }

            //更新组合工具参数列表
            Object.keys(this.autoexecConfig).forEach(key => {
              if (this.includesKeyList.includes(key)) {
                if (this.$utils.isEmpty(this.autoexecCombop[key])) {
                  this.$set(this.autoexecConfig, key, []);
                } else {
                  if (['runtimeParamList', 'executeParamList', 'scenarioParamList'].includes(key)) {
                    if (this.$utils.isEmpty(this.config[key])) {
                      this.$set(this.autoexecConfig, key, this.autoexecCombop[key]);
                    } else {
                      let list = [];
                      this.autoexecCombop[key].forEach(item => {
                        if (key === 'runtimeParamList' && item.type == 'phase') {
                          this.$set(item.config, 'dataList', this.autoexecCombop.phaseList || []);
                        }
                        let findItem = this.config[key].find(c => c.key === item.key);
                        if (findItem) {
                          if (key === 'executeParamList' && item.mappingMode === 'constant') {
                            list.push(item);
                          } else {
                            list.push(findItem);
                          }
                        } else {
                          list.push(item);
                        }
                      });
                      this.$set(this.autoexecConfig, key, list);
                    }
                  } else {
                    this.$set(this.autoexecConfig, key, this.autoexecCombop[key]);
                  }
                }
              }
            });
          } catch (e) {
            this.$set(this.autoexecConfig, 'isShow', !!this.config.isShow);
            this.isFirst = false;
            this.loadingShow = false;
          }
        }
      }
      this.$nextTick(() => {
        this.isFirst = false;
        this.loadingShow = false;
        this.$emit('update', this.autoexecConfig);
      });
    },
    getAutoexecCombop(combopId) {
      return this.$api.process.process.getAutoexecCombop({combopId: combopId}).then(res => {
        if (res.Status == 'OK') {
          this.autoexecCombop = res.Return;
        }
      });
    },
    changeAutoexecCombopId(val) {
      this.autoexecConfig.jobNamePrefix = '';
      this.autoexecConfig.createJobPolicy = 'single';
      if (!val) {
        return;
      }
      this.loadingShow = true;
      let data = {
        combopId: val
      };
      this.$api.process.process.getAutoexecCombop(data).then(res => {
        if (res.Status == 'OK') {
          let runtimeParamList = res.Return.runtimeParamList || [];
          let executeParamList = res.Return.executeParamList || [];
          let phaseList = res.Return.phaseList || [];
          let exportParamList = res.Return.exportParamList || [];
          let scenarioList = res.Return.scenarioList || [];
          let scenarioParamList = res.Return.scenarioParamList || [];
          let runnerGroup = res.Return.runnerGroup || {};
          runtimeParamList.forEach(item => {
            if (item.type == 'phase') {
              this.$set(item, 'config', {});
              this.$set(item.config, 'dataList', phaseList);
            }
          });
          this.autoexecConfig.runtimeParamList = runtimeParamList;
          this.autoexecConfig.executeParamList = executeParamList;
          this.autoexecConfig.exportParamList = exportParamList;
          this.autoexecConfig.scenarioList = scenarioList;
          this.autoexecConfig.scenarioParamList = scenarioParamList;
          this.autoexecConfig.runnerGroup = runnerGroup;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changeJobPolicy() {
      this.$set(this.autoexecConfig, 'batchJobDataSource', {});
      if (this.autoexecConfig.executeParamList && this.autoexecConfig.executeParamList.length > 0) {
        this.autoexecConfig.executeParamList.forEach(item => {
          if (item.mappingMode === 'formTableComponent') {
            this.$set(item, 'value', null);
            this.$set(item, 'column', '');
            this.$set(item, 'filterList', []);
            this.$set(item, 'isActive', false);
          }
        });
      }
      if (this.autoexecConfig.runtimeParamList && this.autoexecConfig.runtimeParamList.length > 0) {
        this.autoexecConfig.runtimeParamList.forEach(item => {
          if (item.mappingMode === 'formTableComponent') {
            this.$set(item, 'value', null);
            this.$set(item, 'column', '');
            this.$set(item, 'filterList', []);
            this.$set(item, 'isActive', false);
          }
        });
      }
    },
    valid() {
      this.isValidTable = true;
      let isValid = true;
      isValid = this.$refs.formConfig.valid();
      if (this.$refs.jobPolicyConfig) {
        isValid = this.$refs.jobPolicyConfig.valid() && isValid;
        if (this.autoexecConfig.createJobPolicy === 'batch') {
          this.isValidTable = this.$refs.jobPolicyConfig.validTable();
          isValid = this.isValidTable && isValid;
        }
      }
      return isValid;
    },
    save() {
      return this.autoexecConfig;
    },
    getruntimeParamListText(value) {
      let findItem = this.autoexecConfig.runtimeParamList.find(item => item.key === value);
      if (findItem) {
        return findItem.name;
      } else {
        return '';
      }
    },
    changeFormTag(tag) {
      this.$set(this.autoexecConfig, 'formTag', tag);
      this.allFormitemList = this.$utils.deepClone(this.defaultAllFormitemList) || [];
      if (!this.formUuid || !tag) {
        return;
      }
      let data = {
        formUuid: this.formUuid,
        tag: tag
      };
      this.$api.framework.form.getFormItemList(data).then(res => {
        if (res.Status == 'OK') {
          this.allFormitemList = res.Return || [];
        }
      });
    }
  },
  filter: {},
  computed: {
    autoexecParamsList() {
      let dataList = [];
      if (this.autoexecConfig.executeParamList && this.autoexecConfig.executeParamList.length) {
        dataList.push(...this.autoexecConfig.executeParamList);
      }
      if (this.autoexecConfig.runtimeParamList && this.autoexecConfig.runtimeParamList.length) {
        dataList.push(...this.autoexecConfig.runtimeParamList);
      }
      return dataList;
    }
  },
  watch: {
    autoexecConfig: {
      handler(val) {
        if (!this.isFirst) {
          this.$emit('update', val);
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.detail{
  position: relative;
}
.tip-eg {
  display: flex;
  align-items: center;
  .center-text {
    position: relative;
    border-bottom: 1px solid;
    margin: 0 16px;
    min-width: 50px;
    &:after {
      font-family: 'tsfont';
      content: '\e899';
      position: absolute;
      bottom: -15px;
      font-size: 18px;
      right: -11px;
    }
  }
}
</style>
