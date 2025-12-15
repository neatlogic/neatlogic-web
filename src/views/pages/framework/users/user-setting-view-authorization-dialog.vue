<template>
  <div>
    <TsDialog v-bind="dialogSetting" @on-close="closeDialog">
      <template v-slot>
        <div class="pt-md pl-md pr-md">
          <TsRow class="mb-nm">
            <Col span="10"></Col>
            <Col span="14">
              <CombineSearcher v-model="searchValue" v-bind="searchConfig" @change="filterAuthByCondition"></CombineSearcher>
            </Col>
          </TsRow>
          <TsTable :theadList="theadList" :tbodyList="tbodyList">
            <template slot="authName" slot-scope="{ row }">
              <span>{{ row.authName }}</span>
              <span class="text-grey">&nbsp;&nbsp;{{ row.auth }}</span>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import BaseMenuMixin from './base-menu-mixin';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue')
  },
  mixins: [BaseMenuMixin],
  props: {
    userAuthList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      keyword: '',
      searchValue: {},
      selectedMenuList: [],
      searchConfig: {
        search: true,
        placeholder: this.$t('form.placeholder.pleaseinput', { target: this.$t('page.keyword') }),
        searchList: [
          {
            type: 'cascader',
            dataList: [],
            name: 'menuName',
            label: this.$t('page.menuname'),
            transfer: true,
            filterable: true,
            onChange: (val, selectedList) => {
              let authList = [];
              let tempList = [];
              selectedList.forEach((v) => {
                if (v && v.authority) {
                  tempList = v.authority.split(',');
                  if (tempList && tempList.length > 0) {
                    tempList.forEach((v) => {
                      if (v) {
                        authList.push(v.toUpperCase());
                      }
                    });
                  }
                }
              });
              this.selectedMenuList = authList;
            }
          }
        ]
      },
      dialogSetting: {
        isShow: true,
        width: 'medium',
        type: 'slide',
        hasFooter: false,
        hasContentPadding: false
      },
      theadList: [
        {
          title: this.$t('term.framework.authname'),
          key: 'authName'
        },
        {
          title: this.$t('term.framework.belongmodule'),
          key: 'groupName'
        }
      ],
      tbodyList: [],
      defaultTbodyList: [],
      groupList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async initData() {
      await this.searchgroupListData();
      let userAuthList = [];
      if (!this.$utils.isEmpty(this.userAuthList)) {
        userAuthList = this.userAuthList.map(v => ({
          ...(v || {}),
          groupName: this.getGroupName(v.authGroup)
        }));
      }
      this.tbodyList = userAuthList || [];
      this.defaultTbodyList = userAuthList || [];
      const dataList = this.getMenuInfoList({ groupList: this.groupList }) || [];
      this.searchConfig.searchList.forEach((v) => {
        if (v && v.name === 'menuName') {
          v.dataList = dataList;
        }
      });
    },
    getGroupName(group) {
      const findItem = this.groupList.find(v => v.value === group);
      return findItem?.text;
    },
    searchgroupListData() {
      return this.$api.common.getAuthGroup().then(res => {
        if (res.Status == 'OK') {
          this.groupList = res?.Return?.groupList || [];
        }
      });
    },
    filterAuthByCondition() {
      const { keyword = '', menuName = [] } = this.searchValue || {};
      if (keyword) {
        const lowerKeyword = keyword?.toLowerCase();
        const upperKeyword = keyword?.toUpperCase();
        this.tbodyList = this.defaultTbodyList.filter((v) => v.authName.includes(lowerKeyword) || v.auth.includes(upperKeyword) || v.groupName.includes(lowerKeyword));
        if (menuName && menuName.length > 0 && this.selectedMenuList.length > 0) {
          this.tbodyList = this.tbodyList.filter((v) => v?.auth && this.selectedMenuList.includes(v.auth));
        }
      } else {
        if (menuName && menuName.length > 0 && this.selectedMenuList.length > 0) {
          this.tbodyList = this.defaultTbodyList.filter((v) => v?.auth && this.selectedMenuList.includes(v.auth));
        } else {
          this.tbodyList = this.defaultTbodyList;
        }
      }
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
