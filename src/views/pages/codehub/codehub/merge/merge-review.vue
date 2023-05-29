<template>
  <div>
    <TsContain 
      v-if="mrActionType =='standard'" 
      class="bg-block" 
      v-bind="layoutConfig"
    >
      <template slot="top">
        <div class="clearfix">
          <div 
            class="ts-angle-left d_f cursor-pointer" 
            @click="gotoPrev()"
          >{{ prevPath.name }}</div>
          <div v-if="mrData" class="d_f top-title">
            <h3 class="title">
              <span 
                class="overflow" 
                :style="setTitlewidth(mrData.status)"
                :title="mrData.description"
              >{{ mrData.description ||'代码评审' }}</span>
              <span 
                v-clipboard="urlPath" 
                v-clipboard:success="clipboardSuc" 
                class="ts-link text-href btn-copy" 
                title="复制当前URL"
              ></span>
              <Tag 
                :color="setStatus('color',mrData.status)" 
                class="ml-10 status-tag"
              >
                {{ setStatus('text',mrData.status) }}
              </Tag>
              
              <Tooltip 
                v-if="errorMessage && mrData.status == 'failed'" 
                theme="light" 
                max-width="400" 
                transfer
              >
                <div class="text-error cursor-pointer ts-info"></div>
                <div slot="content">
                  <div v-html="errorMessage"></div>
                </div>
              </Tooltip>
              <div 
                v-else-if="mrData.status == 'failed'" 
                class="ivu-tooltip"
              >
                <div class="ivu-tooltip-rel">
                  <div class="text-error cursor-pointer ts-info" @click="showError()">
                  </div>
                </div>
              </div>
            </h3>
            <div v-if="mrData" class="desc">
              <Tooltip v-if="showtips(mrData)" theme="light" max-width="300">
                <div>{{ setTxt(mrData, 'text') }}</div>
                <div slot="content">
                  <div>{{ setTxt(mrData, 'tips') }}</div>
                </div>
              </Tooltip>
              <span v-else>{{ setTxt(mrData, 'text') }}</span>
              <Tag class="mr-10 ml-20 status-tag" color="success">{{ mrData.versionVo.name }}</Tag>
              <span v-if="mrData && mrData.versionTypeStrategyRelationVo" class="text-tip ml-20">源分支:</span>
              <span v-if="mrData && mrData.versionTypeStrategyRelationVo" class="ml-10">{{ mrData.srcBranch }}</span>
              <span v-if="mrData && mrData.versionTypeStrategyRelationVo" class="text-tip ml-20">目标分支:</span>
              <span v-if="mrData && mrData.versionTypeStrategyRelationVo" class="ml-10">{{ mrData.targetBranch }}</span>
            </div>
          </div>
          <div class="d_f_r">
            <Button
              v-if="mrData"
              class="ml-10"
              type="error"
              size="small"
            ><div class="ts-refresh" title="强制刷新" @click="forceFlush"></div></Button></div>
        </div>
      </template>
      <div slot="right" class="review-right border-color">
        <div v-if="mrData">
          <Card :padding="0" :bordered="false">
            <div slot="title">
              <div class="ts-info text-tilte mr-10"></div>基本信息
            </div>
            <CellGroup>
              <Cell label="UUID">
                <div>{{ mrData.uuid }}              
                  <span 
                    v-clipboard="mrData.uuid" 
                    class="ts-link text-href btn-copy" 
                    title="复制当前UUID"
                  ></span></div>
              </Cell>
            </CellGroup>
          </Card>
          <Divider />
          <Card :padding="0" :bordered="false">
            <div slot="title">
              <div class="ts-user text-tilte mr-10"></div>人员
            </div>
            <CellGroup>
              <Cell :title="mrData.fcu" label="提交人" />
              <Cell v-if="mrData.handleUser" :title="mrData.handleUser||'暂无'" label="处理人" />
            </CellGroup>
          </Card>
        </div>
      </div>
      <div slot="left" class="review-container">
        <Loading v-if="isLoading" loadingShow></Loading>
        <div v-else-if="mrData" class="review-main padding-md">
          <Tabs v-model="activeTab" :animated="false" @on-click="selectedCommitUuid=null;selectFilepath=null">
            <TabPane 
              v-for="(tab,tindex) in tabList" 
              :key="tindex" 
              :label="tab.label" 
              :name="tab.name"
            >
              <keep-alive>
                <div 
                  :is="tab.name"
                  v-if="activeTab==tab.name"
                  :mrData="mrData" 
                  :uuid="uuid" 
                  :mrstatusList="statusList" 
                  :statusList="issuestatusList" 
                  :commitId="selectedCommitUuid"
                  :refreshItem="refreshItem"
                  :selectFilepath="selectFilepath"
                  @reload="getDetail"
                  @updateStatus="updateStatus"
                  @revert="revertIssue"
                  @getCommit="getCommit"
                  @clearCommit="selectedCommitUuid=null"
                  @clearItem="clearItem"
                  @selectFile="selectFile"
                ></div>
              </keep-alive>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </TsContain>
    <MergeRevert 
      v-else-if="mrActionType =='revert'" 
      :mrData="mrData"
      v-bind="revertConfig" 
      @resetRevert="resetRevert"
    ></MergeRevert>
  </div>
