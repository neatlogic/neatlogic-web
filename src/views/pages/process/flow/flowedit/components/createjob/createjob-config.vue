<template>
  <div class="detail">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <!-- 表单标签 -->
    <FormTagSetting
      :formUuid="formUuid"
      :defaultFormTag="createjobConfig.formTag"
      labelPosition="left"
      class="pb-nm"
      @updateFormTag="changeFormTag"
    ></FormTagSetting>
    <TsFormItem
      :label="$t('term.autoexec.combinationtool')"
      labelPosition="left"
      required
    >
      <TsFormSelect ref="combopId" v-model="createjobConfig.combopId" v-bind="formConfig.combopId"></TsFormSelect>
    </TsFormItem>
    <TsFormItem
      :label="$t('term.autoexec.jobname')"
      labelPosition="left"
      required
    >
      <TsFormInput ref="jobName" v-model="createjobConfig.jobName" v-bind="formConfig.jobName"></TsFormInput>
    </TsFormItem>
    <div v-if="createjobConfig.combopId && !loadingShow">
      <div class="pb-sm">
        <TsFormItem :label="$t('page.namepre')" labelPosition="left">
          <TsFormSelect
            v-model="createjobConfig.jobNamePrefixMappingValue"
            :dataList="autoexecParamsList"
            textName="name"
            valueName="key"
            :placeholder="$t('term.process.targetparams')+' / '+ $t('term.autoexec.jobparam')"
            transfer
          ></TsFormSelect>
        </TsFormItem>
        <TsFormItem :label="$t('term.deploy.actuatorgrouptag')" labelPosition="left">
          <template v-if="runnerGroupTag.mappingMode==='constant'">
            <TsFormSelect v-model="runnerGroupTag.value" v-bind="formConfig.runnerGroupTag"></TsFormSelect>
          </template>
          <template v-else>
            <span class="text-tip pr-sm">{{ $t('term.autoexec.jobparam') }}</span>
            <span>{{ getruntimeParamListText(runnerGroupTag.value) }}</span>
          </template>
          <div v-if="runnerGroupTag.mappingMode==='constant'" class="text-tip tips">
            {{ $t('term.autoexec.runnergrouptagprocesstips') }}
          </div>
        </TsFormItem>
        <TsFormItem :label="$t('term.deploy.actuatorgroup')" labelPosition="left">
          <template v-if="runnerGroup.mappingMode==='constant'">
            <TsFormSelect v-model="runnerGroup.value" v-bind="formConfig.runnerGroup"></TsFormSelect>
          </template>
          <template v-else>
            <span class="text-tip pr-sm">{{ $t('term.autoexec.jobparam') }}</span>
            <span>{{ getruntimeParamListText(runnerGroup.value) }}</span>
          </template>
          <div v-if="runnerGroup.mappingMode==='constant'" class="text-tip tips">
            {{ $t('term.autoexec.runnergroupprocesstips') }}
          </div>
        </TsFormItem>
        <TsFormItem :label="$t('term.process.jobpolicy')" labelPosition="left">
          <TsFormRadio
            v-model="createjobConfig.createPolicy"
            v-bind="formConfig.createPolicy"
            @on-change="changeJobPolicy()"
          ></TsFormRadio>
        </TsFormItem>
        <template v-if="createjobConfig.createPolicy === 'batch'">
          <TsFormItem :label="$t('page.foreachtable')" labelPosition="left" required>
            <TsFormSelect
              ref="batchTable"
              :value="createjobConfig.batchDataSourceMapping.value"
              :dataList="getFormComponent('formTableComponent')"
              textName="label"
              valueName="uuid"
              :validateList="validateList"
              :firstSelect="false"
              transfer
              border="border"
              @on-change="(val)=>{
                setValue(createjobConfig.batchDataSourceMapping, 'value', val);
              }"
            ></TsFormSelect>
          </TsFormItem>
          <TsFormItem
            v-if="createjobConfig.batchDataSourceMapping.value"
            :label="$t('term.dashboard.datafilter')"
            labelPosition="left"
            required
          >
            <FilterList
              ref="filterList"
              :filterList="createjobConfig.batchDataSourceMapping.filterList"
              :allFormitemList="allFormitemList"
              :value="createjobConfig.batchDataSourceMapping.value"
              @updateFilterList="(list)=>{
                $set(createjobConfig.batchDataSourceMapping,'filterList', list);
              }"
            ></FilterList>
          </TsFormItem>
        </template>
      </div>
     
      <ScenarioParam
        v-if="!$utils.isEmpty(createjobConfig.scenarioParamMappingGroupList)"
        ref="scenarioParam"
        :scenarioList="scenarioList"
        :scenarioParamMappingGroupList="createjobConfig.scenarioParamMappingGroupList"
        :allFormitemList="allFormitemList"
        class="pb-sm"
      ></ScenarioParam>
      <ExecuteParam
        v-if="!$utils.isEmpty(createjobConfig.executeParamMappingGroupList)"
        ref="executeParam"
        :executeParamMappingGroupList="createjobConfig.executeParamMappingGroupList"
        :allFormitemList="allFormitemList"
        :runtimeParamList="runtimeParamList"
        class="pb-sm"
      ></ExecuteParam>
      <JobParam
        v-if="!$utils.isEmpty(createjobConfig.jobParamMappingGroupList)"
        ref="jopParam"
        :jobParamMappingGroupList="createjobConfig.jobParamMappingGroupList"
        :allFormitemList="allFormitemList"
        :phaseList="phaseList"
        class="pb-sm"
      ></JobParam>
      <FormAttributeParam
        ref="formAttributeParam"
        :formAttributeMappingList="createjobConfig.formAttributeMappingList"
        :allFormitemList="allFormitemList"
        :exportParamList="exportParamList"
      ></FormAttributeParam>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    FilterList: () => import('./filter-list.vue'),
    ScenarioParam: () => import('./params/scenario-param.vue'),
    ExecuteParam: () => import('./params/execute-param.vue'),
    FormAttributeParam: () => import('./params/form-attribute-param.vue'),
    JobParam: () => import('./params/job-param.vue'),
    FormTagSetting: () => import('@/views/pages/process/flow/flowedit/components/nodesetting/form-tag-setting.vue') // 表单扩展数据标签
  },
  filters: {
  },
  props: {
    formUuid: String,
    defaultAllFormitemList: Array,
    config: Object
  },
  data() {
    return {
      loadingShow: true,
      isFirst: true,
      isFilter: 0, //是否数据过滤
      allFormitemList: [],
      createjobConfig: {
        combopId: null,
        jobName: '',
        jobNamePrefixMappingValue: '',
        createPolicy: 'single',
        formTag: '',
        batchDataSourceMapping: {}, //批量
        jobParamMappingGroupList: [], //作业参数列表
        executeParamMappingGroupList: [], //执行参数列表:执行目标、连接协议、执行用户、分批数量
        scenarioParamMappingGroupList: [], // 场景参数列表
        formAttributeMappingList: []
      },
      validateList: ['required'],
      formConfig: {
        combopId: {
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
            this.changeId(val);
          }
        },
        jobName: {
          type: 'text',
          label: this.$t('term.autoexec.jobname'),
          validateList: ['required']
        },
        runnerGroupTag: {
          type: 'select',
          dynamicUrl: '/api/rest/tag/search?type=runnergroup',
          rootName: 'tagList',
          multiple: true,
          dealDataByUrl: this.$utils.getRunnerGroupTagList,
          readonly: true
        },
        runnerGroup: {
          type: 'select',
          dynamicUrl: '/api/rest/runnergroup/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getRunnerGroupList,
          readonly: true
        },
        createPolicy: {
          dataList: [
            {
              value: 'single',
              text: this.$t('term.process.singlecreatejob')
            },
            {
              value: 'batch',
              text: this.$t('dialog.title.batchcreatetarget', {'target': this.$t('term.autoexec.job')})
            }
          ]
        }
      },
      runnerGroupTag: {}, //执行器组标签
      runnerGroup: {}, //执行组
      phaseList: [],
      scenarioList: [],
      runtimeParamList: [],
      exportParamList: [],
      autoexecCombop: {} //组合工具数据
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
        if (this.config.combopId) {
          try {
            await this.getAutoexecCombop(this.config.combopId);
            this.createjobConfig.combopId = this.config.combopId;
            Object.keys(this.config).forEach(key => {
              this.$set(this.createjobConfig, key, this.config[key]);
            });
            //更新组合工具参数列表
            this.initData(this.config);
          } catch (e) {
            this.$set(this.createjobConfig, 'isShow', !!this.config.isShow);
            this.isFirst = false;
            this.loadingShow = false;
          }
        }
      }
      this.$nextTick(() => {
        this.isFirst = false;
        this.loadingShow = false;
        this.$emit('update', this.createjobConfig);
      });
    },
    initData(config) {
      this.createjobConfig.scenarioParamMappingGroupList = [];
      this.createjobConfig.jobParamMappingGroupList = [];
      this.createjobConfig.executeParamMappingGroupList = [];
      this.createjobConfig.scenarioParamMappingGroupList = [];
      console.log(this.autoexecCombop);
      if (!this.$utils.isEmpty(this.autoexecCombop)) {
        //执行器组只需要只读，从组合工具带出即可
        this.runnerGroup = this.autoexecCombop.runnerGroup || {};
        this.runnerGroupTag = this.autoexecCombop.runnerGroupTag || {};
        let runtimeParamList = this.autoexecCombop.runtimeParamList || [];
        let executeParamList = this.autoexecCombop.executeParamList || [];
        let scenarioParamList = this.autoexecCombop.scenarioParamList || [];
        runtimeParamList.forEach(item => {
          let obj = {
            key: item.key,
            name: item.name,
            type: item.type,
            isRequired: item.isRequired,
            config: {type: item.type},
            defaultValue: item.value,
            mappingList: [{
              mappingMode: item.mappingMode || 'constant',
              value: item.value,
              column: '',
              filterList: []
            }]
          };
          if (!this.$utils.isEmpty(item.config)) {
            Object.assign(obj.config, item.config);
          }
          if (config && !this.$utils.isEmpty(config.jobParamMappingGroupList)) {
            let findParam = config.jobParamMappingGroupList.find(p => p.key === item.key);
            if (findParam && !this.$utils.isEmpty(findParam.mappingList)) {
              obj.mappingList = findParam.mappingList;
            } 
          }
          this.createjobConfig.jobParamMappingGroupList.push(obj);
        });
        executeParamList.forEach(item => {
          let obj = {
            isRequired: item.isRequired,
            key: item.key,
            mappingMode: item.mappingMode,
            name: item.name
          };
          if (item.mappingMode === 'constant' || item.mappingMode === 'runtimeparam') {
            obj.value = item.value;
          } else {
            obj.mappingList = [{
              mappingMode: '',
              value: '',
              column: '',
              filterList: []
            }];
            if (config && !this.$utils.isEmpty(config.executeParamMappingGroupList)) {
              let findParam = config.executeParamMappingGroupList.find(p => p.key === item.key);
              if (findParam && !this.$utils.isEmpty(findParam.mappingList)) {
                obj.mappingList = findParam.mappingList;
              } 
            }
          }
          this.createjobConfig.executeParamMappingGroupList.push(obj);
        });
        scenarioParamList.forEach(item => {
          let obj = {
            key: item.key,
            name: item.name,
            isRequired: item.isRequired,
            mappingList: [{
              mappingMode: item.mappingMode,
              value: item.value,
              column: '',
              filterList: []
            }]
          };
          if (config && !this.$utils.isEmpty(config.scenarioParamMappingGroupList)) {
            let findParam = config.scenarioParamMappingGroupList.find(p => p.key === item.key);
            if (findParam && !this.$utils.isEmpty(findParam.mappingList)) {
              obj.mappingList = findParam.mappingList;
            } 
          }
          this.createjobConfig.scenarioParamMappingGroupList.push(obj);
        });
      }
    },
    getAutoexecCombop(combopId) {
      return this.$api.process.process.getAutoexecCombop({combopId: combopId}).then(res => {
        if (res.Status == 'OK') {
          this.autoexecCombop = res.Return || {};
          this.runtimeParamList = this.autoexecCombop.runtimeParamList || [];
          this.phaseList = this.autoexecCombop.phaseList || [];
          this.scenarioList = this.autoexecCombop.scenarioList || [];
          this.exportParamList = this.autoexecCombop.exportParamList || [];
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changeFormTag(tag) {
      this.$set(this.createjobConfig, 'formTag', tag);
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
    },
    async changeId(val) {
      this.createjobConfig.jobNamePrefixMappingValue = '';
      this.createjobConfig.createPolicy = 'single';
      this.createjobConfig.formAttributeMappingList = [];
      if (!val) {
        return;
      }
      this.loadingShow = true;
      await this.getAutoexecCombop(val);
      this.initData();
    },
    getruntimeParamListText(value) {
      if (this.autoexecCombop && this.autoexecCombop.runtimeParamList) {
        let findItem = this.autoexecCombop.runtimeParamList.find(item => item.key === value);
        if (findItem) {
          return findItem.name;
        } else {
          return '';
        }
      }
    },
    changeJobPolicy() {
      this.$set(this.createjobConfig, 'batchDataSourceMapping', {});
    },
    setValue(item, attr, value) {
      this.$set(item, attr, value);
    },
    valid() {
      let isValid = true;
      for (let key in this.$refs) {
        let item = this.$refs[key];
        if (Array.isArray(item)) {
          item.forEach(v => {
            if (v && v.valid) {
              !v.valid() && (isValid = false);
            }
          });
        } else {
          if (item && item.valid) {
            !item.valid() && (isValid = false);
          }
        }
      }
      return isValid;
    }
  },
  computed: {
    autoexecParamsList() {
      let dataList = [];
      if (this.autoexecCombop) {
        if (this.autoexecCombop.executeParamList && this.autoexecCombop.executeParamList.length) {
          dataList.push(...this.autoexecCombop.executeParamList);
        }
        if (this.autoexecCombop.runtimeParamList && this.autoexecCombop.runtimeParamList.length) {
          dataList.push(...this.autoexecCombop.runtimeParamList);
        }
      }
      return dataList;
    },
    getFormComponent() {
      return (type) => {
        let dataList = [];
        if (this.allFormitemList && this.allFormitemList.length > 0) {
          if (type === 'formCommonComponent') { //表单普通组件
            dataList = this.allFormitemList.filter(item => {
              return item.handler != 'formtableselector' && item.handler != 'formtableinputer' && item.handler != 'formcube';
            });
          } else if (type === 'formTableComponent') { //table组件（表格数据组件、表单选择组件）
            dataList = this.allFormitemList.filter(item => {
              return item.handler === 'formtableselector' || item.handler === 'formtableinputer';
            });
          }
        }
        return dataList;
      };
    }
  },
  watch: {
    createjobConfig: {
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
