<template>
  <Loading v-if="!isReady || isLoading" :loadingShow="true" type="fix"></Loading>
  <div v-else-if="isReady && issueData">
    <template v-if="hasProjectAuth">
      <TsContain :rightWidth="250">
        <template v-if="mode == 'page'" v-slot:navigation>
          <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
        </template>
        <template v-slot:topLeft>
          <IssueTitle :issueData="issueData" :badgeText="titleBadgeText"></IssueTitle>
        </template>
        <template v-slot:right>
          <div class="pl-md">
            <AttrList
              v-if="appId"
              :projectId="projectId"
              :appId="appId"
              :issueData="issueData"
              :saveHandler="isSourceTestcase ? saveIssueWithCopy : null"
              @save="
                val => {
                  issueData = val;
                }
              "
            ></AttrList>
          </div>
        </template>
        <div slot="content" class="ci-content border-color">
          <div class="middle bg-block radius-lg">
            <Tabs v-model="currentTab" :animated="false">
              <TabPane :label="render => renderEditContentTab(render, $t('page.detailinfo'))" name="main">
                <div v-if="currentTab == 'main'" class="pl-nm pr-nm">
                  <ContentHandler
                    :mode="contentMode"
                    :issueData="issueData"
                    :autoSave="false"
                    :saveHandler="isSourceTestcase ? saveIssueWithCopy : null"
                    :projectId="projectId"
                    :ckeditorParams="getCkeditorParams()"
                    @cancel="contentMode = 'read'"
                  ></ContentHandler>
                </div>
              </TabPane>
              <TabPane :label="render => renderTabLabel(render, id, $t('term.rdm.relativerequest'), 'story', 'relative', 'to')" name="childrequest">
                <div v-if="currentTab == 'childrequest'" class="pl-nm pr-nm">
                  <IssueList
                    v-if="id && getApp('story')"
                    ref="requestList"
                    :projectId="projectId"
                    :canAppend="true"
                    :canSearch="false"
                    :canAction="true"
                    :toId="id"
                    relType="relative"
                    relAppType="story"
                    :app="getApp('story')"
                    @refresh="init"
                  ></IssueList>
                </div>
              </TabPane>
              <TabPane v-if="isShowCopyTab" :label="renderCopyTabLabel" name="copy">
                <div v-if="currentTab == 'copy'" class="pl-nm pr-nm">
                  <div class="copy-toolbar">
                    <span class="text-grey">{{ $t('term.rdm.currentsynccopycount', { count: selectedCopyIdList.length }) }}</span>
                    <Button v-if="copyList.length > 0" size="small" @click="openCopySyncScopeSetting">{{ $t('term.rdm.modifysyncscope') }}</Button>
                  </div>
                  <IssueList
                    v-if="getApp('testcase')"
                    ref="copyList"
                    :projectId="projectId"
                    :app="getApp('testcase')"
                    :sourceIssueId="id"
                    :isCopy="1"
                    :canSearch="false"
                    :canAction="false"
                    :isShowEmptyTable="true"
                  ></IssueList>
                </div>
              </TabPane>
              <TabPane :label="render => renderCostTabLabel(render, issueData.costList && issueData.costList.length)" name="timecost">
                <div v-if="currentTab == 'timecost'" class="pl-nm pr-nm">
                  <TimeCostList :issueData="issueData"></TimeCostList>
                </div>
              </TabPane>
              <TabPane :label="render => renderAuditTabLabel(render, issueData.auditCount)" name="audit">
                <div v-if="currentTab == 'audit'" class="pl-nm pr-nm">
                  <IssueAuditList
                    v-if="currentTab === 'audit' && id && appId"
                    :issueId="id"
                    :appId="appId"
                    :projectId="projectId"
                  ></IssueAuditList>
                </div>
              </TabPane>
            </Tabs>
            <div class="padding">
              <Divider />
              <TsFormItem v-if="issueData.commentCount" v-bind="formItemConf" :label="$t('page.comment')">
                <CommentList :issueData="issueData" :issueId="id" :ckeditorParams="getCkeditorParams()"></CommentList>
              </TsFormItem>

              <TsFormItem v-bind="formItemConf" :label="$t('page.status')">
                <StatusRequiredAttrList
                  v-if="!$utils.isEmpty(issueData)"
                  ref="requiredAttrList"
                  :appId="appId"
                  :projectId="projectId"
                  :issueData="issueData"
                ></StatusRequiredAttrList>
              </TsFormItem>

              <TsFormItem v-bind="formItemConf" :label="$t('page.reply')">
                <TsCkeditor
                  v-model="issueData.comment"
                  :params="getCkeditorParams()"
                  :width="'100%'"
                ></TsCkeditor>
              </TsFormItem>

              <TsFormItem v-bind="formItemConf" label="">
                <Button :disabled="!isTransferReady" type="primary" @click="goToNext()">{{ $t('page.confirm') }}</Button>
              </TsFormItem>
            </div>
          </div>
        </div>
      </TsContain>
      <TestcaseCopySyncDialog
        v-if="isCopySyncDialogShow"
        :copyList="copyList"
        :selectedIdList="selectedCopyIdList"
        @confirm="confirmCopySyncScope"
        @close="closeCopySyncDialog"
      ></TestcaseCopySyncDialog>
    </template>
    <div v-else class="auth-container">
      <Alert type="error" style="width: 450px">
        {{ $t('term.rdm.errortip') }}
        <span slot="desc">
          <div>{{ $t('term.rdm.noauthforissue') }}</div>
          <div class="mt-sm">
            <span>{{ $t('term.report.chartsetting.click') }}</span>
            <span class="ml-sm mr-sm">
              <Button disabled size="small" type="primary">{{ $t('term.rdm.apply') }}</Button>
            </span>
            <span>{{ $t('term.rdm.joinproject') }}</span>
          </div>
        </span>
      </Alert>
    </div>
  </div>
  <div v-else-if="!isLoading"><NoData></NoData></div>
