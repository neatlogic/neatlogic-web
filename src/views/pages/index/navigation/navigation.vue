<template>
  <div class="global-home">
    <Loading v-if="loading" :loadingShow="true" type="fix"></Loading>
    <div v-else-if="loadError" class="global-home-state flex-center text-center">
      <NoData :text="loadError"></NoData>
      <Button type="primary" ghost @click="loadWorkbench">重新加载</Button>
    </div>
    <PortalWorkbench
      v-else-if="workbench"
      :widgetList="widgetList"
      class="global-workbench"
    >
      <template v-slot:widget="{ widget }">
        <WorkbenchWidgetHost
          :widget="widget"
          :widgetDefinitions="widgetDefinitions"
        ></WorkbenchWidgetHost>
      </template>
    </PortalWorkbench>
    <div v-else-if="moduleList.length" class="navigation">
      <h2 class="title text-default">What can we do</h2>
      <h3 class="subtitle text-title">{{ $t('message.whatdo') }}</h3>
      <div class="module-list">
        <a
          v-for="module in moduleList"
          :key="module.moduleId"
          :href="`${home}/${module.moduleId}.html`"
          class="module-link"
        >
          <Card
            class="module-item"
            :style="getModuleBackgroundStyle(module.moduleId)"
            :bordered="false"
          >
            <div class="module-name text-default">{{ module.moduleName }}</div>
            <div class="module-desc text-title">{{ module.description }}</div>
          </Card>
        </a>
      </div>
    </div>
  </div>
</template>
<script>
import imageThemeMixins from '@/resources/mixins/imageThemeMixins.js';
import PortalWorkbench from '@/views/components/portal/workbench.vue';
import WorkbenchWidgetHost from '@/views/components/portal/components/workbench-widget-host.vue';
import {
  createWorkbenchWidgetDefinitionMap,
  getWorkbenchWidgetDefinitions
} from '@/views/components/portal/workbench-provider-registry.js';
import { filterValidWorkbenchWidgetList } from '@/views/components/portal/utils/workbench-layout.js';

export default {
  name: 'Navigation',
  components: {
    PortalWorkbench,
    WorkbenchWidgetHost
  },
  mixins: [imageThemeMixins],
  data() {
    return {
      moduleList: [],
      home: HOME,
      workbench: null,
      loading: true,
      loadError: '',
      widgetDefinitions: []
    };
  },
  async created() {
    await this.$store.state.topMenu.gettingModuleList;
    if (this.defaultModuleId === 'index') {
      this.moduleList = this.$store.state.topMenu.moduleList;
      this.widgetDefinitions = getWorkbenchWidgetDefinitions({
        scope: 'global',
        moduleList: this.moduleList
      });
      this.loadWorkbench();
    } else {
      location.assign(HOME + '/' + this.defaultModuleId + '.html');
    }
  },
  methods: {
    loadWorkbench() {
      this.loading = true;
      this.loadError = '';
      this.$api.common.getCurrentUserPortal('index').then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '总工作台加载失败');
        }
        const workbench = res.Return || null;
        const widgetList = filterValidWorkbenchWidgetList(workbench && workbench.config && workbench.config.widgetList);
        const definitionMap = createWorkbenchWidgetDefinitionMap(this.widgetDefinitions);
        const hasAvailableWidget = widgetList.some(widget => definitionMap.has(widget.type));
        this.workbench = workbench && widgetList.length && hasAvailableWidget
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
        this.loadError = (error && (error.Message || error.message)) || '总工作台加载失败';
      }).finally(() => {
        this.loading = false;
      });
    }
  },
  computed: {
    defaultModuleId() {
      return this.$store.getters.defaultModule.moduleId;
    },
    widgetList() {
      return this.workbench && this.workbench.config ? this.workbench.config.widgetList : [];
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.global-home,
.global-workbench {
  position: relative;
  height: 100%;
  min-height: 100%;
}
.global-home-state {
  height: 100%;
  min-height: 320px;
  flex-direction: column;
  gap: 12px;
}
.navigation {
  min-height: 100%;
  .title {
    margin-top: 45px;
    height: 45px;
    line-height: 45px;
    text-align: center;
    font-size: 32px;
    font-weight: 500;
  }

  .subtitle {
    margin-top: 13px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    font-size: 16px;
    font-weight: 400;
  }

  .module-list {
    width: 1136px;
    margin: 45px auto 0;
    display: flex;
    justify-content: flex-start;
    align-content: flex-start;
    flex-wrap: wrap;

    .module-link {
      margin: 0 25px 45px;
    }
    .module-item {
      width: 234px;
      height: 230px;
      border-radius: 10px;
      text-align: center;
      cursor: pointer;
      position: relative;
      transition-property: none; //覆盖ivu-card组件自带的transition
      background-position: center 40px;
      background-repeat: no-repeat;
      background-size: 70%;
      .module-logo {
        position: absolute;
        top: 19px;
        left: 50%;
        transform: translateX(-50%);
        width: 170px;
        height: 73px;
        overflow: hidden;
      }

      .module-name {
        padding-top: 120px;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
      }

      .divider-line {
        width: 236px;
        height: 1px;
        margin: 10px auto 0;
      }

      .module-desc {
        margin: 16px 16px 0;
        font-size: 13px;
        height: 40px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }

      ::v-deep .ivu-card-body {
        padding: 0;
      }
    }
  }
}

</style>
