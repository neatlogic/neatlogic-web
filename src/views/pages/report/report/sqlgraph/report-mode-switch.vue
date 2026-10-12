<template>
  <TsFormRadio
    class="report-mode-switch"
    :value="value"
    :dataList="modeList"
    radioType="button"
    :isChangeWrite="false"
    @change="$emit('change', $event)"
  ></TsFormRadio>
</template>
<script>
// 两种编辑模式共用轻量切换入口，模式及同步逻辑由父组件维护。
export default {
  name: 'ReportModeSwitch',
  components: {
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      default: 'xml'
    }
  },
  data() {
    return {
      modeList: [
        { value: 'xml', text: 'XML' },
        { value: 'graph', text: 'Graph' }
      ]
    };
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
// 公共按钮单选默认使用主题蓝色，此处仅覆盖模式切换的紧凑尺寸和中性选中态。
.theme(@text, @tip, @background, @selected, @border) {
  .report-mode-switch ::v-deep .ivu-radio-group-button {
    display: inline-flex;
    padding: 2px;
    border-radius: 4px;
    background: @background;
    .ivu-radio-wrapper {
      height: 24px;
      line-height: 24px;
      padding: 0 12px;
      border: 0 !important;
      border-radius: 3px;
      background: transparent;
      color: @tip;
      box-shadow: none !important;
      &::before,
      &::after {
        display: none;
      }
      &:hover {
        color: @text;
      }
      &.ivu-radio-wrapper-checked {
        background: @selected;
        color: @text !important;
      }
      &.ivu-radio-focus {
        outline: 1px solid @border;
        outline-offset: -1px;
      }
    }
  }
}
html {
  .theme(@default-text, @default-tip, @default-gray, @default-bg-dark-grey, @default-border);
  &.theme-dark {
    .theme(@dark-text, @dark-tip, @dark-gray, @dark-bg-grey, @dark-border);
  }
}
</style>