</template>
<script>
import IssueDetailBase from '@/views/pages/rdm/project/viewtab/issue-detail-base.vue';
export default {
  name: '',
  components: {
    IssueTitle: () => import('@/views/pages/rdm/project/viewtab/components/issue-title.vue'),
    //IssueContent:()=>import('@/views/pages/rdm/project/viewtab/components/issue-content.vue'),
    ContentHandler: () => import('@/views/pages/rdm/project/content-handler/content-handler.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    CommentList: () => import('@/views/pages/rdm/project/viewtab/components/comment-list.vue'),
    TsCkeditor: () => import('@/resources/plugins/TsCkeditor/TsCkeditor.vue'),
    AttrList: () => import('@/views/pages/rdm/project/viewtab/components/attr-list.vue'),
    StatusRequiredAttrList: () => import('@/views/pages/rdm/project/viewtab/components/status-requiredattr-list.vue'),
    IssueAuditList: () => import('@/views/pages/rdm/project/viewtab/components/issueaudit-list.vue'),
    IssueList: () => import('@/views/pages/rdm/project/viewtab/components/issue-list.vue'),
    TimeCostList: () => import('@/views/pages/rdm/project/viewtab/components/timecost-list.vue'),
    TestcaseCopySyncDialog: () => import('@/views/pages/rdm/project/viewtab/testcase/testcase-copy-sync-dialog.vue')
  },
  extends: IssueDetailBase,
  props: {},
  data() {
    return {
      formItemConf: { labelWidth: 80, labelPosition: 'left', labelStrong: true },
      currentTab: 'main',
      issueData: {},
      issueDataSnapshot: {},
      catalogData: {},
      statusList: [],
      isTransferReady: true,
      appList: [],
      copyList: [],
      selectedCopyIdList: [],
      isCopyScopeConfirmed: false,
      isCopySyncDialogShow: false,
      copySyncResolve: null
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
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async init() {
      await this.getIssueById();
      await this.getTestcaseCopyList();
    },
    async getTestcaseCopyList() {
      this.copyList = [];
      if (this.isSourceTestcase) {
        await this.$api.rdm.issue.searchIssueCopy(this.id).then(res => {
          this.copyList = res.Return || [];
        });
      }
      if (this.currentTab === 'copy' && this.copyList.length === 0) {
        this.currentTab = 'main';
      }
    },
    goToNext() {
      const requiredAttrList = this.$refs['requiredAttrList'];
      if (!requiredAttrList || requiredAttrList.valid()) {
        this.saveIssue();
      }
    },
    saveIssue() {
      this.$api.rdm.issue.saveIssue(this.getSubmitIssueData()).then(async res => {
        this.init();
      });
    },
    async saveIssueWithCopy(issueData) {
      const copyIssueIdList = await this.getCopySyncScope();
      if (copyIssueIdList === null) {
        return false;
      }
      const params = {
        ...issueData,
        copyIssueIdList: copyIssueIdList
      };
      return this.$api.rdm.issue.saveIssue(params).then(async res => {
        if (res.Status === 'OK') {
          await this.getTestcaseCopyList();
          if (this.$refs.copyList) {
            this.$refs.copyList.refresh();
          }
          return true;
        }
        return false;
      });
    },
    async getCopySyncScope() {
      if (!this.isSourceTestcase || this.copyList.length === 0) {
        return [];
      }
      if (this.isCopyScopeConfirmed) {
        return this.selectedCopyIdList;
      }
      return this.openCopySyncDialog();
    },
    openCopySyncDialog() {
      this.isCopySyncDialogShow = true;
      return new Promise(resolve => {
        this.copySyncResolve = resolve;
      });
    },
    async openCopySyncScopeSetting() {
      const selectedIdList = await this.openCopySyncDialog();
      if (selectedIdList !== null) {
        this.selectedCopyIdList = selectedIdList;
        this.isCopyScopeConfirmed = true;
      }
    },
    confirmCopySyncScope(selectedIdList) {
      this.selectedCopyIdList = selectedIdList || [];
      this.isCopyScopeConfirmed = true;
      if (this.copySyncResolve) {
        this.copySyncResolve(this.selectedCopyIdList);
        this.copySyncResolve = null;
      }
      this.isCopySyncDialogShow = false;
    },
    closeCopySyncDialog() {
      this.isCopySyncDialogShow = false;
      if (this.copySyncResolve) {
        this.copySyncResolve(null);
        this.copySyncResolve = null;
      }
    },
    renderCopyTabLabel(h) {
      const controllList = [h('span', this.$t('term.rdm.copy'))];
      if (this.copyList.length > 0) {
        controllList.push(h('span', { class: 'ml-xs text-grey' }, this.copyList.length));
      }
      return h('div', controllList);
    },
    selectStatus(status) {
      this.$set(this.issueData, 'status', status.id);
      this.$set(this.issueData, 'statusName', status.name);
      this.$set(this.issueData, 'statusColor', status.color);
      this.$set(this.issueData, 'statusLabel', status.label);
    }
  },
  filter: {},
  computed: {
    hasProjectAuth() {
      return this.issueData && (this.issueData.isProjectOwner || this.issueData.isProjectMember || this.issueData.isProjectLeader);
    },
    isSourceTestcase() {
      return this.issueData && this.issueData.appType === 'testcase' && !this.issueData.sourceIssueId;
    },
    isShowCopyTab() {
      return this.isSourceTestcase && this.copyList.length > 0;
    },
    titleBadgeText() {
      if (this.issueData && this.issueData.sourceIssueId) {
        return this.$t('term.rdm.copy');
      }
      if (this.copyList.length > 0) {
        return this.$t('term.rdm.copycount', { count: this.copyList.length });
      }
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.copy-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
</style>
