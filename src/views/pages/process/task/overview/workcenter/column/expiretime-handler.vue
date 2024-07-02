<template>
  <div v-if="rowData.expireStatus !== 'no-expired-time'">
    <span v-if="rowData.expireStatus === 'not-expired' || rowData.expireStatus === 'will-be-expired'">
      {{ rowData.expireConfig.timeLeftMin | formatTimeCost({ unitNumber: 2, language: 'zh', unit: 'minute' }) }}
    </span>
    <span v-else-if="rowData.expireStatus==='is-expired'">
      <span class="text-grey">{{ rowData.expireConfig.expiredSlaName }}</span>
      <span>{{ $t('term.process.timedout') }}</span>
      <span class="h3">
        {{ rowData.expireConfig.timeLeftMin | formatTimeCost({language:'en',unitNumber:1, unit: 'minute'}) }}
      </span>
    </span>
  </div>
</template>
<script>
import mixin from './mixin';
export default {
  mixins: [mixin]
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@tip-color, @title-color) {
  .expired-slaname {
    color: @tip-color;
  }
  .expired {
    padding-left: 20px;
    height: 47px;
    &-status {
      color: @tip-color;
    }
    &-duration {
      color: @title-color;
    }
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
      .expired {
        display: none;
      }
    }
  }
}
</style>
