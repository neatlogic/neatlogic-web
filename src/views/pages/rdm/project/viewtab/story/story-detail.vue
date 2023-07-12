<template>
  <Loading v-if="!isReady || isLoading" :loadingShow="true" type="fix"></Loading>
  <div v-else-if="isReady && issueData">
    <TsContain
      v-if="issueData.isProjectOwner || issueData.isProjectMember || issueData.isProjectLeader"
      :rightWidth="250"
      :enableCollapse="true"
      :isSiderHide="isSiderHide"
      @toggleSiderHide="toggleSiderHide"
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <IssueTitle :issueData="issueData"></IssueTitle>
      </template>
      <template v-slot:sider>
        <MyDoingIssueList
          v-if="projectId && appId && id"
          :projectId="projectId"
          :appId="appId"
          :issueId="id"
        ></MyDoingIssueList>
      </template>
      <template v-slot:right>
        <div class="pl-md">
          <AttrList
            v-if="appId"
            :projectId="projectId"
            :appId="appId"
            :issueData="issueData"
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
                  @cancel="contentMode = 'read'"
                ></ContentHandler>
              </div>
            </TabPane>
            <TabPane :label="render => renderTabLabel(render, id, $t('page.task'), 'task', 'extend', 'from')" name="task">
              <div v-if="currentTab == 'task'" class="pl-nm pr-nm">
                <IssueList
                  v-if="id && getApp('task')"
                  ref="taskList"
                  :projectId="projectId"
                  :canAppend="true"
                  :canSearch="false"
                  :canAction="true"
                  relType="extend"
                  relAppType="task"
                  :fromId="id"
                  :app="getApp('task')"
                  @refresh="init"
                ></IssueList>
              </div>
            </TabPane>
            <TabPane :label="render => renderTabLabel(render, id, $t('term.rdm.bug'), 'bug', 'extend', 'from')" name="bug">
              <div v-if="currentTab == 'bug'" class="pl-nm pr-nm">
                <IssueList
                  v-if="id && getApp('bug')"
                  ref="bugList"
                  :projectId="projectId"
                  :canAppend="true"
                  :canSearch="false"
                  :canAction="true"
                  relType="extend"
                  relAppType="bug"
                  :fromId="id"
                  :app="getApp('bug')"
                  @refresh="init"
                ></IssueList>
              </div>
            </TabPane>
            <TabPane :label="render => renderTabLabelForChild(render, issueData, $t('term.rdm.childrequest'))" name="childrequest">
              <div v-if="currentTab == 'childrequest'" class="pl-nm pr-nm">
                <IssueList
                  v-if="id && getApp('story')"
                  ref="requestList"
                  :projectId="projectId"
                  :canAppend="true"
                  :canSearch="false"
                  :canAction="true"
                  :parentId="id"
                  :app="getApp('story')"
                  @refresh="init"
                ></IssueList>
              </div>
            </TabPane>
            <TabPane :label="render => renderTabLabel(render, id, $t('term.rdm.testcase'), 'testcase', 'relative', 'from')" name="testcase">
              <div v-if="currentTab == 'testcase'" class="pl-nm pr-nm">
                <IssueList
                  v-if="id && getApp('testcase')"
                  ref="testcaseList"
                  :projectId="projectId"
                  :canAppend="true"
                  :canSearch="false"
                  :canAction="true"
                  relType="relative"
                  relAppType="testcase"
                  :fromId="id"
                  :app="getApp('testcase')"
                  @refresh="init"
                ></IssueList>
              </div>
            </TabPane>
            <TabPane v-if="getApp('gitlab')" :label="render => renderWebhookLabel(render, getApp('gitlab').id, $t('term.rdm.gitlabcommit'))" name="gitlab">
              <div v-if="currentTab == 'gitlab'" class="pl-nm pr-nm">
                <GitlabList :issueId="issueData.id" :appId="getApp('gitlab').id"></GitlabList>
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
            <TsFormItem v-bind="formItemConf" :label="$t('page.accessory')">
              <TsUpLoad
                styleType="text"
                dataType="issue"
                className="smallUpload"
                type="drag"
                :params="{ issueId: id }"
                :multiple="true"
                :isDeleteRemote="true"
                :defaultList="issueData.fileList"
              ></TsUpLoad>
            </TsFormItem>
            <TsFormItem v-if="issueData.commentCount" v-bind="formItemConf" :label="$t('page.comment')"><CommentList :issueData="issueData" :issueId="id"></CommentList></TsFormItem>
            <TsFormItem v-bind="formItemConf" :label="$t('term.rdm.nextstatus')"><StatusRequiredAttrList
              v-if="!$utils.isEmpty(issueData)"
              ref="requiredAttrList"
              :appId="appId"
              :issueData="issueData"
            ></StatusRequiredAttrList></TsFormItem>
            <TsFormItem v-bind="formItemConf" :label="$t('page.reply')"><TsCkeditor v-model="issueData.comment" :width="'100%'"></TsCkeditor></TsFormItem>
            <TsFormItem v-bind="formItemConf" label="">
              <Button :disabled="!isTransferReady" type="primary" @click="goToNext()">{{ $t('term.process.circulation') }}</Button>
            </TsFormItem>
          </div>
        </div>
      </div>
    </TsContain>
    <div v-else class="auth-container">
      <Alert type="error" style="width: 450px;">
        {{ $t('term.rdm.errortip') }}
        <span slot="desc">
          <div>{{ $t('term.rdm.noauthforissue') }}</div>
          <div class="mt-sm">
            <span>{{ $t('term.report.chartsetting.click') }}</span>
            <span class="ml-sm mr-sm"><Button disabled size="small" type="primary">{{ $t('term.rdm.apply') }}</Button></span>
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
    ContentHandler: resolve => require(['@/views/pages/rdm/project/content-handler/content-handler.vue'], resolve),
    IssueTitle: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-title.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    CommentList: resolve => require(['@/views/pages/rdm/project/viewtab/components/comment-list.vue'], resolve),
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    AttrList: resolve => require(['@/views/pages/rdm/project/viewtab/components/attr-list.vue'], resolve),
    StatusRequiredAttrList: resolve => require(['@/views/pages/rdm/project/viewtab/components/status-requiredattr-list.vue'], resolve),
    IssueAuditList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issueaudit-list.vue'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve),
    MyDoingIssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/my-doing-issue-list.vue'], resolve),
    GitlabList: resolve => require(['@/views/pages/rdm/project/viewtab/components/gitlab-list.vue'], resolve)
  },
  extends: IssueDetailBase,
  props: {},
  data() {
    return {
      formItemConf: { labelWidth: 80, labelPosition: 'left', labelStrong: true },
      isSiderHide: true,
      currentTab: 'main',
      issueData: {},
      issueDataSnapshot: {},
      catalogData: {},
      statusList: [],
      isTransferReady: true
    };
  },
  beforeCreate() {},
  created() {
    if (this.$localStore.get('isSiderHide') != null) {
      this.isSiderHide = this.$localStore.get('isSiderHide');
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
    toggleSiderHide(isHide) {
      this.isSiderHide = isHide;
      this.$localStore.set('isSiderHide', isHide);
    },
    goToNext() {
      const requiredAttrList = this.$refs['requiredAttrList'];
      if (!requiredAttrList || requiredAttrList.valid()) {
        this.saveIssue();
      }
    },
    saveIssue() {
      this.$api.rdm.issue.saveIssue(this.issueData).then(async res => {
        this.init();
      });
    },
    selectStatus(status) {
      this.$set(this.issueData, 'status', status.id);
      this.$set(this.issueData, 'statusName', status.name);
      this.$set(this.issueData, 'statusColor', status.color);
      this.$set(this.issueData, 'statusLabel', status.label);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.auth-container {
  height: calc(100vh - 50px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
