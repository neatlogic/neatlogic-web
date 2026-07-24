<template>
  <div class="process-workbench">
    <TsContain :hasContentPadding="false" hideHeader>
      <div slot="content" class="workbench-content">
        <CommonWelcome
          v-if="!loadingShow && !loadError && !workbench"
          class="fallback-welcome"
        ></CommonWelcome>
        <PortalWorkbench
          v-else
          :widgetList="widgetList"
          :loading="loadingShow"
          :error="loadError"
          @retry="reloadWorkbench"
        >
          <template v-slot:widget="{ widget }">
            <WidgetRenderer :widget="widget"></WidgetRenderer>
          </template>
        </PortalWorkbench>
      </div>
    </TsContain>
  </div>
</template>

<script>
import PortalWorkbench from '@/views/components/portal/workbench.vue';
import WidgetRenderer from './widgets/widget-renderer.vue';
import { filterValidWorkbenchWidgetList } from '@/views/components/portal/utils/workbench-layout.js';
import { WORKBENCH_WIDGETS } from './widget-definition.js';

export default {
  name: 'ProcessWorkbench',
  components: {
    PortalWorkbench,
    WidgetRenderer,
    CommonWelcome: () => import('@/views/pages/common/welcome.vue')
  },
  data() {
    return {
      workbench: null,
      loadingShow: true,
      loadError: ''
    };
  },
  mounted() {
    this.reloadWorkbench();
  },
  methods: {
    reloadWorkbench() {
      this.loadingShow = true;
      this.loadError = '';
      this.$api.common.searchWorkbenchList({
        isActive: 1,
        currentPage: 1,
        pageSize: 1
      }).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '工作台加载失败');
        }
        const currentWorkbench = res.Return &&
          res.Return.tbodyList &&
          res.Return.tbodyList[0];
        return currentWorkbench
          ? this.$api.common.getWorkbenchDetail(currentWorkbench.id)
          : null;
      }).then(res => {
        let workbench = null;
        if (res) {
          if (res.Status !== 'OK') {
            throw new Error(res.Message || '工作台加载失败');
          }
          workbench = res.Return || null;
        }
        const widgetList = filterValidWorkbenchWidgetList(workbench && workbench.config && workbench.config.widgetList, WORKBENCH_WIDGETS);
        this.workbench = workbench &&
          widgetList.length > 0
          ? {
            ...workbench,
            config: {
              ...(workbench.config || {}),
              widgetList
            }
          }
          : null;
      }).catch(error => {
        this.workbench = null;
        this.loadError = (error && error.message) || '工作台加载失败';
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  computed: {
    widgetList() {
      return this.workbench && this.workbench.config ? this.workbench.config.widgetList : [];
    }
  }
};
</script>

<style lang="less" scoped>
.process-workbench,
.workbench-content,
.fallback-welcome {
  height: 100%;
}
</style>
