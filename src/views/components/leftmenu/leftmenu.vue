<template>
  <div class="leftmenu">
    <div :class="isSlider ? 'menubar slider' : 'menubar'">
      <div class="menu_content">
        <slot :menuList="menulist"></slot>
        <div v-if="menulist && Object.keys(menulist).length">
          <div v-for="(menus, ind) in menulist" :key="ind" class="menu_link">
            <div v-if="menus.isFirst" :class="$isMenuActive(menus.url) ? 'active link' : 'link'">
              <router-link :to="menus.url ? menus.url : '/'" :class="menus.icon">{{ menus.name }}</router-link>
            </div>
            <div v-else>
              <div v-if="menutype[ind]" class="title text-grey">{{ menutype[ind] }}</div>
              <ul v-if="menus && menus.length > 0">
                <li
                  v-for="(menu, mindex) in menus"
                  :key="mindex"
                  :class="$isMenuActive(menu.url) ? 'active link' : 'link'"
                  @click="goTo(menu.url ? menu.url : '/')"
                  @contextmenu="newTab($event, menu, menu.url ? menu.url : '/')"
                >
                  <!-- <router-link :to="menu.url ? menu.url : '/'" :class="menu.icon">{{ menu.name }}</router-link> -->
                  <a class="cursor" :class="menu.icon">{{ menu.name }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- <div v-else class="text-center" style="line-height:4">暂无菜单</div> -->
      </div>
      <div :class="setMenushow" @click="menuToggle()"></div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import * as Types from '@/resources/store/mutation-type';
export default {
  name: 'LeftMenu',

  components: {},
  props: ['action'],
  data() {
    return {
      menushow: false, //菜单展开，默认展开还是收起与index的showmenu需同步
      menu_key: true,
      menulist: [],
      menutype: null,
      isSlider: true
    };
  },

  beforecreated() {},
  created() {
    this.getMenuList();
    let menu_storage = localStorage.getItem('menuActive');
    if (menu_storage == 'show' || menu_storage == null) {
      this.menushow = true;
    } else {
      this.menushow = false;
      this.menu_key = false;
      this.$store.commit(Types.UPDATE_MENU, 'show');
    }
  },
  beforeMount() {},

  mounted() {
    const that = this;
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
    newTab(e, menu, path) {
      //鼠标右键打开新标签页
      let base = this.$router.options.base;
      let replaceStr = `<a href="${base}#${path}" class="cursor ${menu.icon}">${menu.name}</a>`;
      e.currentTarget.innerHTML = replaceStr;
    },
    goTo(path) {
      //从左侧菜单点链接，激活清理历史标记
      this.$route.meta.clearHistory = true;
      this.$router.push({ path: path });
    },
    menuToggle: function() {
      let _this = this;
      if (this.menushow == true) {
        this.menu_key = false;
      } else {
        this.menu_key = true;
      }
      this.isSlider = false;
      this.$emit('menushow', this.menushow); //向home父组件传值
      localStorage.setItem('menuActive', this.menuActive);
      this.onChangeMenu(this.menuActive);
      setTimeout(function() {
        _this.isSlider = true;
        //手动触发窗口变化事件
        window.dispatchEvent(new Event('resize'));
      }, 100);
    },
    ...mapMutations({
      onChangeMenu: Types.UPDATE_MENU // this.onChangeMenu()映射为 `this.$store.commit('UPDATE_MENU')`
    }),
    getMenuList() {
      let menulist = MENULIST;
      let menugroup = null;
      this.menulist = {};
      this.menutype = MENUTYPE;

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
          menulist
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
            this.menulist = sortedMenuGroup;
          } else {
            this.menulist = menugroup;
          }
        }
      });
    }
  },
  computed: {
    ...mapState(['menuActive']),
    setMenushow() {
      let showclass = 'toggle-btn tsfont-bar';
      if (this.menushow) {
        showclass = 'toggle-btn tsfont-left';
      }
      return showclass;
    },
    getFinalmenu() {
      return function(list) {
        //需要过滤掉那种作为菜单但是是菜单二级分类的，比如工单中心和知识库的知识分类
        let groupList = [];
        if (list && list.length > 0) {
          groupList = list.filter(l => {
            return !l.istitle;
          });
        }
        return groupList;
      };
    }
  },
  watch: {
    menuActive: function() {
      if (this.menuActive === 'show') {
        this.menushow = true;
      } else {
        this.menushow = false;
      }
      localStorage.setItem('menuActive', this.menuActive);
    },
    menushow: function() {
      this.$emit('menushow', this.menushow);
    }
  }
};
</script>
