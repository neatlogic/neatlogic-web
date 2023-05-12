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
            <div v-for="menuGroup in module.menuGroupList" :key="menuGroup.menuTypeName" class="menu-group">
              <dt
                v-if="getFinalmenu(menuGroup.menuList).length > 0"
                class="menu-type-name text-grey"
              >{{ $t(menuGroup.menuTypeName) }}</dt>
              <dd
                v-for="(menu,mindex) in getFinalmenu(menuGroup.menuList)"
                :key="menu.name+'_'+mindex"
                :class="menu.icon"
                class="menu-name overflow"
                :href="`${home}/${module.moduleId}.html#${menu.path}`"
                @click.prevent="toMenu(module.moduleId, menu.path)"
              >
                <span class="menu-name-text">{{ $t(menu.name) }}</span>
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </Poptip>
    <!-- 导航内容开始 -->
    <ul class="topnav-menu-module">
      <li 
        v-for="module in moduleList"
        :key="module.moduleId"
        class="module-item text-action"
        :class="{ 'module-item-active': module.moduleId === moduleId }"
        @click.prevent="toMenu(module.moduleId)"   
        @contextmenu="newTab($event, module)"     
      >{{ module.moduleName }}</li>
    </ul>
    <!-- //导航内容_end -->
  </div>
</template>

<script>
export default {
  name: 'TopnavMenu',
  data() {
    return {
      isShow: false,
      moduleId: MODULEID,
      home: HOME
    };
  },
  methods: {
    updateMenu() {
      this.$store.dispatch('updateMenu');
    },
    toMenu(module, path = '/') {
      this.isShow = false;
      document.querySelector('.topnav-menu-list').style.display = 'none';
      this.$route.meta.clearHistory = true;
      if (module === MODULEID) {
        this.$router.push(path);
      } else {
        let that = this.$root.$children[0] ? this.$root.$children[0].$refs.root : null;//获取router-view 的vue 对象
        // console.log(module, path, '----', that, `${HOME}/${module}.html#${path}`);
        this.$utils.gotoHref(`${HOME}/${module}.html#${path}`, that);
      }
    },
    newTab(e, module) {
      //鼠标右键打开新标签页
      let replaceStr = `<a href="${HOME}/${module.moduleId}.html#/" style="display:block;">${module.moduleName}</a>`;
      e.currentTarget.innerHTML = replaceStr;
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
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.topnav-menu {
  display: flex;
  align-items: center;
  justify-content: flex-start;

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
    .module-item {
      height: @top-height;
      line-height: @top-height;
      padding: 0 @space-sm;
      min-width: 60px;
      text-align: center;
      position: relative;
      transition: all 0.2s ease-in-out;
    }
    li{
      a{
        display:inline-block;
        padding: 0 10px;
        height: 50px;
        line-height: 50px;
        min-width: 60px;
        text-align: center;
        position: relative;
        transition: all 0.2s ease-in-out;
      }
    }
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
