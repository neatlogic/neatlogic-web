<template>
  <div v-if="rowData.expireStatus !== 'no-expired-time'">
    <template v-if="rowData.expireStatus === 'not-expired' || rowData.expireStatus === 'will-be-expired'">
      <span class="text-success">{{ $t('page.remainingtime') }}</span>
      <Poptip
        :transfer="true"
        width="200"
        padding="8px"
        placement="top"
        trigger="hover"
      >
        <span class="text-success"> {{ rowData.expireConfig.timeLeftMin | formatTimeCost({ unitNumber: 3, language: 'zh', unit: 'minute' }) }}</span>
        <div slot="content">
          {{ $t('term.process.slatip') }}：{{ rowData.expireConfig.willOverSlaName }}
        </div>
      </Poptip>
    </template>
    <template v-else-if="rowData.expireStatus === 'is-expired'">
      <span class="text-danger">{{ $t('term.process.timedout') }}</span>
      <Poptip
        :transfer="true"
        width="200"
        placement="top"
        padding="8px"
        trigger="hover"
      >
        <div class="text-danger">{{ rowData.expireConfig.timeLeftMin | formatTimeCost({language:'zh',unitNumber:3, unit: 'minute'}) }}</div>
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
