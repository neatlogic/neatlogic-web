<template>
  <div class="welcome">
    <div class="welcome-content">
      <p class="text-title description">{{ description }}</p>
      <Button class="setting-button" type="primary" @click="toUsersetting">{{ $t('page.homepagesettings') }}</Button>
    </div>
    <div class="welcome-img">
      <img :src="imgSrc" alt="img" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'Welcome',
  created() {
    // document.title = this.$store.getters['currentModule'].moduleName;
  },
  methods: {
    toUsersetting: function() {
      if (MODULEID == 'framework') {
        this.$router.push({ name: 'user-setting', query: { paneName: 'convenience' }});
      } else {
        window.location.href = HOME + '/framework.html#/user-setting' + '?paneName=convenience';
      }
    }
  },
  computed: {
    description() {
      const moduleList = JSON.parse(localStorage.getItem('moduleList'));
      const desc = moduleList && !this.$utils.isEmpty(moduleList) && moduleList.find(module => module.moduleId === MODULEID) && moduleList.find(module => module.moduleId === MODULEID).description;
      return desc || this.$t('page.welcometo') + MODULEID;
    },
    imgSrc() {
      try {
        return require(`@/resources/assets/images/modules/welcome/${MODULEID}.png`);
      } catch {
        return require(`@/resources/assets/images/modules/welcome/framework.png`);
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.welcome {
  padding-top: 40vh;
  background: linear-gradient(47deg, #EDF8FF 0%, #F5F6FA 100%);
  .welcome-img {
    width: 220px;
    float: left;
    margin-left:2vw;
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
    .welcome-content  {
      background: url('@/resources/assets/images/modules/welcome/content-bg_dark.png') no-repeat;
      background-size: cover;
    }
    .welcome-img {
      img {
        opacity: .9;
      }
    }
  }
}
</style>
