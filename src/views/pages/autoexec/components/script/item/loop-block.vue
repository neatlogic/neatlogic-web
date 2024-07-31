<template>
  <div class="condition-tool">
    <div class="pb-nm pt-nm">
      <div class="text-title require-label pb-sm">
        <span>{{ $t('term.autoexec.loopitem') }}</span>
        <span>
          <Tooltip theme="light" max-width="650" transfer>
            <i class="tsfont-info-o text-tip fz10"></i>
            <div slot="content">{{ $t('term.autoexec.loophelp') }}</div>
          </Tooltip>
        </span>
      </div>
      <TsFormInput
        ref="loopItems"
        v-model="loopItems"
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
        v-model="step.config.operations"
        :title="$t('term.autoexec.loopoperation')"
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
        @changeOperation="(list)=>{changeOperation(list)}"
      ></Tool>
    </div>
  </div>
</template>
<script>
import itemmixin from './itemmixin.js';
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    Tool: () => import('./condition/tool')
  },
  mixins: [itemmixin],
  props: {
  },
  data() {
    return {
      validateList: ['required'],
      loopItems: '',
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
        this.step.config.loopItems && (this.loopItems = this.step.config.loopItems);
      }
    },
    changeCondition(val) {
      this.$set(this.step.config, 'loopItems', val);
    },
    changeOperation(list) {
      this.$set(this.step.config, 'operations', list);
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
