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
            ></CombineSearcher>
          </Col>
        </TsRow>
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
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  mixins: [BaseMenuMixin],
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
        placeholder: this.$t('form.placeholder.pleaseinput', { target: this.$t('page.keyword') }),
        searchList: [
          {
            type: 'cascader',
            dataList: [],
            name: 'defaultValue',
            label: this.$t('page.menuname'),
            transfer: true,
            filterable: true,
            onChange: (val, selectedList) => {
              this.defaultValueList = selectedList.filter(item => item.authority).map(v => v.authority);
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
  created() {},
  beforeMount() {},
  async mounted() {
    await this.searchGroupNameData();
    this.setMenuDataList();
    this.searchAuthData();
  },
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
          if (this.$utils.isEmpty(this.groupName)) {
            this.groupName = !this.$utils.isEmpty(this.groupList) ? this.groupList[0].value : '';
          }
        }
      });
    },
    //获取权限列表
    searchAuthData() {
      this.loadingShow = true;
      let defaultValue = [];
      if (this.searchVal && !this.$utils.isEmpty(this.searchVal.defaultValue)) {
        this.defaultValueList.forEach(item => {
          if (item) {
            defaultValue.push(...item.split(','));
          }
        });
      }
      const data = {
        groupName: this.groupName,
        defaultValue: [...new Set(defaultValue)], // new set 数组去重
        keyword: this.searchVal.keyword
      };
      this.$addHistoryData('groupName', this.groupName);
      this.$addHistoryData('searchVal', this.searchVal);
      this.$api.framework.auth
        .getAuthList(data)
        .then(res => {
          this.tableConfig.tbodyList = res.Return || [];
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    restoreHistory(historyData) {
      this.searchVal = historyData['searchVal'];
      this.groupName = historyData['groupName'];
    },
    toAuthAdduserPage(item) {
      let { name = '', authGroup = '' } = item || {};
      this.$router.push({
        path: `auth-adduser`,
        query: { name: name, groupName: authGroup }
      });
    },
    setMenuDataList() {
      const dataList = this.getMenuInfoList({groupList: this.groupList}) || [];
      this.searchConfig.searchList.forEach(item => {
        if (item.name == 'defaultValue') {
          item.dataList = dataList;
        }
      });
      this.defaultValueList = dataList.flatMap(item => (item.children || []).flatMap(v => (v && this.searchVal && this.searchVal.defaultValue && this.searchVal.defaultValue.includes(v.value) && v.authority ? [v.authority] : []))); // flatMap 将结果展开一级
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
