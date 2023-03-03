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
  <div class="tool-catalog-manage-wrap">
    <TsContain>
      <template v-slot:topLeft>
        <span class="ts-plus text-action" @click="openToolCatalogAdd">{{ $t('term.autoexec.directorytool') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <TsFormSelect
            v-model.trim="keyword"
            v-bind="selectTreeSetting"
            @on-change="searchKeyword"
            @enter-search="searchKeyword"
          ></TsFormSelect>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <ListNestingTree
            v-bind="treeSetting"
            :theadList="theadList"
            :loading="isLoading"
            :search="search"
            @operation="operation"
            @changeCurrent="getCatalogList"
            @changePageSize="getCatalogList(1, ...arguments)"
          ></ListNestingTree>
        </div>
      </template>
    </TsContain>
  
    <!-- 添加目录工具 -->
    <ToolCatalogAdd
      v-if="isShowToolCatalogAdd"
      :value="formValue"
      @close="closeToolCatalogAdd"
    ></ToolCatalogAdd>
  </div>
</template>
<script>
import ListNestingTree from './tool/list-nesting-tree';
import ToolCatalogAdd from './tool/tool-catalog-add'; // 目录工具(添加-编辑)
export default {
  name: 'ToolCatalogManage', // 工具目录管理
  components: {
    ListNestingTree,
    ToolCatalogAdd,
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve)
  },
  filters: {
  },
  props: {
  },
  data() {
    return {
      isLoading: false,
      keyword: '',
      formValue: {}, // 工具目录form表单值
      isShowToolCatalogAdd: false,
      search: false,
      searchList: [], // 搜索列表
      theadList: [
        {
          title: this.$t('page.name')
        }
      ],
      treeSetting: {
        tbodyList: [],
        currentPage: 1,
        rowNum: 0,
        pageSize: 10
      },
     
      children: [],
      selectTreeSetting: {
        name: 'id',
        value: '',
        placeholder: '请选择目录名称',
        search: true,
        multiple: false,
        width: '100%',
        dynamicUrl: '/api/rest/autoexec/catalog/search',
        rootName: 'tbodyList',
        dataList: [],
        textName: 'name',
        valueName: 'id',
        transfer: true,
        clear: true,
        border: 'border',
        enterSearch: true
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getCatalogList(1);
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    openToolCatalogAdd() {
      this.isShowToolCatalogAdd = true;
    },
    closeToolCatalogAdd(needRefresh) {
      // 更新列表数据
      this.isShowToolCatalogAdd = false;
      if (needRefresh) {
        this.getCatalogList();
      }
    },
    getCatalogList(currentPage, pageSize) {
      this.isLoading = true;
      let params = {
        currentPage: currentPage || this.treeSetting.currentPage,
        pageSize: pageSize || this.treeSetting.pageSize
      };
      this.$api.autoexec.catalog.getCatalogList(params).then((res) => {
        if (res.Status == 'OK') {
          this.isLoading = false;
          Object.assign(this.treeSetting, res.Return);
        }
      });
    },
    operation(params) {
      if (params && params.type == 'refresh') {
        // 刷新总条数
        this.getCatalogList(1);
      } 
    },
    searchKeyword() {
      // 搜索根据关键字
      if (this.keyword) {
        this.search = true;
        let params = {
          id: this.keyword,
          keyword: ''
        };
        this.$api.autoexec.catalog.searchCatalogByKeyword(params).then((res) => {
          if (res.Status == 'OK') {
            this.treeSetting.tbodyList = res.Return.children || [];
            this.treeSetting.rowNum = res.Return.children.length || 0;
          }
        });
      } else {
        this.getCatalogList(1);
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
