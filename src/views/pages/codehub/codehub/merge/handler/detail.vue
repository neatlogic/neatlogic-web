<template>
  <div>
    <div :class="'merge-' + mrData.status">
      <TsTable
        ref="showtable"
        v-bind="tabledata"
        :tbodyList="issueList"
        :hasFolder="isFolder(mrData)"
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
        @toggleFolder="toggleFolder"
      >
        <template slot="no" slot-scope="{ row }">
          {{ row.no }}
        </template>
        <template slot="issueUpdateTime" slot-scope="{ row }">
          {{ row.issueUpdateTime | formatDate }}
        </template>
        <template slot="issueMrStatus" slot-scope="{ row }">
          <span :class="'text-' + setStatus('color', row.issueMrStatus)">{{ setStatus('text', row.issueMrStatus) }}</span>
        </template>
        <template slot="sourceUuid" slot-scope="{ row }">
          {{ getsource(row.sourceUuid) }}
        </template>
        <template slot="handleUserId" slot-scope="{ row }">
          {{ row.handleUserId || row.issueCreator }}
        </template>
        <template slot="action" slot-scope="{ row }">
          <div v-if="row.issueMrStatus == 'merged' && mrData.versionTypeStrategyRelationVo.versionStrategyType == 'issue' && mrData.versionTypeStrategyRelationVo.versionStrategyType == 'issue' && mrData.status=='finish'" class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="ts-rotate-left" @click="revertIssue(row)">{{ $t('page.revocation') }}</li>
            </ul>
          </div>
        </template>
        <template slot="folder" slot-scope="{ row }">
          <CommitDetail
            v-if="row.showFolder != undefined"
            :mrId="id"
            :issueNo="row.no"
            :statusList="commitstatusList"
            :mrData="mrData"
            :issueStatus="row.issueMrStatus"
          ></CommitDetail>
        </template>
      </TsTable>
      <template v-if="mrData.canEdit">
        <div v-if="mrData.status == 'open' && !duringAction" class="btn-bottom bg-grey">
          <span v-if="mergetype== 'issue'" class="bottom-text">{{ $t('term.codehub.encounteringconflictingneeds') }}</span>
          <RadioGroup v-if="mergetype == 'issue'" v-model="reslove">
            <Radio label="stop">{{ $t('page.stop') }}</Radio>
            <Radio label="continus">{{ $t('page.continue') }}</Radio>
          </RadioGroup>
          <Button
            type="error"
            class="mr-sm ml-sm"
            :disabled="duringAction"
            @click="closeMr()"
          >{{ $t('page.close') }}</Button>
          <Button type="primary" :disabled="duringAction" @click="handlerMr()">{{ $t('page.merge') }}</Button>
        </div>
        <div v-if="(mrData.status == 'conflict' || mrData.status == 'failed') && !duringAction" class="btn-bottom bg-grey">
          <span v-if="mergetype == 'issue'" class="bottom-text">{{ $t('term.codehub.encounteringconflictingneeds') }}</span>
          <RadioGroup v-if="mergetype == 'issue'" v-model="reslove">
            <Radio label="stop">{{ $t('page.stop') }}</Radio>
            <Radio label="continus">{{ $t('page.continue') }}</Radio>
          </RadioGroup>
          <Button type="primary" :disabled="duringAction" @click="handlerMr()">{{ $t('page.retry') }}</Button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    CommitDetail: resolve => require(['./commit-table.vue'], resolve)
  },
  props: {
    id: String, //父组件传过来的mrid
    mrData: Object, //父组件传过来的mr数据
    statusList: Array, //父组件传过来的需求状态映射列表
    mrstatusList: Array //父组件传过来的mr状态映射列表
  },
  data() {
    return {
      isLoad: false,
      description: '',
      showIssue: false, //是否显示issue详情
      keyword: '',
      addItem: '',
      mergeData: null,
      syncSourceList: [],
      tabledata: {
        theadList: [
          {
            title: this.$t('term.codehub.issuesnumber'),
            key: 'no'
          },
          {
            title: this.$t('page.description'),
            key: 'name'
          },
          {
            title: this.$t('term.codehub.mergerequeststatus'),
            key: 'issueMrStatus'
          },
          {
            title: this.$t('page.responsibleperson'),
            key: 'handleUserId'
          },
          {
            title: this.$t('page.updatetime'),
            key: 'issueUpdateTime'
          },
          {
            title: this.$t('page.source'),
            key: 'source'
          },
          {
            key: 'action'
          }
        ],
        hideAction: false,
        rowKey: 'no',
        selectedRemain: true,
        classKey: 'isExtra'
      },
      reslove: 'continus',
      issueList: [],
      mergetype: 'branch',
      duringAction: false,
      issueConfig: null,
      showList: false,
      commitstatusList: [],
      flushTimer: null//定时刷新的定时器
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getList();
    if (this.mrData && this.mrData.versionStrategyVo && this.mrData.versionStrategyVo.type == 'issue') {
      this.getCommitstatus();
    }
    //如果初始化时mr状态是合并中的（页面无操作按钮无法更新状态），需要定时刷新页面更新状态,直接把是否需要继续改为是，其他与普通类型的一致
    if (this.mrData && this.mrData.status == 'merging') {
      this.reslove = 'continus';
      this.flushIssueStatus();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchList(val) {
      this.tabledata.currentPage = 1;
      this.getList();
    },
    getList() {
      this.issueList = this.mrData.issueList || [];
      this.mergetype = this.mrData.versionTypeStrategyRelationVo.versionStrategyType;
    },
    changeCurrent(page) {
      this.tabledata.currentPage = page;
      this.getList();
    },
    changePageSize(size) {
      this.tabledata.pageSize = size;
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
    handlerMr() {
      let type = this.mergetype;
      if (type == 'branch') {
        this.duringAction = true;
        let param = { mrId: this.id };
        this.$api.codehub.merge
          .mergebyBranch(param)
          .then((res) => {
            // TODO 这个页面可能后续废弃 
            debugger;
            this.duringAction = false;
            let status = res.Return && res.Return.status || '';
            if (res && res.Status == 'OK') {
              this.flushIssueStatus();
              this.$emit('reload');
            }
          })
          .catch(error => {
            this.duringAction = false;
            this.$emit('reload');
          });
      } else {
        this.mergeIssue();
      }
    },
    closeMr() {
      let params = {
        id: this.id,
        status: 'closed'
      };
      this.$api.merge.updateStatus(params).then(res => {
        if (res && res.Status == 'OK') {
          this.$emit('reload');
        }
      });
    },
    mergeIssue() {
      this.duringAction = true;
      let param = { mrId: this.id, continueMergeOnException: this.reslove != 'stop' };
      this.$api.codehub.merge
        .mergebyIssue(param)
        .then(res => {
          if (res && res.Status == 'OK') {
            this.flushIssueStatus();
            this.$emit('reload', this.reslove);
          } else {
            this.duringAction = false;
          }
        })
        .catch(error => {
          this.duringAction = false;
        });
    },
    flushIssueStatus() {
      let notFinish = false;
      this.$api.codehub.merge
        .getDetail({ id: this.id })
        .then((res) => {
          if (res && res.Status == 'OK') {
            //所有的issue列表
            let mr = res.Return;
            //更新mr状态
            this.$emit('updateStatus', mr.status);
            //更新mr的每一条issue状态
            mr.issueList.forEach((retIssue) => {
              if (retIssue.issueMrStatus == 'open' || retIssue.issueMrStatus == 'merging') {
                notFinish = true;
              }
              let isExtra = true; //是否是附加需求
              //单独更新有的每个issue状态，替换全部更新，可以保留每个行的操作状态
              this.issueList.forEach((issue) => {
                if (retIssue.no == issue.no) {
                  isExtra = false;
                  this.$set(issue, 'issueMrStatus', retIssue.issueMrStatus);
                  this.$set(issue, 'isExtra', retIssue.isExtra);
                }
              });
              if (isExtra && retIssue.isExtra) { //原来没有并且字段isExtra为1
                //如果是多的附加需求需要单独加一行到tbody里
                let newList = {
                  isExtra: 1
                };
                Object.assign(newList, retIssue);
                this.issueList.push(retIssue);
              }
            });
            if (mr.status == 'merging') {
              this.flushTimer && clearTimeout(this.flushTimer);
              this.flushTimer = setTimeout(() => {
                this.flushIssueStatus(); 
              }, 5000);
            } else {
              this.duringAction = false;
            }
          } else {
            this.duringAction = false;
          }
        })
        .catch(error => {
          this.duringAction = false;
        });
    },
    clearList() {
      //清空
      this.showList = false;
      this.issueConfig = null;
    },
    revertIssue(item) {
      //revert需求
      //20201118_zqp_需求改成新建一个只有当前需求的mr，创建新的
      //20201120_zqp_在撤销跳转前调接口校验撤销有效性
      let mrParam = {
        mrId: this.id,
        issueNo: item.no
      };
      this.$api.codehub.merge.checkRevert(mrParam).then((res) => {
        if (res && res.Status == 'OK') {
          let param = {
            issueList: [item],
            srcBranch: res.Return.srcBranch,
            targetBranch: res.Return.targetBranch
          };
          this.$emit('revert', param);
        }
      });
    },
    toggleFolder(item) {},
    getCommitstatus() {
      this.$api.codehub.merge.getStatusList({ type: 'commit' }).then(res => {
        if (res && res.Status == 'OK') {
          this.commitstatusList = res.Return.list;
        }
      });
    }
  },

  filter: {},

  computed: {
    getsource() {
      return function(id) {
        let txt = '';
        this.syncSourceList.forEach(sync => {
          if (sync.id == id) {
            txt = sync.source;
          }
        });
        return txt;
      };
    },
    setStatus() {
      return function(type, val) {
        let text = '';
        this.statusList.length > 0 &&
          this.statusList.forEach(status => {
            if (status.value == val) {
              text = status[type];
            }
          });
        return text;
      };
    },
    isFolder() {
      return function(item) {
        let isRequired = false;
        if (item && item.versionStrategyVo && item.versionStrategyVo.type == 'issue') {
          isRequired = true;
        }
        return isRequired;
      };
    }
  },
  watch: {
    'mrData.issueList': {
      handler: function(val) {
        this.getList();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.btn-bottom {
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 0;
  height: 50px;
  text-align: right;
  padding: 9px 10px;
}
.bottom-text {
  margin-right: 8px;
  line-height: 32px;
}
.merge-open,
.merge-conflict,
.merge-failed {
  padding-bottom: 60px;
}
/deep/ .tr-1 {
  .folder-handle {
    position: relative;
    .folder-icon {
      display: none;
    }
    &:after {
      content: '附加需求';
      position: absolute;
      top: 0;
      left: 0;
      transform: scale(0.8);
      color: @default-error-color;
    }
  }
}
</style>
