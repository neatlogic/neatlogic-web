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
  methods: {
  },
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
</style>
