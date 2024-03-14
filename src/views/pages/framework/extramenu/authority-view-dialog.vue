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
                    @change="searchKeyword"
                  ></TsFormSelect>
                </Col>
                <Col span="18">
                  <InputSearcher
                    v-model="keyword"
                    :placeholder="$t('page.keyword')"
                    @change="searchKeyword"
                  ></InputSearcher>
                </Col>
              </TsRow>
            </template>
            <div slot="content">
              <TsTable
                v-bind="tableConfig"
                :theadList="theadList"
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
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isShow: true,
      moduleName: '',
      keyword: '',
      moduleList: [],
      menuList: [],
      groupList: [],
      tableConfig: {
        tbodyList: [],
        currentPage: 1,
        pageSize: 20
      },
      defaultTbodyList: [],
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
    this.getRouterConfig();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
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
      this.tableConfig.tbodyList = [];
      let routerConfig = {};
      let routerPathList = [require.context('@/views/pages', true, /router.js$/)];
      routerPathList.forEach(item => {
        if (item && item.keys()) {
          item.keys().forEach(routerPath => {
            const moduleNames = routerPath.split('/')[1];
            const lastValue = moduleNames.split('-');
            const moduleName = lastValue?.pop() || moduleNames;
            const routeList = item(routerPath).default || [];
            routerConfig[moduleName] = routeList;
          });
        }
      });
      let commercialRouterConfig = this.getCommercialRouter();
      Object.keys(commercialRouterConfig).forEach(key => {
        if (!routerConfig[key]) {
          //模块引入
          routerConfig[key] = commercialRouterConfig[key];
        }
      });
      for (let key in routerConfig) {
        if (key) {
          routerConfig[key].forEach((item) => {
            if (item.name && item.meta && item.meta.ismenu) {
              this.tableConfig.tbodyList.push({
                module: key,
                moduleName: this.handleModuleName(key),
                menuName: item.name ? (item.meta.title ? `${item.meta.title}(${item.name})` : item.name) : '',
                authority: item.meta.authority ? (typeof item.meta.authority == 'string' ? item.meta.authority : (typeof item.meta.authority == 'object' ? item.meta.authority.join(',') : '')) : ''
              });
            }
          });
        }
      }
      this.defaultTbodyList = this.tableConfig.tbodyList; 
    },
    getCommercialRouter() {
      //商业版模块
      let routerConfig = {};
      let routerPathList = [];
      try {
        routerPathList.push(require.context('@/commercial-module', true, /\.router\.js$/));
      } catch {
        // 模块找不到
      }
      routerPathList.forEach(item => {
        if (item && item.keys()) {
          item.keys().forEach(routerPath => {
            const moduleNames = routerPath.split('/')[1];
            const lastValue = moduleNames.split('-');
            const moduleName = lastValue?.pop() || moduleNames;
            const routeList = item(routerPath).default || [];
            routerConfig[moduleName] = routeList;
          });
        }
      });
      return routerConfig;
    },
    handleModuleName(module) {
      let moduleConfig = this.groupList.find((item) => item.value == module);
      if (moduleConfig) {
        return `${moduleConfig.text}(${moduleConfig.value})`;
      }
    },
    searchKeyword() {
      let keyword = this.keyword ? this.keyword.toUpperCase() : '';
      this.tableConfig.tbodyList = this.$utils.deepClone(this.defaultTbodyList);
      if (this.$utils.isEmpty(keyword) && !this.$utils.isEmpty(this.moduleName)) {
        this.tableConfig.tbodyList = this.tableConfig.tbodyList.filter((item) => 
          item.moduleName.indexOf(this.moduleName) != -1 
        );
        return false;
      }
      this.tableConfig.tbodyList = this.tableConfig.tbodyList.filter((item) => 
        item.moduleName.indexOf(keyword) != -1 || item.menuName.indexOf(keyword) != -1 || item.authority.indexOf(keyword) != -1
      );
      if (this.moduleName) {
        this.tableConfig.tbodyList = this.tableConfig.tbodyList.filter((item) => 
          item.moduleName.indexOf(this.moduleName) != -1
        );
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
