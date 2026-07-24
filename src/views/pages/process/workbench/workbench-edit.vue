<template>
  <PortalWorkbenchEdit
    v-model="workbench"
    :widgetDefinitions="WORKBENCH_WIDGETS"
    :availableWidgetList="availableWidgetList"
    :availableWidgetLoading="availableWidgetLoading"
    :availableWidgetError="availableWidgetError"
    :loading="loadingShow"
    :saving="saving"
    @retry-widget-list="loadAvailableWidgetList"
    @save="saveWorkbench"
  >
    <template v-slot:widget="{ widget }">
      <WidgetRenderer :widget="widget"></WidgetRenderer>
    </template>
    <template v-slot:widget-config="{ widget, definition, setConfig }">
      <WidgetConfig
        :widget="widget"
        :definition="definition"
        :setConfig="setConfig"
      ></WidgetConfig>
    </template>
  </PortalWorkbenchEdit>
</template>

<script>
import PortalWorkbenchEdit from '@/views/components/portal/workbench-edit.vue';
import WidgetRenderer from './widgets/widget-renderer.vue';
import WidgetConfig from './widgets/configs/widget-config.vue';
import { WORKBENCH_WIDGETS } from './widget-definition.js';
import { filterValidWorkbenchWidgetList } from '@/views/components/portal/utils/workbench-layout.js';

export default {
  name: 'ProcessWorkbenchEdit',
  components: {
    PortalWorkbenchEdit,
    WidgetRenderer,
    WidgetConfig
  },
  data() {
    return {
      id: this.$route.params.id,
      loadingShow: false,
      saving: false,
      availableWidgetList: [],
      availableWidgetLoading: true,
      availableWidgetError: '',
      WORKBENCH_WIDGETS,
      workbench: {
        name: '',
        isActive: 1,
        authorityList: ['common#alluser'],
        config: {
          widgetList: []
        }
      }
    };
  },
  created() {
    this.loadAvailableWidgetList();
    if (this.id) {
      this.getWorkbench();
    }
  },
  methods: {
    loadAvailableWidgetList() {
      this.availableWidgetLoading = true;
      this.availableWidgetError = '';
      this.availableWidgetList = [];
      this.$api.common.searchAvailableWorkbenchWidgetList({
        currentPage: 1,
        pageSize: 1000
      }).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '可用组件列表加载失败');
        }
        const result = res.Return || {};
        this.availableWidgetList = result.tbodyList || [];
      }).catch(error => {
        this.availableWidgetError = (error && (error.Message || error.message)) || '可用组件列表加载失败';
      }).finally(() => {
        this.availableWidgetLoading = false;
      });
    },
    getWorkbench() {
      this.loadingShow = true;
      this.$api.common.getWorkbenchDetail(this.id).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '工作台模板加载失败');
        }
        const data = res.Return;
        if (!data) {
          this.$Message.warning('工作台模板不存在');
          this.$router.push({ name: 'workbench-manage' });
          return;
        }
        const widgetList = filterValidWorkbenchWidgetList(data.config && data.config.widgetList, WORKBENCH_WIDGETS);
        this.workbench = {
          ...this.workbench,
          ...data,
          config: {
            ...(data.config || {}),
            widgetList
          }
        };
      }).catch(error => {
        this.$Message.error((error && error.message) || '工作台模板加载失败');
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    saveWorkbench(workbench) {
      const params = {
        id: workbench.id,
        name: workbench.name,
        isActive: workbench.isActive,
        authorityList: workbench.authorityList,
        config: {
          ...(workbench.config || {}),
          widgetList: (workbench.config && workbench.config.widgetList) || []
        }
      };
      this.saving = true;
      this.$api.common.saveWorkbench(params).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '工作台模板保存失败');
        }
        this.$Message.success(this.$t('message.savesuccess'));
        this.$router.push({ name: 'workbench-manage' });
      }).catch(error => {
        this.$Message.error((error && error.message) || '工作台模板保存失败');
      }).finally(() => {
        this.saving = false;
      });
    }
  }
};
</script>
