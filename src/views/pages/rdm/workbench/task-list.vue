<template>
  <div>
    <TsContain>
      <template v-slot:top>
        <Tabs v-if="projectList && projectList.length > 0" v-model="currentProject">
          <TabPane
            v-for="project in projectList"
            :key="project.id"
            :label="project.name + ' ' + project.issueCount"
            :name="'p' + project.id"
          ></TabPane>
        </Tabs>
      </template>
      <template v-slot:content>
        <div v-if="projectList && projectList.length > 0">
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
                  :isMine="isMine"
                  :isMyCreated="isMyCreated"
                  :isEnd="isEnd"
                  :isFavorite="isFavorite"
                  :projectId="currentProjectId"
                  :mode="displayMode"
                  :displayAttrList="displayAttrList"
                  :canSearch="true"
                  :canAction="true"
                  :isShowEmptyTable="true"
                ></IssueList>
              </div>
            </TabPane>
            <TabPane
              v-for="app in appList"
              :key="app.id"
              :label="app.name + ' ' + app.issueCount"
              :name="'app' + app.id"
            >
              <div class="bg-op padding-md">
                <IssueList
                  v-if="isReady && currentProjectId && currentApp[currentProject] === 'app' + app.id"
                  :isMine="isMine"
                  :isMyCreated="isMyCreated"
                  :isEnd="isEnd"
                  :isFavorite="isFavorite"
                  :app="app"
                  :projectId="currentProjectId"
                  :mode="displayMode"
                  :canSearch="true"
                  :canAction="true"
                  :isShowEmptyTable="true"
                ></IssueList>
              </div>
            </TabPane>
          </Tabs>
        </div>
        <div v-else><NoData></NoData></div>
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
  props: {
    type: { type: String }
  },
  data() {
    return {
      isReady: false,
      displayMode: 'list',
      needAttr: ['_name', '_createuser', '_createdate', '_status', 'priority', 'startdate', 'enddate'],
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
      this.$api.rdm.attr.getPrivateAttrList(1).then(res => {
        this.attrList = res.Return;
        this.isReady = true;
      });
    },
    getProjectList() {
      this.$api.rdm.project
        .getProjectIssueCount({
          isMine: this.isMine,
          isMyCreated: this.isMyCreated,
          isEnd: this.isEnd,
          isFavorite: this.isFavorite
        })
        .then(res => {
          this.projectList = res.Return;
          if (this.projectList && this.projectList.length > 0) {
            this.currentProject = 'p' + this.projectList[0].id;
            this.projectList.forEach(p => {
              this.$set(this.currentApp, 'p' + p.id, '#');
            });
          }
        });
    }
  },
  filter: {},
  computed: {
    isMyCreated() {
      if (this.type === 'mycreated') {
        return 1;
      }
      return null;
    },
    isMine() {
      if (this.type === 'doing' || this.type === 'done') {
        return 1;
      }
      return null;
    },
    isFavorite() {
      if (this.type === 'favorite') {
        return 1;
      }
      return null;
    },
    isEnd() {
      if (this.type === 'doing') {
        return 0;
      } else if (this.type === 'done') {
        return 1;
      }
      return null;
    },
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
          this.$api.rdm.project.getAppByProjectId(val, {
            isActive: 1,
            needSystemAttr: 1,
            needIssueCount: 1,
            isMine: this.isMine,
            isMyCreated: this.isMyCreated,
            isEnd: this.isEnd,
            isFavorite: this.isFavorite
          }).then(res => {
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
