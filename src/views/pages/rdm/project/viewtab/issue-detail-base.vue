<script>
export default {
  name: '',
  components: {
  },
  props: {
    pId: { type: Number }, //弹窗模式下的项目id
    aId: { type: Number }, //弹窗模式下的appId
    iId: { type: Number }, //弹窗模式下的issueId
    mode: { type: String, default: 'page' } //显示模式，dialog或page
  },
  data() {
    return {
      id: null,
      appId: null,
      projectId: null,
      contentMode: 'read',
      appList: [],
      isReady: false,
      isLoading: false
    };
  },
  beforeCreate() {},
  async created() {
    this.projectId = this.pId || Math.floor(this.$route.params['projectId']);
    this.appId = this.aId || Math.floor(this.$route.params['appId']);
    this.id = this.iId || Math.floor(this.$route.params['id']);
    await this.init();
    await this.getAppByProjectId();
    this.isReady = true;
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editContent() {
      this.contentMode = 'edit';
    },
    async init() {
      await this.getIssueById();
    },
    async getIssueById() {
      if (this.id) {
        this.issueData = {};
        this.isLoading = true;
        await this.$api.rdm.issue
          .getIssueById(this.id)
          .then(res => {
            this.issueData = res.Return;
            if (this.issueData && this.mode === 'page') {
              document.title = this.issueData.name;
              this.$route.meta.title = this.issueData.name;
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    },
    renderEditContentTab(h, label) {
      const controllList = [];
      controllList.push(h('span', label));
      if (!this.issueData.isEnd) {
        controllList.push(
          h('span', {
            class: 'ml-xs tsfont-edit-s',
            on: {
              click: this.editContent
            }
          })
        );
      }
      return h('div', controllList);
    },
    renderTabLabelForChild(h, issueData, label) {
      const controllList = [];
      controllList.push(h('span', label));
      if (issueData.childrenCount > 0) {
        controllList.push(
          h(
            'span',
            {
              class: 'ml-xs text-grey'
            },
            issueData.childrenCount
          )
        );
      }
      return h('div', controllList);
    },
    renderWebhookLabel(h, appId, label) {
      const controllList = [];
      controllList.push(h('span', label));
      if (this.getWebhookCount(appId)) {
        controllList.push(
          h(
            'span',
            {
              class: 'ml-xs text-grey'
            },
            this.getWebhookCount(appId)
          )
        );
      }
      return h('div', controllList);
    },
    renderTabLabel(h, id, label, appType, relType, direction) {
      if (!direction) {
        direction = 'from';
      }
      const controllList = [];
      controllList.push(h('span', label));
      if (this.getRelIssueCount(id, appType, relType, direction)) {
        controllList.push(
          /*h('span', {
            class: 'ml-xs',
            props: {
              type: 'info',
              count: this.getRelIssueCount(appType, relType, direction),
              'overflow-count': 999
            }
          })*/
          h(
            'span',
            {
              class: 'ml-xs text-grey'
            },
            this.getRelIssueCount(id, appType, relType, direction)
          )
        );
      }
      return h('div', controllList);
    },
    renderCostTabLabel(h, costCount) {
      const controllList = [];
      controllList.push(h('span', this.$t('term.rdm.cost')));
      if (costCount) {
        controllList.push(
          h(
            'span',
            {
              class: 'ml-xs text-grey'
            },
            costCount
          )
        );
      }
      return h('div', controllList);
    },
    renderAuditTabLabel(h, auditCount) {
      const controllList = [];
      controllList.push(h('span', this.$t('term.rdm.auditlist')));
      if (auditCount) {
        controllList.push(
          /*h('Badge', {
            class: 'ml-xs',
            props: {
              type: 'info',
              count: auditCount,
              'overflow-count': 999
            }
          })*/
          h(
            'span',
            {
              class: 'ml-xs text-grey'
            },
            auditCount
          )
        );
      }
      return h('div', controllList);
    },
    async getAppByProjectId() {
      if (this.projectId) {
        await this.$api.rdm.project.getAppByProjectId(this.projectId, { isActive: 1, needSystemAttr: 1 }).then(res => {
          this.appList = res.Return;
        });
      }
    }
  },
  filter: {},
  computed: {
    getApp() {
      return type => {
        return this.appList.find(d => d.type === type);
      };
    },
    getWebhookCount() {
      return appId => {
        if (this.issueData && this.issueData.webhookList && this.issueData.webhookList.length > 0) {
          return this.issueData.webhookList.filter(d => d.appId === appId).length;
        }
        return 0;
      };
    },
    getRelIssueCount() {
      return (id, appType, relType, direction) => {
        if (this.issueData && this.issueData.issueRelList && this.issueData.issueRelList.length > 0) {
          if (direction === 'from') {
            return this.issueData.issueRelList.filter(d => d.fromIssueId === id && d.toAppType === appType && d.relType === relType).length;
          } else if (direction === 'to') {
            return this.issueData.issueRelList.filter(d => d.toIssueId === id && d.fromAppType === appType && d.relType === relType).length;
          }
        }
        return 0;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 20px;
}
.middle {
  position: relative;
  height: calc(100vh - 116px);
  overflow: auto;
  transition: all 200ms;
}
.auth-container {
  height: calc(100vh - 50px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
