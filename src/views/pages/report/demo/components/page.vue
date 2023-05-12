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
    <TsContain>
      <template slot="topRight">
        <TsFormInput
          v-model="keyword"
          border="border"
          suffix="tsfont-search"
          placeholder="请输入"
          @on-change="getData(1)"
        ></TsFormInput>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="tableConfig"
          multiple
          @changeCurrent="getData"
          @changePageSize="getData(1, ...arguments)"
        >
        </TsTable>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  filters: {},
  props: {},
  data() {
    let _this = this;
    return {
      keyword: '',
      loading: false,
      tableConfig: {
        keyName: 'id',
        value: [],
        theadList: [
          {
            key: 'name',
            title: '名称',
            type: 'linktext',
            textValue: 'views'
          },
          {
            key: 'url',
            title: '地址'
          },
          {
            key: 'referenceCount',
            title: '数量'
          },
          { key: 'action', title: '', type: 'action', operations:
          [{icon: 'tsfont-edit', name: '编辑', type: 'text', style: ''},
            {icon: 'tsfont-trash-o', name: '删除', type: 'disabled', style: '', key: 'del', value: 'referenceCount', disabled: true},
            {icon: '', name: '状态', type: 'switch', style: '', key: 'isActive', value: 'referenceCount', disabled: 'state'},
            {icon: '', name: '状态', type: 'switch', style: '', key: 'isActive', value: 'referenceCount', disabled: 'disabled'}
          ]}
        ],
        tbodyList: [
          {name: 'textsasa', url: 'dsadsadlj', referenceCount: 100, isActive: 0},
          {name: 'textsasa', url: 'dsadsadlj', referenceCount: 200, isActive: 0},
          {name: 'textsasa', url: 'dsadsadlj', referenceCount: 10, isActive: 0},
          {name: 'textsasa', url: 'dsadsadlj', referenceCount: 0, isActive: 1},
          {name: 'textsasa', url: 'dsadsadlj', referenceCount: 60, isActive: 0}
        ],
        pageSize: 20,
        currentPage: 1
      },
      contentHeight: '100'
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  async mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
  },
  destroyed() {},
  methods: {
    getData() {

    }
  },
  computed: {
  },
  watch: {}
};
</script>
<style lang="less" scoped>

</style>
