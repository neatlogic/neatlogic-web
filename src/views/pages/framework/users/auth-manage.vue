<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topRight">
        <TsRow>
          <Col span="24">
            <CombineSearcher
              v-if="!$utils.isEmpty(defaultMenuList)"
              v-model="searchVal"
              v-bind="searchConfig"
              @change="searchAuthData()"
            >
              <template v-slot:defaultValue="{valueConfig, textConfig}">
                <TsFormSelect
                  v-model="valueConfig.defaultValue"
                  v-bind="defaultValueConfig"
                  @change="(val) => {
                    $set(valueConfig, 'defaultValue', null)
                    if(val) {
                      $set(valueConfig, 'defaultValue', val)
                    }
                  }"
                  @change-label="(label) => {
                    if(label) {
                      $set(textConfig, 'defaultValue', label);
                    } else {
                      $delete(textConfig, 'defaultValue')
                    }
                  }"
                >
                  <template v-slot:option="{item}">
                    <Tooltip placement="right">
                      <span>{{ item.text }}</span>
                      <div slot="content">
                        {{ getMenuName(item) }}
                      </div>
                    </Tooltip>
                  </template>
                </TsFormSelect>
              </template>
            </CombineSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content">
        <TsTable
          v-bind="tableConfig"
          :theadList="theadList"
        >
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-permission" @click="toAuthAdduserPage(row)">{{ $t('page.auth') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
  </div>
</template>

<script>
export default {
  name: 'AuthManage',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {},
  data() {
    return {
      groupName: '',
      loadingShow: true,
      defaultMenuList: [],
      authGroupList: [],
      searchVal: {},
      defaultValueConfig: {
        dataList: [],
        search: true,
        multiple: true,
        transfer: true
      },
      searchConfig: {
        search: true,
        placeholder: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.keyword')}),
        searchList: [
          {
            label: this.$t('term.framework.belongmodule'),
            type: 'select',
            name: 'groupName',
            url: '/api/rest/auth/group',
            clearable: false,
            search: true,
            defaultValueIsFirst: true,
            transfer: true,
            rootName: 'groupList',
            onChange: (groupName) => {
              this.searchVal.defaultValue = null;
              if (this.$utils.isEmpty(groupName) || groupName == 'all') {
                this.defaultValueConfig.dataList = this.defaultMenuList;
              } else {
                this.defaultValueConfig.dataList = this.defaultMenuList.filter((item) => item.groupName == groupName);
              }
            }
          },
          {
            type: 'slot',
            name: 'defaultValue',
            label: this.$t('page.menuname')
          }
        ]
      },
      tableConfig: {
        tbodyList: []
      },
      theadList: [
        {
          title: this.$t('term.framework.authname'),
          key: 'displayName'
        },
        {
          title: this.$t('term.framework.belongmodule'),
          key: 'authGroupName'
        },
        {
          title: this.$t('term.framework.authdesc'),
          key: 'description',
          width: 500
        },
        {
          title: this.$t('term.framework.usercount'),
          key: 'userCount'
        },
        {
          title: this.$t('term.framework.rolecount'),
          key: 'roleCount'
        },
        {
          key: 'action'
        }
      ]
    };
  },
  beforeCreate() {},
  async created() {
    await this.getAuthGrouplist();
    this.getRouterConfig();
    this.searchAuthData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getAuthGrouplist() {
      return this.$api.common.getAuthGroup().then(res => {
        if (res.Status == 'OK') {
          this.authGroupList = res.Return.groupList || [];
        }
      });
    },
    //获取权限列表
    searchAuthData() {
      let defaultValueList = [];
      this.defaultMenuList.forEach((item) => {
        if (item && item.value && this.searchVal.defaultValue && this.searchVal.defaultValue.includes(item.value) && item.authority) {
          defaultValueList.push(...item.authority.split(','));
        }
      });
      let data = {
        ...this.searchVal,
        defaultValue: this.$utils.uniqueArr(defaultValueList)
      };
      this.loadingShow = true;
      this.$addHistoryData('searchVal', this.searchVal);
      this.$api.framework.auth.getAuthList(data).then(res => {
        this.tableConfig.tbodyList = res.Return || [];
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    restoreHistory(historyData) {
      this.searchVal = historyData['searchVal'];
    },
    toAuthAdduserPage(item) {
      let {name = '', authGroup = ''} = item || {};
      this.$router.push({
        path: `auth-adduser`,
        query: { name: name, groupName: authGroup }
      });
    },
    getRouterConfig() {
      let routerConfig = {};
      let menuList = [];
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
            if (item.name && item.meta && item.meta.ismenu && item.meta.authority) {
              menuList.push({
                text: `${item.meta.title}`,
                value: `${item.name}_${item.path}_${key}`,
                groupName: key,
                authority: item.meta.authority ? (typeof item.meta.authority == 'string' ? item.meta.authority : (typeof item.meta.authority == 'object' ? item.meta.authority.join(',') : '')) : ''
              });
            }
          });
        }
      }
      this.defaultMenuList = this.$utils.deepClone(menuList);
      this.defaultValueConfig.dataList = menuList;
    },
    getCommercialRouter() {
      //商业版模块
      let routerConfig = {};
      let routerPathList = [];
      try {
        routerPathList.push(require.context('@/commercial-module', true, /router.js$/));
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
    }
  },
  filter: {},
  computed: {
    getMenuName() {
      return (item) => {
        let groupName = this.authGroupList.find((v) => v.value == item.groupName);
        return groupName && groupName.text ? `${item.text}(${groupName.text})` : item.text; 
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
