<template>
  <Loading
    v-if="!isReady"
    :loadingShow="true"
    type="fix"
  ></Loading>
  <div v-else>
    <TsContain :rightWidth="250">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <IssueTitle :issueData="issueData"></IssueTitle>
      </template>
      <template v-slot:topRight>
      </template>
      <template v-slot:right>
        <div class="pl-md">
          <AttrList
            v-if=" appId"
            :projectId="projectId"
            :appId="appId"
            :issueData="issueData"
          ></AttrList>
        </div>
      </template>
      <div slot="content" class="ci-content border-color">
        <div class="middle bg-block radius-lg">
          <Tabs v-model="currentTab" :animated="false">
            <TabPane :label="$t('page.detailinfo')" name="main">
              <div v-if="currentTab == 'main'" class="pl-nm pr-nm">
                <ContentHandler :issueData="issueData" :autoSave="false"></ContentHandler>
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
            <TabPane :label="render => renderAuditTabLabel(render, issueData.auditCount)" name="audit">
              <div v-if="currentTab == 'audit'" class="pl-nm pr-nm">
                <IssueAuditList v-if="currentTab === 'audit' && id && appId" :issueId="id" :appId="appId"></IssueAuditList>
              </div>
            </TabPane>
          </Tabs>
          <div class="padding">
            <Divider />
            <TsFormItem v-if="issueData.commentCount" v-bind="formItemConf" :label="$t('page.comment')">
              <CommentList :issueData="issueData" :issueId="id"></CommentList>
            </TsFormItem>
            
            <TsFormItem v-bind="formItemConf" :label="$t('page.status')">
              <StatusRequiredAttrList
                v-if=" !$utils.isEmpty(issueData)"
                ref="requiredAttrList"
                :appId="appId"
                :issueData="issueData"
              ></StatusRequiredAttrList>
            </TsFormItem>

            <TsFormItem
              v-bind="formItemConf"
              :label="$t('page.reply')"
            ><TsCkeditor v-model="issueData.comment" :width="'100%'"></TsCkeditor></TsFormItem>
            
            <TsFormItem
              v-bind="formItemConf"
              label=""
            >
              <Button :disabled="!isTransferReady" type="primary" @click="goToNext()">{{ $t('page.confirm') }}</Button>
            </TsFormItem>
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
import IssueDetailBase from '@/views/pages/rdm/project/viewtab/issue-detail-base.vue';
export default {
  name: '',
  components: {
    IssueTitle: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-title.vue'], resolve),
    //IssueContent: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-content.vue'], resolve),
    ContentHandler: resolve => require(['@/views/pages/rdm/project/content-handler/content-handler.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    CommentList: resolve => require(['@/views/pages/rdm/project/viewtab/components/comment-list.vue'], resolve),
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve),
    AttrList: resolve => require(['@/views/pages/rdm/project/viewtab/components/attr-list.vue'], resolve),
    StatusRequiredAttrList: resolve => require(['@/views/pages/rdm/project/viewtab/components/status-requiredattr-list.vue'], resolve),
    IssueAuditList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issueaudit-list.vue'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve)
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
      isReady: true,
      isTransferReady: true,
      appList: []
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
  watch: {
  }
};
</script>
