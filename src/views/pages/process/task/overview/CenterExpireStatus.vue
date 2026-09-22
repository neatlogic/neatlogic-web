<template>
  <div class="expire-status-container">
    <div
      v-if="row.expireStatus === 'is-expired' || row.expireStatus === 'will-be-expired'"
      class="expired sla"
      :class="row.expireStatus"
    >
      <div class="sla-summary">
        <span class="sla-icon" :class="row.expireStatus === 'is-expired' ? 'tsfont-warning-o' : 'tsfont-time'" aria-hidden="true"></span>
        <span class="sla-duration">{{ row.expireConfig.timeLeftMin | formatTimeCost({ language: 'en', unitNumber: 3, unit: 'minute', separator: ' ' }) }}</span>
        <span class="sla-status" :title="row.expireStatus === 'is-expired' ? $t('term.process.timedout') : $t('term.process.slastatus.untiltimeout')">{{ row.expireStatus === 'is-expired' ? $t('term.process.timedout') : $t('term.process.slastatus.untiltimeout') }}</span>
      </div>
      <div class="sla-slaname" :title="slaName">{{ slaName }}</div>
    </div>
  </div>
</template>

<script>
// 工单时效提示只展示告警时间和 SLA 名称，不改变处理人的切换规则。
export default {
  name: 'CenterExpireStatus',
  props: {
    row: Object
  },
  computed: {
    // 两类告警分别读取对应 SLA，避免展示另一条规则的名称。
    slaName() {
      return this.row.expireStatus === 'is-expired' ? this.row.expireConfig.expiredSlaName : this.row.expireConfig.willOverSlaName;
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.will-or-is-expired {
  .carouse-user-list {
    position: absolute;
    top: -60px;
    left: 0;
  }
}
.expire-status-container {
  min-width: 0;
  width: 100%;
}
// 使用独立子元素类，避免卡片视图旧倒计时样式覆盖字号和间距。
.sla {
  height: 47px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  gap: 4px;
  &-summary {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    line-height: 20px;
  }
  &-icon {
    flex: none;
    font-size: 16px;
  }
  // 时间始终完整显示，长文案只在自身范围内省略，避免单位换行撑高表格。
  &-duration {
    flex: none;
    font-size: 16px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  &-status {
    min-width: 0;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &-slaname {
    font-size: 12px;
    line-height: 18px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.theme(@tip-color, @text-color, @warning-color, @error-color) {
  .sla-slaname {
    color: @tip-color;
  }
  .sla-status {
    color: @text-color;
  }
  .expired.will-be-expired .sla-summary {
    color: @warning-color;
  }
  .expired.is-expired .sla-summary {
    color: @error-color;
  }
}

html {
  // 浅色主题加深告警文字，确保白色表格上的可读性。
  .theme(@default-icon, @default-text, darken(@default-warning-color, 35%), darken(@default-error-color, 12%));
  &.theme-dark {
    .theme(@dark-title, @dark-text, @dark-warning-color, @dark-error-hover-color);
  }
}

tr.trtype-is-expired, tr.trtype-will-be-expired{
  &:hover {
    &.will-be-expired,
    &.is-expired,
    &.will-or-is-expired {
      .carouse-user-list {
        top: 0;
      }
      .expired {
        display: none;
      }
    }
  }
}
</style>
