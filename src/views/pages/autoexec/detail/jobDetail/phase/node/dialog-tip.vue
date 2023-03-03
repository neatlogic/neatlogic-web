
<template>
  <TsDialog
    v-if="tipConfig.tipAction"
    :title="tipConfig.title"
    :isShow.sync="tipConfig.tipAction"
    :hasHeader="false"
    :showCloseIcon="false"
    @on-ok="okAction"
    @on-cancel="closeTip"
  >
    <div class="tip-main">
      <template v-if="tipConfig.btnType=='reset' || tipConfig.btnType=='resetAll'">
        <div class="title-top"><span class="tsfont-info-o text-warning icon-tip"></span>重置节点将会使节点状态变为“待运行”，是否重置节点</div>
        <div class="text-tip">重置节点适用于以下两种场景：</div>
        <div class="text-tip">1.节点需要重跑，重置为“待运行”状态后，可重跑节点。</div>
        <div class="text-tip">2.本平台出现故障，导致所有节点停止运行，可重置所有节点，重跑当前作业。</div>
      </template>
      <template v-else-if="tipConfig.btnType=='ignore'">
        <div class="title-top"><span class="tsfont-info-o text-warning icon-tip"></span>是否忽略选中节点</div>
        <div class="text-tip">作业重跑或继续运行时，将跳过已忽略的节点</div>
        <div v-if="isNotIgnore" class="text-tip">选中节点包含待运行、运行中、已成功的节点，不可执行忽略操作，是否剔除待运行、运行中、已成功节点，并忽略其他节点</div>
      </template>
      <template v-else-if="tipConfig.btnType=='redo'">
        <div class="title-top"><span class="tsfont-info-o text-warning icon-tip"></span>是否重跑选中节点</div>
      </template>
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
  
  },
  filters: {
  },
  props: {
    tipConfig: Object,
    isNotIgnore: Boolean
  },
  data() {
    return {
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
    okAction() {
      this.$emit('okAction');
    },
    closeTip() {
      this.$emit('closeTip');
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.tip-main{
  .title-top{
    padding-bottom: 10px;
  }
  .text-tip{
    padding-bottom: 6px;
  }
  .icon-tip{
    padding-right: 4px;
  }
}
</style>
