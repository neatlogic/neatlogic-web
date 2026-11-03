
<template>
  <div class="mt-sm">
    <div v-if="(!interactData.role&& jobData.isCanExecute) || (interactData.role && $AuthUtils.hasRole(interactData.role))">
      <Divider orientation="left">{{ interactData.message }}</Divider>
      <template v-if="interactData.opType == 'button'">
        <div v-if="interactData.options && interactData.options.length > 0" class="action-group">
          <span v-for="btn in interactData.options" :key="btn" class="action-item">
            <Button
              size="small"
              :type="parmaryBtn.includes(btn) ? 'error' : 'info'"
              :loading="isSubmitting && pendingAction === btn"
              :disabled="isSubmitting"
              @click="doAction(btn)"
            >{{ btn }}</Button>
          </span>
        </div>
      </template>
      <template v-if="interactData.opType == 'input'">
        <div class="controller-group">
          <div>
            <TsFormInput
              ref="controller"
              v-model="value"
              type="text"
              class="value-item"
              :validateList="validateList"
            ></TsFormInput>
          </div>
          <div style="text-align:left">
            <Button
              type="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="doAction()"
            >{{ $t('page.continueexecute') }}</Button>
          </div>
        </div>
      </template>
      <template v-if="interactData.opType == 'select' || interactData.opType == 'mselect'">
        <div class="controller-group">
          <div>
            <TsFormSelect
              ref="controller"
              v-model="value"
              :validateList="validateList"
              :isEqualValue="true"
              :multiple="interactData.opType == 'mselect' ? true : false"
              :dataList="getDataList"
            ></TsFormSelect>
          </div>
          <div style="text-align:left">
            <Button
              type="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="doAction()"
            >{{ $t('page.continueexecute') }}</Button>
          </div>
        </div>
      </template>
    </div>
    <div v-if="interactData.role && !$AuthUtils.hasRole(interactData.role)">
      <span class="text-warning"> {{ $t('page.autoexecwaitinputnoauth', { target: interactData.role}) }} </span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  filters: {},
  props: {
    nodeData: { type: Object },
    interactData: { type: Object },
    jobData: { type: Object },
    phaseData: { type: Object }
  },
  data() {
    return {
      value: null,
      pendingAction: null,
      parmaryBtn: ['commit'],
      validateList: ['required']
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    // 同一次交互只允许一个提交，记录点击项以显示对应按钮的加载状态。
    async doAction(action = '') {
      if (this.isSubmitting) {
        return;
      }
      const controller = this.$refs['controller'];
      if (controller && controller.valid && !controller.valid()) {
        return;
      }
      this.pendingAction = action;
      try {
        const param = {
          option: action || this.value,
          jobId: this.jobData.id,
          jobPhaseId: this.phaseData.id,
          nodeId: this.nodeData.id,
          resourceId: this.nodeData.resourceId || null,
          sqlName: this.nodeData.sqlFile || null
        };
        const res = await this.$api.autoexec.job.exectWaitInput(param);
        if (res.Status == 'OK') {
          this.$emit('action');
        }
      } finally {
        this.pendingAction = null;
      }
    }
  },
  computed: {
    // 表单提交没有按钮选项，空字符串也表示请求正在进行。
    isSubmitting() {
      return this.pendingAction !== null;
    },
    getDataList() {
      let ary = [];
      if (this.interactData.opType == 'select' || this.interactData.opType == 'mselect') {
        this.interactData.options.forEach(item => {
          if (typeof item == 'object') {
            ary.push(item);
          } else {
            ary.push({ text: item, value: item });
          }
        });
      }
      return ary;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
