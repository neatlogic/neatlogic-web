<template>
  <div>
    <TsRow v-if="!readonly" :gutter="8">
      <Col v-if="!isCreateJob" span="8">
        <TsFormSelect
          v-model="runnerGroup.mappingMode"
          :dataList="mappingModeList"
          :disabled="disabled"
          :clearable="false"
          transfer
          @change="changeMappingMode"
        ></TsFormSelect>
      </Col>
      <Col :span="getSelectWidth">
        <TsFormSelect
          v-if="runnerGroup.mappingMode==='runtimeparam'"
          ref="userValue"
          v-model="runnerGroup.value"
          :dataList="paramsList"
          :disabled="disabled"
          :validateList="isRequired? validateList : []"
          transfer
          :firstText="$t('term.autoexec.jobparam')"
          :firstSelect="false"
          @first="gotoAddParameter"
        ></TsFormSelect>
        <TsFormSelect
          v-if="runnerGroup.mappingMode==='constant'"
          v-model="runnerGroup.value"
          v-bind="runnerGroupConfig"
          :clearable="false"
          :disabled="disabled"
          :needCallback.sync="runnerGroupConfig.needCallback"
          @searchCallback="refreshSuccess('process')"
        >
          <template v-slot:first-ul>
            <li class="tsfont-plus text-href first-slot" @click="gotoRunnerGroupPage">{{ $t('term.deploy.actuatorgroup') }}</li>
          </template>
        </TsFormSelect>
      </Col>
      <Col v-if="!isCreateJob && runnerGroup.mappingMode!=='runtimeparam' && !disabled" span="5">
        <div class="view">
          <div class="div-btn-contain action-group">
            <span class="action-item tsfont-rotate-right" @click="refresh('process')">{{ $t('page.refresh') }}</span>
            <span class="action-item tsfont-setting" @click="gotoRunnerGroupPage()">{{ $t('page.setting') }}</span>
          </div>
        </div>
      </Col>
    </TsRow>
    <div v-else>
      <template v-if="runnerGroup.value">
        <span class="text-tip pr-nm">{{ mappingModeLabel[runnerGroup.mappingMode] }}</span>
        <span v-if="runnerGroup.mappingMode === 'runtimeparam'">{{ getParamLabel(runnerGroup.value) }}</span>
        <span v-else>{{ runnerGroup.text }}</span>
      </template>
      <template v-else>-</template>
    </div>
  </div>
</template>
<script>
import { sync } from '../../../pbc/policy/phase';
export default {
  name: '',
  inject: {
    openParamsSetting: {
      default: () => {}
    }
  },
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    readonly: Boolean,
    disabled: Boolean,
    config: {
      type: Object,
      default: () => {}
    },
    runtimeParamList: Array,
    isRequired: {
      type: Boolean,
      default: true
    },
    isCreateJob: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      runnerGroup: {
        mappingMode: 'constant',
        value: '-1',
        text: this.$t('page.autoexecradomrunnergroup')
      },
      mappingModeList: [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        },
        {
          text: this.$t('term.autoexec.jobparam'),
          value: 'runtimeparam'
        }
      ],
      mappingModeLabel: {
        constant: this.$t('page.constant'),
        runtimeparam: this.$t('term.autoexec.jobparam')
      },
      typeList: ['runnergroup'],
      validateList: ['required'],
      runnerGroupConfig: {
        filterable: true,
        transfer: true,
        needCallback: false,
        validateList: ['required'],
        dealDataByUrl: this.$utils.getRunnerGroupList,
        dynamicUrl: '/api/rest/runnergroup/search',
        params: {
          
        },
        rootName: 'tbodyList'
      }
    };
  },
  beforeCreate() {},
  async created() {
    await this.getRunnerGroupLabel();
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
    init() {
      if (!this.$utils.isEmpty(this.config)) {
        Object.keys(this.runnerGroup).forEach(key => {
          if (this.config.hasOwnProperty(key)) {
            this.runnerGroup[key] = this.config[key];
          }
        });
      }
    },
    gotoAddParameter() { //添加作业参数
      this.openParamsSetting();
    },
    save() {
      if (this.runnerGroup.value) {
        return this.runnerGroup;
      } else {
        return {};
      }
    },
    valid() {
      let isValid = true;
      if (this.$refs.userValue) {
        isValid = this.$refs.userValue.valid();
      }
      return isValid;
    },
    getParamLabel(value) {
      let label = '';
      if (this.runtimeParamList && this.runtimeParamList.length > 0) {
        let findItem = this.runtimeParamList.find(i => i.key === value);
        if (findItem) {
          label = findItem.name;
        }
      }
      return label;
    },
    async getRunnerGroupLabel() {
      if (this.runnerGroup.value == -1) {
        return;
      }
      let params = {defaultValue: [this.runnerGroup.value]};
      await this.$api.framework.runner.getRunnerGroup(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.runnerGroup.text = res.Return.tbodyList.length > 0 ? res.Return.tbodyList[0].name : '执行器组已被删除';
          }
        });
    },
    changeMappingMode() {
      this.$set(this.runnerGroup, 'value', '');
    },
    refreshSuccess(type) {
      this.$Message.success(this.$t('message.executesuccess'));
    },
    gotoRunnerGroupPage() { //新增流程
      window.open(HOME + '/framework.html#/runnergroup-manage', '_blank');
    },
    refresh() {
      let newParam = { timeUuid: this.$utils.setUuid() };
      this.$set(this.runnerGroupConfig, 'params', newParam);
      this.$set(this.runnerGroupConfig, 'needCallback', true);
    }
  },
  filter: {},
  computed: {
    paramsList() {
      if (this.runtimeParamList && this.runtimeParamList.length > 0) {
        return this.runtimeParamList.filter(item => {
          return this.typeList.includes(item.type);
        }).map(v => {
          return {
            text: v.name,
            value: v.key
          };
        });
      }
      return [];
    },
    getSelectWidth() {
      if (this.isCreateJob) {
        return 24;
      }
      if (this.runnerGroup.mappingMode === 'runtimeparam' || this.disabled) {
        return 16;
      } else {
        return 11;
      }
    }
  },
  watch: {
    runnerGroup: {
      handler(val) {
        this.$emit('change', val);
      },
      deep: true,
      immediate: true
    },
    config: {
      handler(val) {
        this.init();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
