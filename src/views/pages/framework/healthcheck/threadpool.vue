<template>
  <div>
    <TsContain :hasContentPadding="false">
      <template v-slot:topLeft>
        <div v-if="threadPoolData" class="action-group">
          <div class="action-item">
            <span class="mr-xs text-grey">服务器ID</span>
            <span>
              <b>{{ threadPoolData.serverId }}</b>
            </span>
          </div>
          <div class="action-item">
            <span class="mr-xs text-grey">任务数</span>
            <span>
              <b class="text-success">{{ threadPoolData.mainActiveCount || '-' }}</b>
            </span>
          </div>
          <div class="action-item">
            <span class="mr-xs text-grey">线程数</span>
            <span>
              <b class="text-primary">{{ threadPoolData.mainPoolSize || '-' }}</b>
            </span>
          </div>
          <div class="action-item">
            <span class="mr-xs text-grey">排队</span>
            <span>
              <b class="text-error">{{ threadPoolData.mainQueueSize || '-' }}</b>
            </span>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div v-if="threadPoolData" class="container">
          <div
            v-for="index in threadPoolData.mainPoolSize"
            :key="'pool' + index"
            class="item"
            :class="getThreadInfo(index) ? 'bg-success cursor' : 'bg-info'"
          >
            <Tooltip v-if="getThreadInfo(index)" :max-width="300" :transfer="true">
              <LoadingIcon></LoadingIcon>
              <div slot="content">
                <div class="grid">
                  <div class="text-grey">名称</div>
                  <div>
                    <b class="text-grey">{{ getThreadInfo(index).name }}</b>
                  </div>
                </div>
                <div class="grid">
                  <div class="text-grey">开始</div>
                  <div>
                    <b class="text-grey">{{ getThreadInfo(index).startTime | formatDate }}</b>
                  </div>
                </div>
                <div class="grid">
                  <div class="text-grey">耗时</div>
                  <div>
                    <b class="text-grey">{{ formatTimeCost(getThreadInfo(index).timeCost) }}</b>
                  </div>
                </div>
              </div>
            </Tooltip>
          </div>
          <div v-for="index in Math.min(threadPoolData.mainQueueSize, maxsize)" :key="'queue' + index" class="item bg-error"></div>
          <span v-if="threadPoolData.mainQueueSize > maxsize" class="text-grey">还有 {{ threadPoolData.mainQueueSize - maxsize }}</span>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    LoadingIcon: () => import('@/views/pages/process/flow/floweditor/element/components/shape/loading.vue')
  },
  props: {},
  data() {
    return {
      maxsize: 500,
      timer: null,
      threadPoolData: null
    };
  },
  beforeCreate() {},
  async created() {
    this.getThreadPoolStatus();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.timer) {
      this.timer.clear();
    }
  },
  destroyed() {},
  methods: {
    formatTimeCost(ms) {
      const units = [
        { label: '天', value: 24 * 60 * 60 * 1000 },
        { label: '小时', value: 60 * 60 * 1000 },
        { label: '分钟', value: 60 * 1000 },
        { label: '秒', value: 1000 }
      ];

      let remainingMs = ms;
      const result = [];

      for (const { label, value } of units) {
        if (remainingMs >= value) {
          const count = Math.floor(remainingMs / value);
          remainingMs %= value;
          result.push(`${count}${label}`);
        }
      }

      // 如果剩余毫秒小于1秒，单独显示
      if (remainingMs > 0) {
        result.push(`${remainingMs}毫秒`);
      }

      return result.join(' ');
    },
    getThreadInfo(index) {
      if (this?.threadPoolData?.threadList && this.threadPoolData.threadList.length > index - 1) {
        return this.threadPoolData.threadList[index - 1];
      }
      return null;
    },
    getThreadPoolStatus() {
      this.timmer = this.$utils.setInterval(async() => {
        await this.$api.framework.healthcheck.getThreadpoolStatus().then(res => {
          this.threadPoolData = res.Return;
        });
      }, 3000);
    }
  },
  filter: {},
  computed: {
    poolSum() {
      return this.threadPoolData.mainPoolSize + this.threadPoolData.backupPoolSize;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 35px auto;
}
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30px, 0.05fr));
  gap: 8px; /* 圆圈之间的间距 */
  padding: 0px 16px 0px 16px; /* 页面两边的间距 */
  box-sizing: border-box;
}
.item {
  width: 100%; /* 自适应宽度 */
  aspect-ratio: 1; /* 保证是圆形 */
  border-radius: 50%;
  display: flex; /* 启用 flex 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  padding-top: 3px;
}
</style>
