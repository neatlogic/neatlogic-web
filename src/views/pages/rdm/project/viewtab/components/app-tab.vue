<template>
  <div>
    <!--<ButtonGroup>
    <Button :type="currentTab === 'project' ? 'primary' : 'default'" @click="changeTab('project')">{{ $t('term.rdm.projectinfo') }}</Button>
    <Button
      v-for="item in appList"
      :key="item.id"
      :type="currentTab === 'app_' + item.id ? 'primary' : 'default'"
      @click="changeTab('app_' + item.id)"
    >{{ item.name }}</Button>
  </ButtonGroup>-->
    <!--<Tabs :animated="false" :value="currentTab" @on-click="changeTab">
      <TabPane :label="$t('term.rdm.projectinfo')" name="project" @click.native="changeTab('project')"></TabPane>
      <TabPane
        v-for="item in appList"
        :key="item.id"
        :label="item.name"
        :name="'app_' + item.id"
        @click.native="changeTab('app_' + item.id)"
      ></TabPane>
    </Tabs>-->
    <div class="action-group">
      <span class="action-item" :class="{ 'text-grey': currentTab !== 'project', 'text-primary': currentTab === 'project', 'tsfont-location': currentTab === 'project' }" @click="changeTab('project')">
        <strong>{{ $t('term.rdm.projectinfo') }}</strong>
      </span>
      <span
        v-for="item in appList"
        :key="item.id"
        class="action-item"
        :class="{ 'text-grey': currentTab !== 'app_' + item.id, 'text-primary': currentTab === 'app_' + item.id, 'tsfont-location': currentTab === 'app_' + item.id }"
        @click="changeTab('app_' + item.id)"
      >
        <strong>{{ item.name }}</strong>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    appId: { type: Number },
    projectId: { type: Number }
  },
  data() {
    return {
      appList: [],
      currentTab: this.appId ? 'app_' + this.appId : 'project'
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
    changeTab(tab) {
      if (tab != this.currentTab) {
        if (tab.startsWith('app_')) {
          const app = this.appList.find(d => d.id == tab.replace('app_', ''));
          if (app) {
            this.$router.push({ path: '/' + app.type + '/' + this.projectId + '/' + app.id });
          }
        } else {
          this.$router.push({ path: '/project/' + this.projectId });
        }
      }
    },
    getAppByProjectId() {
      if (this.projectId) {
        this.$api.rdm.project.getAppByProjectId(this.projectId, { isActive: 1 }).then(res => {
          this.appList = res.Return;
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
