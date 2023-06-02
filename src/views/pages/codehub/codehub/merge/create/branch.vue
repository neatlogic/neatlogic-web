<template>
  <div>
    <div>
      <div v-if="!srcBranch" class="text-tip text-center" style="line-height:2">{{ $t('term.codehub.selectoriginbranchandtargetbranch') }}</div>
      <Loading v-if="isLoad" loadingShow></Loading>
      <div v-else-if="srcBranch && targetBranch" :class="'issue-' + isValid">
        <TsTable
          ref="showtable"
          v-bind="tabledata"
          hasFolder
          :tbodyList="tbodyList"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template slot="no" slot-scope="{ row }">
            {{ row.no || $t('term.codehub.unknownrequirement') }}
          </template>
          <template slot="sourceUuid" slot-scope="{ row }">
            {{ getsource(row.sourceUuid) }}
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
          <template slot="sourceUuid" slot-scope="{ row }">
            {{ getsource(row.sourceUuid) }}
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="ts-list" @click="viewIssue(row.uuid)">{{ $t('page.detail') }}</li>
              </ul>
            </div>
          </template>
          <template slot="folder" slot-scope="{ row }">
            <CommitDetail v-if="row.commitList" :tbodyList="row.commitList" :statusList="statusList"></CommitDetail>
          </template>
        </TsTable>
      </div>
    </div>
    <div v-if="srcBranch && targetBranch" class="input-border padding-md"><Input v-model="description" type="textarea" :placeholder="$t('term.codehub.mergerequestdesc')" /></div>
  </div>
</template>

<script>
// 分支型的mr创建先获取需求状态再获取其他字段
import mixins from './createmixin.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    CommitDetail: resolve => require(['./commit-table.vue'], resolve)
  },
  mixins: [mixins],
  props: {},
  data() {
    return {
      showIssue: false, //是否显示issue详情
      tbodyList: [],
      statusList: [],
      cancelAxios: null //取消接口调用用
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
      this.tabledata.currentPage = 1;
      this.getList();
    },
    viewIssue(uuid) {
      this.showIssue = true;
    },
    getList() {
      let _this = this;
      let param = {};
      if (!this.srcBranch || !this.targetBranch) {
        return;
      }
      //取消正在搜索的请求
      let cancel = this.cancelAxios;
      cancel && cancel.cancel();
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      if (this.versiondata.subsystemUuid) {
        Object.assign(param, { subsystemUuid: this.versiondata.subsystemUuid }); //需补充
      }
      //repositoryUuid
      if (this.targetBranch) {
        Object.assign(param, { targetBranch: this.targetBranch });
      }

      if (this.versiondata.uuid) {
        Object.assign(param, {versionUuid: this.versiondata.uuid});//补充版本uuid
      }

      Object.assign(param, { srcBranch: this.srcBranch });
      //Object.assign(param, {searchCommitCount: parseInt(this.maxSearchCount)});
      this.tabledata.pageSize && Object.assign(param, { pageSize: this.tabledata.pageSize });
      this.tabledata.currentPage && Object.assign(param, { currentPage: this.tabledata.currentPage });
      this.$api.merge.getVaildlist(param, { cancelToken: _this.cancelAxios.token }).then(res => {
        //this.$api.codehub.merge.getList(param).then(res => {//这里待确定究竟调哪个获取需求的接口
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
                  isValid: n.status && n.status != 'invalid',
                  status: null,
                  issueUpdateTime: '',
                  sourceUuid: '',
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
      //获取除了issueno跟isvalid之外的字段
      let param = {};
      if (this.versionid) {
        Object.assign(param, { versionUuid: this.versionid });
      }
      this.keyword && Object.assign(param, { keyword: this.keyword });
      this.tabledata.pageSize && Object.assign(param, { pageSize: this.tabledata.pageSize });
      this.tabledata.currentPage && Object.assign(param, { currentPage: this.tabledata.currentPage });
      this.isLoad = true;
      this.$api.codehub.merge
        .getIssuelist(param)
        .then(res => {
          this.isLoad = false;
          if (res && res.Status == 'OK') {
            this.$set(this.tabledata, 'pageCount', res.Return.pageCount);
            this.$set(this.tabledata, 'rowNum', res.Return.rowNum);
            this.$set(this.tabledata, 'pageSize', res.Return.pageSize);
            this.$set(this.tabledata, 'currentPage', res.Return.currentPage);
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
                      sourceUuid: t.sourceUuid
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
    }
  },
  filter: {},
  computed: {
    getTbody() {
      return function() {
        let list = [];
        if (this.tbodyList && this.tbodyList.length > 0) {
          list = this.tbodyList.filter(tbody => {
            return this.isValid ? tbody.isValid : tbody;
          });
        }
        return list;
      };
    }
  },
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
