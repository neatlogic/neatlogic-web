<template>
  <div>
    <TsContain>
      <template v-slot:top>
        <Tabs v-if="projectList && projectList.length > 0" v-model="currentProject">
          <TabPane
            v-for="(project) in projectList"
            :key="project.id"
            :label="project.name"
            :name="'p' + project.id"
          ></TabPane>
        </Tabs>
      </template>
      <template v-slot:content>
        <div>
          <Tabs
            v-if="isReady && appList && appList.length > 0"
            v-model="currentApp[currentProject]"
            :animated="false"
            type="card"
          >
            <TabPane :label="'所有 ' + allIssueCount" name="#">
              <div class="bg-op padding-md">
                <IssueList
                  v-if="isReady && currentProjectId && currentApp[currentProject] === '#'"
                  :isMine="1"
                  :isEnd="0"
                  :projectId="currentProjectId"
                  :mode="displayMode"
                  :displayAttrList="displayAttrList"
                  :canSearch="true"
                  :isShowEmptyTable="true"
                ></IssueList>
              </div>
            </TabPane>
            <TabPane
              v-for="(app) in appList"
              :key="app.id"
              :label="app.name + ' ' + app.issueCount"
              :name="'app' + app.id"
            >
              <div class="bg-op padding-md">
                <IssueList
                  v-if="isReady && currentProjectId && currentApp[currentProject] === 'app' + app.id"
                  :isMine="1"
                  :isEnd="0"
                  :app="app"
                  :projectId="currentProjectId"
                  :mode="displayMode"
                  :canSearch="true"
                  :isShowEmptyTable="true"
                ></IssueList>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isReady: false,
      displayMode: 'level',
      needAttr: ['status', 'priority', 'startdate', 'enddate'],
      attrList: [],
      appList: [],
      projectList: [],
      currentProject: null,
      currentApp: {},
      allIssueCount: 0
    };
  },
  beforeCreate() {},
  created() {
    this.getProjectList();
    this.getPrivateAttrList();
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
    getPrivateAttrList() {
      this.$api.rdm.attr.getPrivateAttrList().then(res => {
        this.attrList = res.Return;
        this.isReady = true;
      });
    },
    getProjectList() {
      this.$api.rdm.project
        .searchProject({
          isMine: 1,
          isClose: 0
        })
        .then(res => {
          this.projectList = res.Return.tbodyList;
          if (this.projectList && this.projectList.length > 0) {
            this.currentProject = 'p' + this.projectList[0].id;
          }
          this.projectList.forEach(p => {
            this.$set(this.currentApp, 'p' + p.id, '#');
          });
        });
    }
  },
  filter: {},
  computed: {
    currentProjectId() {
      if (this.currentProject) {
        return parseInt(this.currentProject.replace('p', ''));
      }
      return null;
    },
    displayAttrList() {
      if (this.attrList && this.attrList.length > 0) {
        return this.attrList.filter(attr => this.needAttr.includes(attr.type));
      }
      return [];
    }
  },
  watch: {
    currentProjectId: {
      handler: function(val) {
        if (val) {
          this.isReady = false;
          this.$api.rdm.project.getAppByProjectId(val, 1, 1).then(res => {
            this.appList = res.Return;
            this.allIssueCount = 0;
            if (this.appList && this.appList.length > 0) {
              this.appList.forEach(app => {
                this.allIssueCount += app.issueCount;
              });
            }
          });
          this.$nextTick(() => {
            this.isReady = true;
          });
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
