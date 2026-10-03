<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template slot="topRight">
        <CombineSearcher
          v-model="searchVal"
          v-bind="searchConfig"
          @change="searchAuthData()"
        ></CombineSearcher>
      </template>
      <div slot="content">
        <TsTable v-bind="tableConfig" :theadList="theadList">
          <template v-slot:userCount="{ row }">
            <Badge :count="row.userCount" type="primary"></Badge>
          </template>
          <template v-slot:roleCount="{ row }">
            <Badge :count="row.roleCount" type="primary"></Badge>
          </template>
          <template slot="displayName" slot-scope="{ row }">
            <div>
              <span>{{ row.displayName }}</span>
              <span v-if="row.name" class="text-grey">·{{ row.name }}</span>
              <span v-if="row.commercial">
                <Tooltip placement="top" :transfer="true" :content="$t('term.framework.commercialauth')">
                  <span class="ml-xs tsfont-star text-warning"></span>
                </Tooltip>
              </span>
            </div>
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
import BaseMenuMixin from './base-menu-mixin';
export default {
  name: 'AuthManage',
  components: {
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  mixins: [BaseMenuMixin],
  props: {},
  data() {
    return {
      loadingShow: true,
      groupList: [],
      searchVal: { groupName: 'all' },
      searchConfig: {
        labelPosition: 'left',
        search: true,
        placeholder: this.$t('form.placeholder.pleaseinput', { target: this.$t('page.keyword') }),
        searchList: [
          {
            type: 'select',
            name: 'groupName',
            label: this.$t('term.framework.belongmodule'),
            dataList: [],
            search: true,
            clearable: true,
            transfer: true
          },
          {
            type: 'cascader',
            name: 'defaultValue',
            label: this.$t('page.menuname'),
            dataList: [],
            transfer: true,
            filterable: true
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
  created() {},
  beforeMount() {},
  async mounted() {
    await this.searchGroupNameData();
    this.searchAuthData();
  },
  beforeUpdate() {},
  updated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    //模块选项同时用于组合搜索和菜单分组，因此在页面统一加载。
    searchGroupNameData() {
      return this.$api.common.getAuthGroup().then(res => {
        if (res.Status == 'OK') {
          this.groupList = res.Return.groupList || [];
          //整体更新配置以同步模块与菜单选项，避免修改嵌套配置字段。
          this.searchConfig = {
            ...this.searchConfig,
            searchList: this.searchConfig.searchList.map(item => {
              if (item.name === 'groupName') {
                return { ...item, dataList: this.groupList };
              }
              return { ...item, dataList: this.menuDataList };
            })
          };
        }
      });
    },
    //根据当前组合条件计算菜单权限，删除菜单或清空条件后不沿用旧权限过滤。
    searchAuthData() {
      this.loadingShow = true;
      const selectedMenus = this.searchVal.defaultValue || [];
      const defaultValue = this.menuDataList.flatMap(group => (group.children || [])
        .filter(menu => selectedMenus.includes(menu.value) && menu.authority)
        .flatMap(menu => menu.authority.split(',').filter(Boolean)));
      const data = {
        groupName: this.searchVal.groupName || 'all',
        defaultValue: [...new Set(defaultValue)],
        keyword: this.searchVal.keyword
      };
      //保留旧历史格式的兼容字段；清除模块时写 all，防止返回后恢复过期模块。
      this.$addHistoryData('groupName', data.groupName);
      this.$addHistoryData('searchVal', this.searchVal);
      return this.$api.framework.auth
        .getAuthList(data)
        .then(res => {
          this.tableConfig.tbodyList = res.Return || [];
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    //优先恢复统一搜索状态，只在旧状态缺少模块字段时读取独立模块历史。
    restoreHistory(historyData) {
      this.searchVal = { ...(historyData.searchVal || {}) };
      if (!Object.prototype.hasOwnProperty.call(this.searchVal, 'groupName')) {
        this.$set(this.searchVal, 'groupName', historyData.groupName || 'all');
      }
    },
    //进入当前权限的成员配置页，传递既有权限名称和所属模块。
    toAuthAdduserPage(item) {
      let { name = '', authGroup = '' } = item || {};
      this.$router.push({
        path: `auth-adduser`,
        query: { name: name, groupName: authGroup }
      });
    }
  },
  filter: {},
  computed: {
    //菜单数据由当前模块选项派生，保留公共菜单转换逻辑。
    menuDataList() {
      return this.getMenuInfoList({ groupList: this.groupList }) || [];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
