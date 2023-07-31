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
      isLoad: true, //接口是否加载完成
      description: '',
      keyword: '',
      mergeData: null, //外部带过来的合并的信息
      selectIssuelist: [],
      syncSourceList: [],
      isValid: false, //是否过滤有效需求
      maxSearchCount: '300', //检索提交日志条数
      theadList: [
        {
          key: 'selection'
        },
        {
          title: this.$t('term.codehub.issuesnumber'),
          key: 'no'
        },
        {
          title: this.$t('page.description'),
          key: 'name'
        },
        {
          title: this.$t('page.responsibleperson'),
          key: 'handleUserId'
        },
        {
          title: this.$t('page.effectiveness'),
          key: 'isValid'
        },
        {
          title: this.$t('page.status'),
          key: 'status'
        },
        {
          title: this.$t('page.updatetime'),
          key: 'issueUpdateTime'
        },
        {
          title: this.$t('page.source'),
          key: 'sourceId'
        }
      ],
      tableData: {
        keyName: 'no',
        selectedRemain: true,
        classKey: 'isValid',
        tbodyList: []
      },
      selectedTableData: {
        // 选择需要待合并的需求列表
        theadList: [
          {
            title: this.$t('term.codehub.issuesnumber'),
            key: 'no'
          },
          {
            title: this.$t('page.name'),
            key: 'name'
          },
          {
            title: this.$t('term.process.dealwithuser'),
            key: 'lcu',
            type: 'user'
          },
          {
            title: this.$t('term.codehub.issuesvalid'),
            key: 'isValid'
          },
          {
            title: this.$t('page.updatetime'),
            key: 'issueUpdateTime'
          },
          {
            title: this.$t('page.source'),
            key: 'sourceId'
          },
          {
            key: 'action'
          }
        ],
        tbodyList: [],
        keyName: 'no',
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
  beforeDestroy() {},
  methods: {
    changeCurrent(page) {
      this.tableData.currentPage = page;
      this.getList();
    },
    changePageSize(size) {
      this.tableData.pageSize = size;
      this.getList();
    },
    getSouce() {
      //获取需求列表
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
        list.forEach(l => {
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
    getSourceName() {
      // 获取来源名称
      return sourceId => {
        let sourceName = '';
        this.syncSourceList.forEach(sync => {
          if (sync.id == sourceId) {
            sourceName = sync.source;
          }
        });
        return sourceName;
      };
    },
    tableheight() {
      return () => {
        return window.innerHeight / 2;
      };
    },
    getClassNameByValid() {
      // 获取类名，根据需求有效性
      return isValid => {
        if (isValid == 1) {
          return 'text-success';
        } else if (isValid == 0) {
          return 'text-warning';
        } else if (isValid == null) {
          return 'ts-spinner loading text-primary';
        }
      };
    },
    getTextByValid() {
      // 获取名称，根据需求有效性
      return isValid => {
        if (isValid == 1) {
          return this.$t('term.codehub.effectivedemand');
        } else if (isValid == 0) {
          return this.$t('term.codehub.invaliddemand');
        } else if (isValid == null) {
          return '';
        }
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
