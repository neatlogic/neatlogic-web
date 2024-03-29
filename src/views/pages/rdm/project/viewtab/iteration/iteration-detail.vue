<template>
  <div>
    <TsContain :rightWidth="300" :enableCollapse="true" :isSiderHide="true">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="clearfix">
          <div class="float-left">
            <AppIcon v-if="iterationData" :appType="iterationData.appType" :appColor="iterationData.appColor"></AppIcon>
          </div>
          <div class="float-left mr-md">
            <strong class="fz16">{{ iterationData.name }}</strong>
          </div>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <Button type="primary" @click="isEditIterationShow = true">
              {{ $t('page.edit') }}
            </Button>
          </div>
        </div>
      </template>
      <div slot="content">
        <div class="radius-md mt-md padding-md bg-op">
          <div class="clearfix fz16">
            <div class="float-left text-grey">
              <span class="tsfont-calendar mr-md"></span>
              <span>{{ iterationData.startDate | formatDate('yyyy-mm-dd') }}</span>
              <span class="ml-xs mr-xs">~</span>
              <span>{{ iterationData.endDate | formatDate('yyyy-mm-dd') }}</span>
            </div>
            <div class="float-left ml-lg">
              <TsFormSwitch
                :value="iterationData.isOpen"
                :trueValue="1"
                :falseValue="0"
                :showStatus="true"
                :trueText="$t('term.rdm.isopened')"
                :falseText="$t('term.rdm.isclosed')"
                @on-change="toggleIterationOpen"
              ></TsFormSwitch>
            </div>
            <div class="float-left ml-lg" style="width: 300px"><Progress
              v-if="iterationData.issueCount"
              status="active"
              :percent="parseFloat(((iterationData.doneIssueCount / iterationData.issueCount) * 100).toFixed(2))"
              :stroke-width="20"
            /></div>
          </div>
          <div v-if="iterationData.description" class="mt-lg text-grey" v-html="iterationData.description"></div>
          <Divider v-if="issueCountData && issueCountData.length > 0"></Divider>
          <div v-if="issueCountData && issueCountData.length > 0" class="grid">
            <div><IssueBar :data="issueCountData"></IssueBar></div>
            <div><IssueRing :data="issueCountData"></IssueRing></div>
          </div>
        </div>
        <Tabs v-if="issueAppList && issueAppList.length > 0" v-model="currentApp" :animated="false">
          <TabPane
            v-for="(app, index) in issueAppList"
            :key="index"
            :label="app.name"
            :name="app.type"
          >
            <div>
              <IssueList
                v-if="currentApp === app.type"
                :canAppend="true"
                :canSearch="true"
                :canAction="true"
                :app="app"
                :projectId="projectId"
                :mode="displayMode"
                :iteration="iterationData && iterationData.id"
                :isShowEmptyTable="true"
              ></IssueList>
            </div>
          </TabPane>
        </Tabs>
        <NoData v-else></NoData>
      </div>
    </TsContain>
    <EditIteration
      v-if="isEditIterationShow"
      :id="id"
      :app="getApp('iteration')"
      @close="closeEditIteration"
    ></EditIteration>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    IssueRing: resolve => require(['@/views/pages/rdm/project/viewtab/iteration/issue-ring.vue'], resolve),
    IssueBar: resolve => require(['@/views/pages/rdm/project/viewtab/iteration/issue-bar.vue'], resolve),
    AppIcon: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-icon.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve),
    EditIteration: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-iteration-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      id: null,
      appId: null,
      projectId: null,
      isEditIterationShow: false,
      iterationData: {},
      isReady: true,
      appList: [],
      displayMode: 'list',
      currentApp: null,
      issueCountData: null
    };
  },
  beforeCreate() {},
  created() {
    this.projectId = Math.floor(this.$route.params['projectId']);
    this.appId = Math.floor(this.$route.params['appId']);
    this.id = Math.floor(this.$route.params['id']);
    this.getIterationById();
    this.getAppByProjectId();
    this.getIterationIssueCount();
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
    closeEditIteration(needRefresh) {
      this.isEditIterationShow = false;
      if (needRefresh) {
        this.getIterationById();
      }
    },
    getIterationIssueCount() {
      if (this.id) {
        this.$api.rdm.iteration.getIterationIssueCount(this.id).then(res => {
          this.issueCountData = res.Return;
        });
      }
    },
    toggleIterationOpen(val) {
      this.$api.rdm.iteration.toggleIterationIsOpen({ id: this.iterationData.id, isOpen: val }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.updatesuccess'));
        }
      });
    },
    getIterationById() {
      if (this.id) {
        this.$api.rdm.iteration.getIterationById(this.id).then(res => {
          this.iterationData = res.Return;
          document.title = this.iterationData.name;
          this.$route.meta.title = this.iterationData.name;
        });
      }
    },
    getAppByProjectId() {
      this.$api.rdm.project.getAppByProjectId(this.projectId, { isActive: 1, needSystemAttr: 1 }).then(res => {
        this.appList = res.Return;
        const list = this.appList.filter(d => d.hasIssue);
        if (list.length > 0) {
          this.currentApp = list[0].type;
        }
      });
    }
  },
  filter: {},
  computed: {
    getApp() {
      return type => {
        return this.appList.find(d => d.type === type);
      };
    },
    issueAppList() {
      if (this.appList && this.appList.length > 0) {
        return this.appList.filter(d => d.hasIteration);
      }
      return [];
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 10px;
}
</style>
