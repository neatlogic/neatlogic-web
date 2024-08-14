<template>
  <div class="condition-tool">
    <div class="step-group pb-nm pt-nm">
      <TsFormItem
        :label="$t('term.autoexec.loopitem')" 
        :tooltip="$t('term.autoexec.loophelp')" 
        labelWidth="100"
        :required="true"
      >
        <TsFormInput
          ref="loopItems"
          v-model="loopItems"
          border="border"
          :validateList="validateList"
          class="condition-param"
          :readonly="!canEdit"
          @change="changeLoopItems"
        ></TsFormInput>
      </TsFormItem>
      <TsFormItem
        :label="$t('term.autoexec.loopitemname')" 
        :tooltip="$t('term.autoexec.loopitemhelp')" 
        labelWidth="100"
        :required="true"
      >
        <TsFormInput
          ref="loopItemVar"
          v-model="loopItemVar"
          border="border"
          :validateList="validateList"
          class="condition-param"
          :readonly="!canEdit"
          @change="changeLoopItemVar"
        ></TsFormInput>
      </TsFormItem>
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
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    Tool: () => import('./condition/tool')
  },
  mixins: [itemmixin],
  props: {
  },
  data() {
    return {
      validateList: ['required'],
      loopItems: '',
      loopItemVar: '',
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
        this.step.config.loopItemVar && (this.loopItemVar = this.step.config.loopItemVar);
      }
    },
    changeLoopItems(val) {
      this.$set(this.step.config, 'loopItems', val);
    },
    changeLoopItemVar(val) {
      this.$set(this.step.config, 'loopItemVar', val);
    },
    changeOperation(list) {
      this.$set(this.step.config, 'operations', list);
    },
    valid() {
      console.log(1);
      //校验输入参数是否通过
      if (this.$el.querySelectorAll('.form-li').length) {
        let isVaild = true;
        let childrendom = this.$el.querySelectorAll('.form-li');
        if (childrendom && childrendom.length > 0) {
          childrendom.forEach(children => {
            if (children.__vue__ && children.__vue__.valid) {
              if (!children.__vue__.valid()) {
                isVaild = false;
              }
            }
          });
        }
        this.$forceUpdate();
        return isVaild;
      } else {
        return true;
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
