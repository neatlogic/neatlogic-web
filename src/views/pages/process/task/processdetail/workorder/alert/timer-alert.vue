
<template>
  <div class="task-alert bg-op radius-sm align-center">
    <div class="tsfont-danger-o icon-tip text-primary"></div>
    <div v-if="triggerTime" class="alert-main">
      {{ $t('term.process.currentnodewillflowtime',{time: $utils.getDateByFormat(triggerTime)}) }}
      {{ $t('term.process.distanceflow') }}
      <span v-if="newDataTime(triggerTime)" class="text-primary">{{ newDataTime(triggerTime)|formatTimeCost({maxUnit:'hour',language:'zh'}) }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    
  },
  filters: {
  },
  props: {
    processTaskStepConfig: Object
  },
  data() {
    return {
      triggerTime: null
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
  methods: {},
  computed: {
    newDataTime() {
      return function(val) {
        let nowDate = this.$store.state.now;
        let now = val - nowDate;
        if (now <= 0) { this.$emit('updateTask'); return false; }
        return now;
      };
    }
  },
  watch: {
    processTaskStepConfig: {
      handler(val) {
        if (val && val.handlerStepInfo && val.handlerStepInfo.triggerTime) {
          this.triggerTime = val.handlerStepInfo.triggerTime;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.task-alert{
  display: flex;
  margin-bottom: 16px;
  max-height: 134px;
  overflow-y: auto;
  padding: 12px 16px;
  .icon-tip{
    padding-left: 10px;
    width: 64px;
    font-size: 27px;
    flex-shrink: 0;
    line-height: 1;
  }
  .alert-main{
    flex: 1;
  }
}
</style>
