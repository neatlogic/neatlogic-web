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
export default {
  name: 'TopNav',
  components: {
    TopnavUser,
    TopnavMessage,
    TopnavMenu: resolve => require(['./topnav-menu.vue'], resolve),
    TopnavHelp: resolve => require(['./topnav-help.vue'], resolve)
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
      let src = '';
      store.logo;//此句不能删，用于激活cache
      let logo = ThemeUtils.getValueByType('logo');
      //如果类型是数字代表是上传的图片
      if (typeof logo == 'number') {
        src = HOME + '/api/binary/image/download?id=' + logo;
      } else {
        src = require('@/resources/assets/images/' + logo);
      }
      return src;
    }
  }
};
</script>
