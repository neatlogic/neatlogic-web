<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topCenter>
        <AppTab></AppTab>
      </template>
      <template v-slot:content>
        <AppHandler
          v-if="(currentObject === 'project' || currentAppId) && projectId"
          :appName="currentObject.replace('app_', '')"
          :projectId="projectId"
          :appId="currentAppId"
        ></AppHandler>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppTab: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-tab.vue'], resolve),
    AppHandler: resolve => require(['@/views/pages/rdm/project/viewtab/app-handler.vue'], resolve)
  },
  props: {},
  data() {
    return {
      currentObject: 'project',
      projectId: null,
      currentAppId: null,
      isReady: false
    };
  },
  beforeCreate() {},
  created() {
    this.projectId = Math.floor(this.$route.params['projectId']);
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
    restoreHistory(historyData) {
      this.currentObject = historyData['currentTag'];
      this.currentAppId = historyData['currentAppId'];
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped></style>
