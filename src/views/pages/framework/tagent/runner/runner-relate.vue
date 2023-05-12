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
  <div class="runner-relate-wrap">
    <div class="tsfont-plus text-action mb-md text" @click="openRunner">{{ $t('term.deploy.associatedrunner') }}</div>
    <TsTable
      v-bind="tableSetting"
      @changeCurrent="getTableList"
      @changePageSize="getTableList"
    >
      <template slot="action" slot-scope="{ row, index }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="ts-trash-s" @click="delOperation(row, index)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>

    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <RunnerRelateComponent
            v-model="selectedList"
            :groupId="groupId"
            class="runner-relate-wrap"
            :isShowHeader="false"
          ></RunnerRelateComponent>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import RunnerRelateComponent from './components/runner-relate-component';
export default {
  name: 'RunnerRelate', // 关联runner
  components: {
    RunnerRelateComponent,
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  filters: {},
  props: {
    groupId: {
      // 分组id
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      selectedList: [], // 选中的列表
      dialogSetting: {
        type: 'modal',
        mode: 'dialog',
        title: this.$t('term.deploy.associatedrunner'),
        isShow: false
      },
      tableSetting: {
        theadList: [
          {
            title: '#',
            key: 'id'
          },
          {
            title: this.$t('page.name'),
            key: 'name'
          },
          {
            title: this.$t('term.deploy.connectionmode'),
            key: 'authType'
          }, 
          {
            title: 'IP',
            key: 'host'
          },
          {
            title: this.$t('page.protocol'),
            key: 'protocol'
          },
          {
            title: this.$t('term.deploy.commandport'),
            key: 'port'
          },
          {
            title: this.$t('term.deploy.heartbeatport'),
            key: 'nettyPort'
          },
          { 
            key: 'action', 
            title: ''
          }
        ],
        hideAction: false,
        multiple: true,
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
    openRunner() {
      // 点击关联Runner，弹出关联列表
      this.dialogSetting.isShow = true;
    },
    okDialog() {
      let arr = this.selectedList;
      for (let index = 0; index < arr.length; index++) {
        arr[index]['isDel'] = true;
      }
      this.$set(this.tableSetting, 'tbodyList', this.$utils.uniqueArr([...this.tableSetting.tbodyList, ...arr]));
      this.closeDialog();
    },
    closeDialog() {
      this.dialogSetting.isShow = false;
      this.emitValue();
    },
    emitValue() {
      this.$emit('input', this.tableSetting.tbodyList);
    },
    delOperation(row, index) {
      // 删除操作
      if (!row) {
        return; 
      }
      if (row.id && row.hasOwnProperty('isDel')) {
        this.tableSetting.tbodyList.splice(index, 1);
        this.emitValue();
      } else {
        this.tableSetting.tbodyList.splice(index, 1);
        this.emitValue();
      }
    },
    getTableList(currentPage, pageSize) {
      let params = {
        groupId: this.groupId ? this.groupId : '',
        keyword: '',
        needPage: false,
        currentPage: currentPage || this.tableSetting.currentPage,
        pageSize: pageSize || this.tableSetting.pageSize
      };
      this.$api.framework.runner.getRunner(params).then((res) => {
        if (res.Status == 'OK') {
          Object.assign(this.tableSetting, res.Return);
          this.emitValue();
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
@import "./src/common.less";
.runner-relate-wrap {
  /deep/ .tscontain-header {
    height: 0;
  }
  /deep/ .tstable-body {
    height: 0;
  }
  /deep/ .tscontain-body {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}
</style>
