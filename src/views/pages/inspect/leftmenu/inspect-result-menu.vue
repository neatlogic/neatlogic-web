<template>
  <div class="OverviewMenu menu_link">
    <div class="title text-grey">{{ $t('term.inspect.inspectresult') }}</div>
    <ul>
      <li
        v-for="(item, index) in inspectResultFirstMenuList"
        :key="index"
        v-auth="item.auth"
        :class="$isMenuActive(item.url) ? 'active link' : 'link'"
        @contextmenu="newTab($event, item.nameIconObj, item.url)"
        @click="goTo(item.url)"
      >
        <a class="cursor" :class="item.icon">{{ $t(item.name) }}</a>
      </li>
    </ul>
    <div v-auth="questionClassificationMenuAuth">
      <div v-if="InspectResultMenuList">
        <ul v-if="InspectResultMenuList.length > 0" class="navlist-ul">
          <draggable
            v-model="InspectResultMenuList"
            :animation="200"
            handle=".handle"
            @end="dragEnd"
          >
            <ul
              v-for="(item, index) in InspectResultMenuList"
              :key="item.id"
              class="navlist-li link"
              :class="{ active: $isMenuActive('/recent-issues-' + item.id)}"
            >
              <li class="overflow navlist-text">
                <a class="router-link tsfont-baobiao" :title="item.name" @click="goTo('/recent-issues-' + item.id)">{{ $t(item.name) }}</a>
                <i class="item-icon handle tsfont-drag hide text-actiongit"></i>
                <span class="navlist-action">
                  <Dropdown trigger="click" :transfer="true">
                    <span ref="horizontal" class="tsfont-option-horizontal text-action"></span>
                    <DropdownMenu slot="list" class="overdown">
                      <DropdownItem @click.native="renameNewClass(item)">
                        <div>{{ $t('page.edit') }}</div>
                      </DropdownItem>
                      <DropdownItem @click.native="delNewClass(item, index)">
                        <div>{{ $t('page.delete') }}</div>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </span>
              </li>
            </ul>
          </draggable>
        </ul>
      </div>
      <div v-else>
        <Loading loadingShow></Loading>
      </div>
    </div>
    <ul>
      <li
        v-for="(item, index) in inspectResultOtherMenuList"
        :key="index"
        v-auth="item.auth"
        :class="$isMenuActive(item.url) ? 'active link' : 'link'"
        @click="goTo(item.url)"
        @contextmenu="newTab($event, item.nameIconObj, item.url)"
      >
        <a class="cursor" :class="item.icon">{{ $t(item.name) }}</a>
      </li>
    </ul>
    <CategoryEditDialog v-if="isShowCategoryEditDialog" :id="id" @close="closeRenameDialog"></CategoryEditDialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import draggable from 'vuedraggable';
