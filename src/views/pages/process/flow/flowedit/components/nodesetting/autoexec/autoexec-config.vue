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
        createJobPolicy: 'single',
        runtimeParamList: [], //作业参数列表
        executeParamList: [], //执行参数列表:执行目标、连接协议、执行用户、分批数量
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
      isValidTable: true //批量创建作业:是否存在表格组件
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
    init() {
      if (!this.$utils.isEmpty(this.config)) {
        this.autoexecConfig = this.config;
      }
      this.isFirst = false;
      this.loadingShow = false;
    },
    changeAutoexecCombopId(val) {
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
          runtimeParamList.forEach(item => {
            if (item.type == 'phase') {
              this.$set(item, 'config', {});
              this.$set(item.config, 'dataList', phaseList);
            }
          });
          this.autoexecConfig.runtimeParamList = runtimeParamList;
          this.autoexecConfig.executeParamList = executeParamList;
          this.autoexecConfig.exportParamList = exportParamList;
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
