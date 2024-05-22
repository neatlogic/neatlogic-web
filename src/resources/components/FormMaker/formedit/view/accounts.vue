<template>
  <div v-if="setting.config" :style="getStyle">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <div>
      <!-- <div v-if="!isReadonly" class="text-href text-align" @click="isOpen">
        <i class="tsfont-plus"></i>
        {{ setting.config.placeholder }}
      </div> -->

      <a
        v-if="!isReadonly"
        href="javascript:void(0)"
        class="isChoice text-align"
        :class="{ cur: isReadonly }"
        @click="isOpen"
      >
        <i class="tsfont-plus"></i>
        {{ setting.config.placeholder }}
      </a>
      <div class="tstable-container border bg-grey radius-lg">
        <div>
          <table v-if="selectedDataList && selectedDataList.length > 0" class="tstable-body">
            <thead>
              <tr>
                <th v-for="(attr, index) in theadList" :key="index">
                  {{ attr.title }}
                </th>
                <th v-show="!isReadonly" style="width:40px"></th>
              </tr>
            </thead>
            <tbody class="tbody-main">
              <tr v-for="(data, oindex) in selectedDataList" :key="oindex">
                <td v-for="(theadKey, keyIndex) in theadList" :key="keyIndex">
                  {{ data[theadKey.key] }}
                </td>
                <td v-show="!isReadonly">
                  <i class="tsfont-close-o text-action text-grey" title="删除" @click="deleteAccount(data)"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <TsDialog v-bind="dialogConfig" @on-close="close">
        <template v-slot>
          <TsContain
            :gutter="10"
            border="border"
            navBorderBottom="none"
            mode="dialog"
          >
            <!-- <template slot="topRight">
              <TsFormInput
                v-model="keyword"
                search
                :placeholder="searchParams.placeholder"
                clearable
                @on-search="getTableData(1)"
                @on-clear="getTableData(1)"
                @on-enter="getTableData(1)"
              ></TsFormInput>
            </template> -->

            <template v-slot:content>
              <div class="account-select-form-input">
                <TsFormInput
                  v-model="keyword"
                  search
                  :placeholder="searchParams.placeholder"
                  clearable
                  @on-search="getTableData(1)"
                  @on-clear="getTableData(1)"
                  @on-enter="getTableData(1)"
                ></TsFormInput>
              </div>
              <div style="clear: both;"></div>
              <div class="padlr">
                <TsTable
                  v-model="selectedIdList"
                  :theadList="theadListSelection"
                  :multiple="true"
                  :keyName="'tempId'"
                  :fixedHeader="false"
                  v-bind="tableData"
                  :selectedRemain="true"
                  @changeCurrent="getTableData"
                  @getSelected="getSelected"
                  @changePageSize="getTableData(1, ...arguments)"
                ></TsTable>
              </div>
            </template>
          </TsContain>
        </template>
        <template v-slot:footer>
          <Button @click="close()">{{ $t('page.cancel') }}</Button>
          <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
        </template>
      </TsDialog>
    </div>
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">
      {{ setting.config.desc }}
    </div>
  </div>
