<template>
  <div class="module-home">
    <component
      :is="workbenchRuntime || 'div'"
      scope="module"
      :moduleGroup="moduleGroup"
      class="module-home-content"
    >
      <div class="welcome">
        <div class="welcome-content">
          <p class="text-title description">{{ description }}</p>
          <Button class="setting-button" type="primary" @click="toUsersetting">{{ $t('page.homepagesettings') }}</Button>
        </div>
        <div class="welcome-img">
          <img :src="imgSrc" alt="img" />
        </div>
      </div>
    </component>
  </div>
</template>

<script>
import ComponentManager from '@/resources/import/component-manager.js';

export default {
  name: 'Welcome',
  data() {
    return {
      moduleGroup: MODULEID
    };
  },
  methods: {
    toUsersetting() {
      if (MODULEID === 'framework') {
        this.$router.push({ name: 'user-setting', query: { paneName: 'convenience' } });
      } else {
        window.location.href = `${HOME}/framework.html#/user-setting?paneName=convenience`;
      }
    }
  },
  computed: {
    workbenchRuntime() {
      return ComponentManager.getComponent('workbenchRuntime') || null;
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
.module-home-content {
  position: relative;
  height: 100%;
  min-height: 100%;
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
