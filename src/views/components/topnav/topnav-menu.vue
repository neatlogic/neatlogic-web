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
          <template v-if="module && module.menuGroupList&& module.menuGroupList.length">
            <div
              class="module-name text-action"
              @click.prevent="toMenu(module.moduleId)"
            >{{ module.moduleName }}</div>
            <template v-for="menuGroup in module.menuGroupList">
              <div v-if="menuGroup.menuTypeName && getFinalmenu(menuGroup.menuList).length > 0" :key="menuGroup.menuTypeName" class="menu-group">
                <dt
                  class="menu-type-name text-grey"
                >{{ $t(menuGroup.menuTypeName) }}</dt>
                <dd
                  v-for="(menu,mindex) in getFinalmenu(menuGroup.menuList)"
                  :key="menu.name+'_'+ mindex"
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
      <Tabs :value="moduleId" @on-click="toMenu">
        <TabPane
          v-for="module in moduleList"
          :key="module.moduleId"
          :label="renderLabel(module)"
          :name="module.moduleId"
        ></TabPane>
      </Tabs>
    </div>
    <!-- //导航内容_end -->
    <!-- 附加菜单 -->
    <TopnavExtramenu v-if="!$utils.isEmpty(extramenu)" :extramenu="extramenu"></TopnavExtramenu>
  </div>
</template>

<script>
export default {
  name: 'TopnavMenu',
  components: {
    TopnavExtramenu: () => import('./topnav-extramenu.vue')
  },
  data() {
    return {
      isShow: false,
      moduleId: MODULEID,
      home: HOME,
      extramenu: {},
      extramenuLoading: false
    };
  },
  created() {},
  methods: {
    updateMenu() {
      this.$store.dispatch('updateMenu');
    },
    toMenu(module, path = '/') {
      this.isShow = false;
      this.moduleId = module;
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
        let that = this.$root.$children[0] ? this.$root.$children[0].$refs.root : null;//获取router-view 的vue 对象
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
              contextmenu: ($event) => {
                this.newTab($event, module);
              }
            }
          }, module.moduleName
        );
      };
    },
    initExtramenu() {
      this.$api.framework && this.$api.framework.extramenu.getMenuList().then(res => { // 修复用户权限加载快，$api没有挂载好，extramenu拿不到问题
        if (res.Status === 'OK') {
          this.extramenu = res.Return || {};
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.$store.commit('setExtramenu', false);
        });
      });
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
    isHasExtramenu() {
      return this.$AuthUtils.hasRole('EXTRA_MENU_MODIFY');
    },
    isUpdateExtramenu() {
      return this.$store.state.isUpdateExtramenu;
    }
  },
  watch: {
    isHasExtramenu: {
      handler(val) {
        if (val) {
          this.initExtramenu();
        }
      },
      immediate: true
    },
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
.theme(@top-active){
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
      /deep/ .ivu-tabs {
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
        .ivu-tabs-nav-prev, .ivu-tabs-nav-next {
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
  .ivu-poptip-body{
    padding: 0;
  }
  .ivu-poptip-body-content{
    max-height: 500px;
    overflow: auto;
    max-width: 100vw;
    padding: 8px 16px;
  }
  .menu-group-list {
    display: flex;
    padding: 22px 24px;
    .module-group {
      &:not(:empty){
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
