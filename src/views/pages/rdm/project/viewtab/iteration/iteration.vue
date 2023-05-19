<template>
  <div>
    <TsContain :enableCollapse="false" :siderWidth="280">
      <template v-slot:topLeft>
        <AppTab v-if="appId && projectId" :appId="appId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item" @click="displayMode = displayMode === 'level' ? 'list' : 'level'">
            <span class="tsfont-flow-children" :class="{ 'text-primary': displayMode === 'list', 'text-grey': displayMode === 'level' }">列表视图</span>
            <Divider type="vertical" />
            <span class="tsfont-formdynamiclist" :class="{ 'text-primary': displayMode === 'level', 'text-grey': displayMode === 'list' }">层级视图</span>
          </span>
          <span class="action-item tsfont-plus" @click="addIteration()">{{ $t('term.rdm.iteration') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <div ref="iterationList">
          <IterationList v-if="isIterationReady" :projectId="projectId" @change="selectIteration"></IterationList>
        </div>
      </template>
      <template v-slot:content>
        <div class="pl-md pb-md">
          <Tabs v-if="issueAppList && issueAppList.length > 0" v-model="currentApp">
            <TabPane
              v-for="(app, index) in issueAppList"
              :key="index"
              :label="app.name"
              :name="app.type"
            >
              <div>
                <IssueList
                  v-if="currentApp === app.type"
                  :app="app"
                  :mode="displayMode"
                  :iteration="selectedIterationId"
                  :isShowEmptyTable="true"
                ></IssueList>
              </div>
            </TabPane>
          </Tabs>
          <NoData v-else></NoData>
        </div>
      </template>
    </TsContain>
    <EditIteration
      v-if="isEditIterationShow"
      :id="currentIterationId"
      :app="appData"
      @close="closeEditIteration"
    ></EditIteration>
  </div>
</template>
<script>
import mixins from '@/views/pages/rdm/project/viewtab/issue-mixin.js';
export default {
  name: '',
  components: {
    AppTab: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-tab.vue'], resolve),
    EditIteration: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-iteration-dialog.vue'], resolve),
    IterationList: resolve => require(['@/views/pages/rdm/project/viewtab/components/iteration-list.vue'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve)
  },
  mixins: [mixins],
  props: {},
  data() {
    return {
      isIterationReady: true,
      scrollHeight: 500,
      pageName: this.$t('term.rdm.iterationmanage'),
      currentIterationId: null,
      selectedIterationId: null,
      isEditIterationShow: false,
      searchParam: {},
      iterationData: {},
      displayMode: 'level',
      appList: [],
      currentApp: null,
      iterationHeight: 500
    };
  },
  beforeCreate() {},
  created() {
    this.getAppByProjectId();
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
    initHeight() {
      this.iterationHeight = window.innerHeight - this.$refs['iterationList'].getBoundingClientRect().top - 16;
    },
    getAppByProjectId() {
      this.$api.rdm.project.getAppByProjectId(this.projectId).then(res => {
        this.appList = res.Return;
        const list = this.appList.filter(d => d.hasIssue);
        if (list.length > 0) {
          this.currentApp = list[0].type;
        }
      });
    },
    getIterationApp(iterationId) {
      this.$api.rdm.iteration.getIterationApp(iterationId).then(res => {
        this.appList = res.Return;
      });
    },
    selectIteration(iteration) {
      if (iteration) {
        this.selectedIterationId = iteration.id;
      } else {
        this.selectedIterationId = null;
      }
    },
    addIteration() {
      this.isEditIterationShow = true;
      this.currentIterationId = null;
    },
    closeEditIteration(needRefresh) {
      this.isEditIterationShow = false;
      if (needRefresh) {
        this.refreshIterationList();
      }
    },
    changeCatalog(catalog) {
      if (catalog) {
        this.currentCatalog = catalog.id;
      } else {
        this.currentCatalog = null;
      }
    },
    editIssue(issue) {
      this.isEditIterationShow = true;
      this.currentIssueId = issue.id;
    },
    refreshIterationList() {
      this.isIterationReady = false;
      this.$nextTick(() => {
        this.isIterationReady = true;
      });
    }
  },
  filter: {},
  computed: {
    issueAppList() {
      if (this.appList && this.appList.length > 0) {
        return this.appList.filter(d => d.hasIssue);
      }
      return [];
    }
  },
  watch: {}
};
</script>
