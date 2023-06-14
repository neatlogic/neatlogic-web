<template>
  <div>
    <TsContain
      :rightWidth="250"
      :enableCollapse="true"
      :isSiderHide="isSiderHide"
      @toggleSiderHide="toggleSiderHide"
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item"><AppIcon :appType="issueData.appType" :appColor="issueData.appColor"></AppIcon></span>
          <span class="action-item">
            <strong class="fz16">[{{ issueData.id }}]{{ issueData.name }}</strong>
          </span>
          <span class="action-item"><IssueStatus :issueData="issueData"></IssueStatus></span>
          <span class="action-item"><IssueFavorite :issueId="issueData.id"></IssueFavorite></span>
        </div>
      </template>
      <template v-slot:topRight></template>
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
            v-if="isReady && appId"
            :projectId="projectId"
            :appId="appId"
            :issueData="issueData"
          ></AttrList>
        </div>
      </template>
      <div slot="content" class="ci-content border-color">
        <div class="middle bg-block radius-lg">
          <Tabs v-model="currentTab">
            <TabPane :label="$t('page.detailinfo')" name="main">
              <div class="pl-nm pr-nm">
                <div v-html="issueData.content"></div>
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
            <TabPane :label="render => renderAuditTabLabel(render, issueData.auditCount)" name="audit">
              <div v-if="currentTab == 'audit'" class="pl-nm pr-nm">
                <IssueAuditList v-if="currentTab === 'audit' && id && appId" :issueId="id" :appId="appId"></IssueAuditList>
              </div>
            </TabPane>
          </Tabs>
          <div class="padding">
            <Divider />
            <div class="item-grid">
              <div>
                <strong class="text-grey">{{ $t('page.accessory') }}</strong>
              </div>
              <div><TsUpLoad
                styleType="text"
                dataType="issue"
                className="smallUpload"
                type="drag"
                :params="{ issueId: id }"
                :multiple="true"
                :isDeleteRemote="true"
                :defaultList="issueData.fileList"
              ></TsUpLoad></div>
            </div>
            <div v-if="issueData.commentCount" class="item-grid mt-md">
              <div>
                <strong class="text-grey">{{ $t('page.comment') }}</strong>
              </div>
              <div>
                <CommentList v-if="isReady" :issueData="issueData" :issueId="id"></CommentList>
              </div>
            </div>
            <div class="item-grid mt-md">
              <div>
                <strong class="text-grey">{{ $t('term.rdm.nextstatus') }}</strong>
              </div>
              <div>
                <StatusRequiredAttrList
                  v-if="isReady && !$utils.isEmpty(issueData)"
                  ref="requiredAttrList"
                  :appId="appId"
                  :issueData="issueData"
                ></StatusRequiredAttrList>
              </div>
            </div>
            <div class="item-grid mt-md">
              <div>
                <strong class="text-grey">{{ $t('page.reply') }}</strong>
              </div>
              <div>
                <TsCkeditor v-model="issueData.comment" :width="'100%'"></TsCkeditor>
              </div>
            </div>
            <div class="item-grid mt-md">
              <div></div>
              <div>
                <Button :disabled="!isTransferReady" type="primary" @click="goToNext()">{{ $t('term.process.circulation') }}</Button>
              </div>
            </div>
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
    AppIcon: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-icon.vue'], resolve),
    IssueStatus: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-status.vue'], resolve),
    IssueFavorite: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-favorite.vue'], resolve),
    CommentList: resolve => require(['@/views/pages/rdm/project/viewtab/components/comment-list.vue'], resolve),
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve),
    TsUpLoad: resolve => require(['@/resources/components/UpLoad/UpLoad.vue'], resolve),
    AttrList: resolve => require(['@/views/pages/rdm/project/viewtab/components/attr-list.vue'], resolve),
    StatusRequiredAttrList: resolve => require(['@/views/pages/rdm/project/viewtab/components/status-requiredattr-list.vue'], resolve),
    IssueAuditList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issueaudit-list.vue'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve),
    MyDoingIssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/my-doing-issue-list.vue'], resolve)
  },
  extends: IssueDetailBase,
  props: {},
  data() {
    return {
      isSiderHide: true,
      currentTab: 'main',
      issueData: {},
      issueDataSnapshot: {},
      catalogData: {},
      statusList: [],
      isReady: true,
      isLoading: true,
      isTransferReady: true,
      appList: []
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
  watch: {
    issueData: {
      handler: function(val) {
        //console.log(JSON.stringify(val, null, 2));
      },
      deep: true
    }
  }
};
</script>
