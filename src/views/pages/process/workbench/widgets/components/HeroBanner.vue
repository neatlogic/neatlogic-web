<template>
  <div class="hero-banner bg-op text-default radius-lg padding" :class="{ 'is-state': loading || error || empty }">
    <div v-if="loading" class="hero-state flex-center text-grey">
      <span class="tsfont-loading"></span>
      <span>Loading...</span>
    </div>
    <div v-else-if="error" class="hero-state flex-center text-danger">
      <span class="tsfont-warning-o"></span>
      <span>{{ error }}</span>
    </div>
    <NoData v-else-if="empty"></NoData>
    <template v-else>
      <div class="hero-copy">
        <div class="hero-title">您好，{{ summary.userName }}</div>
        <div class="hero-subtitle text-grey mt-sm">{{ summary.subtitle }}</div>
        <div class="hero-summary text-grey mt-md">
          当前有 <span class="text-success">{{ summary.normalCount }}</span> 个服务运行正常，
          <span class="text-danger">{{ summary.alertCount }}</span> 个服务需要关注
        </div>
      </div>
      <div class="hero-art">
        <img :src="imgSrc" alt="" />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'HeroBanner',
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      summary: null
    };
  },
  computed: {
    empty() {
      return !this.summary;
    },
    imgSrc() {
      return require('@/resources/assets/images/modules/welcome/process.png');
    }
  }
};
</script>

<style lang="less" scoped>
.hero-banner {
  height: 100%;
  box-sizing: border-box;
  min-height: 120px;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 220px;
  gap: 24px;
  align-items: start;
  &.is-state {
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
  }
  .hero-state {
    min-height: 80px;
    gap: 6px;
    font-size: 12px;
  }
  .hero-title {
    font-size: 26px;
    line-height: 34px;
    font-weight: 700;
  }
  .hero-subtitle {
    font-size: 14px;
  }
  .hero-summary {
    font-size: 13px;
  }
  .hero-art {
    align-self: center;
    justify-self: end;
    img {
      width: 128px;
      opacity: 0.9;
    }
  }
}
@media (max-width: 1100px) {
  .hero-banner {
    grid-template-columns: minmax(300px, 1fr) 300px;
    .hero-art {
      display: none;
    }
  }
}
</style>
