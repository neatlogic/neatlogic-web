
<template>
  <div v-if="step" class="script-detail">
    <div class="pt-nm pb-sm text-title tips">
      <span>
        {{ $t('page.failurestrategy') }}
      </span>
      <Tooltip
        placement="top"
        theme="light"
        transfer
        max-width="840"
      >
        <i class="tsfont-info-o text-tip tips" style="margin-left:3px;"></i>
        <template v-slot:content>
          <div>
            <div>{{ $t('term.autoexec.failurestopinfo') }}</div>
            <div>{{ $t('term.autoexec.failurecontinueinfo') }}</div>
          </div>
        </template>
      </Tooltip>
    </div>
    <div class="failPolicy-item">
      <TsFormRadio
        v-model="step.failPolicy"
        v-bind="policyConfig"
        :dataList="failPolicyOption"
        :disabled="!(canEdit && operationType=='combop')"
        :readonly="!(canEdit && operationType=='combop')"
      ></TsFormRadio>
    </div>
    <!-- 预置参数集 -->
    <ProfileEdit
      :ref="'profileEdit'"
      class="profile-param"
      :config="step"
      :canEdit="canEdit"
      @updateProfile="(config)=>{ updateProfile(config, step) }"
      @refreshProfile="refreshProfile"
    ></ProfileEdit>

    <div class="pt-nm pb-sm text-title tips"><span>
      {{ $t('page.inputparam') }}
    </span></div>
    <div v-if="step.operation.inputParamList && step.operation.inputParamList.length">
      <InputParam
        :ref="'inputParam'+step.uuid"
        v-model="step.config.paramMappingList"
        class="input-param"
        :canEdit="canEdit"
        :list="step.operation.inputParamList"
        :isFirst="isFirst"
        :prevList="prevList"
        :paramList="paramList"
        :paramsTypeList="paramsTypeList"
        :inputTypeList="inputTypeList"
        :profileId="profileId"
        :stepConfig="step"
      ></InputParam>
    </div>
    <div v-else class="line-2 text-tip">
      {{ $t('page.notarget', {target: $t('page.inputparam')}) }}
    </div>
    <!-- 自由参数 -->
    <div v-if="step.operation.argument">
      <ArgumentParam
        :ref="'argumentParam'+step.uuid"
        v-model="step.config.argumentMappingList"
        class="argument-param"
        :canEdit="canEdit"
        :config="step.operation.argument"
        :isFirst="isFirst"
        :prevList="prevList"
        :paramList="paramList"
        :paramsTypeList="paramsTypeList"
        :inputTypeList="inputTypeList"
      ></ArgumentParam>
    </div>
    <!-- 输出参数 -->
    <div class="pt-nm pb-sm text-title tips"><span>
      {{ $t('page.outputparam') }}
    </span></div>
    <div v-if="step.operation.outputParamList && step.operation.outputParamList.length" class="pb-xs outputParam-list">
      <Tag
        v-for="(output,oindex) in step.operation.outputParamList"
        :key="oindex"
        color="default"
        size="medium"
      >
        <template v-if="output.description">
          <Tooltip
            :content="output.description"
            max-width="300"
            theme="light"
            transfer
          >
            <span :class="typeIcon[output.type]?typeIcon[output.type]:'tsfont-forminput'">{{ output.name }}</span>
          </Tooltip>
        </template>
        <template v-else>
          <span :class="typeIcon[output.type]?typeIcon[output.type]:'tsfont-forminput'">{{ output.name }}</span>
        </template>
      </Tag>
    </div>
    <div v-else class="line-2 text-tip">
      {{ $t('page.notarget', {target: $t('page.outputparam')}) }}
    </div>
  </div>
</template>
<script>
import InputParam from './param/inputparam.vue';
import itemmixin from './itemmixin.js';
export default {
  name: '',
  components: {
    InputParam,
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    ArgumentParam: resolve => require(['./param/argumentparam.vue'], resolve),
    ProfileEdit: resolve => require(['./param/profile-edit'], resolve)
  },
  filters: {
  },
  mixins: [itemmixin],
  props: {
  },
  data() {
    return {
      step: {},
      policyConfig: {
        validateList: ['required']
      },
      typeIcon: {
        text: 'tsfont-forminput', //文本输入
        password: 'tsfont-lock', //密码
        file: 'tsfont-wenjian', //文件
        filepath: 'tsfont-wenjian', //文件路径
        date: 'tsfont-calendar', //日期
        datetime: 'tsfont-riqishijian', //日期时间
        json: 'tsfont-json', //json
        select: 'tsfont-formselect', //下拉单选
        multiselect: 'tsfont-formselectcascader', //下拉多选
        time: 'tsfont-formtime', //时间
        radio: 'tsfont-circle-o', //单选
        checkbox: 'tsfont-check-square', //复选
        node: 'tsfont-blocks', //节点
        account: 'tsfont-userinfo', //账号
        textarea: 'tsfont-formtextarea', //文本域
        phase: 'tsfont-stage', //阶段
        switch: 'tsfont-canvas' //开关
      },
      profileId: null //选择的预置参数集
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
    updateProfile(config, step) {
      if (config) {
        this.profileId = config.profileId;
        Object.keys(config).forEach(key => {
          this.$set(step.config, key, config[key]);
        });
      }
    },
    refreshProfile(profileId) { //刷新预置参数集的数据
      this.$refs['inputParam' + this.step.uuid].getProfileParamsList(profileId);
    }
  },
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
          this.step = val;
          this.step.config && this.step.config.profileId && (this.profileId = this.step.config.profileId);
        }
      },
      deep: true,
      immediate: true      
    }
  }
};
</script>
<style lang="less" scoped>
.outputParam-list {
  white-space: break-spaces;
}
</style>