import LeftMenu from '@/views/components/leftmenu/leftmenu';
import inspectRouterList from '@/views/pages/inspect/router.js'; // 巡检路由列表
export default {
  name: '', // 巡检结果菜单
  components: {
    CategoryEditDialog: () => import('@/views/pages/inspect/recentIssues/category-edit-dialog'), // 编辑新分类
    draggable
  },
  extends: LeftMenu,
  props: {},
  data() {
    return {
      isShowCategoryEditDialog: false,
      InspectResultMenuList: null, //左侧列表
      id: '', // 新分类id
      oldMenuList: [], // 没有拖拽前的菜单列表
      questionClassificationMenuAuth: '', // 问题分类菜单权限
      inspectResultFirstMenuList: [], // 巡检结果分类，第一个菜单
      inspectResultOtherMenuList: [] // 巡检结果分类，其他菜单列表
    };
  },
  async created() {
    await this.initData('init');
    this.getInspectResultMenu();
  },
  mounted() {},
  activated() {},
  beforeDestroy() {},
  methods: {
    getInspectResultMenu() {
      // 获取巡检结果分类菜单
      this.inspectResultFirstMenuList = []; // 巡检结果分类，第一个菜单
      this.inspectResultOtherMenuList = []; // 巡检结果分类，其他菜单
      if (inspectRouterList && inspectRouterList.length > 0) {
        inspectRouterList.forEach((item) => {
          if (item && item.hasOwnProperty('meta')) {
            if (item.meta && item.meta.type == 'inspectResult') {
              if (item.meta.sort && (item.meta.sort == 1)) {
              // 排在第一个
                let recentIssuesPath = item.path ? (item.path.split(':') ? item.path.split(':')[0] : '/') : '/';
                this.inspectResultFirstMenuList.push({
                  name: item.meta.title,
                  icon: item.meta.icon,
                  path: recentIssuesPath,
                  url: recentIssuesPath,
                  auth: item.authority, // 权限
                  nameIconObj: {
                    name: item.meta.title,
                    icon: item.meta.icon
                  }
                });
                this.questionClassificationMenuAuth = item.authority;
              } else {
              // 其他菜单
                this.inspectResultOtherMenuList.push({
                  name: item.meta.title,
                  icon: item.meta.icon,
                  path: item.path,
                  url: item.path,
                  auth: item.authority, // 权限
                  nameIconObj: {
                    name: item.meta.title,
                    icon: item.meta.icon
                  }
                });
              }
            }
          }
        });
      }
    },
    dragEnd({oldIndex, newIndex}) {
      const params = {
        id: this.oldMenuList[oldIndex].id, //被拖拽的id
        sort: this.oldMenuList[newIndex].sort //被挤走的sort
      };
      this.$api.inspect.assetsInspect.moveNewClassification(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          }
        }).finally(() => {
          this.initData(true);
        });
    },
    renameNewClass(obj) {
      this.id = obj.id;
      this.isShowCategoryEditDialog = true;
    },
    closeRenameDialog(needRefresh) {
      this.isShowCategoryEditDialog = false;
      this.id = '';
      if (needRefresh) {
        this.initData(true);
      }
    },
    delNewClass(item, index) {
      if (item && item.id && item.name) {
        this.$createDialog({
          type: 'modal',
          title: this.$t('page.warning'),
          maskClose: true,
          btnType: 'error',
          content: this.$t('dialog.content.deleteconfirm', {target: item.name}),
          'on-ok': (vnode) => {
            this.$api.inspect.assetsInspect.delProblemClassificationMenu({id: item.id}).then(res => {
              if (res.Status == 'OK') {
                this.InspectResultMenuList.splice(index, 1);
                if (item.id === this.$route.params.recentIssuesId) {
                  this.initData('first');
                } else {
                  this.initData(true);
                }
              }
            });
            vnode.isShow = false;
          }
        });
      }
    },
    getInspectMenu() {
      // 最新问题菜单分类
      return this.$store.dispatch('leftMenu/getRecentIssuesMenuData');
    },
    async initData(action) {
      if (action) {
        await this.getInspectMenu();
      }
      this.InspectResultMenuList = this.$store.state.leftMenu.recentIssuesList || [];
      this.oldMenuList = this.$utils.deepClone(this.InspectResultMenuList);
      if (action === 'first') {
        this.$router.push({ name: 'recent-issues', params: { recentIssuesId: this.InspectResultMenuList[0].id } });
      }
    }
  },
  computed: {
    ...mapGetters('leftMenu', {
      recentIssuesId: 'recentIssuesId'
    })
  },
  watch: {
    '$store.state.leftMenu.recentIssuesList': {
      handler(val) {
        if (val) {
          this.initData();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.OverviewMenu {
  padding-top: 8px;
}
  .navlist-ul {
    .navlist-li {
      position: relative;
      &:hover .item-icon.tsfont-type {
        display: none;
      }
      .item-icon.tsfont-drag {
        display: none;
        cursor: ns-resize;
      }
      &:hover {
        .item-icon.tsfont-drag {
          display: block;
          position: absolute;
          left: @space-md - 6px;
          top: 0;
        }
        .navlist-text {
          a:before {
            opacity: 0;
          }
        }
      }
      &:hover {
        .navlist-action {
          display: block;
        }
      }

      .navlist-text {
        cursor: pointer;
        position: relative;
        display: inline-block;
        max-width: 100%;
        line-height: 36px;
        height: 36px;
        text-align: left;
        width: 100%;
        &:before {
          margin-right: 10px;
          margin-left: 2px;
        }
        a {
          position: relative;
        }
      }
      .navlist-action {
        position: absolute;
        top: 0;
        right: 6px;
        line-height: 36px;
        height: 36px;
        width: 18px;
        cursor: pointer;
        display: none;
        text-align: center;
        font-size: 10px;
      }
    }
  }
.ivu-select-dropdown:has(.overdown) {
  z-index: 0;
}
</style>
