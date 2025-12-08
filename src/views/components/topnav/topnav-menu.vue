<template>
  <div class="topnav-menu">
    <Poptip
      placement="bottom-start"
      :offset="0"
      transfer
      popper-class="topnav-menu-list"
      transfer-class-name="topnav-menu-list"
      @on-popper-show.once="updateMenu"
      @on-popper-show="isShow = true"
      @on-popper-hide="isShow = false"
    >
      <i class="tsfont-apps apps-icon" :class="{ 'apps-icon-active': isShow }"></i>
      <div slot="content" class="menu-group-list">
        <dl v-for="module in moduleList" :key="module.moduleId" class="module-group">
          <template v-if="module && module.menuGroupList && module.menuGroupList.length">
            <div class="module-name text-action" @click.prevent="toMenu(module.moduleId)">{{ module.moduleName }}</div>
            <template v-for="menuGroup in module.menuGroupList">
              <div v-if="menuGroup.menuTypeName && getFinalmenu(menuGroup.menuList).length > 0" :key="menuGroup.menuTypeName" class="menu-group">
                <dt class="menu-type-name text-grey">{{ $t(menuGroup.menuTypeName) }}</dt>
                <dd
                  v-for="(menu, mindex) in getFinalmenu(menuGroup.menuList)"
                  :key="menu.name + '_' + mindex"
                  :class="menu.icon"
                  class="menu-name overflow"
                  :href="`${home}/${module.moduleId}.html#${menu.path}`"
                  @click.prevent="toMenu(module.moduleId, menu.path)"
                >
                  <span class="menu-name-text">{{ $t(menu.name) }}</span>
                </dd>
              </div>
            </template>
          </template>
        </dl>
      </div>
    </Poptip>
    <!-- 导航内容开始 -->
    <div class="topnav-menu-module overflow">
      <Tabs :value="moduleId" @on-click="name => toMenu(name, '/', true)">
        <TabPane
          v-for="(module, index) in moduleList"
          :key="module.moduleId"
          :label="renderLabel(module)"
          :name="module.moduleId"
          :index="100 + index"
        ></TabPane>
        <TabPane
          v-for="(extramenu,index) in extramenuList"
          :key="extramenu.id"
          :index="200 + index"
          :name="'extra_' + extramenu.id"
          :label="renderExtraLabel(extramenu)"
        ></TabPane>
      </Tabs>
    </div>
    <!-- //导航内容_end -->
    <!-- 附加菜单 -->
    <!--<TopnavExtramenu v-for="(extramenu,index) in extramenuList" :key="index" :extramenu="extramenu"></TopnavExtramenu>-->
  </div>
</template>

