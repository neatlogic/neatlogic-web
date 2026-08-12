<template>
  <PortalWorkbenchManage
    :moduleGroup="moduleGroup"
    :workbenchType="workbenchType"
    editRouteName="personal-workbench-edit"
    :editRouteQuery="{ moduleGroup }"
    :scopeList="scopeList"
    @scope-change="selectScope"
  ></PortalWorkbenchManage>
</template>

<script>
import PortalWorkbenchManage from '@/views/components/portal/workbench-manage.vue';
import { WORKBENCH_TYPE_PERSONAL } from '@/views/components/portal/workbench-constants.js';
import {
  getWorkbenchScopeList,
  normalizeWorkbenchModuleGroup
} from '@/views/components/portal/workbench-provider-registry.js';

export default {
  name: 'UserSettingWorkbenchManage',
  components: { PortalWorkbenchManage },
  data() {
    return {
      moduleList: [],
      moduleGroup: this.$route.query.moduleGroup || 'index',
      isScopeReady: false,
      workbenchType: WORKBENCH_TYPE_PERSONAL
    };
  },
  async created() {
    await this.$store.state.topMenu.gettingModuleList;
    this.moduleList = this.$store.state.topMenu.moduleList || [];
    this.isScopeReady = true;
    this.syncModuleGroupFromRoute();
  },
  methods: {
    syncModuleGroupFromRoute() {
      const routeModuleGroup = this.$route.query.moduleGroup || 'index';
      const moduleGroup = normalizeWorkbenchModuleGroup(routeModuleGroup, this.scopeList);
      if (moduleGroup !== this.moduleGroup) {
        this.moduleGroup = moduleGroup;
      }
      if (moduleGroup !== routeModuleGroup) {
        this.replaceScopeRoute(moduleGroup);
      }
    },
    replaceScopeRoute(moduleGroup) {
      const query = this.getScopeRouteQuery(moduleGroup);
      const currentModuleGroup = this.$route.query.moduleGroup || 'index';
      if (this.$route.query.paneName !== 'workbench' || currentModuleGroup !== moduleGroup) {
        this.$router.replace({
          name: 'user-setting',
          query
        });
      }
    },
    getScopeRouteQuery(moduleGroup) {
      const query = {
        ...this.$route.query,
        paneName: 'workbench'
      };
      if (moduleGroup === 'index') {
        delete query.moduleGroup;
      } else {
        query.moduleGroup = moduleGroup;
      }
      return query;
    },
    selectScope(moduleGroup) {
      if (moduleGroup === this.moduleGroup) {
        return;
      }
      this.moduleGroup = moduleGroup;
      this.$router.push({
        name: 'user-setting',
        query: this.getScopeRouteQuery(moduleGroup)
      });
    }
  },
  computed: {
    scopeList() {
      return getWorkbenchScopeList({
        moduleList: this.moduleList
      });
    }
  },
  watch: {
    '$route.query.moduleGroup'() {
      if (this.isScopeReady) {
        this.syncModuleGroupFromRoute();
      }
    }
  }
};
</script>
