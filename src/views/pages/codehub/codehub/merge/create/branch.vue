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
            {{ getSourceName(row.sourceId) }}
          </template>
          <template slot="isValid" slot-scope="{ row }">
            <span :class="getClassNameByValid(row.isValid)">{{ getTextByValid(row.isValid) }}</span>
          </template>
          <template slot="issueUpdateTime" slot-scope="{ row }">
            {{ row.issueUpdateTime | formatDate }}
          </template>
          <template slot="handleUserId" slot-scope="{ row }">
            {{ row.handleUserId || row.issueCreator }}
          </template>
          <template v-slot:showFolderTable="{ row, index }">
            <!-- 展开收起内嵌表格 -->
            <span :class="{ 'tsfont-right': !row._expand, 'tsfont-down open': row._expand }" class="cursor" @click.stop="openInnerTable(row, index)"></span>
          </template>
          <template v-slot:expand="{ row }">
            <!-- 内嵌表格 -->
            <CommitTable
              v-if="row.commitList"
              :tbodyList="row.commitList"
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
        maxlength="1024"
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
      tbodyList: [],
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
    getList() {
      if (!this.srcBranch || !this.targetBranch) {
        this.isLoad = false;
        return;
      }
  
      this.isLoad = true;
  
      const param = {
        appModuleId: this.versionData.appModuleId,
        targetBranch: this.targetBranch,
        srcBranch: this.srcBranch,
        versionId: this.versionData.id,
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };

      //取消正在搜索的请求
      if (this.cancelAxios) {
        this.cancelAxios.cancel();
      }
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();

      this.$api.codehub.merge.getVaildlist(param, { cancelToken: this.cancelAxios.token })
        .then(res => {
          if (res && res.Status == 'OK') {
            const { list = [] } = res.Return || [];

            this.tbodyList = list.map(n => ({
              no: n.issueNo,
              name: '',
              handleUserId: '',
              isValid: n.issueNo ? 1 : 0,
              status: null,
              issueUpdateTime: '',
              sourceId: '',
              commitList: n.commitList || []
            }));

            this.emitGetIsuuelist();
            this.$emit('getIssue', this.tbodyList.length > 0);
            this.getMoreinfo();
          }
        })
        .finally(() => {
          this.isLoad = false;
        });
    },
    emitGetIsuuelist() {
      const list = this.tbodyList.map(l => l.no);
      this.$emit('getIsuuelist', this.tbodyList.length > 0 ? list : []);
    },
    getMoreinfo() {
      let param = {
        versionId: this.versionId || null,
        keyword: this.keyword,
        pageSize: this.tableData.pageSize,
        currentPage: this.tableData.currentPage
      };
      this.isLoad = true;

      this.$api.codehub.merge.getIssuelist(param)
        .then(res => {
          this.isLoad = false;
          if (res && res.Status == 'OK') {
            const { pageCount = 0, rowNum = 0, pageSize = 20, currentPage = 1, list = [] } = res.Return;

            this.tableData = {
              ...this.tableData,
              pageCount,
              rowNum,
              pageSize,
              currentPage
            };

            for (let t of list || []) {
              let tbody = this.tbodyList.find(({ no }) => no === t.no);
              if (tbody) {
                tbody.name = t.name || '';
                tbody.handleUserId = t.handleUserId || '';
                tbody.status = t.status;
                tbody.issueUpdateTime = t.issueUpdateTime;
                tbody.sourceId = t.sourceId;
              }
            }
          } else {
            this.$set(this, 'tbodyList', []);
            this.$emit('getIsuuelist', []);
          }
        })
        .finally(() => {
          this.isLoad = false;
        });
    },
    openInnerTable(row, index) {
      const shouldExpand = !row['_expand'];

      row._expand = shouldExpand;
      this.$set(this.tbodyList, index, row);
    },
    handleBranchChange() {
      this.$emit('getIsuuelist', []);
      this.getList();
    }
  },
  filter: {},
  computed: {},
  watch: {
    srcBranch(val) {
      this.handleBranchChange();
    },
    targetBranch(val) {
      this.handleBranchChange();   
    }
  }
};
</script>
<style lang="less" scoped>
</style>