<script>
export default {
  name: 'TopnavMenu',
  components: {
    //TopnavExtramenu: () => import('./topnav-extramenu.vue')
  },
  data() {
    return {
      isShow: false,
      moduleId: MODULEID,
      home: HOME,
      extramenuList: [],
      extramenuLoading: false,
      selectedExtraMenuList: [] // 已选的额外菜单列表。用于在点击跳转后重置选中状态，防止第二次点击无效。
    };
  },
  async created() {
    await this.initExtramenu();
    //检测hash变化，用于framework.html切换hash
    window.addEventListener('hashchange', this.onHashChange);
    //如果从别的页面进来，使用此方法检测
    this.onHashChange();
  },
  mounted() {
  },
  beforeDestroy() {
    window.removeEventListener('hashchange', this.onHashChange);
  },
  methods: {
    onHashChange() {
      //用于检测hash的变化，高亮扩展菜单
      const hash = window.location.hash;
      if (hash.startsWith('#/extramenu-detail')) {
        const queryString = hash.split('?')[1];
        const params = new URLSearchParams(queryString);
        const id = params.get('rootId');
        if (id) {
          this.moduleId = 'extra_' + id;
        }
      }
    },
    getDatalist(arr) {
      for (var i in arr) {
        if (arr[i].name) {
          arr[i].label = arr[i].name;
          arr[i].value = arr[i].id;
        }
        if (arr[i].children && arr[i].children.length > 0) {
          this.getDatalist(arr[i].children);
        }
      }
      return arr;
    },
    handleExtraChange(val, selectedData, rootmenu) {
      if (!this.$utils.isEmpty(selectedData) && selectedData[selectedData.length - 1].url) {
        const url = selectedData[selectedData.length - 1].url;
        const openType = selectedData[selectedData.length - 1].openType;
        const id = selectedData[selectedData.length - 1].id;
        if (url && this.checkUrl(url)) {
          if (openType === 'window') {
            this.selectedExtraMenuList = [];
            window.open(url, '_blank');
          } else if (openType === 'iframe') {
            //清空模块id，避免选中
            this.moduleId = null;
            let that = this.$root.$children[0] ? this.$root.$children[0].$refs.root : null; //获取router-view 的vue 对象
            this.$utils.gotoHref(`${HOME}/framework.html#/extramenu-detail?rootId=${rootmenu.id}&id=${id}`, that);
          }
        }
      }
    },
    checkUrl(string) {
      let givenURL;
      try {
        givenURL = new URL(string);
      } catch (error) {
        this.$Notice.error({ title: 'URL' + this.$t('page.exception'), desc: error});
        return false;
      }
      return true;
    },
    renderExtraLabel(extramenu) {
      const options = this.getDatalist(extramenu.children);
      return h => {
        return h(
          'div',
          {
            class: 'extra-cascader-label',
            on: {
              click: e => e.stopPropagation(),
              mousedown: e => e.stopPropagation()
            },
            style: { display: 'flex', alignItems: 'center', height: '50px' }
          },
          [
            h(
              'Cascader',
              {
                props: {
                  value: this.selectedExtraMenuList, // = selecteData
                  data: options,
                  transfer: true,
                  clearable: false,
                  'change-on-select': true,
                  'transfer-class-name': 'extramenu-transfer-cascader'
                },
                on: {
                  'on-change': (val, selected) =>
                    this.handleExtraChange(val, selected, extramenu), // = changeMenu
                  'on-visible-change': visible =>
                    this.onVisibleChange && this.onVisibleChange(visible) // 可选，与你现有方法名一致
                }
              },
              [
                // 默认 slot
                h(
                  'div',
                  { class: 'cursor-pointer padding-sm' },
                  extramenu.name
                )
              ]
            )
          ]
        );
      };
    },
    canClick() {
      let { isDisabled = false, disabledReason = '' } = this.currentModuleItem || {};
      if (isDisabled) {
        this.$Notice.error({
          title: this.$t('page.licenseexception'),
          desc: disabledReason
        });
        return false;
      } else {
        return true;
      }
    },
    updateMenu() {
      this.$store.dispatch('updateMenu');
    },
    toMenu(module, path = '/', isDisabled = false) {
      this.isShow = false;
      this.moduleId = module;
      if (!this.canClick() && !isDisabled) {
        return false;
      }
      document.querySelector('.topnav-menu-list').style.display = 'none';
      if (document.querySelector(`#tab_${module}`)) {
        document.querySelector(`#tab_${module}`).setAttribute('href', 'javascript:void(0)');
      }
      this.$route.meta.clearHistory = true;
      if (module === MODULEID) {
        let defaultPage = '';
        try {
          const moduleList = JSON.parse(localStorage.getItem('moduleList'));
          defaultPage =
            moduleList.find(module => {
              return module.moduleId === MODULEID;
            }).defaultPage || '/welcome';
        } catch {
          defaultPage = '/welcome';
        }
        this.$router.push({
          path: defaultPage
        });
      } else {
        let that = this.$root.$children[0] ? this.$root.$children[0].$refs.root : null; //获取router-view 的vue 对象
        this.$utils.gotoHref(`${HOME}/${module}.html#${path}`, that);
      }
      this.$nextTick(() => {
        //出现数据保存弹框时，确保选中模块与当前模块保持一致
        this.moduleId = MODULEID;
      });
    },
    newTab(e, module) {
      //鼠标右键打开新标签页
      let replaceStr = `<a href="${HOME}/${module.moduleId}.html#/" style="display:block;" id="tab_${module.moduleId}">${module.moduleName}</a>`;
      e.currentTarget.innerHTML = replaceStr;
    },
    renderLabel(module) {
      return h => {
        return h(
          'div',
          {
            on: {
              contextmenu: $event => {
                this.newTab($event, module);
              }
            }
          },
          module.moduleName
        );
      };
    },
    initExtramenu() {
      if (!this.$api.framework) {
        return;
      }
      return this.$api.framework.extramenu
        .getMenuList()
        .then(res => {
          this.extramenuList = this.findActiveExtramenuList(res.Return || []);
        })
        .finally(() => {
          this.$nextTick(() => {
            this.$store.commit('setExtramenu', false);
          });
        });
    },
    findActiveExtramenuList(menuList = []) {
      const result = [];
      menuList.forEach(item => {
        const newItem = { ...item };
        if (item['children'] && Array.isArray(item['children'])) {
          newItem['children'] = this.findActiveExtramenuList(item['children']);
        }
        if (newItem['isActive'] == 1 || (newItem['isActive'] == 1 && newItem['children'] && newItem['children'].length > 0)) {
          result.push(newItem);
        }
      });
      return result;
    }
  },
  computed: {
    moduleList() {
      return this.$store.state.topMenu.moduleList;
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
    },
    isUpdateExtramenu() {
      return this.$store.state.isUpdateExtramenu;
    },
    currentModuleItem() {
      return this.moduleList.find(item => {
        return item.moduleId === MODULEID;
      });
    }
  },
  watch: {
    isUpdateExtramenu: {
      handler(val) {
        if (val) {
          this.initExtramenu();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@top-active) {
  .topnav-menu {
    // display: flex;
    // align-items: center;
    // justify-content: flex-start;
    display: grid;
    grid-template-columns: 46px auto auto;
    align-items: center;

    .apps-icon {
      font-size: 16px;
      transition: color 0.2s ease;
      display: flex;
      align-items: center;
      margin-left: 12px;
      margin-right: 10px;
      cursor: pointer;
      &::before {
        padding: 4px;
      }
    }

    .topnav-menu-module {
      height: @top-height;
      background-color: transparent;
      cursor: pointer;

      display: flex;
      justify-content: center;
      align-items: center;
      ::v-deep .ivu-tabs {
        color: @white;
        .ivu-tabs-bar {
          margin: 0;
        }
        .ivu-tabs-ink-bar {
          display: none;
        }
        .ivu-tabs-tab {
          padding: 0 10px;
          height: 50px;
          line-height: 50px;
          margin: 0;
        }
        .ivu-tabs-nav-prev,
        .ivu-tabs-nav-next {
          line-height: 50px;
        }
        .ivu-tabs-nav .ivu-tabs-tab:hover {
          color: @white;
          background: fade(@top-active, 50%);
        }
        .ivu-tabs-nav .ivu-tabs-tab-active {
          color: @white;
          background: var(--top-active, @top-active);
          border-color: none;
        }
      }
    }
  }
}
html {
  .theme(@default-top-active);

  &.theme-dark {
    .theme(@dark-top-active);
  }
}
</style>

<style lang="less">
.topnav-menu-list {
  .ivu-poptip-body {
    padding: 0;
  }
  .ivu-poptip-body-content {
    max-height: 500px;
    overflow: auto;
    max-width: 100vw;
    padding: 8px 16px;
  }
  .menu-group-list {
    display: flex;
    padding: 22px 24px;
    .module-group {
      &:not(:empty) {
        width: 220px;
      }
      .module-name {
        width: 200px;
        height: 22px;
        margin-bottom: 28px;
        font-size: 16px;
        font-weight: normal;
        line-height: 22px;
        position: relative;
        cursor: pointer;
        transition: color 0.2s ease;

        &::after {
          content: '';
          display: inline-block;
          position: absolute;
          width: 200px;
          height: 1px;
          background-color: #333;
          bottom: -10px;
          left: 0;
        }
      }
      .menu-group {
        .menu-type-name {
          cursor: default;
          font-size: 13px;
          margin-top: 22px;
          margin-bottom: 8px;
        }
        .menu-name {
          display: block;
          text-align: left;
          font-size: 13px;
          cursor: pointer;
          line-height: 28px;
          transition: color 0.2s ease;
          .menu-name-text {
            padding-left: 4px;
            vertical-align: baseline;
          }
          & + .menu-name {
            margin-top: 8px;
          }
          &::before {
            margin-right: 7px;
          }
        }
      }
    }
  }

  .ivu-poptip-popper {
    transform: translate(0, 7px);
  }

  .ivu-poptip-arrow {
    left: 220px !important;
  }
}
</style>
