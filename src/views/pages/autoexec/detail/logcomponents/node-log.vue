<template>
  <div class="node-code bg-dark-grey padding radius-lg" :style="{ '--height': offsetHeight }">
    <div
      ref="codemirror"
      class="codeContain"
      @scroll="onScroll"
      @mousewheel="onMousewheel"
    >
      <div v-if="isLoading" class="isLoading text-op tips">
        <Icon type="ios-loading" size="18" class="loading"></Icon>
        {{ $t('page.loading') }}
      </div>
      <div id="divLog" ref="codeContent">
        <div
          v-for="(log, index) in logContentList"
          :id="'content' + index"
          :key="index"
          :class="log.anchor && log.anchor.replace(/[-\.\/]+?/gi, '_')"
          class="content-grid"
        >
          <div class="text-grey">{{ log.time }}</div>
          <div
            v-remove-events
            class="content"
            :class="getContentClass(log.type)"
            v-html="log.content"
          ></div>
        </div>
        <Waitinput
          v-if="nodeData && nodeData.status == 'waitInput' && logData && logData.interact"
          :jobData="jobData"
          :phaseData="phaseData"
          :nodeData="nodeData"
          :interactData="logData.interact"
          @action="afterInteract"
        ></Waitinput>
      </div>
    </div>
    <div class="btn-div action-group bg-dark-grey">
      <span
        :class="isAutoScroll ? 'tsfont-unlock' : 'tsfont-lock'"
        class="action-item"
        @click="isAutoScroll = !isAutoScroll"
      >{{ isAutoScroll ? $t('page.automaticscrolling') : $t('page.lockscreen') }}</span>
      <span class="action-item tsfont-copy" @click="onCopy">{{ $t('page.copy') }}</span>
      <span
        v-if="!isDownloading"
        v-download="downloadConfig"
        class="tsfont-download action-item"
      >{{ $t('page.download') }}</span>
      <span v-else><Icon type="ios-loading" size="16" class="loading"></Icon></span>
      <span v-if="encodeList.length" class="action-item">
        <Dropdown trigger="click">
          <span class="tsfont-down">{{ encoding }}</span>
          <template slot="list">
            <DropdownMenu>
              <DropdownItem
                v-for="(item,index) in encodeList"
                :key="index"
                :disabled="encoding==item"
                @click.native="changeEncoding(item)"
              >{{ item }}</DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
      </span>
    </div>
    <div class="desc-div">
      <span>{{ descText }}</span>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
