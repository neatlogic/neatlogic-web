<template>
  <div>
    <div v-if="row.expireStatus === 'is-expired' || row.expireStatus === 'will-be-expired'" class="expired">
      <div v-if="row.expireStatus === 'is-expired'" class="expired-slaname">{{ row.expireConfig.expiredSlaName }}</div>
      <div v-if="row.expireStatus === 'will-be-expired'" class="expired-slaname">{{ row.expireConfig.willOverSlaName }}</div>
      <div class="clearfix">
        <div v-if="row.expireStatus === 'is-expired'">
          <span class="expired-status">{{ $t('term.process.timedout') }}</span>
          <span class="expired-duration">{{ (row.expireConfig.timeLeftMin) | formatTimeCost({ language: 'en', unitNumber: 1, unit: 'minute' }) }}</span>
        </div>
        <div v-if="row.expireStatus === 'will-be-expired'">
          <span class="expired-status">{{ $t('term.process.distancetimeout') }}</span>
          <span class="expired-duration">{{ (row.expireConfig.timeLeftMin) | formatTimeCost({ language: 'en', unitNumber: 1, unit: 'minute' }) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
  },
  props: {
    row: Object
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
  methods: {},
  filter: {},
  computed: {
    now() {
      return this.$store.state.now;
    }
  },
  watch: {}
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
.expired {
  height: 47px;
  display: flex;
  align-items: center;
  &-status {
    font-size: 12px;
    margin-right: 5px;
  }
  &-duration {
    font-size: 30px;
    height: 42px;
    line-height: 42px;
  }
}
.theme(@tip-color, @title-color) {
  .expired-slaname {
    color: @tip-color;
  }
  .expired {
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
