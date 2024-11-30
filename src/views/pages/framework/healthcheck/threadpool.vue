<template>
  <div>
    <TsContain>
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
        <!--<div v-if="threadPoolData && threadPoolData.threadList && threadPoolData.threadList.length > 0">
          <li v-for="(thread, index) in threadPoolData.threadList" :key="index" class="grid">
            <div>
              {{ thread.name }}
            </div>
            <div>{{ thread.startTime | formatDate }}</div>
            <div></div>
          </li>
        </div>-->
        <div>
          <div
            v-for="index in threadPoolData.mainPoolSize"
            :key="index"
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
          <div v-for="index in Math.min(threadPoolData.mainQueueSize, maxsize)" :key="index" class="item bg-error"></div>
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
      threadPoolData: {}
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
  grid-template-columns: 40px auto;
}
.item {
  display: inline-block;
  width: 30px;
  height: 30px;
  margin-right: 3px;
  margin-bottom: 3px;
  border-radius: 15px;
  text-align: center;
  padding-top: 6px;
}
</style>
