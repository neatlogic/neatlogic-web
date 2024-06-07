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
      let routerConfig = {};
      let routerJsPathList = [];
      const communityConfig = require.context('@/views/pages', true, /\/router\.js$/); // 正则匹配/router.js文件
      const commercialConfig = require.context('@/commercial-module', true, /\/router\.js$/);
      const commercialRouterPathList = commercialConfig.keys() || [];
      const communityRouterPathList = communityConfig.keys() || [];
      let uniqueToCommercialList = commercialRouterPathList.filter(item => !communityRouterPathList.includes(item));// 过滤不存在社区版的模块
      routerJsPathList.push(...communityRouterPathList, ...uniqueToCommercialList);
      routerJsPathList.forEach(routerPath => {
        const moduleId = routerPath.split('/')[1];
        let routeList = [];
        if (!this.$utils.isEmpty(commercialRouterPathList) && commercialRouterPathList.indexOf(routerPath) != -1) {
          routeList = [...(communityRouterPathList.indexOf(routerPath) != -1 ? communityConfig(routerPath).default : []), ...(commercialConfig(routerPath) ? commercialConfig(routerPath).default : [])];
        } else {
          routeList = (communityConfig(routerPath).default || []);
        }
        const menuList = routeList
          .filter(item => item.meta)
          .map(item => ({
            menuName: item.meta.title,
            menu: item.name,
            moduleName: '',
            module: moduleId,
            authority: item.meta.authority ? (typeof item.meta.authority == 'string' ? item.meta.authority : (typeof item.meta.authority == 'object' ? item.meta.authority.join(',') : '')) : ''
          }));
        if (menuList.length) {
          routerConfig[moduleId] = menuList;
        }
      });
      this.routerConfig = routerConfig;
    },
    getMenuAuthority(moduleId, menu) {
      let authorityItem = moduleId && this.routerConfig[moduleId] && this.routerConfig[moduleId].find((v) => menu.indexOf(v.menu) != -1);
      return authorityItem && authorityItem.authority;
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
                    authority: this.getMenuAuthority(item.moduleId, n.path)
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
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
