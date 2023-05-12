<template>
  <div class="leftmenu">
    <div :class="isSlider ? 'menubar slider' : 'menubar'">
      <div class="menu_content">
        <div class="menu_link">
          <ul>
            <li class="link">
              <a class="tsfont-plus text-primary" @click="openPortfolioToolsDialog">
                <span class="text-primary">{{ $t('page.new') }}</span>
              </a>
            </li>
          </ul>
        </div>
        <slot :menuList="menulist"></slot>
        <div v-if="menulist && Object.keys(menulist).length">
          <div v-for="(menus, ind) in menulist" :key="ind" class="menu_link">
            <div v-if="menus.isFirst" :class="$isMenuActive(menus.url) ? 'active link' : 'link'">
              <router-link :to="menus.url ? menus.url : '/'" :class="menus.icon">{{ $t(menus.name) }}</router-link>
            </div>
            <div v-else>
              <div class="title text-grey">{{ menutype[ind] }}</div>
              <ul v-if="menus && menus.length > 0">
                <li
                  v-for="(menu, mindex) in menus"
                  :key="mindex"
                  :class="$isMenuActive(menu.url) ? 'active link' : 'link'"
                  @click="goTo(menu.url ? menu.url : '/')"
                  @contextmenu="newTab($event, menu, menu.url ? menu.url : '/')"
                >
                  <!-- <router-link :to="menu.url ? menu.url : '/'" :class="menu.icon">{{ menu.name }}</router-link> -->
                  <a class="cursor" :class="menu.icon">{{ $t(menu.name) }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div :class="setMenushow" @click="menuToggle()"></div>
    </div>
    <PortfolioToolsDialog v-if="isShowPortfolioToolsDialog" @close="closePortfolioToolsDialog"></PortfolioToolsDialog>
  </div>
</template>

<script>
import LeftMenu from '@/views/components/leftmenu/leftmenu';

export default {
  name: 'LeftMenu',
  components: {
    PortfolioToolsDialog: resolve => require(['../manage/tool/portfolio-tools-dialog'], resolve) // 创建作业(选择组合工具入口）
  },
  extends: LeftMenu,
  props: ['action'],
  data() {
    return {
      isShowPortfolioToolsDialog: false
    };
  },

  beforecreated() {},
  created() {},
  beforeMount() {},

  mounted() {},

  methods: {
    openPortfolioToolsDialog() {
      this.isShowPortfolioToolsDialog = true;
    },
    closePortfolioToolsDialog() {
      this.isShowPortfolioToolsDialog = false;
    }
  },
  watch: {}
};
</script>
