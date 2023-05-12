<script>
import NodeList from './node-list.vue';

export default {
  name: '',
  components: {
  },
  extends: NodeList,
  props: {},
  data() {
    return {
      theadList: [
        {
          title: this.$t('page.filename'),
          key: 'sqlFile'
        },
        {
          title: 'ip',
          key: 'host'
        },
        {
          title: this.$t('term.process.nodename'),
          key: 'nodeName'
        },
        {
          title: this.$t('page.status'),
          width: 120,
          key: 'statusVo'
        },
        {
          title: this.$t('page.startstoptime'),
          width: 300,
          key: 'startTime'
        },
        {
          title: this.$t('page.timecost'),
          key: 'costTime'
        }
      ]
    };
  },
  beforeCreate() {},
  created() { },
  beforeMount() {},
  mounted() {
    
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    refreshNode(nodeIdList) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      if (nodeIdList && nodeIdList.length > 0) {
        this.$api.autoexec.job
          .getSqlListByPhase({
            nodeIdList: nodeIdList,
            needPage: false,
            jobPhaseId: this.phaseData.id,
            jobId: this.jobData.id
          })
          .then(res => {
            if (res.Return['tbodyList'] && res.Return['tbodyList'].length > 0) {
              const nodeIdList = [];
              res.Return['tbodyList'].forEach(node => {
                const oldNodeIndex = this.nodeData.tbodyList.findIndex(d => d.id === node.id);
                if (oldNodeIndex >= 0) {
                  node['isSelected'] = this.nodeData.tbodyList[oldNodeIndex]['_selected'];
                  this.$set(this.nodeData.tbodyList, oldNodeIndex, node);
                }
                if (!this.endingStatusList.includes(node.status)) {
                  nodeIdList.push(node.id);
                }
              });
              if (nodeIdList.length > 0) {
                this.timmer = setTimeout(() => {
                  this.refreshNode(nodeIdList);
                }, 3000);
              }
            }
          });
      }
    },
    searchNode(currentPage) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      this.searchParam.jobPhaseId = this.phaseData.id;
      this.searchParam.jobId = this.jobData.id;
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
        this.searchParam.nodeIdList = [];
      }
      this.$api.autoexec.job.getSqlListByPhase(this.searchParam).then(res => {
        this.nodeData = res.Return;
        const nodeList = res.Return.tbodyList;
        if (nodeList && nodeList.length > 0) {
          const nodeIdList = [];
          nodeList.forEach(element => {
            if (!this.endingStatusList.includes(element.status)) {
              nodeIdList.push(element.id);
            }
          });
          if (nodeIdList.length > 0) {
            this.timmer = setTimeout(() => {
              this.refreshNode(nodeIdList);
            }, 3000);
          }
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
