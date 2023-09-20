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
  <div class="upgrade-record-wrap">
    <span class="text-action tsfont-formtime upgrade-record-margin-right" @click="handleUpgradeRecord">{{ $t('term.framework.upgrecord') }}</span>
    <TsDialog
      type="modal"
      :isShow="isShowDialog"
      v-bind="dialogConfig"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div>{{ getTitleName() }}</div>
      </template>
      <template v-slot>
        <div v-if="isShowOtherTable =='one'">
          <div class="flex-end mb-md">
            <InputSearcher
              v-model="tableData.fcuName"
              v-bind="recordListForm.fcuName"
              @change="getRecordList(1,10)"
            ></InputSearcher>
          </div>
          <TsTable
            v-if="tableData.tbodyList"
            v-bind="tableData"
            @operation="operation"
            @changeCurrent="getRecordList"
            @changePageSize="getRecordList(1, ...arguments)"
          >
          </TsTable>
        </div>
        <div v-else-if="isShowOtherTable =='two'">
          <div class="flex-end mb-md">
            <TsFormSelect
              v-model="detailTableConfig.status"
              class="bg-op mr-md"
              v-bind="detailForm.status"
              @on-change="getRecordDetail()"
            ></TsFormSelect>
            <InputSearcher
              v-model="detailTableConfig.ip"
              v-bind="detailForm.ip"
              @change="getRecordDetail()"
            ></InputSearcher>
          </div>
          <TsTable
            v-if="detailTableConfig"
            v-bind="detailTableConfig"
            @operation="operation"
          >
            <template v-slot:status="{row}">
              <div>
                <span v-if="row.status == 'succeed'" class="green">
                  {{ $t('page.success') }}
                </span>
                <span v-else class="red">
                  {{ $t('page.fail') }}
                </span>
              </div>
            </template>
          </TsTable>
        </div>
        <div v-else>
          <!-- 查看日志 -->
          {{ logDetail }}
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'UpgradeRecord', // 升级记录
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  filters: {
  },
  props: {
  },
  data() {
    return {
      isShowDialog: false,
      isShowOtherTable: 'one',
      logDetail: '', // 日志详情
      dialogConfig: {
        hasFooter: false
      },
      detailForm: {
        status: {
          type: 'select',
          value: '',
          dataList: [],
          defaultValueIsFirst: true,
          width: '150px'
        },
        ip: {
          type: 'text',
          value: '',
          placeholder: 'IP'
        }
      },
      recordListForm: {
        // 升级记录搜索
        fcuName: {
          search: true,
          suffix: 'tsfont-search',
          width: '200px',
          value: '',
          placeholder: this.$t('page.user'),
          clearable: true
        }
      },
      tableData: {
        // 升级记录列表
        theadList: [
          {
            title: this.$t('page.executeuser'),
            key: 'fcuVo',
            type: 'user'
          },
          {
            title: this.$t('term.framework.upgagentcount'),
            key: 'count',
            type: 'linktext',
            textValue: 'detail'
          },
          {
            title: this.$t('term.framework.upgtime'),
            key: 'fcd',
            type: 'time'
          },
          {
            title: this.$t('page.networksegment'),
            key: 'network',
            type: 'html'
          }
        ],
        tbodyList: [],
        currentPage: 1,
        pageSize: 10,
        loading: false,
        rowNum: 0, // 总条数
        fcuName: '' // 用户
      },
      detailTableConfig: {
        // 详情表格
        
        theadList: [
          {
            title: 'IP',
            key: 'ip'
          },
          {
            title: this.$t('page.port'),
            key: 'port'
          },
          {
            title: this.$t('term.framework.sourceversion'),
            key: 'sourceVersion'
          },
          {
            title: this.$t('term.framework.targetversion'),
            key: 'targetVersion'
          },
          {
            title: this.$t('page.status'),
            key: 'status'
          },
          {
            title: '',
            key: 'action',
            type: 'action',
            operations: [
              {icon: 'tsfont-file-single', name: this.$t('page.viewtarget', {'target': this.$t('page.log')}), action: 'view', type: 'text'}]
          }
        ],
        tbodyList: [],
        ip: '', // ip
        status: '', // 状态
        auditId: null, // 升级详情ID
        loading: false,
        showPager: false,
        rowNum: 0 // 总条数
      }
    };
  },
  beforeCreate() {},
  created() {
   
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
    getStatusList() {
      // 状态列表
      let params = {
        enumClass: 'neatlogic.framework.tagent.enums.TagentUpgradeStatus'
      };
      this.$https.post('/api/rest/universal/enum/get', params).then((res) => {
        let arr = [{text: this.$t('page.allstatus'), value: 'allStatus'}, ... res.Return];
        this.$set(this.detailForm.status, 'dataList', arr);
      });
    },
    handleUpgradeRecord() {
      this.isShowDialog = true;
      this.getRecordList();
    },
    getRecordList(currentPage, pageSize, fcuName) {
      // 升级记录列表
      let params = {
        currentPage: currentPage || this.tableData.currentPage,
        pageSize: pageSize || this.tableData.pageSize,
        fcuName: fcuName || this.tableData.fcuName
      };
      this.tableData.loading = true;
      this.$api.framework.tagent.getBatchUpgradeList(params).then((res) => {
        if (res.Status == 'OK') {
          if (this.$utils.isEmptyObj(res.Return)) {
            // 暂无数据
            // this.$set(this.tableData, 'tbodyList', []);
            Object.assign(this.tableData, {loading: false, rowNum: 0, currentPage: 1, pageSize: 10, tbodyList: []});
          } else {
            Object.assign(this.tableData, res.Return);
            this.tableData.loading = false;
          }
        }
      });
    },
    getRecordDetail() {
      // 升级记录详情
      let params = {
        auditId: this.detailTableConfig.auditId,
        status: this.detailTableConfig.status == 'allStatus' ? '' : this.detailTableConfig.status, // 升级状态
        ip: this.detailTableConfig.ip// ip
      };
      this.detailTableConfig.loading = true;
      this.$api.framework.tagent.getBatchUpgradeDetail(params).then((res) => {
        if (res.Status == 'OK') {
          if (this.$utils.isEmptyObj(res.Return)) { 
            this.$set(this.detailTableConfig, 'tbodyList', []);
            this.detailTableConfig.loading = false;
          } else {
            Object.assign(this.detailTableConfig, res.Return);
            this.detailTableConfig.loading = false;
          }
        }
      });
    },
    closeDialog() {
      switch (this.isShowOtherTable) {
        case 'three':
          this.isShowOtherTable = 'two';
          break;
        case 'two':
          this.isShowOtherTable = 'one';
          break;
        case 'one':
          this.isShowDialog = false;
          break;
        default:
          break;
      }
    },
    operation(type, row) {
      if (type && type == 'view') {
        this.isShowOtherTable = 'three'; // 显示日志详情
        this.logDetail = row.result;
      } else {
        this.isShowOtherTable = 'two';
        this.detailTableConfig.auditId = type.id; // 显示升级详情
        this.getRecordDetail(); // 升级详情
        this.getStatusList(); // 状态列表
      }
    },
    getTitleName() {
      switch (this.isShowOtherTable) {
        case 'one':
          return this.$t('term.framework.upgrecord');
        case 'two':
          return this.$t('term.framework.upgdetails');
        default:
          return this.$t('page.logdetails');
      }
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
.upgrade-record-wrap {
   .upgrade-record-margin-right {
    margin-right: 10px;
  }
}
</style>
