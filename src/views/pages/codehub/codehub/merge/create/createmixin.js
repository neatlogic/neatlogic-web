export default {
  props: {
    versionid: [String, Number],
    versiondata: Object,
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
          title: $t('term.codehub.issuesnumber'),
          key: 'no'
        }, {
          title: $t('page.description'),
          key: 'name'
        }, {
          title: $t('page.responsibleperson'),
          key: 'handleUserId'
        }, {
          title: $t('page.effectiveness'),
          key: 'isValid'
        }, {
          title: $t('page.status'),
          key: 'status'
        }, {
          title: $t('page.updatetime'),
          key: 'issueUpdateTime'
        }, {
          title: $t('page.source'),
          key: 'sourceUuid'
        }
        ],
        rowKey: 'no',
        selectedRemain: true,
        classKey: 'isValid'
      },
      showtabledata: {
        theadList: [{
          title: $t('term.codehub.issuesnumber'),
          key: 'no'
        }, {
          title: $t('page.name'),
          key: 'name'
        }, {
          title: $t('term.process.dealwithuser'),
          key: 'lcu'
        }, {
          title: $t('term.codehub.issuesvalid'),
          key: 'isValid'
        }, {
          title: $t('page.status'),
          key: 'status'
        }, {
          title: $t('page.updatetime'),
          key: 'issueUpdateTime'
        }, {
          title: $t('page.source'),
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
    if (this.versiondata && this.versiondata.subSystemVo) {
      let subSystemId = this.versiondata.subSystemVo.id;
      let count = this.$utils.getCookie(subSystemId + '_searchCommitCount') || '300';
      this.maxSearchCount = parseInt(count);
    }
  },
  beforeDestroy() {},
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
      this.$api.codehub.issue.getSource({type: 'issue'}).then(res => {
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
      return function(uuid) {
        let txt = '';
        this.syncSourceList.forEach(sync => {
          if (sync.uuid == uuid) {
            txt = sync.source;
          }
        });
        return txt;
      };
    },
    tableheight() {
      return function() {
        return window.innerHeight / 2;
      };
    }
  },
  watch: {
    description(val) {
      this.$emit('getDes', val);
    },
    maxSearchCount: {
      handler: function(val) {
        this.$emit('getMaxSearchCount', val);
      },
      immediate: true
    }
  }
};
