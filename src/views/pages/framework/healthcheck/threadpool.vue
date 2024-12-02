<template>
  <div>
    <TsContain :siderWidth="800" :isDrag="true" :isSiderHide="!isShowThreaddump">
      <template v-slot:topLeft>
        <div class="action-group">
          <div class="action-item" @click="toggleThreaddump()">
            <span class="tsfont-fangbingduwangguan">{{ $t('term.framework.printsnapshot') }}</span>
            <span v-if="isShowThreaddump" class="tsfont-close"></span>
          </div>
        </div>
      </template>
      <template v-slot:topRight>
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
        <div class="bg-op radius-md" style="height: 100%">
          <div v-if="threadPoolData" class="container">
            <div
              v-for="index in threadPoolData.mainPoolSize"
              :key="'pool' + index"
              class="item"
              :class="getThreadInfo(index) ? 'bg-success cursor' : 'bg-info'"
              @click="searchThread(index)"
            >
              <Tooltip v-if="getThreadInfo(index)" :max-width="300" :transfer="true">
                <LoadingIcon></LoadingIcon>
                <div slot="content">
                  <div class="grid">
                    <div class="text-grey">{{ $t('page.name') }}</div>
                    <div>
                      <b class="text-grey">{{ getThreadInfo(index).name }}</b>
                    </div>
                  </div>
                  <div class="grid">
                    <div class="text-grey">{{ $t('page.thread') }}</div>
                    <div>
                      <b class="text-grey">{{ getThreadInfo(index).id }}</b>
                    </div>
                  </div>
                  <div class="grid">
                    <div class="text-grey">{{ $t('page.begin') }}</div>
                    <div>
                      <b class="text-grey">{{ getThreadInfo(index).startTime | formatDate }}</b>
                    </div>
                  </div>
                  <div class="grid">
                    <div class="text-grey">{{ $t('page.term.rank') }}</div>
                    <div>
                      <b class="text-grey">{{ getThreadInfo(index).priority }}</b>
                    </div>
                  </div>
                  <div class="grid">
                    <div class="text-grey">{{ $t('page.timecost') }}</div>
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
        </div>
      </template>
      <div slot="sider">
        <div style="position: relative; padding-top: 80px">
          <div style="width: 100%; position: absolute; top: 0px; left: 0px">
            <div class="action-group">
              <div class="action-item">
                <InputSearcher v-model="keyword" :width="400" @change="searchKeyword()"></InputSearcher>
              </div>
              <div v-if="matches.length > 0" class="action-item">{{ matches.length }}个匹配</div>
              <div
                v-if="matches.length > 0"
                class="action-item"
                :class="{ disable: currentMatchIndex === 0 }"
                @click="prevMatch()"
              >{{ $t('page.term.prev') }}</div>
              <div
                v-if="matches.length > 0"
                class="action-item"
                :class="{ disable: currentMatchIndex === matches.length - 1 }"
                @click="nextMatch()"
              >{{ $t('page.term.next') }}</div>
              <div class="action-item tsfont-fangbingduwangguan" @click="printThreaddump()">{{ $t('page.term.printagent') }}</div>
              <div v-if="threaddump" class="action-item tsfont-download" @click="exportThreaddump()">{{ $t('page.export') }}</div>
            </div>
            <Divider></Divider>
          </div>
          <div ref="textContainer" style="height: calc(100vh - 200px); overflow: auto; white-space: pre" v-html="threaddump"></div>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    LoadingIcon: () => import('@/views/pages/process/flow/floweditor/element/components/shape/loading.vue')
  },
  props: {},
  data() {
    return {
      keyword: '',
      maxsize: 500,
      isShowThreaddump: false,
      timer: null,
      threadPoolData: null,
      threaddump: null,
      currentMatchIndex: 0,
      matches: []
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
    searchThread(index) {
      if (this.isShowThreaddump && this.threaddump) {
        const t = this.getThreadInfo(index);
        if (t) {
          this.keyword = 'tid=' + t.id.toString();
          this.searchKeyword();
        }
      }
    },
    exportThreaddump() {
      // 获取 textContainer 的内容
      const container = this.$refs.textContainer;
      const textContent = container.innerText || container.textContent; // 提取纯文本

      // 创建 Blob 对象
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });

      // 创建下载链接
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'threaddump-' + this.threadPoolData.serverId + '-' + this.$utils.getCurrenttime('yyyyMMddHHmmss') + '.txt'; // 指定文件名
      link.click();

      // 释放 URL 对象
      URL.revokeObjectURL(link.href);
    },
    toggleThreaddump() {
      if (!this.isShowThreaddump) {
        this.isShowThreaddump = true;
        this.printThreaddump();
      } else {
        this.isShowThreaddump = false;
        this.threaddump = null;
      }
    },
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
    },
    printThreaddump() {
      this.threaddump = null;
      this.$api.framework.healthcheck.threaddump().then(res => {
        if (res.Return) {
          this.threaddump = res.Return;
        }
      });
    },
    searchKeyword() {
      const keyword = this.keyword.trim();
      const container = this.$refs.textContainer;

      // 清除当前高亮状态
      const selection = window.getSelection();
      if (selection.rangeCount > 0) selection.removeAllRanges();

      // 重置匹配信息
      this.matches = [];
      this.currentMatchIndex = 0;
      if (!keyword) return;

      // 遍历文本节点并记录匹配位置
      const range = document.createRange();
      range.selectNodeContents(container);
      const treeWalker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      while (treeWalker.nextNode()) {
        const textNode = treeWalker.currentNode;
        const text = textNode.nodeValue.toLowerCase();
        const searchKeyword = keyword.toLowerCase();
        let startIndex = 0;

        while ((startIndex = text.indexOf(searchKeyword, startIndex)) !== -1) {
          this.matches.push({
            node: textNode,
            start: startIndex,
            end: startIndex + keyword.length
          });
          startIndex += keyword.length; // 防止重复匹配同一位置
        }
      }

      if (this.matches.length > 0) {
        this.highlightMatch(0); // 高亮第一个匹配
      } else {
        this.$Message.info('未找到匹配的关键字');
      }
    },
    highlightMatch(index) {
      const match = this.matches[index];
      if (!match) return;

      // 高亮指定的匹配范围
      const range = document.createRange();
      range.setStart(match.node, match.start);
      range.setEnd(match.node, match.end);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      // 滚动到匹配位置
      const container = this.$refs.textContainer;
      const bounding = range.getBoundingClientRect();
      const containerBounding = container.getBoundingClientRect();
      container.scrollTop += bounding.top - containerBounding.top - 20; // 调整偏移
    },
    nextMatch() {
      if (this.currentMatchIndex < this.matches.length - 1) {
        this.currentMatchIndex++;
        this.highlightMatch(this.currentMatchIndex);
      }
    },
    prevMatch() {
      if (this.currentMatchIndex > 0) {
        this.currentMatchIndex--;
        this.highlightMatch(this.currentMatchIndex);
      }
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
  padding: 8px; /* 页面两边的间距 */
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
