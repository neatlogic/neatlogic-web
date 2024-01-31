<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topRight">
        <TsRow>
          <Col span="8">
            <TsFormSelect
              v-model="groupName"
              :dataList="groupList"
              :defaultValueIsFirst="true"
              :search="true"
              :clearable="false"
              transfer
              border="border"
              @change="searchAuthData()"
            ></TsFormSelect>
          </Col>
          <Col span="16">
            <CombineSearcher
              v-if="searchConfig.searchList[0].dataList.length > 0"
              v-model="searchVal"
              v-bind="searchConfig"
              @change="searchAuthData()"
            >
            </CombineSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content">
        <TsTable
          v-bind="tableConfig"
          :theadList="theadList"
        >
          <template slot="displayName" slot-scope="{ row }">
            <Tooltip placement="top" :transfer="true">
              <span>{{ row.displayName }}</span>
              <div slot="content">
                {{ row.displayName }}{{ row.name ? `(${row.name})` : '' }}
              </div>
            </Tooltip>
          </template>
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
      groupList: [],
      defaultValueList: [],
      searchVal: {},
      tableConfig: {
        tbodyList: []
      },
      searchConfig: {
        search: true,
        placeholder: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.keyword')}),
        searchList: [
          {
            type: 'cascader',
            dataList: [],
            name: 'defaultValue',
            label: this.$t('page.menuname'),
            transfer: true,
            filterable: true,
            onChange: (val, selectedList) => {
              this.defaultValueList = selectedList.filter(item => item.authority).map((v) => v.authority);
            }
          }
        ]
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
    await this.searchGroupNameData();
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
    searchGroupNameData() {
      return this.$api.common.getAuthGroup().then(res => {
        if (res.Status == 'OK') {
          this.groupList = res.Return.groupList || [];
        }
      });
    },
    //获取权限列表
    searchAuthData() {
      this.loadingShow = true;
      let defaultValue = [];
      this.defaultValueList.forEach((item) => {
        if (item) {
          defaultValue.push(...item.split(','));
        }
      });
      const data = {
        groupName: this.groupName,
        defaultValue: [...new Set(defaultValue)], // new set 数组去重
        keyword: this.searchVal.keyword
      };
      this.$addHistoryData('groupName', this.groupName);
      this.$addHistoryData('searchVal', this.searchVal);
      this.$api.framework.auth.getAuthList(data).then(res => {
        this.tableConfig.tbodyList = res.Return || [];
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    restoreHistory(historyData) {
      this.searchVal = historyData['searchVal'];
      this.groupName = historyData['groupName'];
    },
    toAuthAdduserPage(item) {
      let {name = '', authGroup = ''} = item || {};
      this.$router.push({
        path: `auth-adduser`,
        query: { name: name, groupName: authGroup }
      });
    },
    getRouterConfig() {
      const routerConfig = {};
      const dataList = [];

      const routerPathList = [require.context('@/views/pages', true, /router.js$/)];
      routerPathList.forEach(item => {
        item.keys().forEach(routerPath => {
          const moduleNames = routerPath.split('/')[1];
          const moduleName = moduleNames.split('-').pop() || moduleNames;
          const routeList = item(routerPath).default || [];
          routerConfig[moduleName] = routeList;
        });
      });

      const commercialRouterConfig = this.getCommercialRouter();
      Object.keys(commercialRouterConfig)
        .filter(key => !routerConfig[key])
        .forEach(key => {
          routerConfig[key] = commercialRouterConfig[key];
        });
      for (let key in routerConfig) {
        let groupItem = this.groupList.find((item) => item.value == key); 
        if (key && !this.$utils.isEmpty(groupItem) && !this.$utils.isEmpty(groupItem.text)) {
          dataList.push({
            text: groupItem.text,
            value: key,
            children: []
          });
          routerConfig[key].forEach((item) => {
            if (item.name && item.meta && item.meta.ismenu && item.meta.authority) {
              let childrenItem = dataList.find((item) => item.value == key);
              if (!this.$utils.isEmpty(childrenItem)) {
                childrenItem.children.push({
                  text: `${item.meta.title}`,
                  value: `${item.name}_${item.path}_${key}`,
                  authority: item.meta.authority ? (typeof item.meta.authority == 'string' ? item.meta.authority : (typeof item.meta.authority == 'object' ? item.meta.authority.join(',') : '')) : ''
                });
              }
            }
          });
        }
      }
      this.searchConfig.searchList.forEach((item) => {
        if (item.name == 'defaultValue') {
          item.dataList = dataList;
        }
      });
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
            const moduleName = moduleNames.split('-').pop() || moduleNames;
            const routeList = (item(routerPath).default || []);
            routerConfig[moduleName] = routeList;
          });
        }
      });
      return routerConfig;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
