<template>
  <div class="condition-tool">
    <div class="pb-nm pt-nm">
      <div class="text-title require-label pb-sm">
        <span>{{ $t('page.condition') }}</span>
        <span>
          <Tooltip theme="light" max-width="650" transfer>
            <i class="tsfont-info-o text-tip fz10"></i>
            <div slot="content">
              <ConditionHelp></ConditionHelp>
            </div>
          </Tooltip>
        </span>
      </div>
      <TsFormInput
        ref="condition"
        v-model="condition"
        border="border"
        :validateList="validateList"
        class="condition-param"
        :readonly="!canEdit"
        @change="changeCondition"
      ></TsFormInput>
    </div>
    <!-- 满足执行 -->
    <div class="pb-xs">
      <Tool
        ref="toolDetail"
        v-model="step.config.ifList"
        :title="$t('term.autoexec.satisfiedexecution')"
        :config="config"
        :canEdit="canEdit"
        :stepIndex="prevStepList && prevStepList.length||0"
        :prevStepList="prevStepList"
        :combopConfig="combopConfig"
        :paramList="paramList"
        :paramsTypeList="paramsTypeList"
        :failPolicyOption="failPolicyOption"
        :inputTypeList="inputTypeList"
        :execMode="execMode"
        class="condition-tool-param"
        @changeOperation="(list)=>{changeOperation(list,'if')}"
      ></Tool>
    </div>
    <!-- 否则执行 -->
    <Tool
      ref="toolDetail"
      v-model="step.config.elseList"
      :title="$t('term.autoexec.otherwiseexecute')"
      :config="config"
      :canEdit="canEdit"
      :stepIndex="prevStepList && prevStepList.length||0"
      :prevStepList="prevStepList"
      :combopConfig="combopConfig"
      :paramList="paramList"
      :paramsTypeList="paramsTypeList"
      :failPolicyOption="failPolicyOption"
      :inputTypeList="inputTypeList" 
      :execMode="execMode"
      class="condition-tool-param"
      @changeOperation="(list)=>{changeOperation(list,'else')}"
    ></Tool>
  </div>
</template>
<script>
import itemmixin from './itemmixin.js';
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    Tool: resolve => require(['./condition/tool'], resolve),
    ConditionHelp: resolve => require(['./condition/condition-help'], resolve)

  },
  mixins: [itemmixin],
  props: {
  },
  data() {
    return {
      validateList: ['required'],
      condition: '',
      step: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
   
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData(val) {
      this.step = val;
      if (this.step.config) {
        this.step.config.condition && (this.condition = this.step.config.condition);
      }
    },
    changeCondition(val) {
      this.$set(this.step.config, 'condition', val);
    },
    changeOperation(list, type) {
      if (type == 'if') {
        this.$set(this.step.config, 'ifList', list);
      } else if (type == 'else') {
        this.$set(this.step.config, 'elseList', list);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    step: {
      handler(val) {
        this.$emit('update:config', val);
        this.$emit('change', val);
      },
      deep: true
    },
    config: {
      handler(val) {
        let isSame = this.$utils.isSame(val, this.step);
        if (!isSame) {
          this.initData(val);
        }
      },
      deep: true,
      immediate: true      
    }
  }
};
</script>
<style lang="less" scoped>
.condition-tool { 
  padding: 0 16px;
}
</style>