import removeEvents from '@/resources/directives/remove-events.js';
export default {
  name: '',
  components: { Waitinput: resolve => require(['./waitinput.vue'], resolve) },
  directives: { download, removeEvents },
  filters: {},
  props: {
    jobData: { type: Object }, //作业信息
    phaseData: { type: Object }, //阶段信息
    nodeData: { type: Object, default: () => {} }, //节点信息
    runnerData: { type: Object }, //执行器信息
    mode: { type: String, default: 'page' }, //page或 dialog两种模式，主要用来决定日志框高度
    locationId: {type: String}, //定位行id
    isHasExtraInfo: {type: Boolean} //是否有额外信息,主要用来计算内容高度
  },
  data() {
    return {
      startPos: Number.MAX_VALUE,
      endPos: 0,
      isDownloading: false,
      isLoading: false,
      //这是终点状态节点列表，非终点状态列表的需要定时刷新。到达终点状态列表之后，还会再刷新一次，确保所有状态一致。
      descText: this.$t('page.loading'),
      logData: null,
      logContentList: [],
      timmer: null,
      isAutoScroll: true, //自动滚动日志
      encodeList: [], //编码列表
      encoding: 'UTF-8'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      this.getJobEncodeList();
      this.getContent();
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.timmer) {
      clearTimeout(this.timmer);
      this.timmer = null;
    }
  },
  destroyed() {},
  methods: {
    afterInteract() {
      this.getContent('down', this.endPos);
    },
    onMousewheel(event) {
      this.isAutoScroll = false;
    },
    onScroll(event) {
      //向上加载更多
      if (this.$refs.codemirror) {
        let scrollTop = this.$refs.codemirror.scrollTop;
        if (scrollTop <= 0 && this.startPos > 0 && !this.isLoading) {
          this.getContent('up', this.startPos);
        }
      }
    },
    getContent(direction, logPos) {
      //如果是节点是未开始状态，只清空日志，不显示日志内容
      if (this.nodeData.status == 'pending') {
        this.$set(this, 'logContentList', []);
        this.logData = null;
        this.timmer = setTimeout(() => {
          this.getContent();
        }, 2000);
      } else {
        const param = {
          jobPhaseId: this.phaseData.id,
          status: this.nodeData.status,
          resourceId: this.nodeData.resourceId,
          nodeId: this.nodeData.id,
          encoding: this.encoding
        };
        if (this.nodeData.sqlFile) {
          param.sqlName = this.nodeData.sqlFile;
        }
        if (!direction) {
          param.direction = 'down';
        } else {
          param.direction = direction;
        }
        if (!logPos) {
          param.logPos = -1;
        } else {
          param.logPos = logPos;
        }
        if (param.direction == 'down') {
          this.descText = this.$t('page.loading');
          //向下滚动才需要中断自动刷新
          if (this.timmer) {
            clearTimeout(this.timmer);
            this.timmer = null;
          }
        } else {
          this.isLoading = true;
        }

        let firstIndex;

        this.$api.autoexec.job
          .getNodeLog(param)
          .then(res => {
            this.logData = res.Return;
            const isRefresh = res.Return.isRefresh;
            this.startPos = Math.min(this.logData.startPos, this.startPos);
            this.endPos = Math.max(this.logData.endPos, this.endPos);
            if (param.direction == 'down') {
              for (let i = 0; i < res.Return.lineList.length; i++) {
                this.logContentList.push(res.Return.lineList[i]);
              }
            } else {
              //记录第一行原来的位置，更新内容后重新定位到这个地方
              firstIndex = res.Return.lineList.length;
              for (let i = res.Return.lineList.length - 1; i >= 0; i--) {
                this.logContentList.unshift(res.Return.lineList[i]);
              }
            }
            if (isRefresh == 1) {
              this.timmer = setTimeout(() => {
                this.getContent('down', this.endPos);
              }, this.calcIntervalTime(res.Return.lineList.length));
            }
          })
          .finally(() => {
            this.isLoading = false;
            if (param.direction == 'down' && this.logData && this.logData.isRefresh == 0) {
              this.descText = this.$t('page.loadfinish');
            }
            if (param.direction == 'down' && this.isAutoScroll) {
              if (this.logContentList.length > 0) {
                this.$nextTick(() => {
                  this.$utils.jumpTo('#content' + (this.logContentList.length - 1), 'smooth', this.$refs['codeContent']);
                });
              }
            } else if (firstIndex && param.direction == 'up') {
              this.$nextTick(() => {
                this.$utils.jumpTo('#content' + firstIndex, 'instant', this.$refs['codeContent']);
              });
            }
          });
      }
    },
    onCopy() {
      this.$utils.copyText('#divLog');
    },
    calcIntervalTime(dataLength) {
      if (dataLength == 0) {
        return 1000;
      } else if (dataLength <= 10) {
        return 1500;
      } else if (dataLength <= 20) {
        return 2000;
      } else if (dataLength <= 30) {
        return 2500;
      } else if (dataLength <= 40) {
        return 3000;
      } else if (dataLength <= 50) {
        return 3500;
      } else if (dataLength <= 60) {
        return 4000;
      } else if (dataLength <= 70) {
        return 4500;
      } else {
        return 5000;
      }
    },
    getJobEncodeList() {
      this.$api.autoexec.job.getJobEncodeList().then(res => {
        this.encodeList = res.Return || [];
      });
    },
    changeEncoding(item) {
      this.encoding = item;
      this.logContentList = [];
      this.getContent();
    }
  },
  computed: {
    offsetHeight() {
      return this.mode == 'page' ? this.isHasExtraInfo ? '310px' : '215px' : '190px';
    },
    getContentClass() {
      return type => {
        if (type == 'FINE') {
          return 'text-success';
        } else if (type == 'INFO') {
          return 'text-info';
        } else if (type == 'ERROR') {
          return 'text-error';
        } else if (type == 'WARN') {
          return 'text-warning';
        }
        return '';
      };
    },
    downloadConfig() {
      return {
        url: '/api/binary/autoexec/job/phase/node/log/download',
        method: 'post',
        params: {
          jobPhaseId: this.phaseData.id,
          resourceId: this.nodeData.resourceId,
          sqlName: this.nodeData.sqlFile,
          nodeId: this.nodeData.id,
          runnerId: this.runnerData ? this.runnerData.id : null
        },
        changeStatus: status => {
          if (status == 'start') {
            this.isDownloading = true;
          } else if (status == 'success' || status == 'error') {
            this.isDownloading = false;
          }
        }
      };
    }
  },
  watch: {
    locationId: {
      handler: function(val) {
        if (val) {
          this.$utils.jumpTo('.' + val, 'smooth', this.$refs['codeContent'], 'start');
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.content-grid {
  display: grid;
  grid-template-columns: 60px auto;
}
.content {
  white-space: pre-wrap;
  word-break: break-all;
}
.codeContain {
  white-space: pre-wrap;
  word-break: break-all;
  height: 100%;
  overflow: auto;
}

.node-code {
  position: relative;
  height: calc(100vh - var(--height));
  &:hover {
    .btn-div {
      opacity: 1;
    }
  }
  .btn-div {
    position: absolute;
    z-index: 10;
    top: 16px;
    right: 0;
    opacity: 0;
    text-align: right;
    padding: 0 16px;
  }
  .isLoading {
    text-align: center;
    opacity: 0.8;
  }
  .desc-div {
    position: absolute;
    z-index: 10;
    bottom: 6px;
    right: 16px;
    text-align: right;
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
}
</style>
