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
  <div class="runner-manage">
    <div class="flex-between mb-md">
      <div>
        <span class="text-action tsfont-plus mr-md" @click="addRunner">新建Runner</span>
        <span class="tsfont-rotate-right text-action text" @click="refreshList">刷新</span>
      </div>
      <InputSearcher
        v-model="inputSetting.value"
        v-bind="inputSetting"
        @change="getTableList(1,20)"
      ></InputSearcher>
    </div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <TsTable
      :theadList="theadList"
      v-bind="tableSetting"
      @getSelected="getSelected"
      @operation="operation"
      @changeCurrent="getTableList"
      @changePageSize="getTableList(1, ...arguments)"
    >
      <template slot="usedCount" slot-scope="{ row }">
        <ReferenceSelect
          :isTable="true"
          :dataList="row.runnerGroupVoList"
          :isUrl="false"
          textName="name"
          valueName="id"
          jumpPath="/framework.html#/tagent-add?id="
          :referenceCount="row.usedCount"
        ></ReferenceSelect>
      </template>
    </TsTable>
  </div>
</template>
<script>
export default {
  name: 'RelateRunnerList', // 关联runner列表
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    ReferenceSelect: resolve => require(['@/resources/components/ReferenceSelect/ReferenceSelect.vue'], resolve)
  },
  filters: {
  },
  props: {},
  data() {
    return {
      inputSetting: {
        placeholder: '名称、IP',
        value: ''
      },
      loadingShow: false,
      theadList: [
        {
          key: 'selection',
          multiple: true
        },
        {
          title: '#',
          key: 'id'
        },
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '连接方式',
          key: 'authType'
        }, 
        {
          title: 'IP',
          key: 'host'
        },
        {
          title: '协议',
          key: 'protocol'
        },
        {
          title: '命令端口',
          key: 'port'
        },
        {
          title: '心跳端口',
          key: 'nettyPort'
        },
        {
          title: '关联组',
          key: 'usedCount'
        },
        { 
          key: 'action', 
          title: '', 
          type: 'action',
          operations: [
            {
              name: '删除',
              icon: 'ts-trash-s',
              type: 'text',
              action: 'del'
            }
          ] 
        }
      ],
      tableSetting: {
        tbodyList: [],
        currentPage: 1,
        pageSize: 20
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getTableList();
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
    addRunner() {
      // 新建runner
      window.open(HOME + '/framework.html#/runner-manage?type=add', '_blank');
    },
    refreshList() {
      this.getTableList();
    },
    operation(view, row) {
      if (view == 'del' && row) {
        this.$createDialog({
          title: '警告',
          content: `确认删除Runner<span style="color: red">${row.name}</span>?`,
          btnType: 'error',
          'on-ok': vnode => {
            vnode.isShow = false;
            this.$api.framework.runner.deleteRunner(row.id).then((res) => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.content.deletesuccess'));
                this.getTableList();
              }
            });
          }
        });
      }
    },
    getSelected(id, row) {
      this.$emit('input', row);
    },
    getTableList(currentPage, pageSize) {
      // 获取列表数据
      let params = {
        groupId: null,
        isFilterGroup: null,
        keyword: this.inputSetting.value,
        needPage: false,
        currentPage: currentPage || this.tableSetting.currentPage,
        pageSize: pageSize || this.tableSetting.pageSize
      };
      this.loadingShow = true;
      this.$api.framework.runner.getRunner(params)
        .then(res => {
          if (res.Status == 'OK') {
            Object.assign(this.tableSetting, res.Return);
          }
        }).finally(() => {
          this.loadingShow = false;
        });
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
</style>
