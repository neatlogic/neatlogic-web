<template>
  <div>
    <TsContain>
      <template v-slot:top>
        <Tabs v-if="projectList && projectList.length > 0" v-model="currentProject">
          <TabPane
            v-for="(project,index) in projectList"
            :key="index"
            :label="project.name"
            :name="'p'+project.id"
          ></TabPane>
        </Tabs>
      </template>
      <template v-slot:content>
        <div>
          <IssueList
            v-if="isReady && currentProjectId"
            ref="issueList"
            :isMine="1"
            :isEnd="0"
            :projectId="currentProjectId"
            :isExpired="0"
            :mode="displayMode"
            :displayAttrList="displayAttrList"
            :canSearch="true"
            :isShowEmptyTable="true"
          ></IssueList>
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
      needAttr: ['priority', 'startdate', 'enddate'],
      attrList: [],
      projectList: [],
      currentProject: null
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
    currentProject: {
      handler: function(val) {
        if (val) {
          this.isReady = false;
          this.$nextTick(() => {
            this.isReady = true;
          });
        }
      }
    }
  }
};
</script>
<style lang="less"></style>
