<template>
  <div ref="container" style="position:relative">
    <div v-if="hasLeftMore" class="bg-op left-more tsfont-option-horizontal text-action pr-xs" @click.stop="scrollLeft()"></div>
    <div v-if="hasRightMore" class="bg-op right-more tsfont-option-horizontal text-action pl-xs" @click.stop="scrollRight()"></div>
    <div
      v-if="isReady"
      ref="phasecontiner"
      :style="{ width: width + 'px' }"
      class="phase-continer bg-op"
    >
      <span v-for="(phase, index) in phaseList" :key="index" class="phase-item">
        <span :class="phase.status" class="cursor phase-status" @click.stop="toJobDetail(phase.id)">{{ phase.name }}</span>
        <span v-if="index < phaseList.length - 1" class="tsfont-drop-right text-grey" />
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    jobId: { type: Number },
    phaseList: { type: Array, default: new Array() }
  },
  data() {
    return {
      isReady: false,
      width: 0,
      timmer: null,
      scrolltimmer: null,
      hasLeftMore: false,
      hasRightMore: false
    };
  },
  beforeCreate() {},
  created() {
    window.addEventListener('resize', this.calcWidth);
  },
  beforeMount() {},
  mounted() {
    setTimeout(() => {
      this.calcWidth();
    }, 200);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.calcWidth);
  },
  destroyed() {},
  methods: {
    toJobDetail(phaseId) {
      this.$router.push({
        path: '/job-detail',
        query: { id: this.jobId, phaseId: phaseId }
      });
    },
    scrollLeft() {
      const phaseContainer = this.$refs['phasecontiner'];
      if (phaseContainer) {
        const sl = phaseContainer.scrollLeft;
        phaseContainer.scrollTo({
          left: sl - 100,
          behavior: 'smooth'
        });
        this.calcScroll();
      }
    },
    scrollRight() {
      const phaseContainer = this.$refs['phasecontiner'];
      if (phaseContainer) {
        const sl = phaseContainer.scrollLeft;
        phaseContainer.scrollTo({
          left: sl + 100,
          behavior: 'smooth'
        });
        this.calcScroll();
      }
    },
    calcWidth() {
      const container = this.$refs['container'];
      if (container) {
        this.isReady = false;
        if (this.timmer) {
          clearTimeout(this.timmer);
          this.timmer = null;
        }
        this.timmer = setTimeout(() => {
          this.width = container.getBoundingClientRect().width;
          this.isReady = true;
        }, 100);
      }
    },
    calcScroll() {
      if (this.scrolltimmer) {
        clearTimeout(this.scrolltimmer);
        this.scrolltimmer = null;
      }
      this.scrolltimmer = setTimeout(() => {
        const phaseContainer = this.$refs['phasecontiner'];
        if (phaseContainer) {
          const val = phaseContainer.scrollLeft;
          if (val > 0) {
            this.hasLeftMore = true;
          } else {
            this.hasLeftMore = false;
          }
          if (val + phaseContainer.clientWidth < phaseContainer.scrollWidth) {
            this.hasRightMore = true;
          } else {
            this.hasRightMore = false;
          }
        }
      }, 300);
    }
  },
  filter: {},
  computed: {},
  watch: {
    isReady: {
      handler: function(val) {
        if (val) {
          this.calcScroll();
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import './phase.less';
.phase-item {
  display: inline-block;
}
.phase-status:hover {
  text-decoration: underline;
}
.left-more {
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 10;
}
.right-more {
  position: absolute;
  right: 0px;
  top: 0px;
  z-index: 10;
}
.phase-continer {
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  -moz-transition: all 0.5s ease-out;
  -o-transition: all 0.5s ease-out;
  -webkit-transition: all 0.5s ease-out;
  transition: all 0.5s ease-out;
}
</style>
