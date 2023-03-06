/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div>
    <div class="pb-md">
      <FilterSearch
        :defaultValue="searchVal"
        :defaultSearchValue="defaultSearchValue"
        class="search"
        @changeValue="changeValue"
      ></FilterSearch>
    </div>
    <div v-if="!loadingShow">
      <TsTable
        ref="table"
        v-bind="tableData"
        @changeCurrent="getDataList('currentPage',...arguments)"
        @changePageSize="getDataList('pageSize',...arguments)"
      >
        <template v-slot:appModuleName="{row}">
          <span v-if="row.appModuleName || row.appModuleAbbrName">
            <span v-if="row.appModuleName">{{ row.appModuleName }}</span>
            <span v-if="row.appModuleAbbrName" class="text-tip">({{ row.appModuleAbbrName }})</span>
          </span>
          <span v-else>-</span>
        </template>
        <template v-slot:appSystemName="{row}">
          <span v-if="row.appSystemName || row.appSystemAbbrName">
            <span v-if="row.appSystemName">{{ row.appSystemName }}</span>
            <span v-if="row.appSystemAbbrName" class="text-tip">({{ row.appSystemAbbrName }})</span>
          </span>
          <span v-else>-</span>
        </template>
      </TsTable>
    </div>
  </div>
</template>
<script>
import FilterSearch from './filter-search.vue';
export default {
  name: '',
  components: {
    FilterSearch,
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  filters: {
  },
  props: {
    config: Object
  },
  data() {
    return {
      searchVal: {},
      theadList: [
        { title: 'ip', key: 'ip'},
        { title: '端口', key: 'port'},
        { title: this.$t('page.name'), key: 'name'},
        { title: '标签', key: 'tagList', type: 'tag'},
        { title: '环境', key: 'envName'},
        { title: '模型类型', key: 'typeLabel'},
        { title: '模块', key: 'appModuleName'},
        { title: '应用', key: 'appSystemName'},
        { title: '资产状态', key: 'stateName'},
        { title: '网络区域', key: 'networkArea'},
        { title: '所属部门', key: 'bgList', type: 'usercards'},
        { title: '所有者', key: 'ownerList', type: 'usercards'},
        { title: '维护期', key: 'maintenanceWindow'},
        { title: this.$t('page.description'), key: 'description'}
      ],
      tableData: null,
      currentPage: 1,
      pageSize: 10,
      loadingShow: true,
      defaultSearchValue: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchNodeList(param) {
      let data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize
      };
      if (param) {
        Object.assign(data, param);
      }
      this.$api.common.getNodeList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.$set(this.tableData, 'theadList', this.theadList);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getDataList(type, value) {
      type == 'pageSize' && (this.pageSize = value);
      let param = {
        currentPage: type == 'currentPage' ? value : this.currentPage,
        pageSize: type == 'pageSize' ? value : this.pageSize
      };
      param = Object.assign(param, this.searchVal);
      this.searchNodeList(param);
    },
    changeValue(val) {
      this.searchVal = this.$utils.deepClone(val);
      this.getDataList('currentPage', 1);
    },
    init() {
      if (this.config && this.config.filter) {
        let defaultSearchValue = this.config.filter;
        this.defaultSearchValue = defaultSearchValue;
        this.searchVal = defaultSearchValue;
      }
      this.getDataList();
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val) {
        this.init();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.search{
  width: 80%;
}
</style>