</template>
<script>
import viewmixin from '@/resources/components/FormMaker/formedit/view/viewmixin.js';
export default {
  name: 'Formaccounts',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue')
  },
  mixins: [viewmixin],
  props: {
    setting: Object,
    value: Object,
    isReadonly: Boolean
  },
  data() {
    return {
      currentValue: null,
      dialogConfig: {
        title: this.$t('dialog.title.choosetarget', {'target': this.$t('page.account')}),
        type: 'modal',
        maskClose: false,
        isShow: false,
        width: 'large'
      },
      keyword: '', // 资产名称、资产IP
      searchParams: {
        placeholder: '资产名称、资产IP'
      },
      theadListSelection: [
        // 模态框表头字段
        { key: 'selection' },
        { key: 'name', title: '资产名' },
        { key: 'ip', title: '资产IP' },
        { key: 'account', title: '账号名称' },
        { key: 'accountName', title: '用户名' },
        { key: 'protocol', title: '连接协议' },
        { key: 'port', title: '端口' }
      ],
      tableData: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      theadList: [
        // 选中列表表头字段
        { key: 'name', title: '资产名' },
        { key: 'ip', title: '资产IP' },
        { key: 'account', title: '账号名称' },
        { key: 'accountName', title: '用户名' },
        { key: 'protocol', title: '连接协议' },
        { key: 'port', title: '端口' }
      ],
      selectedRowData: [], // 临时选中行的数据
      selectedDataList: [], // 点击确认之后，值回显
      selectedRowId: [], // 临时选中复选框ID列表
      selectedIdList: [] // 选中之后列表
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updatethis: function(val) {
      this.$emit('update', val);
    },
    updateValue: function(val) {
      this.currentValue = val;
    },
    getValue: function(val) {
      let newObj = {};
      if (!this.currentValue) {
        newObj = {};
        let currentValue = this.value;
        if (currentValue && this.selectedDataList.length == 0) {
          newObj = {};
        }

        newObj.selectedDataList = [];
        newObj.selectedDataList = this.selectedDataList;
        return newObj;
      }
    },
    getTableData(currentPage, pageSize) {
      let data = {
        keyword: this.keyword, // 关键字，资产名称和资产IP
        currentPage: currentPage || this.tableData.currentPage, // 当前页
        pageSize: pageSize || this.tableData.pageSize, // 每页显示条目
        needPage: true // 是否需要分页，默认是需要分页
      };
      this.$https.post('/api/rest/resourcecenter/resource/account/component/select', data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = Object.assign(this.tableData, res.Return);
          for (let i = 0; i < this.tableData.tbodyList.length; i++) {
            // 新增一个临时的ID，为了复选框选择处理
            this.tableData.tbodyList[i]['tempId'] = i + 1;
          }
        }
      });
    },
    getSelected(id, row) {
      // 选中列表数据，id是选中行主键
      let selectedArr = this.tableData.tbodyList.filter(val => {
        return id.includes(val.tempId); // 获取所有选中列表
      });
      this.selectedRowId = id;
      this.selectedRowData = selectedArr;
    },
    save() {
      this.dialogConfig.isShow = false; // 关闭弹出框
      this.selectedIdList = this.selectedRowId; // 点击确定之后，赋值选中id
      this.selectedDataList = this.selectedRowData; // 点击确认之后，把选中行数据赋值到选中列表中
    },
    deleteAccount(row) {
      // 删除列表的数据
      this.selectedDataList.splice(
        this.selectedDataList.findIndex(v => v.tempId == row.tempId),
        1
      );

      // 删除默认回显高亮数据列表
      this.selectedIdList.splice(
        this.selectedIdList.findIndex(v => v == row.tempId),
        1
      );
    },
    validateValue: function() {
      let isVaild = true;
      if (this.setting.config.isRequired) {
        if (this.selectedDataList.length == 0) {
          this.$Message.error('账号组件:不可为空');
          isVaild = false;
        }
      }
      return isVaild;
    },
    init() {
      this.getTableData(1);
    },
    operation(view, row) {
      // console.log(view, row);
    },
    close() {
      this.dialogConfig.isShow = false;
    },
    ok() {
      this.dialogConfig.isShow = false;
    },
    isOpen() {
      if (!this.isReadonly) {
        this.dialogConfig.isShow = true;
        // 解决取消之后的问题，再次点击勾选的按钮没有去掉的问题
        if (this.selectedDataList && this.selectedDataList.length > 0) {
          this.selectedIdList = [];
          this.selectedDataList.forEach(val => {
            this.selectedIdList.push(val.tempId);
          });
        } else {
          this.selectedIdList = [];
        }
      }
    }
  },
  filter: {},
  computed: {
    getStyle: function() {
      const resultJson = {};
      if (typeof this.setting.config.width == 'number') {
        resultJson.width = this.setting.config.width + 'px';
      } else if (typeof this.setting.config.width == 'string') {
        resultJson.width = this.setting.config.width;
      }
      return resultJson;
    }
  },
  watch: {
    value: {
      handler(val) {
        // 解决工单中心，数据选中回显问题，删除数据问题
        this.selectedDataList = (val && val.selectedDataList) || [];
        if (this.selectedDataList && this.selectedDataList.length > 0) {
          this.selectedDataList.forEach(item => {
            this.selectedIdList.push(item.tempId);
          });
        }
      },
      immediate: true,
      deep: true
    },
    dialogConfig: {
      // 解决点击选择账号组件，没有调接口的问题
      handler(val) {
        if (val && val.isShow) {
          this.getTableData(1);
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.text-align {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.account-select-form-input {
  width: 300px;
  margin: 10px 0 10px 0;
  float: right;
}
.text-action {
  font-size: 15px;
  cursor: pointer;
}
.tstable-container {
  .tstable-body {
    td {
      font-size: 13px;
    }
  }
}
</style>

