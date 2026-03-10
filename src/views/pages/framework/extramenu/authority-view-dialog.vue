<template>
  <div>
    <TsDialog
      :title="$t('page.viewauthority')"
      type="slider"
      :isShow.sync="isShow"
      :hasFooter="false"
      :isScrollbar="true"
      width="large"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsContain>
            <template slot="topRight">
              <TsRow>
                <Col span="6">
                  <TsFormSelect
                    v-model="moduleName"
                    :dataList="groupList"
                    :placeholder="$t('form.placeholder.pleaseselect',{'target':$t('page.module')})"
                    border="border"
                  ></TsFormSelect>
                </Col>
                <Col span="18">
                  <InputSearcher
                    v-model="keyword"
                    :placeholder="$t('page.keyword')"
                  ></InputSearcher>
                </Col>
              </TsRow>
            </template>
            <div slot="content">
              <TsTable
                v-bind="tableConfig"
                :theadList="theadList"
                :tbodyList="menuAuthList"
              >
                <template slot="authority" slot-scope="{ row }">
                  <div v-for="(item, index) in row.authorityList" :key="index" :class="index != row.authorityList.length - 1 ? 'mb-xs' : ''">
                    <template v-if="item.displayName">
                      <span>{{ item.displayName }}</span>
                      <span class="text-grey">·</span>
                    </template>
                    <span v-if="item.name" class="text-grey">{{ item.name }}</span>
                  </div>
                </template>
              </TsTable>
            </div>
          </TsContain>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {},
  data() {
    return {
      isShow: true,
      moduleName: '',
      keyword: '',
      routerConfig: {},
      moduleList: [],
      groupList: [],
      authList: [],
      tableConfig: {
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        {
          title: this.$t('page.menuname'),
          key: 'menuName'
        },
        {
          title: this.$t('term.framework.belongmodule'),
          key: 'moduleName'
        },
        {
          title: this.$t('page.authority'),
          key: 'authority'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.searchModule();
    await this.getAuthList();
    this.updateMenu();
    this.getRouterConfig();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getAuthList() {
      return this.$api.common
        .getAuthGrouplist()
        .then(res => {
          this.authList = [];
          let { Status, Return } = res || {};
          let {authGroupList = []} = Return || {};
          if (Status == 'OK') {
            authGroupList.forEach((item) => {
              if (item && item.authVoList && item.authVoList.length > 0) {
                this.authList.push(...(item.authVoList || []));
              }
            });
          }
        });
    },
    updateMenu() {
      // 获取自定义菜单
      this.$store.dispatch('updateMenu');
    },
    closeDialog() {
      this.$emit('close');
    },
    searchModule() {
      let data = {};
      return this.$api.common.getAuthGroup(data).then(res => {
        if (res.Status == 'OK') {
          let groupList = res.Return.groupList;
          this.groupList = groupList.filter((item) => item.value != 'all');
        }
      });
    },
    getRouterConfig() {
      const { getRouterConfig } = require('@/resources/import/router-config.js');
      const merged = getRouterConfig();
      const routerConfig = {};
      Object.keys(merged).forEach(moduleId => {
        const routeList = Array.isArray(merged[moduleId]) ? merged[moduleId] : [];
        const menuList = routeList
          .filter(item => item && item.meta)
          .map(item => ({
            menuName: item.meta.title,
            menu: item.name,
            moduleName: '',
            path: item.path,
            module: moduleId,
            authority: item.meta.authority
          }));
        if (menuList.length) {
          routerConfig[moduleId] = menuList;
        }
      });
      this.routerConfig = routerConfig;
    },
    getMenuAuthority(moduleId, menu) {
      if (!moduleId || !this.routerConfig[moduleId] || menu === '/') {
        return '';
      }
      let authList = this.routerConfig[moduleId] || [];
      let findItem = authList.find((v) => {
        if (menu && v.authority) {
          if (v.path && menu.indexOf(v.path) != -1) {
            return v;
          } else if (v.menu && menu.indexOf(v.menu) != -1) {
            return v;
          }
        }
      });
      return findItem ? findItem.authority : '';
    }
  },
  filter: {},
  computed: {
    menuAuthList() {
      let menuAuthList = [];
      this.$store.state.topMenu.moduleList.forEach((item) => {
        if (item.moduleId && item.moduleName) {
          item.menuGroupList && item.menuGroupList.forEach((v) => {
            if (v.menuList && v.menuList.length > 0) {
              v.menuList.forEach((n) => {
                if (n && n.name && n.path) {
                  menuAuthList.push({
                    moduleId: item.moduleId,
                    moduleName: item.moduleName,
                    menuName: n.name,
                    authority: this.getMenuAuthority(item.moduleId, n.path),
                    authorityList: this.getAuthorityName(this.getMenuAuthority(item.moduleId, n.path))
                  });
                }
              });
            }
          });
        }
      });
      // 根据搜索条件，过滤菜单权限列表数据
      let keyword = this.keyword ? this.keyword.toUpperCase() : '';
      if (this.$utils.isEmpty(keyword) && !this.$utils.isEmpty(this.moduleName)) {
        menuAuthList = menuAuthList.filter((item) =>
          item.moduleId && item.moduleId.indexOf(this.moduleName) != -1
        );
        return menuAuthList;
      }
      menuAuthList = menuAuthList.filter((item) =>
        (item.moduleName && item.moduleName.indexOf(keyword) != -1) || (item.menuName && item.menuName.indexOf(keyword) != -1) || (item.authority && item.authority.indexOf(keyword) != -1)
      );
      if (this.moduleName) {
        menuAuthList = menuAuthList.filter((item) =>
          item.moduleId && item.moduleId.indexOf(this.moduleName) != -1
        );
      }
      return menuAuthList;
    },
    getAuthorityName() {
      return (authority) => {
        if (typeof authority !== 'string' && !Array.isArray(authority)) {
          return [];
        }
        const authItems = Array.isArray(authority) ? authority : [authority];
        return authItems.map(authorityEnName => {
          const authItem = this.authList.find(v => v.name && authorityEnName && v.name === authorityEnName);
          let {displayName, name} = authItem || {};
          return { displayName, name: name || authorityEnName };
        });
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
