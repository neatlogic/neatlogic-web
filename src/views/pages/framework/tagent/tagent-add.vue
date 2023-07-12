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
  <div class="tagent-add-wrap">
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="tsfont-plus action-item" @click="addGroud()">{{ $t('page.group') }}</span>
          <span class="tsfont-proxy action-item" @click="goRunner()">{{ $t('term.framework.actuator') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="keyword"
            :placeholder="$t('message.framework.addtagentpla')"
            @change="getTableData(1)"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            v-bind="tableConfig"
            @operation="operation"
            @changeCurrent="getTableData"
            @changePageSize="getTableData(1, ...arguments)"
          >
            <template slot="groupNetworkList" slot-scope="{ row }">
              <!-- 网段IP/子网掩码 -->
              <div v-if="row.groupNetworkList.length > 0">
                <div v-for="item in row.groupNetworkList" :key="item.id">
                  {{ item.networkIp }} / {{ item.mask }}
                </div>
              </div>
            </template>
            <template slot="runnerCount" slot-scope="{ row }">
              <div>
                <span v-if="row.runnerCount > 0" class="text-href" @click.stop="showRunnerManage(row)">{{ row.runnerCount }}</span>
                <span v-else>{{ row.runnerCount }}</span>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>

    <!-- 添加分组 -->
    <GroupAddDialog
      v-if="isShowGroupAddDialog"
      :runnerGroupData="runnerGroupData"
      @close="closeGroupAddDialog"
    ></GroupAddDialog>

    <!-- 编辑分组 -->
    <GroupEditDialog
      v-if="isShowRunnerGroupEdit"
      :runnerGroupData="runnerGroupData"
      @close="closeGroupEditDialog"
    ></GroupEditDialog>

    <!-- runner管理 -->
    <TsDialog
      v-bind="runnerManageDialog"
      @on-ok="saveRunnerDialog"
      @on-close="cancleDialog"
    >
      <template v-slot>
        <div class="runner-relate-reduce-margin-top">
          <RunnerRelate v-model="runnerList" :groupId="groupId"></RunnerRelate>
        </div>
      </template>
    </TsDialog>
  </div>
 
</template>
<script>
export default {
  name: 'TagentAdd',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    GroupAddDialog: resolve => require(['./runner/group-add-dialog.vue'], resolve),
    GroupEditDialog: resolve => require(['./runner/group-edit-dialog.vue'], resolve),
    RunnerRelate: resolve => require(['./runner/runner-relate.vue'], resolve)
  },
  filters: {},
  props: {
    value: [Array, Object]
  },
  data() {
    return {
      keyword: '', // 搜索关键词
      groupId: '', // 点击runner数量组id
      runnerList: [], // runnerList 点击runner数量
      runnerRowData: {}, // 点击数量，获取行的数据
      isShowGroupAddDialog: false,
      isShowRunnerGroupEdit: false,
      runnerGroupData: {},
      runnerManageDialog: {
        type: 'modal',
        isShow: false,
        title: this.$t('term.framework.runnerlist'),
        okText: this.$t('page.save'),
        className: 'runner-relate-container'
      },
      tableConfig: {
        theadList: [
          {
            key: 'name',
            title: this.$t('page.name'),
            type: 'linktext',
            textValue: 'edit'
          },
          {
            key: 'groupNetworkList',
            title: this.$t('term.framework.ipnetwork'),
            type: 'tag',
            textName: 'workName'
          },
          {
            key: 'runnerCount',
            title: this.$t('term.framework.runnercount')
          },
          {
            key: 'description',
            title: this.$t('page.description')
          },
          { key: 'action', title: '', type: 'action', operations:
          [
            {icon: 'tsfont-trash-o', name: this.$t('page.delete'), action: 'del', key: 'name', type: 'text'}
          ]
          }
        ],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1,
        tbodyList: [],
        loading: false
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getTableData(1).then(() => {
      this.getQuery();
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getQuery() {
      let query = this.$route.query;
      if (!this.$utils.isEmptyObj(query) && query.id) {
        this.isShowRunnerGroupEdit = true; // 显示编辑页面
        if (!this.$utils.isEmpty(this.tableConfig.tbodyList)) {
          let arr = this.tableConfig.tbodyList.filter((val) => {
            return val.id == query.id;
          });
          this.runnerGroupData = !this.$utils.isEmpty(arr) ? arr[0] : [];
        }
      }
    },
    saveRunnerDialog() {
      // 点击Runner数量，保存runner
      let params = Object.assign(this.runnerRowData, {
        runnerList: this.runnerList
      });
      this.$api.framework.runner.saveRunnerGroup(params).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.cancleDialog();
          this.getTableData();
        }
      });
    },
    cancleDialog() {
      this.runnerManageDialog.isShow = false;
    },
    goRunner() {
      // 跳转runner管理页面
      this.$router.push({ 
        path: '/runner-manage'
      });
    },
    showRunnerManage(row) {
      // 点击runner数量，显示runner管理页面
      this.runnerManageDialog.isShow = true;
      this.groupId = row ? row.id : '';
      this.runnerRowData = row;
    },
    operation(view, row) {
      if (view === 'del') {
        this.delRunnerGroup(row);
      } else if (row == 'edit') {
        this.runnerGroupData = view;
        this.isShowRunnerGroupEdit = true;
      }
    },
    addGroud() {
      // 添加分组按钮模态框
      this.runnerGroupData.id = '';
      this.isShowGroupAddDialog = true;
    },
    async getTableData(currentPage, pageSize) {
      // 获取列表数据
      let params = {
        keyword: this.keyword, // 关键字
        currentPage: currentPage || this.tableConfig.currentPage,
        pageSize: pageSize || this.tableConfig.pageSize
      };
      this.tableConfig.loading = true;
      return await this.$api.framework.runner.getRunnerGroup(params)
        .then(res => {
          if (res.Status == 'OK') {
            Object.assign(this.tableConfig, res.Return);
            this.tableConfig.loading = false;
          }
        });
    },
    delRunnerGroup(row) {
      // 删除runner组
      if (!row.id) {
        return false;
      }
      // 删除确认提示框
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.group')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.runner.delRunnerGroup(row.id)
            .then((res) => {
              if (res.Status == 'OK') {
                this.getTableData();
                this.$Message.success(this.$t('message.deletesuccess'));
              }
            }).finally(res => {
              vnode.isShow = false;
            });
        }
      });
    },
    closeGroupAddDialog(needRefresh) {
      this.isShowGroupAddDialog = false;
      if (needRefresh) {
        this.getTableData();
      }
    },
    closeGroupEditDialog(needRefresh) {
      this.isShowRunnerGroupEdit = false;
      if (needRefresh) {
        this.getTableData();
      }
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
@import "./runner/src/common.less";
</style>
