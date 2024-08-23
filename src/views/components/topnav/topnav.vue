<template>
  <div class="topnav">
    <div class="topnav-left-container">
      <a :href="`${home}/${defaultModuleId}.html`" class="homeLink" @click.prevent="toHomePage()">
        <!-- <h1 class="topnav-logo"></h1> -->
        <img
          class="topnav-newlogo"
          :src="setLogo"
        />
      </a>
      <TopnavMenu v-if="!isAtNaviPage" />
    </div>
    <div class="topnav-right-container">
      <TopnavHelp v-if="!isAtNaviPage" class="pr-nm"></TopnavHelp>
      <TopnavMessage class="pr-nm" />
      <TopnavUser />
    </div>
  </div>
</template>

<script>
import {store} from '@/views/pages/framework/theme/state.js';
import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
import TopnavUser from './topnav-user.vue';
import TopnavMessage from './topnav-message/topnav-message';
import logoConfig from '@/resources/import/logo-manager.js';
export default {
  name: 'TopNav',
  components: {
    TopnavUser,
    TopnavMessage,
    TopnavMenu: () => import('./topnav-menu.vue'),
    TopnavHelp: () => import('./topnav-help.vue')
  },
  data() {
    return {
      home: HOME
    };
  },
  methods: {
    toHomePage() {
      if (MODULEID === this.defaultModuleId) {
        this.$router.push('/');
      } else {
        let that = this.$root.$children[0] ? this.$root.$children[0].$refs.root : null;//获取router-view 的vue 对象
        this.$utils.gotoHref(HOME + '/' + this.defaultModuleId + '.html', that);
      }
    }
  },
  computed: {
    isAtNaviPage() {
      return MODULEID === 'index' && this.$route.fullPath == '/navigation';
    },
    defaultModuleId() {
      return this.$store.getters.defaultModule.moduleId;
    },
    setLogo() {
      // 首先尝试使用用户上传的logo，若无则自动切换至默认前端定制包的logo，最后若两者均不可用，则采用项目本地预设的logo
      let src = '';
      store.logo;//此句不能删，用于激活cache
      let logo = ThemeUtils.getValueByType('logo');
      let themeClass = localStorage.getItem('themeClass') || 'theme-default';
      let {logoWhiteIcon = '', logoDarkIcon = ''} = logoConfig || {};
      if (logo && typeof logo == 'number') { //如果类型是数字代表是上传的图片
        src = HOME + '/api/binary/image/download?id=' + logo;
      } else if (themeClass == 'theme-default') {
        src = logoWhiteIcon || require('@/resources/assets/images/logo_big_white.png');
      } else if (themeClass == 'theme-dark') {
        src = logoDarkIcon || require('@/resources/assets/images/logo_big_dark.png');
      }
      return src;
    }
  }
};
</script>
