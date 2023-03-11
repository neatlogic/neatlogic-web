
<script>
import download from '@/resources/directives/download.js';
import NodeLog from './node-log.vue';
export default {
  name: '',
  components: {},
  directives: { download },
  filters: {},
  extends: NodeLog,
  props: {
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
  },
  destroyed() {},
  methods: {
    getContent(direction, logPos) {
      //如果是节点是未开始状态，只清空日志，不显示日志内容
      if (this.phaseData.status == 'pending') {
        this.$set(this, 'logContentList', []);
        this.logData = null;
        this.timmer = setTimeout(() => {
          this.getContent();
        }, 2000);
      } else {
        const param = {
          jobPhaseId: this.phaseData.id,
          status: this.phaseData.status
        };
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
                this.getContent('down', this.logData.endPos);
              }, this.calcIntervalTime(res.Return.lineList.length));
            }
          })
          .finally(() => {
            this.isLoading = false;
            if (param.direction == 'down' && this.logData && this.logData.isRefresh == 0) {
              this.descText = this.$t('page.dataloadingcompleted');
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
    }
  },
  computed: {
    downloadConfig() {
      return {
        url: '/api/binary/autoexec/job/console/log/download',
        method: 'post',
        params: {
          jobId: this.jobData.id,
          runnerId: this.runnerData.id
        },
        changeStatus: status => {
          if (status == 'start') {
            this.isDownloading = true;
          } else if (status == 'success' || status == 'error') {
            this.isDownloading = false;
          }
        }
      };
    },
    offsetHeight() {
      return this.mode == 'page' ? this.isHasExtraInfo ? '310px' : '215px' : '180px';
    }
  },
  watch: {
  }
};
</script>
