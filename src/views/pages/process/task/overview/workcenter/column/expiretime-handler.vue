<template>
  <div v-if="rowData.expireStatus !== 'no-expired-time'">
    <template v-if="rowData.expireStatus === 'not-expired' || rowData.expireStatus === 'will-be-expired'">
      <span class="text-success mr-xs">{{ $t('page.remainingtime') }}{{ timeLabelSeparator }}</span>
      <Poptip
        :transfer="true"
        width="200"
        padding="8px"
        placement="top"
        trigger="hover"
      >
        <span class="text-success"> {{ rowData.expireConfig.timeLeftMin | formatTimeCost(timeFormatOptions) }}</span>
        <div slot="content">
          {{ $t('term.process.slatip') }}：{{ rowData.expireConfig.willOverSlaName }}
        </div>
      </Poptip>
    </template>
    <template v-else-if="rowData.expireStatus === 'is-expired'">
      <span class="text-danger mr-xs">{{ $t('term.process.timedout') }}{{ timeLabelSeparator }}</span>
      <Poptip
        :transfer="true"
        width="200"
        placement="top"
        padding="8px"
        trigger="hover"
      >
        <div class="text-danger">{{ rowData.expireConfig.timeLeftMin | formatTimeCost(timeFormatOptions) }}</div>
        <div slot="content">
          {{ $t('term.process.slatip') }}： {{ rowData.expireConfig.expiredSlaName }}
        </div>
      </Poptip>
    </template>
  </div>
</template>
<script>
import mixin from './mixin';
export default {
  mixins: [mixin],
  computed: {
    // 中英文标签分别使用全角和半角冒号。
    timeLabelSeparator() {
      return /^en(?:[-_]|$)/i.test(this.$i18n.locale) ? ':' : '：';
    },
    // 英文时长使用缩写并分隔各单位，中文保持原有紧凑格式。
    timeFormatOptions() {
      const isEnglish = /^en(?:[-_]|$)/i.test(this.$i18n.locale);
      return { unitNumber: 3, language: isEnglish ? 'en' : 'zh', unit: 'minute', separator: isEnglish ? ' ' : '' };
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@tip-color, @title-color) {
  .expired-slaname {
    color: @tip-color;
  }
}

html {
  .theme(@default-tip, @default-title);
  &.theme-dark {
    .theme(@white, @white);
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
    }
  }
}
</style>
