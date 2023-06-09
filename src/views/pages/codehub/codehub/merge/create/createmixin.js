export default {
  props: {
    versionId: [String, Number],
    versionData: Object,
    srcBranch: [String, Number],
    targetBranch: [String, Number],
    issueNoList: Array,
    type: String
  },
  data() {
    return {
      isLoad: false, //接口是否加载完成
      description: '',
      keyword: '',
      mergeData: null, //外部带过来的合并的信息
      selectIssuelist: [],
      syncSourceList: [],
      isValid: false, //是否过滤有效需求
      maxSearchCount: '300', //检索提交日志条数
      tabledata: {
        theadList: [{
          title: this.$t('term.codehub.issuesnumber'),
          key: 'no'
        }, {
          title: this.$t('page.description'),
          key: 'name'
        }, {
          title: this.$t('page.responsibleperson'),
          key: 'handleUserId'
        }, {
          title: this.$t('page.effectiveness'),
          key: 'isValid'
        }, {
          title: this.$t('page.status'),
          key: 'status'
        }, {
          title: this.$t('page.updatetime'),
          key: 'issueUpdateTime'
        }, {
          title: this.$t('page.source'),
          key: 'sourceUuid'
        }
        ],
        rowKey: 'no',
        selectedRemain: true,
        classKey: 'isValid'
      },
      showtabledata: {
        theadList: [{
          title: this.$t('term.codehub.issuesnumber'),
          key: 'no'
        }, {
          title: this.$t('page.name'),
          key: 'name'
        }, {
          title: this.$t('term.process.dealwithuser'),
          key: 'lcu'
        }, {
          title: this.$t('term.codehub.issuesvalid'),
          key: 'isValid'
        }, {
          title: this.$t('page.updatetime'),
          key: 'issueUpdateTime'
        }, {
          title: this.$t('page.source'),
          key: 'sourceUuid'
        }, {
          key: 'action'
        }],
        tbodyList: [],
        rowKey: 'no',
        hideAction: false,
        classKey: 'isValid'
      }
    };
  },
  mounted() {
    this.getSouce();
    this.getList();
    if (this.versionData && this.versionData.appModuleVo) {
      let appModuleId = this.versionData.appModuleVo.id;
      let count = this.$utils.getCookie(appModuleId + '_searchCommitCount') || '300';
      this.maxSearchCount = parseInt(count);
    }
  },
  beforeDestroy() { },
  methods: {
    changeCurrent(page) {
      this.tabledata.currentPage = page;
      this.getList();
    },
    changePageSize(size) {
      this.tabledata.pageSize = size;
      this.getList();
    },
    getSouce() { //获取需求列表
      this.$api.codehub.issue.getSource({ type: 'issue' }).then(res => {
        if (res && res.Status == 'OK') {
          this.syncSourceList = res.Return.syncSourceList;
        }
      });
    },

    getSelected(li, list) {
      this.selectIssuelist = li;
      if (this.type == 'branch') {
        this.$emit('getIsuuelist', this.tbodyList);
      } else {
        this.$emit('getIsuuelist', this.totalIssue(this.selectIssuelist, this.addLi));
      }
    },
    updateVaildStatus(list, no) {
      if (list.length > 0) {
        list.forEach((l) => {
          Object.assign(l, {
            isValid: 0
          });
          if (l.no == no) {
            Object.assign(l, {
              isValid: 1
            });
          }
        });
        this.$forceUpdate();
      }
    }
  },
  computed: {
    getsource() {
      return (id) => {
        let txt = '';
        this.syncSourceList.forEach(sync => {
          if (sync.id == id) {
            txt = sync.source;
          }
        });
        return txt;
      };
    },
    tableheight() {
      return () => {
        return window.innerHeight / 2;
      };
    }
  },
  watch: {
    description(val) {
      this.$emit('getDes', val);
    },
    maxSearchCount: {
      handler(val) {
        this.$emit('getMaxSearchCount', val);
      },
      immediate: true
    }
  }
};
