<template>
  <div>
    <TsRow v-if="!readonly" :gutter="8">
      <Col v-if="!isCreateJob" span="8">
        <TsFormSelect
          v-model="runnerGroupTag.mappingMode"
          :dataList="mappingModeList"
          :disabled="disabled"
          :clearable="false"
          transfer
          @change="changeMappingMode"
        ></TsFormSelect>
      </Col>
      <Col :span="getSelectWidth">
        <TsFormSelect
          v-if="runnerGroupTag.mappingMode==='runtimeparam'"
          v-model="runnerGroupTag.value"
          :dataList="paramsList"
          :disabled="disabled"
          :validateList="isRequired? validateList : []"
          transfer
          :firstText="$t('term.autoexec.jobparam')"
          :firstSelect="false"
          :firstLi="isEditRuntimeParam"
          @first="gotoAddParameter"
        ></TsFormSelect>
        <TsFormSelect
          v-if="runnerGroupTag.mappingMode==='constant'"
          ref="runnerGroupTag"
          v-model="runnerGroupTag.value"
          v-bind="runnerGroupTagConfig"
          :disabled="disabled"
          :clearable="true"
          @on-change="updateRunnerGroupText"
        >
        </TsFormSelect>
      </Col>
      <Col v-if="!isCreateJob && runnerGroupTag.mappingMode!=='runtimeparam' && !disabled" span="5">
        <div class="view">
          <div class="div-btn-contain action-group">
            <span class="action-item tsfont-rotate-right" @click="refresh()">{{ $t('page.refresh') }}</span>
            <span class="action-item tsfont-setting" @click="gotoRunnerGroupPage()">{{ $t('page.setting') }}</span>
          </div>
        </div>
      </Col>
    </TsRow>
    <div v-else>
      <template v-if="runnerGroupTag.value">
        <span class="text-tip pr-nm">{{ mappingModeLabel[runnerGroupTag.mappingMode] }}</span>
        <span v-if="runnerGroupTag.mappingMode === 'runtimeparam'">{{ getParamLabel(runnerGroupTag.value) }}</span>
        <span v-else>{{ runnerGroupTag.text }}</span>
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
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
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
    },
    isEditRuntimeParam: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      runnerGroupTag: {
        mappingMode: 'constant',
        value: null,
        text: null
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
      typeList: ['runnergrouptag'],
      validateList: ['required'],
      runnerGroupTagConfig: {
        transfer: true,
        needCallback: false,
        border: 'border',
        dynamicUrl: '/api/rest/tag/search?type=runnergroup',
        multiple: true,
        keyword: 'name',
        dealDataByUrl: this.$utils.getRunnerGroupTagList,
        rootName: 'tagList'
      }
    };
  },
  beforeCreate() {},
  async created() {
    await this.getRunnerGroupTagLabel();
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
        Object.keys(this.runnerGroupTag).forEach(key => {
          if (this.config.hasOwnProperty(key)) {
            this.runnerGroupTag[key] = this.config[key];
          }
        });
      }
    },
    gotoAddParameter() { //添加作业参数
      this.openParamsSetting();
    },
    save() {
      if (this.runnerGroupTag.value) {
        return this.runnerGroupTag;
      } else {
        return {};
      }
    },
    valid() {
      let isValid = true;
      if (this.$refs.runnerGroupTag) {
        isValid = this.$refs.runnerGroupTag.valid();
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
    async getRunnerGroupTagLabel() {
      let params = {defaultValue: [this.runnerGroupTag.value]};
      await this.$api.framework.runner.getRunnerGroupTag(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.runnerGroupTag.text = res.Return.tagList.length > 0 ? res.Return.tagList[0].name : '执行器组标签已被删除';
          }
        });
    },
    changeMappingMode() {
      this.$set(this.runnerGroupTag, 'value', '');
    },
    refreshSuccess(type) {
      this.$Message.success(this.$t('message.executesuccess'));
    },
    gotoRunnerGroupPage() { //新增流程
      window.open(HOME + '/framework.html#/runnergroup-manage', '_blank');
    },
    refresh() {
      let newParam = { timeUuid: this.$utils.setUuid() };
      this.$set(this.runnerGroupTagConfig, 'params', newParam);
      this.$set(this.runnerGroupTagConfig, 'needCallback', true);
    },
    updateRunnerGroupText(val, valObj) {
      this.runnerGroupTag.text = valObj.text;
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
      if (this.runnerGroupTag.mappingMode === 'runtimeparam' || this.disabled) {
        return 16;
      } else {
        return 11;
      }
    }
  },
  watch: {
    runnerGroupTag: {
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
