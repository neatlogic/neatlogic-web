<template>
  <div class="topnav">
    <div class="topnav-left-container">
      <span class="homeLink" @click.prevent="toHomePage()">
        <img
          class="topnav-newlogo"
          :src="getNavigationLogo"
        />
      </span>
      <TopnavMenu v-if="!isAtNaviPage" />
    </div>
    <div v-if="!$store.state.isPwdRedirected" class="topnav-right-container">
      <component :is="AiChatNav" v-if="AiChatNav" class="pr-nm"></component>
      <TopnavExportManage class="pr-nm"></TopnavExportManage>
      <TopnavHelp v-if="!isAtNaviPage" class="pr-nm"></TopnavHelp>
      <TopnavMessage class="pr-nm" />
      <TopnavUser />
    </div>
  </div>
</template>

<script>
import ComponentManager from '@/resources/import/component-manager.js';
import TopnavUser from './topnav-user.vue';
import TopnavMessage from './topnav-message/topnav-message';
import NavigationLogoMixin from '@/views/components/topnav/navigation-logo-mixin.js';

export default {
  name: 'TopNav',
  components: {
    TopnavUser,
    TopnavMessage,
    TopnavMenu: () => import('./topnav-menu.vue'),
    TopnavHelp: () => import('./topnav-help.vue'),
    TopnavExportManage: () => import('./topnav-export-manage.vue')
  },
  mixins: [NavigationLogoMixin],
  data() {
    return {
      home: HOME,
      AiChatNav: null
    };
  },
  async created() {
    this.AiChatNav = ComponentManager.getVueTemplate('ai-chat-nav');
  },
  methods: {
    toHomePage() {
      if (sessionStorage.getItem('PWD_FORCE_REDIRECTED')) {
        return;
      }
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
      return MODULEID === 'index' && this.$route.meta.isNavHide;
    },
    defaultModuleId() {
      return this.$store.getters.defaultModule.moduleId;
    }
  }
};
</script>
