<template>
  <div>
    <TsContain 
      v-if="mrActionType =='standard'"
      siderPosition="right"
      :isSiderHide="!isSiderHide"
      :rightBtn="true"
      @rightSiderToggle="rightSiderToggle"
    >
      <template v-slot:navigation>
        <span class="ts-angle-left text-action" @click="$back('/merge-overview')">{{ $getFromPage($t('router.codehub.mergerequestlist')) }}</span>
      </template>
      <template v-slot:topLeft>
        <div v-if="mrData" style="display: flex;">
          <div class="title">
            <span 
              class="overflow header-descrition-text"
              :title="mrData.description"
            >{{ mrData.description || $t('term.codehub.codereview') }}</span>
            <span 
              v-clipboard="urlPath" 
              v-clipboard:success="clipboardSuc" 
              class="ts-link text-href btn-copy ml-sm" 
              :title="$t('term.codehub.copycurrenturl')"
            ></span>
            <Tag 
              :color="setStatus('color',mrData.status)" 
              class="ml-sm status-tag"
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
          </div>
          <div class="desc">
            <Tooltip theme="light" max-width="300">
              <div>{{ $utils.getAbbrNameAndName(mrData.appSystemVo) ? `${$utils.getAbbrNameAndName(mrData.appSystemVo)}/${$utils.getAbbrNameAndName(mrData.appModuleVo)}` : $utils.getAbbrNameAndName(mrData.appModuleVo) }}</div>
              <div slot="content">
                <div>{{ $utils.getAbbrNameAndName(mrData.appSystemVo) ? `${$utils.getAbbrNameAndName(mrData.appSystemVo)}/${$utils.getAbbrNameAndName(mrData.appModuleVo)}` : $utils.getAbbrNameAndName(mrData.appModuleVo) }}</div>
              </div>
            </Tooltip>
            <Tag v-if="mrData.versionVo && mrData.versionVo.version" class="mr-sm ml-sm status-tag" color="success">{{ mrData.versionVo.version }}</Tag>
            <span v-if="mrData && mrData.versionTypeStrategyRelationVo" class="text-tip ml-sm">{{ $t('page.sourcebranch') }}:</span>
            <span v-if="mrData && mrData.versionTypeStrategyRelationVo" class="ml-sm">{{ mrData.srcBranch }}</span>
            <span v-if="mrData && mrData.versionTypeStrategyRelationVo" class="text-tip ml-sm">{{ $t('page.targetbranch') }}:</span>
            <span v-if="mrData && mrData.versionTypeStrategyRelationVo" class="ml-sm">{{ mrData.targetBranch }}</span>
          </div>
        </div>
      </template>
      <template v-slot:topRight>
        <Button
          v-if="mrData"
          class="ml-sm"
          type="error"
          size="small"
        >
          <span class="tsfont-refresh" @click="forceFlush">{{ $t('page.forceflush') }}</span>
        </Button>
      </template>
      <template v-slot:content>
        <Loading v-if="isLoading" loadingShow></Loading>
        <div v-else-if="mrData" class="review-main mr-sm">
          <Tabs
            v-model="activeTab"
            :animated="false"
            class="block-tabs"
            @on-click="selectedCommitId=null;selectFilepath=null"
          >
            <TabPane 
              v-for="(tab,tindex) in tabList" 
              :key="tindex" 
              :label="tab.label" 
              :name="tab.name"
            >
              <keep-alive>
                <div 
                  :is="tab.name"
                  v-if="activeTab == tab.name"
                  :id="id" 
                  :mrData="mrData" 
                  :mrstatusList="statusList" 
                  :statusList="issuestatusList" 
                  :commitId="selectedCommitId"
                  :refreshItem="refreshItem"
                  :selectFilepath="selectFilepath"
                  @reload="getDetail"
                  @updateStatus="updateStatus"
                  @revert="revertIssue"
                  @toDiffDetail="toDiffDetail"
                  @clearCommit="selectedCommitId=null"
                  @clearItem="clearItem"
                  @selectFile="selectFile"
                ></div>
              </keep-alive>
            </TabPane>
          </Tabs>
        </div>
      </template>
      <template v-slot:right>
        <div v-if="mrData" class="bg-op radius-lg padding-sm">
          <div>{{ $t('page.basicinfo') }}</div>
          <ul>
            <li class="basic-info-box mb-sm">
              <div class="left-lable-box text-right text-grey">id</div>
              <div>
                <span 
                  v-clipboard="mrData.id" 
                  class="ts-link text-href btn-copy" 
                  :title="$t('term.codehub.copycurrentid')"
                ></span>
              </div>
            </li>
            <li class="basic-info-box mb-sm">
              <div class="left-lable-box text-right text-grey">
                {{ $t('page.presenter') }}
              </div>
              <div>
                <UserCard
                  v-if="mrData.fcu"
                  :uuid="mrData.fcu"
                  :hideAvatar="true"
                ></UserCard>
              </div>
            </li>
            <li class="basic-info-box mb-sm">
              <div class="left-lable-box text-right text-grey">
                {{ $t('term.process.dealwithuser') }}
              </div>
              <div>
                <UserCard
                  v-if="mrData.handleUser"
                  :uuid="mrData.handleUser"
                  :hideAvatar="true"
                ></UserCard>
              </div>
            </li>
          </ul>
        </div>
      </template>
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
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    MergeRevert: resolve => require(['./merge-revert.vue'], resolve),
    ...tabs
  },
  directives: {
    clipboard
  },
  props: {},
  data() {
    return {
      isSiderHide: true, // 是否展示右侧基本信息
      id: null, //mrid
      mrData: null, //接口返回的mr数据
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
      activeTab: 'issue',
      tabList: [{
        name: 'issue',
        label: this.$t('term.rdm.request')
      }, {
        name: 'diff',
        label: this.$t('page.change')
      }, {
        name: 'comment',
        label: this.$t('page.comment')
      }, {
        name: 'active',
        label: this.$t('page.activity')
      }],
      isLoading: false,
      switchValue: true,
      selectedCommitId: null, //从需求切换变更指定的哪个commit
      leftCommitId: null,
      rightCommitId: null,
      refreshItem: [], //新增的用于强制刷新数组
      selectFilepath: null//选中的文件路径（从评论切过来的）
    };
  },
  beforeCreate() {},
  created() {
    this.initData();
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
    initData() {
      this.urlPath = window.location.href;
      this.getStatuslist();
      this.getissueStatuslist();
      if (this.$route.query.id) {
        this.id = parseInt(this.$route.query.id);
        this.getDetail();
      }
      if (this.$localStore.get('isSiderHide') != null) {
        this.isSiderHide = this.$localStore.get('isSiderHide');
      } 
    },
    rightSiderToggle() {
      // 展开收起右边基本信息
      this.isSiderHide = !this.isSiderHide;
      this.$localStore.set('isSiderHide', this.isSiderHide);
    },
    getDetail(isRefreshStatus) {
      if (!isRefreshStatus) {
        this.isLoading = true;
      }
      this.errorMessage = null;
      this.$api.codehub.merge.getDetail({id: this.id}).then(res => {
        if (res && res.Status == 'OK') {
          this.mrData = res.Return || null;
        }
      }).finally(() => {
        this.isLoading = false;
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
        mrUuid: this.id 
      };
      this.$api.codehub.merge.getError(param).then((res) => {
        if (res.Status == 'OK' && res.Return) {
          this.errorMessage = res.Return.errorMessage || this.$t('term.codehub.thereiscurrentlynoerrormessage');
        } else {
          this.$Message.info(this.$t('term.codehub.thereiscurrentlynoerrormessage'));
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
      this.$Message.success(this.$t('message.copysuccess'));
    },
    toDiffDetail(commitId) {
      //从需求切换到变更并选中指定的commit
      this.selectedCommitId = commitId;
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
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.action-item {
  width: 24px;
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
.review-main{
  /deep/.ivu-tabs{
    overflow: visible;
  }
}
.basic-info-box {
  display: flex;
  .left-lable-box {
    width: 90px;
    margin-right: 10px;
  }
}
 .header-descrition-text {
    display: inline-block;
    max-width: 300px;
  }
</style>
