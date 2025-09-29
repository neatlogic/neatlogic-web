<template>
  <div class="team-manage">
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="isEdit = true">{{ $t('page.menu') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <div class="action-group">
          <div class="action-item tsfont-auth" @click="openAuthorityViewDialog">{{ $t('page.systemmenuauth') }}</div>
        </div>
      </template>
      <div slot="content" class="dividing-color">
        <div class="card-wrapper">
          <div v-if="menuList && menuList.length > 0">
            <div class="grid text-grey mb-md">
              <div>{{ $t('page.name') }}</div>
              <div>{{ $t('term.framework.openmode') }}</div>
              <div>{{ $t('page.type') }}</div>
              <div>{{ $t('page.childmenucount') }}</div>
              <div>{{ $t('page.action') }}</div>
            </div>
            <div style="height: calc(100vh - 145px); overflow: auto">
              <MenuTreeview
                :parentId="0"
                :children="menuList"
                @refresh="getMenuList(); $store.commit('setExtramenu', true);"
                @update="update"
              ></MenuTreeview>
            </div>
          </div>
          <div v-else>
            <NoData></NoData>
          </div>
        </div>
      </div>
    </TsContain>
    <MenuEdit v-if="isEdit" @close="closeEdit"></MenuEdit>
    <AuthorityViewDialog v-if="isShowAuthorityViewDialog" @close="isShowAuthorityViewDialog = false"></AuthorityViewDialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    MenuTreeview: () => import('./menu-treeview'),
    MenuEdit: () => import('./menu-edit.vue'),
    AuthorityViewDialog: () => import('./authority-view-dialog')
  },
  props: [],
  data() {
    return {
      isShowAuthorityViewDialog: false,
      menuList: [],
      isEdit: false
    };
  },
  beforeCreate() {},
  created() {
    this.getMenuList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    openAuthorityViewDialog() {
      this.isShowAuthorityViewDialog = true;
    },
    addMenu() {},
    closeEdit(needRefresh) {
      this.isEdit = false;
      if (needRefresh) {
        this.getMenuList();
      }
    },
    update(list, parentId) {
      this.$api.framework.extramenu.moveExtramenu({ menuList: list }).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.getMenuList();
        }
      });
    },
    getMenuList() {
      this.$api.framework.extramenu
        .getMenuTreeList()
        .then(res => {
          this.menuList = this.normalizeMenuList(res.Return || []);
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    normalizeMenuList(list = []) {
      // 修复空目录节点无法拖入菜单的问题
      list.forEach(item => {
        if (item && item.type === 0 && item.childCount === 0) {
          item.children = [];
        }
        if (item && Array.isArray(item.children) && item.children.length > 0) {
          this.normalizeMenuList(item.children);
        }
      });
      return list;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
@import '~@/resources/assets/css/framework/manage.less';
</style>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 120px 120px 120px 210px;
}
</style>
