<template>
  <PortalWorkbenchEdit
    v-model="workbench"
    :widgetDefinitions="widgetDefinitions"
    :availableWidgetList="availableWidgetList"
    :availableWidgetLoading="availableWidgetLoading"
    :availableWidgetError="availableWidgetError"
    :loading="loading"
    :saving="saving"
    :showTemplateActive="workbenchType === globalWorkbenchType"
    :showTemplateAuthority="workbenchType === globalWorkbenchType"
    @retry-widget-list="loadAvailableWidgetList"
    @save="saveWorkbench"
  >
    <template v-slot:navigation>
      <span class="tsfont-left text-action" @click="toManage">
        {{ $t(workbenchType === globalWorkbenchType ? 'term.workbench.workbenchmanagement' : 'page.personalsetting') }}
      </span>
    </template>
    <template v-slot:widget="{ widget }">
      <WorkbenchWidgetHost
        :widget="widget"
        :widgetDefinitions="widgetDefinitions"
        :lazy="false"
      ></WorkbenchWidgetHost>
    </template>
    <template v-slot:widget-config="{ widget, definition, setConfig }">
      <component
        :is="definition.configComponent"
        v-if="definition && definition.configComponent"
        :widget="widget"
        :definition="definition"
        :setConfig="setConfig"
      ></component>
      <WorkbenchWidgetConfig
        v-else
        :widget="widget"
        :definition="definition"
        :setConfig="setConfig"
      ></WorkbenchWidgetConfig>
    </template>
  </PortalWorkbenchEdit>
</template>

<script>
import PortalWorkbenchEdit from '@/views/components/portal/workbench-edit.vue';
import { WORKBENCH_TYPE_GLOBAL } from '@/views/components/portal/workbench-constants.js';
import WorkbenchWidgetConfig from '@/views/components/portal/components/workbench-widget-config.vue';
import WorkbenchWidgetHost from '@/views/components/portal/components/workbench-widget-host.vue';
import {
  createWorkbenchWidgetDefinitionMap,
  getWorkbenchProviderList,
  getWorkbenchWidgetDefinitions,
  mergeAuthorizedWorkbenchWidgetList,
  migrateWorkbenchWidget
} from '@/views/components/portal/workbench-provider-registry.js';
import { filterValidWorkbenchWidgetList } from '@/views/components/portal/utils/workbench-layout.js';

export default {
  name: 'WorkbenchTemplateEdit',
  components: {
    PortalWorkbenchEdit,
    WorkbenchWidgetConfig,
    WorkbenchWidgetHost
  },
  props: {
    workbenchType: {
      type: String,
      default: WORKBENCH_TYPE_GLOBAL
    },
    manageRouteName: {
      type: String,
      required: true
    },
    manageRouteQuery: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      id: this.$route.params.id,
      globalWorkbenchType: WORKBENCH_TYPE_GLOBAL,
      moduleGroup: this.$route.query.moduleGroup || 'index',
      workbench: {
        name: '',
        ...(this.workbenchType === WORKBENCH_TYPE_GLOBAL
          ? {
            isActive: 1,
            authorityList: ['common#alluser']
          }
          : {}),
        config: { widgetList: [] }
      },
      widgetDefinitions: [],
      availableWidgetList: [],
      availableWidgetLoading: true,
      availableWidgetError: '',
      loading: false,
      saving: false
    };
  },
  async created() {
    await this.$store.state.topMenu.gettingModuleList;
    const moduleList = this.$store.state.topMenu.moduleList || [];
    const isValidModuleGroup = this.moduleGroup === 'index' || getWorkbenchProviderList({
      scope: 'module',
      moduleList
    }).some(provider => provider.moduleGroup === this.moduleGroup);
    if (!isValidModuleGroup) {
      this.moduleGroup = 'index';
    }
    this.widgetDefinitions = getWorkbenchWidgetDefinitions({
      scope: this.moduleGroup === 'index' ? 'global' : 'module',
      targetModuleGroup: this.moduleGroup === 'index' ? '' : this.moduleGroup,
      moduleList
    });
    this.loadAvailableWidgetList();
    if (this.id) {
      this.loadWorkbench();
    }
  },
  methods: {
    loadAvailableWidgetList() {
      this.availableWidgetLoading = true;
      this.availableWidgetError = '';
      this.$api.common.searchAvailableWorkbenchWidgetList({
        currentPage: 1,
        pageSize: 1000,
        moduleGroup: this.moduleGroup,
        type: this.workbenchType
      }).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || this.$t('term.workbench.availablewidgetlistloadfailed'));
        }
        const apiList = (res.Return && res.Return.tbodyList) || [];
        this.availableWidgetList = mergeAuthorizedWorkbenchWidgetList(this.widgetDefinitions, apiList);
      }).catch(error => {
        this.availableWidgetList = [];
        const errorMessage = (error && (error.Message || error.message)) || this.$t('term.workbench.availablewidgetlistloadfailed');
        this.availableWidgetError = errorMessage;
      }).finally(() => {
        this.availableWidgetLoading = false;
      });
    },
    loadWorkbench() {
      this.loading = true;
      this.$api.common.getWorkbenchDetail(this.id, this.moduleGroup, this.workbenchType).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || this.$t('term.workbench.workbenchloadfailed'));
        }
        if (!res.Return) {
          this.$Message.warning(this.$t('term.workbench.workbenchnotfound'));
          this.toManage();
          return;
        }
        const definitionMap = createWorkbenchWidgetDefinitionMap(this.widgetDefinitions);
        const widgetList = filterValidWorkbenchWidgetList(res.Return.config && res.Return.config.widgetList)
          .map(widget => {
            const definition = definitionMap.get(widget.type);
            return definition
              ? migrateWorkbenchWidget({ ...widget, type: definition.name }, definition)
              : widget;
          });
        this.workbench = {
          ...this.workbench,
          ...res.Return,
          config: {
            ...(res.Return.config || {}),
            widgetList
          }
        };
      }).catch(error => {
        this.$Message.error((error && (error.Message || error.message)) || this.$t('term.workbench.workbenchloadfailed'));
      }).finally(() => {
        this.loading = false;
      });
    },
    saveWorkbench(workbench) {
      this.saving = true;
      const data = {
        id: workbench.id,
        name: workbench.name,
        moduleGroup: this.moduleGroup,
        type: this.workbenchType,
        config: {
          ...(workbench.config || {}),
          widgetList: (workbench.config && workbench.config.widgetList) || []
        }
      };
      if (this.workbenchType === WORKBENCH_TYPE_GLOBAL) {
        data.isActive = workbench.isActive;
        data.authorityList = workbench.authorityList;
      }
      this.$api.common.saveWorkbench(data).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || this.$t('term.workbench.workbenchsavefailed'));
        }
        this.$Message.success(this.$t('message.savesuccess'));
        this.toManage();
      }).catch(error => {
        this.$Message.error((error && (error.Message || error.message)) || this.$t('term.workbench.workbenchsavefailed'));
      }).finally(() => {
        this.saving = false;
      });
    },
    toManage() {
      this.$router.push({
        name: this.manageRouteName,
        query: {
          ...this.manageRouteQuery,
          ...(this.moduleGroup === 'index' ? {} : { moduleGroup: this.moduleGroup })
        }
      });
    }
  }
};
</script>
