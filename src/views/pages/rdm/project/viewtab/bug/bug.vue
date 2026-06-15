<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-slot:topLeft>
        <AppTab v-if="appId && projectId" :appId="appId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item">
            <Dropdown>
              <a href="javascript:void(0)" class="tsfont-blocks">
                {{ viewModeName }}
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="changeViewMode('table')">{{ $t('page.list') }}</DropdownItem>
                <DropdownItem @click.native="changeViewMode('storywall')">{{ $t('term.rdm.storywall') }}</DropdownItem>
                <DropdownItem @click.native="changeViewMode('gantt')">{{ $t('term.rdm.gantt') }}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>
          <span class="action-item tsfont-os" @click="editDisplayAttr()">
            {{ $t('term.rdm.attrsetting') }}
          </span>
          <span class="action-item" @click="addIssue()">
            <Button type="success">
              <span class="tsfont-plus">{{ $t('term.rdm.bug') }}</span>
            </Button>
          </span>
        </div>
      </template>
      <template v-slot:content>
        <BugOverview
          v-if="isReady && appData"
          ref="bugOverview"
          :projectId="projectId"
          :app="appData"
          @filter-change="changeOverviewFilter"
        ></BugOverview>
        <IssueList
          v-if="isReady && appData"
          ref="issueList"
          :projectId="projectId"
          :app="appData"
          :viewmode="viewMode"
          :canSearch="true"
          :canAction="true"
          :isShowEmptyTable="true"
          @refresh="refreshOverview"
        ></IssueList>
      </template>
    </TsContain>
    <EditIssue
      v-if="isEditIssueShow"
      :id="currentIssueId"
      :app="appData"
      @close="closeEditIssue"
    ></EditIssue>
    <AttrSettingDialog v-if="isAttrSettingShow" :appId="appId" @close="closeAttrSetting"></AttrSettingDialog>
  </div>
</template>
<script>
import mixins from '@/views/pages/rdm/project/viewtab/issue-mixin.js';

export default {
  name: '',
  components: {
    AppTab: () => import('@/views/pages/rdm/project/viewtab/components/app-tab.vue'),
    EditIssue: () => import('@/views/pages/rdm/project/viewtab/components/edit-issue-dialog.vue'),
    IssueList: () => import('@/views/pages/rdm/project/viewtab/components/issue-list.vue'),
    BugOverview: () => import('@/views/pages/rdm/project/viewtab/bug/bug-overview.vue'),
    AttrSettingDialog: () => import('@/views/pages/rdm/project/viewtab/components/attr-setting-dialog.vue')
  },
  mixins: [mixins],
  props: {

  },
  data() {
    return {
      pageName: this.$t('term.rdm.bugmanage'),
      currentIssueId: null,
      isEditIssueShow: false,
      isAttrSettingShow: false,
      isReady: true, //刷新issue-list组件
      isShowGantt: false
    };
  },
  beforeCreate() {},
  created() {
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
    editDisplayAttr() {
      this.isAttrSettingShow = true;
    },
    closeAttrSetting(needRefresh) {
      this.isAttrSettingShow = false;
      if (needRefresh) {
        this.reloadIssueList();
        this.refreshOverview();
      }
    },
    addIssue() {
      this.isEditIssueShow = true;
      this.currentIssueId = null;
    },
    closeEditIssue(needRefresh) {
      this.isEditIssueShow = false;
      if (needRefresh) {
        this.refreshIssueList();
        this.refreshOverview();
      }
    },
    editIssue(issue) {
      this.isEditIssueShow = true;
      this.currentIssueId = issue.id;
    },
    changeOverviewFilter(filterObj) {
      const issueList = this.$refs['issueList'];
      if (issueList && issueList.setOverviewFilter) {
        issueList.setOverviewFilter(filterObj);
      }
    },
    refreshOverview() {
      const bugOverview = this.$refs['bugOverview'];
      if (bugOverview && bugOverview.refresh) {
        bugOverview.refresh();
      }
    }
  },
  filter: {},
  computed: {
  },
  watch: {}
};
</script>
