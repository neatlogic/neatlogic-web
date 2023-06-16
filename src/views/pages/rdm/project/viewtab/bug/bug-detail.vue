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
        <IssueTitle :issueData="issueData"></IssueTitle>
      </template>
      <template v-slot:topRight>
        <div class="action-group" style="text-align: right">
          <div class="action-item">
            <Dropdown :transfer="true" placement="bottom-end">
              <Button type="primary" ghost>
                <span>{{ $t('page.more') }}</span>
                <span class="tsfont-drop-down"></span>
              </Button>
              <DropdownMenu slot="list"></DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </template>
      <template v-slot:sider><MyDoingIssueList
        v-if="projectId && appId && id"
        :projectId="projectId"
        :appId="appId"
        :issueId="id"
      ></MyDoingIssueList></template>
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
            <TabPane :label="render => renderTabLabel(render, id, $t('term.rdm.relativerequest'), 'story', 'extend', 'to')" name="story">
              <div v-if="currentTab == 'story'" class="pl-nm pr-nm">
                <IssueList
                  v-if="id && getApp('story')"
                  :canAppend="false"
                  :canSearch="false"
                  :canAction="true"
                  :projectId="projectId"
                  relType="extend"
                  relAppType="story"
                  :toId="id"
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

            <TsFormItem v-if="issueData.commentCount" v-bind="formItemConf" :label="$t('page.comment')">
              <CommentList v-if="isReady" :issueData="issueData" :issueId="id"></CommentList>
            </TsFormItem>

            <TsFormItem v-bind="formItemConf" :label="$t('term.rdm.nextstatus')">
              <StatusRequiredAttrList
                v-if="isReady && !$utils.isEmpty(issueData)"
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
              <Button :disabled="!isTransferReady" type="primary" @click="goToNext()">{{ $t('term.process.circulation') }}</Button>
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
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
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
      formItemConf: { labelWidth: 80, labelPosition: 'left', labelStrong: true },
      isSiderHide: true,
      currentTab: 'main',
      isEditIssueShow: false,
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
  }
};
</script>
<style lang="less" scoped></style>
