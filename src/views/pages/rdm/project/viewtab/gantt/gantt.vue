<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <AppTab v-if="appId && projectId" :appId="appId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:content>
        <Tabs
          v-if="isReady && appList && appList.length > 0"
          v-model="currentApp"
          :animated="false"
          type="card"
        >
          <TabPane :label="'所有 ' + allIssueCount" name="#">
            <div class="bg-op padding-md">
              <IssueList
                v-if="isReady && currentApp === '#'"
                :isMine="isMine"
                :isMyCreated="isMyCreated"
                :isEnd="isEnd"
                :isFavorite="isFavorite"
                :projectId="projectId"
                :mode="displayMode"
                :displayAttrList="displayAttrList"
                :canSearch="true"
                :canAction="true"
                :isShowGantt="true"
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
                v-if="isReady && currentApp === 'app' + app.id"
                :isMine="isMine"
                :isMyCreated="isMyCreated"
                :isEnd="isEnd"
                :isFavorite="isFavorite"
                :app="app"
                :projectId="projectId"
                :mode="displayMode"
                :canSearch="true"
                :canAction="true"
                :isShowGantt="true"
                :isShowEmptyTable="true"
              ></IssueList>
            </div>
          </TabPane>
        </Tabs>
        <div v-else><NoData></NoData></div>
      </template>
    </TsContain>
  </div>
</template>
<script>
import mixins from '@/views/pages/rdm/project/viewtab/issue-mixin.js';

export default {
  name: '',
  components: {
    AppTab: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-tab.vue'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve)
  },
  mixins: [mixins],
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
      currentApp: '#',
      allIssueCount: 0
    };
  },
  beforeCreate() {},
  created() {
    this.getAppList();
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
    getAppList() {
      this.isReady = false;
      this.$api.rdm.project.getAppByProjectId(this.projectId, {
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
    displayAttrList() {
      if (this.attrList && this.attrList.length > 0) {
        return this.attrList.filter(attr => this.needAttr.includes(attr.type));
      }
      return [];
    }
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
