<template>
  <ButtonGroup>
    <Button :type="currentTab === 'project' ? 'primary' : 'default'" @click="changeTab('project')">{{ $t('term.rdm.projectinfo') }}</Button>
    <Button
      v-for="item in appList"
      :key="item.id"
      :type="currentTab === 'app_' + item.id ? 'primary' : 'default'"
      @click="changeTab('app_' + item.id)"
    >{{ item.name }}</Button>
  </ButtonGroup>
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
        this.$api.rdm.project.getAppByProjectId(this.projectId).then(res => {
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
<style lang="less"></style>
