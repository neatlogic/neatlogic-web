<template>
  <div class="topnav">
    <div class="topnav-left-container">
      <a :href="`${home}/${defaultModuleId}.html`" class="homeLink" @click.prevent="toHomePage()">
        <img
          class="topnav-newlogo"
          :src="setLogo"
        />
      </a>
      <span class="text-href h3 pl-lg" @click="toDocumentonlinePage()">{{ $t('term.documentonline.helpcenter') }}</span>
      <span v-if="$AuthUtils.hasRole('DOCUMENTONLINE_CONFIG_MODIFY')" class="pl-nm tsfont-setting cursor-pointer" @click="toManagePage()">关系维护</span>
    </div>
    <div class="topnav-right-container">
      <div v-if="!isDocumentonline" class="pr-lg">
        <InputSearcher
          v-model="keyword"
          :placeholder="$t('term.documentonline.searchhelp')"
          @change="searchDocument"
        ></InputSearcher>
      </div>
      <TopnavUser />
    </div>
  </div>
</template>
<script>
import {store} from '@/views/pages/framework/theme/state.js';
import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
export default {
  name: '',
  components: {
    TopnavUser: () => import('@/views/components/topnav/topnav-user.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {},
  data() {
    return {
      home: HOME,
      keyword: ''
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query) {
      this.keyword = this.$route.query.searchKeyword;
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toHomePage() {
      if (MODULEID === this.defaultModuleId) {
        this.$router.push('/');
      } else {
        let that = this.$root.$children[0] ? this.$root.$children[0].$refs.root : null;//获取router-view 的vue 对象
        this.$utils.gotoHref(HOME + '/' + this.defaultModuleId + '.html', that);
      }
    },
    searchDocument(val) {
      if (val.trim()) {
        this.$router.push({
          path: '/documentonline-search',
          query: {
            searchKeyword: val
          }
        });
      } else {
        this.$router.push({path: '/documentonline'});
      }
    },
    toDocumentonlinePage() {
      this.$router.push({path: '/documentonline'});
    },
    toManagePage() {
      this.$router.push({path: '/directory-manage'});
    }
  },
  filter: {},
  computed: {
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
    },
    isDocumentonline() {
      return this.$route.fullPath == '/documentonline';
    }
  },
  watch: {
    $route: {
      handler(val) {
        this.keyword = '';
        this.$nextTick(() => {
          if (this.$localStore.get('searchKeyword', 'common') != null) {
            this.keyword = this.$localStore.get('searchKeyword', 'common');
          }
        });
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
