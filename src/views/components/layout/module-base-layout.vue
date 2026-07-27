<template>
  <div
    v-if="hasAuthorization"
    class="home module-base"
    :class="{
      'menu-min': !isMenuExpanded,
      'hidden-topnav': !showTopnav,
      'hidden-leftmenu': !showLeftmenu,
      'hidden-topnav-leftmenu': isHiddenTopnavLeftmenu
    }"
  >
    <slot v-if="showTopnav" name="topNav">
      <TopNav></TopNav>
    </slot>
    <LeftMenu v-if="showLeftmenu" @menuToggle="menuToggle">
      <slot name="leftMenu"></slot>
    </LeftMenu>
    <div class="centermain" :style="centermainStyle">
      <div v-if="isRouterAlive">
        <keep-alive :include="keepAliveInclude" :max="keepAliveMax">
          <router-view
            v-if="useKeepAlive"
            :key="routerViewKey"
            ref="root"
            style="height:100%;overflow: auto;"
          ></router-view>
        </keep-alive>
        <router-view
          v-if="!useKeepAlive"
          :key="routerViewKey"
          ref="root"
          style="height:100%;overflow: auto;"
        ></router-view>
      </div>
    </div>
    <LicenseValidator></LicenseValidator>
  </div>
</template>
<script>
export default {
  name: 'ModuleBaseLayout',
  provide() {
    return {
      reloadRouter: this.reloadRouter
    };
  },
  components: {
    TopNav: () => import('@/views/components/topnav/topnav.vue'),
    LeftMenu: () => import('@/views/components/leftmenu/leftmenu.vue'),
    LicenseValidator: () => import('@/views/components/license/license-validator.vue')
  },
  props: {
    hasAuthorization: {
      type: Boolean,
      default: true
    },
    hasLeftMenu: {
      type: Boolean,
      default: true
    },
    centermainStyle: {
      type: [String, Object, Array],
      default: null
    },
    keepAliveInclude: {
      type: [String, Array, RegExp],
      default: null
    },
    keepAliveMax: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      isMenuExpanded: false,
      isRouterAlive: true
    };
  },
  methods: {
    menuToggle(isMenuExpanded) {
      this.isMenuExpanded = isMenuExpanded;
    },
    reloadRouter() {
      this.isRouterAlive = false;
      this.$store.dispatch('getModuleList');
      this.$nextTick(() => {
        this.isRouterAlive = true;
        location.reload();
      });
    },
    getLocationQueryValue(key) {
      if (typeof window === 'undefined') {
        return undefined;
      }
      const hash = window.location.hash || '';
      const queryIndex = hash.indexOf('?');
      if (queryIndex < 0) {
        return undefined;
      }
      let queryString = hash.slice(queryIndex + 1);
      const hashIndex = queryString.indexOf('#');
      if (hashIndex > -1) {
        queryString = queryString.slice(0, hashIndex);
      }
      return queryString
        .split('&')
        .map(item => item.split('='))
        .filter(item => item[0])
        .reduce((valueList, item) => {
          const queryKey = decodeURIComponent(item[0]);
          if (queryKey === key) {
            valueList.push(decodeURIComponent((item[1] || '').replace(/\+/g, ' ')));
          }
          return valueList;
        }, []);
    },
    isRouteOptionTrue(key) {
      const route = this.$route || {};
      const query = route.query || {};
      const meta = route.meta || {};
      return this.isTrue(query[key]) || this.isTrue(meta[key]) || this.isTrue(this.getLocationQueryValue(key));
    },
    isTrue(value) {
      if (Array.isArray(value)) {
        return value.some(item => this.isTrue(item));
      }
      return value === true || String(value).toLowerCase() === 'true';
    }
  },
  computed: {
    isHiddenTopnavLeftmenu() {
      return this.isRouteOptionTrue('hidden-topnav-leftmenu');
    },
    showTopnav() {
      return !this.isHiddenTopnavLeftmenu && !this.isRouteOptionTrue('hidden-topnav');
    },
    showLeftmenu() {
      return this.hasLeftMenu && !this.isHiddenTopnavLeftmenu && !this.isRouteOptionTrue('hidden-leftmenu');
    },
    useKeepAlive() {
      if (Array.isArray(this.keepAliveInclude)) {
        return this.keepAliveInclude.length > 0;
      }
      return !!this.keepAliveInclude;
    },
    routerViewKey() {
      const ignoredQueryList = ['hidden-topnav', 'hidden-leftmenu', 'hidden-topnav-leftmenu'];
      const query = this.$route.query || {};
      const queryString = Object.keys(query)
        .filter(key => !ignoredQueryList.includes(key))
        .sort()
        .map(key => {
          const value = query[key];
          return Array.isArray(value) ? `${key}=${value.join(',')}` : `${key}=${value}`;
        })
        .join('&');
      return `${this.$route.path}${queryString ? '?' + queryString : ''}${this.$route.hash || ''}`;
    }
  }
};
</script>