</template>
<script>
// 代码评审
import clipboard from '@/resources/directives/clipboard.js';
import tabs from './review/tab/index.js';
export default {
  name: '',
  components: {
    MergeRevert: resolve => require(['./merge-revert.vue'], resolve),
    ...tabs
  },
  directives: {
    clipboard
  },
  props: [''],
  data() {
    return {
      uuid: null, //mrid
      mrData: null, //接口返回的mr数据
      prevPath: {
        //上一步
        path: '/merge-overview',
        name: 'MR列表'
      },
      statusList: [], //需单独通过接口获取的状态下拉，用于mr状态中文回显
      issuestatusList: [], //需单独通过接口获取的需求状态下拉，用于需求状态中文回显，最外层获取减少调用次数
      duringAction: false, //是否是调用接口的操作标志，操作中的禁用改操作按钮防止重复点击
      errorMessage: null, //错误信息
      mrActionType: 'standard', //mr的操作类型（标准的是正常的处理，如果是revert则是从当前mr处理正文切换为mr创建的正文但是数据一致）
      revertConfig: {//需撤回的issue数据
        issueList: [],
        srcBranch: null,
        targetBranch: null      
      },
      urlPath: null, //当前页面完整路径
      layoutConfig: {//当前布局的设置
        canFolded: true,
        type: 'layout',
        right: '200px'
      },
      activeTab: 'issue',
      tabList: [{
        name: 'issue',
        label: '需求'
      }, {
        name: 'diff',
        label: '变更'
      }, {
        name: 'comment',
        label: '评论'
      }, {
        name: 'active',
        label: '活动'
      }],
      isLoading: false,
      switchValue: true,
      selectedCommitUuid: null, //从需求切换变更指定的哪个commit
      leftCommitId: null,
      rightCommitId: null,
      refreshItem: [], //新增的用于强制刷新数组
      selectFilepath: null//选中的文件路径（从评论切过来的）
    };
  },
  beforeCreate() {},
  created() {
    this.urlPath = window.location.href;
    this.getStatuslist();
    this.getissueStatuslist();
    if (sessionStorage.getItem('mergehandlerPrev')) {
      let prevsetting = JSON.parse(sessionStorage.getItem('mergehandlerPrev'));
      if (prevsetting.router != '/') {
        this.prevPath = prevsetting;
      }
    }
    if (this.$route.query.uuid) {
      this.uuid = this.$route.query.uuid;
      this.getDetail();
    }
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
    gotoPrev() {
      this.$router.push({
        path: this.prevPath.path
      });
    },
    getDetail(isRefreshStatus) {
      let _this = this;
      let param = { uuid: this.uuid };
      if (!isRefreshStatus) {
        _this.isLoading = true;
      }
      this.errorMessage = null;
      _this.$api.codehub.merge.getDetail(param).then(res => {
        _this.isLoading = false;
        if (res && res.Status == 'OK') {
          _this.mrData = res.Return;
        } else {
          _this.mrData = null;
        }
      }).catch((e) => {
        _this.isLoading = false;
        _this.mrData = null;
      });
    },
    getStatuslist() {
      this.$api.codehub.merge.getStatusList({ type: 'mr' }).then(res => {
        if (res && res.Status == 'OK') {
          this.statusList = res.Return.list;
        }
      });
    },
    getissueStatuslist() {
      this.$api.codehub.merge.getStatusList({ type: 'issue' }).then(res => {
        if (res && res.Status == 'OK') {
          this.issuestatusList = res.Return.list;
        }
      });
    },
    updateStatus(val) {
      this.$set(this.mrData, 'status', val);
      this.errorMessage = null;
    },
    showError() {
      //查看失败的mr的错误消息
      let param = {
        mrUuid: this.uuid 
      };
      this.$api.codehub.merge.getError(param).then((res) => {
        if (res.Status == 'OK' && res.Return) {
          this.errorMessage = res.Return.errorMessage || '暂无错误信息';
        } else {
          this.$Message.info('暂无错误信息');
        }
      });
    },
    resetRevert() {
      //从撤销需求那里返回
      this.mrActionType = 'standard';
      Object.assign(this.revertConfig, {
        issueList: [],
        srcBranch: null,
        targetBranch: null
      });
    },
    revertIssue(config) {
      Object.assign(this.revertConfig, {
        issueList: config.issueList,
        srcBranch: config.srcBranch,
        targetBranch: config.targetBranch
      });
      this.mrActionType = 'revert';
    },
    clipboardSuc() {
      this.$Message.success('复制当前URL成功');
    },
    getCommit(commitUuid) {
      //从需求切换到变更并选中指定的commit
      this.selectedCommitUuid = commitUuid;
      this.activeTab = 'diff';
    },
    forceFlush() {
      this.refreshItem = ['diff', 'issue'];
      this.selectFilepath = null;
    },
    clearItem(item) {
      if (this.refreshItem && this.refreshItem.length > 0 && this.refreshItem.includes(item)) {
        this.refreshItem.splice(this.refreshItem.indexOf(item), 1);
      }
    },
    selectFile(path) {
      this.activeTab = 'diff';
      this.selectFilepath = path;
    }
  },

  filter: {},

  computed: {
    showtips() {
      //如果系统、子系统的描述都没有，不显示提示tooltip
      return function(config) {
        let isshow = false;
        if ((config.systemVo && config.systemVo.description) || (config.subSystemVo && config.subSystemVo.description)) {
          isshow = true;
        }
        return isshow;
      };
    },
    setTxt() {
      //回显对应的系统、子系统的描述
      return function(config, type) {
        let text = '';
        let prev = config.systemVo || '';
        let next = config.subSystemVo || '';
        if (type == 'text') {
          text = (prev ? prev.name : '') + (next ? '/' + next.name : '');
        } else if (type == 'tips') {
          text = (prev && prev.description ? prev.description : '') + (next && next.description ? '/' + next.description : '');
        }
        return text;
      };
    },
    setStatus() {
      //状态的颜色
      return function(type, val) {
        let text = '';
        this.statusList.length > 0 &&
          this.statusList.forEach(status => {
            if (status.value == val) {
              text = status[type];
            }
          });
        if (text == 'info') {
          text = '#00c1de';
        }
        return text;
      };
    },
    setTitlewidth() {
      return function(status) {
        let styles = {
          'display': 'inline-block',
          'max-width': status == 'failed' ? 'calc(100vw - 320px)' : 'calc(100vw - 280px)'

        };
        return styles;
      };
    }
  },

  watch: {},
  beforeRouteEnter(to, from, next) {
    if (from.fullPath && from.fullPath != '/') {
      let prevsetting = {
        path: from.fullPath,
        name: from.meta.title
      };
      sessionStorage.setItem('mergehandlerPrev', JSON.stringify(prevsetting));
    }
    next();
  },
  beforeRouteLeave(to, from, next) {
    sessionStorage.removeItem('mergehandlerPrev');
    next();
  }
};
</script>
<style lang="less">
// @import '~@/resources/assets/css/codehub/commit.less';
</style>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.action-item {
  width: 24px;
}
.top-title {
  .title {
    line-height: 26px;
  }
  .desc {
    line-height: 20px;
  }
  padding-left: 20px;
  margin-left: 20px;
  border-left: 1px solid @default-border;
}
/deep/ .TsFormSelect .select-top {
  line-height: 24px;
  min-height: 24px;
}
.status-tag {
  transform: scale(0.9);
}
/deep/.tag-item{
  position: relative;
  .tag-new{
    position: absolute;
    line-height: 18px;
    right: -20px;
    top: -10px;
    color: @default-primary-color;
    transform: scale(0.9);
    border-radius: 3px;
    animation: fade 2s infinite;
  }
}
.btn-copy{
  width: 20px;
  text-align: center;
  &:before{
    margin-right: 0;
  }
}
.review-right{
  border-left: 1px solid;
  height: 100%;
  padding: 10px;
}
.review-main{
  /deep/.ivu-tabs{
    overflow: visible;
  }
}
</style>
