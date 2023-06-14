<template>
  <div>
    <div>
      <div v-if="!srcBranch" class="text-tip text-center" style="line-height:2">{{ $t('term.codehub.selectoriginbranchandtargetbranch') }}</div>
      <Loading v-if="isLoad" loadingShow></Loading>
      <div v-else-if="srcBranch && targetBranch" :class="'issue-' + isValid">
        <TsTable
          ref="showtable"
          v-bind="tableData"
          class="inner-table"
          canExpand
          :theadList="tableTheadList"
          :tbodyList="tbodyList"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template slot="no" slot-scope="{ row }">
            {{ row.no || $t('term.codehub.unknownrequirement') }}
          </template>
          <template slot="sourceId" slot-scope="{ row }">
            {{ getsource(row.sourceId) }}
          </template>
          <template slot="isValid" slot-scope="{ row }">
            <span v-if="row.isValid === 1" class="text-success">{{ $t('term.codehub.effectivedemand') }}</span>
            <span v-else-if="row.isValid === 0" class="text-warning">{{ $t('term.codehub.invaliddemand') }}</span>
            <span v-else-if="row.isValid === null" class="ts-spinner loading text-primary"></span>
          </template>
          <template slot="issueUpdateTime" slot-scope="{ row }">
            {{ row.issueUpdateTime | formatDate }}
          </template>
          <template slot="handleUserId" slot-scope="{ row }">
            {{ row.handleUserId || row.issueCreator }}
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="ts-list" @click="viewIssue(row.id)">{{ $t('page.detail') }}</li>
              </ul>
            </div>
          </template>
          <template v-slot:showFolderTable="{ row, index }">
            <span :class="{ 'tsfont-right': !row._expand, 'tsfont-down open': row._expand }" class="cursor" @click.stop="openInnerTable(row, index)"></span>
          </template>
          <template v-slot:expand="{ row }">
            <CommitTable
              v-if="row.commitList"
              :tbodyList="row.commitList"
              :statusList="statusList"
            ></CommitTable>
            <div v-else-if="!row.commitList" class="text-tip text-center">{{ $t('page.nodata') }}</div>
          </template>
        </TsTable>
      </div>
    </div>
    <div v-if="srcBranch && targetBranch" class="mt-sm">
      <TsFormInput
        v-model="description"
        type="textarea"
        border="border"
        :placeholder="$t('term.codehub.mergerequestdesc')"
      ></TsFormInput>
    </div>
  </div>
</template>

<script>
// 分支型的mr创建先获取需求状态再获取其他字段
import mixins from './createmixin.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    CommitTable: resolve => require(['./commit-table.vue'], resolve)
  },
  mixins: [mixins],
  props: {},
  data() {
    return {
      showIssue: false, //是否显示issue详情
      tbodyList: [],
      statusList: [],
      cancelAxios: null, //取消接口调用用
      tableTheadList: [
        {
          title: '',
          key: 'showFolderTable'
        },
        {
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
          key: 'sourceId'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    //取消正在搜索的请求
    let cancel = this.cancelAxios;
    cancel && cancel.cancel();
  },
  destroyed() {},
  methods: {
    getissueStatuslist() {
      this.$api.codehub.merge.getStatusList({ type: 'issue' }).then(res => {
        if (res && res.Status == 'OK') {
          this.statusList = res.Return.list;
        }
      });
    },
    searchList(val) {
      this.tableData.currentPage = 1;
      this.getList();
    },
    viewIssue(id) {
      this.showIssue = true;
    },
    getList() {
      if (!this.srcBranch || !this.targetBranch) {
        return;
      }
      let param = {
        appModuleId: this.versionData.appModuleId,
        targetBranch: this.targetBranch,
        srcBranch: this.srcBranch,
        versionId: this.versionData.id,
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };
      //取消正在搜索的请求
      let cancel = this.cancelAxios;
      cancel && cancel.cancel();
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      this.$api.codehub.merge.getVaildlist(param, { cancelToken: this.cancelAxios.token }).then(res => {
        if (res && res.Status == 'OK') {
          let newlist = res.Return.list || [];
          if (newlist.length > 0) {
            this.$set(
              this,
              'tbodyList',
              newlist.map(n => {
                return {
                  no: n.issueNo,
                  name: '',
                  handleUserId: '',
                  isValid: n.issueNo ? 1 : 0, // 有需求编号，表示有效需求，否则就是无效需求
                  status: null,
                  issueUpdateTime: '',
                  sourceId: '',
                  commitList: n.commitList || []
                };
              })
            );
            if (this.tbodyList && this.tbodyList.length > 0) {
              let list = this.tbodyList.map(l => {
                return l.no;
              });
              this.$emit('getIsuuelist', list);
            } else {
              this.$emit('getIsuuelist', []);
            }
            this.$emit('getIssue', true);
            this.getMoreinfo();
          } else {
            this.tbodyList = [];
            this.$emit('getIssue', false);
          }
        }
      });
    },
    getMoreinfo() {
      // 获取所有和需求列表和tbodyList 里面的no 需求编号相等，从需求列表取其他的字段
      let param = {
        versionId: this.versionId || null,
        keyword: this.keyword,
        pageSize: this.tableData.pageSize,
        currentPage: this.tableData.currentPage
      };
      this.isLoad = true;
      this.$api.codehub.merge
        .getIssuelist(param)
        .then(res => {
          this.isLoad = false;
          if (res && res.Status == 'OK') {
            this.$set(this.tableData, 'pageCount', res.Return.pageCount);
            this.$set(this.tableData, 'rowNum', res.Return.rowNum);
            this.$set(this.tableData, 'pageSize', res.Return.pageSize);
            this.$set(this.tableData, 'currentPage', res.Return.currentPage);
            let tbodylist = res.Return.list || [];
            if (tbodylist && tbodylist.length > 0) {
              //单独添加是否有效的字段
              tbodylist.forEach(t => {
                this.tbodyList.forEach(tbody => {
                  if (tbody.no == t.no) {
                    Object.assign(tbody, {
                      name: t.name || '',
                      handleUserId: t.handleUserId || '',
                      status: t.status,
                      issueUpdateTime: t.issueUpdateTime,
                      sourceId: t.sourceId
                    });
                  }
                });
              });
            }
          } else {
            this.$set(this, 'tbodyList', []);
            this.$emit('getIsuuelist', []);
          }
        })
        .catch(error => {
          this.isLoad = false;
        });
    },
    openInnerTable(row, index) {
      // 展开收起内嵌表格
      if (row['_expand']) {
        row._expand = false;
        this.$set(this.tbodyList, index, row);
      } else {
        row._expand = true;
        this.$set(this.tbodyList, index, row);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    srcBranch(val) {
      this.$emit('getIsuuelist', []);
      this.getList();
    },
    targetBranch(val) {
      this.$emit('getIsuuelist', []);
      this.getList();      
    }
  }
};
</script>
<style lang="less" scoped>
.issue-true {
  /deep/ .tr-false {
    display: none;
  }
}
</style>
