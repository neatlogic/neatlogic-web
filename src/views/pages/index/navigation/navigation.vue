<template>
  <div class="global-home">
    <Loading v-if="!isReady" :loadingShow="true" type="fix"></Loading>
    <component
      :is="workbenchRuntime || 'div'"
      v-else
      scope="global"
      moduleGroup="index"
      class="global-home-content"
    >
      <div v-if="moduleList.length" class="navigation">
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
    </component>
  </div>
</template>
<script>
import imageThemeMixins from '@/resources/mixins/imageThemeMixins.js';
import ComponentManager from '@/resources/import/component-manager.js';

export default {
  name: 'Navigation',
  mixins: [imageThemeMixins],
  data() {
    return {
      moduleList: [],
      home: HOME,
      isReady: false
    };
  },
  async created() {
    await this.$store.state.topMenu.gettingModuleList;
    if (this.defaultModuleId === 'index') {
      this.moduleList = this.$store.state.topMenu.moduleList;
      this.isReady = true;
    } else {
      location.assign(HOME + '/' + this.defaultModuleId + '.html');
    }
  },
  computed: {
    defaultModuleId() {
      return this.$store.getters.defaultModule.moduleId;
    },
    workbenchRuntime() {
      return ComponentManager.getComponent('workbenchRuntime') || null;
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.global-home,
.global-home-content {
  position: relative;
  height: 100%;
  min-height: 100%;
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
