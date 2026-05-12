<template>
  <div class="leftmenu" :class="{ resizing: isResizing }">
    <div :class="isSlider ? 'menubar slider' : 'menubar'">
      <div class="menu_content">
        <slot :menuList="menuList"></slot>
        <div v-if="menuList && Object.keys(menuList).length">
          <div v-for="(menus, ind) in menuList" :key="ind" class="menu_link">
            <div v-if="menus.isFirst" :class="$isMenuActive(menus.url) ? 'active link' : 'link'">
              <router-link :to="menus.url ? menus.url : '/'" :class="menus.icon">{{ menus.name }}</router-link>
            </div>
            <div v-else>
              <div v-if="menuCategoryType[ind]" class="title text-grey">{{ menuCategoryType[ind] }}</div>
              <ul v-if="menus && menus.length > 0">
                <li
                  v-for="(menu, mindex) in menus"
                  :key="mindex"
                  :class="$isMenuActive(menu.url) ? 'active link' : 'link'"
                  @click="goTo(menu.url ? menu.url : '/')"
                  @contextmenu="newTab($event, menu, menu.url ? menu.url : '/')"
                >
                  <a class="cursor" :class="menu.icon">{{ menu.name }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div :class="menuToggleButtonClass" @click="menuToggle()"></div>
    </div>
    <div class="resize-handle">
      <span class="resize-handle-icon tsfont-drag" aria-hidden="true" @mousedown.prevent="startResize"></span>
      <span class="resize-handle-icon tsfont-drag" aria-hidden="true" @mousedown.prevent="startResize"></span>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import * as Types from '@/resources/store/mutation-type';
import LeftMenuMixin from './leftmenu-mixin';
import LeftMenuResizeMixin from './leftmenu-resize-mixin';

export default {
  name: 'LeftMenu',
  mixins: [LeftMenuMixin, LeftMenuResizeMixin],
  data() {
    return {
      isMenuExpanded: false, //菜单是否展开
      menuList: [],
      menuCategoryType: null,
      isSlider: true
    };
  },
  beforecreated() {},
  created() {
    this.getMenuList();
    const menuActive = localStorage.getItem('menuActive');
    if (menuActive == 'show' || menuActive == null) {
      this.isMenuExpanded = true;
    } else {
      this.isMenuExpanded = false;
      this.$store.commit(Types.UPDATE_MENU, 'show');
    }
  },
  beforeMount() {},
  mounted() {
    //404页面必须在所有路由加载完成后添加，不然无效
    this.$router.addRoute({
      path: '*',
      component: () => import('@/views/pages/common/no-authority.vue'),
      meta: {
        title: '页面不存在'
      }
    });
  },
  methods: {
    menuToggle() {
      this.isSlider = false;
      localStorage.setItem('menuActive', this.menuActive);
      this.onChangeMenu(this.menuActive);
      setTimeout(() => {
        this.isSlider = true;
        this.emitResizeEvent();
      }, 100);
    },
    ...mapMutations({
      onChangeMenu: Types.UPDATE_MENU // this.onChangeMenu()映射为 `this.$store.commit('UPDATE_MENU')`
    }),
    getMenuList() {
      let menuList = MENULIST;
      let menugroup = null;
      this.menuList = {};
      this.menuCategoryType = MENUTYPE;

      this.$store.state.topMenu.gettingModuleList.then(res => {
        if (res && res.Status == 'OK') {
          menugroup = {};
          let moduleList = res.Return || [];
          let userAuthList = []; // 拿到用户所有权限
          moduleList.forEach((item) => {
            if (item && item.authList && !this.$utils.isEmpty(item.authList)) {
              userAuthList.push(...item.authList);
            }
          });
          let authList = userAuthList.filter(item => item && item.name).map(item => item.name);
          menuList
            .filter(menu => menu.meta && menu.meta.ismenu && !menu.meta.istitle && ((authList && (typeof menu.meta.authority == 'string' ? authList.indexOf(menu.meta.authority) > -1 : this.$utils.checkHasSomeitem(authList, menu.meta.authority))) || !menu.meta.authority))
            .map(m => {
              if (m.meta.type) {
                if (!menugroup[m.meta.type]) {
                  menugroup[m.meta.type] = [];
                }
                menugroup[m.meta.type].push({
                  name: m.meta.title,
                  url: m.path.replace(/:(.*)\?/, ''),
                  icon: m.meta.icon,
                  urlName: m.name
                });
              } else {
                menugroup[m.name] = {
                  name: m.meta.title,
                  url: m.path.replace(/:(.*)\?/, ''),
                  icon: m.meta.icon,
                  isFirst: true,
                  urlName: m.name
                };
              }
            });
          //}
          //按照分组进行排序
          if (MENUTYPE) {
            const sortedMenuGroup = {};
            for (let key in MENUTYPE) {
              if (menugroup[key]) {
                sortedMenuGroup[key] = menugroup[key];
              }
            }
            this.menuList = sortedMenuGroup;
          } else {
            this.menuList = menugroup;
          }
        }
      });
    }
  },
  computed: {
    ...mapState(['menuActive']),
    menuToggleButtonClass() {
      let showclass = 'toggle-btn tsfont-bar';
      if (this.isMenuExpanded) {
        showclass = 'toggle-btn tsfont-left';
      }
      return showclass;
    }
  },
  watch: {
    menuActive: function() {
      if (this.menuActive === 'show') {
        this.isMenuExpanded = true;
      } else {
        this.isMenuExpanded = false;
      }
      localStorage.setItem('menuActive', this.menuActive);
    },
    isMenuExpanded: function() {
      this.$emit('menuToggle', this.isMenuExpanded);
    }
  }
};
</script>
