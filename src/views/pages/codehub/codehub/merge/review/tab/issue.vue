<template>
  <div>
    <template v-if="!isLoading">
      <div v-if="mrData.status == 'open' && !duringAction" style="height:48px;" class="text-right">
        <span v-if="mergetype == 'issue'" class="bottom-text mr-sm">遇到冲突需求</span>
        <RadioGroup v-if="mergetype == 'issue'" v-model="reslove">
          <Radio label="stop">终止</Radio>
          <Radio label="continus">继续</Radio>
        </RadioGroup>
        <Button
          type="primary"
          class="mr-sm ml-sm"
          :disabled="duringAction"
          size="small"
          @click="handlerMr()"
        >合并</Button>
        <Button
          type="error"
          :disabled="duringAction"
          size="small"
          @click="closeMr()"
        >关闭</Button>
      </div>
      <div v-if="(mrData.status == 'conflict' || mrData.status == 'failed') && !duringAction" style="height:48px;" class="text-right">
        <span v-if="mergetype == 'issue'" class="bottom-text mr-sm">遇到冲突需求</span>
        <RadioGroup v-if="mergetype == 'issue'" v-model="reslove">
          <Radio label="stop">终止</Radio>
          <Radio label="continus">继续</Radio>
        </RadioGroup>
        <Button
          type="primary"
          class="ml-sm"
          :disabled="duringAction"
          size="small"
          @click="handlerMr()"
        >重试</Button>
      </div>
      <div v-if="(mrData && mrData.versionTypeStrategyRelationVo && mrData.versionTypeStrategyRelationVo.versionStrategyType && mrData.versionTypeStrategyRelationVo.versionStrategyType=='branch' && mrData.status=='finish') && !duringAction" style="height:48px;" class="text-right">
        <Button
          type="error"
          class="ml-sm"
          :disabled="duringAction"
          size="small"
          @click="revertMr()"
        ><i class="ts-rotate-left"></i>撤销</Button>
      </div>
    </template>
    <div v-if="!isLoading" ref="maindiv" :class="'merge-' + mrData.status">
      <TsTable
        ref="showtable"
        :height="tableHeight"
        v-bind="tabledata"
        :tbodyList="issueList"
        hasFolder
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
          <div v-if="row.issueMrStatus == 'merged' && mrData.versionTypeStrategyRelationVo.versionStrategyType == 'issue' && mrData.versionTypeStrategyRelationVo.versionStrategyType == 'issue' && mrData.status == 'finish'" class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="ts-rotate-left" @click="revertIssue(row)">撤销</li>
            </ul>
          </div>
        </template>
        <template slot="folder" slot-scope="{ row }">
          <CommitDetail
            v-if="row.showFolder != undefined && row.commitList"
            :mrId="id"
            :commitList="row.commitList"
            :statusList="commitstatusList"
            @getCommit="getCommit"
          ></CommitDetail>
          <div v-else-if="!row.commitList" class="text-tip text-center">暂无数据</div>
        </template>
      </TsTable>
    </div>
    <Loading v-else loadingShow style="height:100px"></Loading>
  </div>
