<template>
  <div class="detail">
    <Alert v-if="autoexecConfig.createJobPolicy==='batch' && !isValidTable" type="error" show-icon>{{ $t('message.process.batchcreatejobpolicyvalid') }}</Alert>
    <TsForm
      ref="formConfig"
      v-model="autoexecConfig"
      :item-list="formConfig"
      labelPosition="left"
    ></TsForm>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
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
import {store} from '@/views/pages/process/flow/flowedit/floweditState.js';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    Batchjobpolicy: resolve => require(['./joppolicy/batchjobpolicy.vue'], resolve),
    Singlejobpolicy: resolve => require(['./joppolicy/singlejobpolicy.vue'], resolve)
  },
  props: {
    config: Object
  },
  data() {
    return {
      loadingShow: true,
      autoexecConfig: {
        autoexecCombopId: null,
        jobName: '',
        jobNamePrefix: '',
        createJobPolicy: 'single',
        runtimeParamList: [], //作业参数列表
        executeParamList: [], //执行参数列表:执行目标、连接协议、执行用户、分批数量
        exportParamList: [],
        scenarioList: [], // 场景列表
        scenarioParamList: [], // 场景参数列表
        formAttributeList: []
      },
      formConfig: {
        autoexecCombopId: {
          label: this.$t('term.autoexec.combinationtool'),
          type: 'select',
          multiple: false,
          search: true,
          dynamicUrl: '/api/rest/autoexec/combop/list',
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
      if (!this.$utils.isEmpty(this.config)) {
        if (this.config.autoexecCombopId) {
          try {
            await this.getAutoexecCombop(this.config.autoexecCombopId);
            Object.keys(this.config).forEach(key => {
              this.$set(this.autoexecConfig, key, this.config[key]);
            });
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
                          list.push(findItem);
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
    }
  },
  filter: {},
  computed: {
    allFormitemList() {
      return store.allFormitemList;
    },
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
