
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
        <div class="title-top"><span class="tsfont-info-o text-warning icon-tip"></span>{{ $t('term.autoexec.resetnodeconfirm') }}</div>
        <div class="text-tip">{{ $t('term.autoexec.resetnodescene') }}</div>
        <div class="text-tip">1.{{ $t('term.autoexec.waitrunnodetip') }}</div>
        <div class="text-tip">2.{{ $t('term.autoexec.malfunctionrerunjob') }}</div>
      </template>
      <template v-else-if="tipConfig.btnType=='ignore'">
        <div class="title-top"><span class="tsfont-info-o text-warning icon-tip"></span>{{ $t('term.autoexec.ignoreselectednode') }}</div>
        <div class="text-tip">{{ $t('term.autoexec.jobruntip') }}</div>
        <div v-if="isNotIgnore" class="text-tip">{{ $t('term.autoexec.deletnodetip') }}</div>
      </template>
      <template v-else-if="tipConfig.btnType=='redo'">
        <div class="title-top"><span class="tsfont-info-o text-warning icon-tip"></span>{{ $t('term.autoexec.rerunselectednodeconfirm') }}</div>
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