</template>
<script>
import mixins from './tabmixins.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    CommitDetail: resolve => require(['./issue/commit-table.vue'], resolve)
  },
  filters: {},
  mixins: [mixins],
  props: [''],
  data() {
    return {
      isLoading: false,
      syncSourceList: [],
      tabledata: {
        theadList: [
          {
            title: '需求编号',
            key: 'no'
          },
          {
            title: '描述',
            key: 'name'
          },
          {
            title: '合并状态',
            key: 'issueMrStatus'
          },
          {
            title: '负责人',
            key: 'handleUserId'
          },
          {
            title: '更新时间',
            key: 'issueUpdateTime'
          },
          {
            title: '来源',
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
      showList: false,
      commitstatusList: [],
      flushTimer: null, //定时刷新的定时器
      cancelAxios: null, //取消接口调用用
      reloadStatus: false,
      tableHeight: 300
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.mergetype = this.mrData.versionTypeStrategyRelationVo.versionStrategyType;
    this.getCommitstatus();
  },
  beforeUpdate() {},
  updated() {},
  async activated() {
    await this.getList();
    //如果初始化时mr状态是合并中的（页面无操作按钮无法更新状态），需要定时刷新页面更新状态,直接把是否需要继续改为是，其他与普通类型的一致
    if (this.mrData && this.mrData.status == 'merging') {
      this.reslove = 'continus';
      this.flushIssueStatus();
    } else if (this.issueList && this.issueList.length && this.reslove && this.reslove == 'continus') {
      let requireFlush = false;
      //新增除了外层合并中需要定时刷新，还有需求下面有合并中、待合并的都需要
      this.issueList.forEach(i => {
        if (i.issueMrStatus && i.issueMrStatus == 'merging') {
          requireFlush = true;
        }
      });
      if (requireFlush) {
        this.flushIssueStatus();
      }
    }
  },
  deactivated() {
    //取消正在搜索的请求
    let cancel = this.cancelAxios;
    cancel && cancel.cancel();
  },
  beforeDestroy() {
    //取消正在搜索的请求
    let cancel = this.cancelAxios;
    cancel && cancel.cancel();
  },
  destroyed() {},
  methods: {
    getList(forceFlush) {
      let param = {
        mrId: this.id
      };
      if (forceFlush) {
        Object.assign(param, {
          forceFlush: true
        });
      }
      let _this = this;
      if (!this.reloadStatus) {
        this.isLoading = true;
      }
      let cancel = this.cancelAxios;
      cancel && cancel.cancel();
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      return this.$api.codehub.merge.getIssuelistByMruuid(param, { cancelToken: _this.cancelAxios.token }).then(res => {
        this.isLoading = false;
        if (res.Status == 'OK') {
          this.issueList = res.Return.list || [];
        } else {
          this.issueList = [];
        }
        this.$nextTick(() => {
          if (this.$refs['maindiv']) {
            let totalheight = window.innerHeight || document.body.clientHeight;
            this.tableHeight = Math.max(totalheight - this.$refs.maindiv.getBoundingClientRect().top, 72);
          }
        });
      }).catch(e => {
        this.isLoading = false;
      });
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
      let _this = this;
      if (type == 'branch') {
        _this.duringAction = true;
        let param = { mrId: _this.id };
        this.$api.codehub.merge.mergebyBranch(param).then(res => {
          _this.duringAction = false;
          _this.reloadStatus = true;
          if (res && res.Status == 'OK') {
            _this.flushIssueStatus();
            _this.$emit('reload');
          }
        })
          .catch(error => {
            _this.duringAction = false;
            _this.reloadStatus = true;
          });
      } else {
        this.mergeIssue();
      }
    },
    revertMr() {
      let _this = this;
      if (this.mrData.versionTypeStrategyRelationVo && this.mrData.versionTypeStrategyRelationVo.versionStrategyType && this.mrData.versionTypeStrategyRelationVo.versionStrategyType == 'branch' && this.mrData.status == 'finish') {
        //分支类型且状态为已结束的才可以revert
        let param = { mrId: this.id };
        _this.$createDialog({
          title: '确认撤销MR',
          content: '是否确认撤销MR？',
          btnType: 'error',
          'on-ok': function(vnode) {
            _this.duringAction = true;
            _this.$api.codehub.merge.checkRevert(param).then((res) => {
              _this.duringAction = false;
              if (res && res.Status == 'OK') {
                let param = {
                  srcBranch: res.Return.srcBranch,
                  targetBranch: res.Return.targetBranch,
                  versionid: _this.mrData.versionUuid,
                  mrType: 'revert',
                  description: 'MR撤销'
                };
                _this.$router.push({ path: 'merge-create', query: param });
              }
            }).catch(error => {
              _this.duringAction = false;
            }).finally(e => {
              vnode.isShow = false;
            });
          }
        });
      }
    },
    closeMr() {
      let params = {
        id: this.id,
        status: 'closed'
      };
      this.$api.codehub.merge.updateStatus(params).then(res => {
        if (res && res.Status == 'OK') {
          this.$emit('reload');
        }
      });
    },
    mergeIssue() {
      let _this = this;
      _this.duringAction = true;
      let param = { mrId: _this.id, continueMergeOnException: _this.reslove != 'stop' };
      this.$api.codehub.merge
        .mergebyIssue(param)
        .then(res => {
          if (res && res.Status == 'OK') {
            _this.flushIssueStatus();
          } else {
            _this.duringAction = false;
          }
        })
        .catch(error => {
          _this.duringAction = false;
        });
    },
    flushIssueStatus() {
      let _this = this;
      let notFinish = false;
      _this.$api.codehub.merge
        .getDetail({ id: _this.id })
        .then(res => {
          if (res && res.Status == 'OK') {
            //所有的issue列表
            let mr = res.Return;
            //更新mr状态
            _this.$emit('updateStatus', mr.status);
            //更新mr的每一条issue状态
            mr.issueList.forEach(retIssue => {
              if (retIssue.issueMrStatus == 'merging') {
                notFinish = true;
              }
              let isExtra = true; //是否是附加需求
              //单独更新有的每个issue状态，替换全部更新，可以保留每个行的操作状态
              _this.issueList.forEach(issue => {
                if (retIssue.no == issue.no) {
                  isExtra = false;
                  _this.$set(issue, 'issueMrStatus', retIssue.issueMrStatus);
                  _this.$set(issue, 'isExtra', retIssue.isExtra);
                }
              });
              if (isExtra && retIssue.isExtra) {
                //原来没有并且字段isExtra为1
                //如果是多的附加需求需要单独加一行到tbody里
                let newList = {
                  isExtra: 1
                };
                Object.assign(newList, retIssue);
                _this.issueList.push(retIssue);
              }
            });
            if (mr.status == 'merging') {
              _this.flushTimer && clearTimeout(_this.flushTimer);
              _this.flushTimer = setTimeout(function() {
                _this.flushIssueStatus();
              }, 5000);
            } else {
              _this.duringAction = false;
            }
          } else {
            _this.duringAction = false;
          }
        })
        .catch(error => {
          _this.duringAction = false;
        });
    },
    revertIssue(item) {
      //revert需求
      let mrParam = {
        mrId: this.id,
        issueNo: item.no
      };
      this.$api.codehub.merge.checkRevert(mrParam).then(res => {
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
    },
    getCommit(id) {
      this.$emit('getCommit', uuid);
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
    },
    refreshItem: {
      handler: function(val) {
        if (val && val.length > 0 && val.includes('issue')) {
          this.getList(true);
        }
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
