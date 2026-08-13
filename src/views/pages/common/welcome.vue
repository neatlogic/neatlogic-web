<template>
  <div class="module-home">
    <Loading v-if="loading" :loadingShow="true" type="fix"></Loading>
    <div v-else-if="loadError" class="module-home-state flex-center text-center">
      <NoData :text="loadError"></NoData>
      <Button type="primary" ghost @click="loadWorkbench">重新加载</Button>
    </div>
    <PortalWorkbench
      v-else-if="workbench"
      :widgetList="widgetList"
      class="module-workbench"
    >
      <template v-slot:widget="{ widget }">
        <WorkbenchWidgetHost
          :widget="widget"
          :widgetDefinitions="widgetDefinitions"
        ></WorkbenchWidgetHost>
      </template>
    </PortalWorkbench>
    <div v-else class="welcome">
      <div class="welcome-content">
        <p class="text-title description">{{ description }}</p>
        <Button class="setting-button" type="primary" @click="toUsersetting">{{ $t('page.homepagesettings') }}</Button>
      </div>
      <div class="welcome-img">
        <img :src="imgSrc" alt="img" />
      </div>
    </div>
  </div>
</template>

<script>
import PortalWorkbench from '@/views/components/portal/workbench.vue';
import WorkbenchWidgetHost from '@/views/components/portal/components/workbench-widget-host.vue';
import {
  createWorkbenchWidgetDefinitionMap,
  getWorkbenchWidgetDefinitions
} from '@/views/components/portal/workbench-provider-registry.js';
import { filterValidWorkbenchWidgetList } from '@/views/components/portal/utils/workbench-layout.js';

export default {
  name: 'Welcome',
  components: {
    PortalWorkbench,
    WorkbenchWidgetHost
  },
  data() {
    return {
      workbench: null,
      widgetDefinitions: [],
      loading: true,
      loadError: ''
    };
  },
  async created() {
    await this.$store.state.topMenu.gettingModuleList;
    this.widgetDefinitions = getWorkbenchWidgetDefinitions({
      scope: 'module',
      targetModuleGroup: MODULEID,
      moduleList: this.$store.state.topMenu.moduleList || []
    });
    this.loadWorkbench();
  },
  methods: {
    loadWorkbench() {
      this.loading = true;
      this.loadError = '';
      this.$api.common.getCurrentUserPortal(MODULEID).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '模块工作台加载失败');
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
        this.loadError = (error && (error.Message || error.message)) || '模块工作台加载失败';
      }).finally(() => {
        this.loading = false;
      });
    },
    toUsersetting() {
      if (MODULEID === 'framework') {
        this.$router.push({ name: 'user-setting', query: { paneName: 'convenience' } });
      } else {
        window.location.href = `${HOME}/framework.html#/user-setting?paneName=convenience`;
      }
    }
  },
  computed: {
    widgetList() {
      return this.workbench && this.workbench.config ? this.workbench.config.widgetList : [];
    },
    description() {
      let moduleList = [];
      try {
        moduleList = JSON.parse(localStorage.getItem('moduleList')) || [];
      } catch (error) {
        moduleList = [];
      }
      const currentModule = moduleList.find(module => module.moduleId === MODULEID);
      return (currentModule && currentModule.description) || `${this.$t('page.welcometo')}${MODULEID}`;
    },
    imgSrc() {
      try {
        return require(`@/resources/assets/images/modules/welcome/${MODULEID}.png`);
      } catch (error) {
        return require('@/resources/assets/images/modules/welcome/framework.png');
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.module-home,
.module-workbench {
  position: relative;
  height: 100%;
  min-height: 100%;
}
.module-home-state {
  height: 100%;
  min-height: 320px;
  flex-direction: column;
  gap: 12px;
}
.welcome {
  height: 100%;
  min-height: 520px;
  padding-top: 40vh;
  box-sizing: border-box;
  background: linear-gradient(47deg, #edf8ff 0%, #f5f6fa 100%);
  .welcome-img {
    width: 220px;
    float: left;
    margin-left: 2vw;
    transform: translateY(-40%);
    img {
      width: 100%;
    }
  }
  .welcome-content {
    float: left;
    margin-left: 20vw;
    transform: translateY(-50%);
    width: 420px;
    height: 302px;
    text-align: center;
    padding-top: 120px;
    padding-left: 50px;
    background: url('@/resources/assets/images/modules/welcome/content-bg.png') no-repeat;
    background-size: cover;
    box-sizing: border-box;
    .description {
      font-size: 14px;
      cursor: default;
    }
    .setting-button {
      margin-top: 20px;
    }
  }
}
.theme-dark {
  .welcome {
    background: none;
    .welcome-content {
      background: url('@/resources/assets/images/modules/welcome/content-bg_dark.png') no-repeat;
      background-size: cover;
    }
    .welcome-img img {
      opacity: 0.9;
    }
  }
}
</style>
