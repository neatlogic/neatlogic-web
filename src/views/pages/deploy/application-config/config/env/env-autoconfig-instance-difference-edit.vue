<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div v-if="instanceId">{{ $t('dialog.title.edittarget', {target: $t('term.deploy.casedifference')}) }}</div>
        <div v-else>{{ $t('dialog.title.addtarget', {target: $t('term.deploy.casedifference')}) }}</div>
      </template>
      <template v-slot>
        <div>
          <TsForm
            ref="form"
            v-model="formValue"
            :item-list="formConfigList"
            class="pt-nm pb-nm"
          ></TsForm>
          <TsTable
            :theadList="theadList"
            v-bind="tableData"
            @changeCurrent="searchInstanceDifferenceInfo"
            @changePageSize="changePageSize"
          >
            <template slot="key" slot-scope="{row, index}">
              <TsFormSelect
                v-model="row.key"
                :dataList="currentEnvKeyList"
                :errorMessage="row.errorMessage"
                :allowCreate="true"
                :search="true"
                border="border"
                transfer
                :width="250"
                @on-change="(currentValue, valueObj, selectedItem) => changekey(currentValue, selectedItem, index)"
              ></TsFormSelect>
            </template>
            <template slot="isEmpty" slot-scope="{row, index}">
              <div class="flex-center" style="width: 150px;">
                <span class="pr-xs">{{ $t('page.settonull') }}</span>
                <TsFormSwitch
                  v-model="row.isEmpty"
                  :falseValue="0"
                  :trueValue="1"
                  @on-change="(value) => switchChange(row, value, index)"
                ></TsFormSwitch>
              </div>
            </template>
            <template slot="value" slot-scope="{row, index}">
              <TsFormInput
                v-model="row.value"
                :type="row.componentType || 'text'"
                :errorMessage="row.valueErrorMessage"
                :disabled="(row.isEmpty ? true : false)"
                border="border"
                @on-change="(value) => valueChange(row, value, index)"
              ></TsFormInput>
            </template>
            <template slot="delOperation" slot-scope="{row, index }">
              <div class="action-group">
                <span class="tsfont-trash-o text-action" @click="delKeyValueById(row, index)"></span>
              </div>
            </template>
          </TsTable>
          <span class="variable-text tsfont-plus text-href pt-nm" @click="addVariable">{{ $t('page.variable') }}</span>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    instanceId: {
      type: [String, Number]
    },
    params: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    let { appSystemId, appModuleId, envId } = this.params;
    return {
      dialogSetting: {
        type: 'modal',
        isShow: true,
        okText: this.$t('page.save'),
        width: 'medium'
      },
      formValue: {
        instanceId: null
      },
      formConfigList: [
        {
          name: 'instanceId',
          type: 'select',
          label: this.$t('page.instance'),
          dynamicUrl: 'api/rest/deploy/app/module/env/auto/config/instance/search',
          params: {appSystemId, appModuleId, envId, isAutoConfig: 0},
          labelPosition: 'top',
          transfer: true,
          validateList: ['required'],
          rootName: 'tbodyList',
          dealDataByUrl: (list) => this.dealDataByUrl(list)
        }
      ],
      theadList: [
        {
          title: this.$t('page.variablename'),
          key: 'key',
          headerIcon: 'require-label'
        },
        {
          title: '',
          key: 'isEmpty'
        },
        {
          title: this.$t('page.variablevalue'),
          key: 'value'
        },
        {
          key: 'delOperation'
        }
      ],
      tableData: {
        tbodyList: []
      },
      searchParam: {},
      currentEnvKeyList: [] // 当前环境层所有的变量名
    };
  },
  beforeCreate() {},
  created() {
    if (this.instanceId) {
      this.formValue.instanceId = this.instanceId;
    }
    this.searchInstanceDifferenceInfo();
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
    dealDataByUrl(nodeList) {
      let dataList = [];
      if (nodeList) {
        nodeList.forEach(item => {
          dataList.push({
            value: item.id,
            text: item.ip ? (item.port ? (item.name ? `${item.ip}:${item.port}[${item.name}]` : `${item.ip}:${item.port}`) : item.name ? `${item.ip}[${item.name}]` : item.ip) : ''
          });
        });
      }
      return dataList;
    },
    addVariable() {
      this.tableData.tbodyList.push({
        isEmpty: 0,
        key: '',
        value: '',
        delOperation: ''
      });
    },
    delKeyValueById(row, index) {
      if (this.tableData && this.tableData.tbodyList.length > 0) {
        this.tableData.tbodyList.splice(index, 1);
      }
    },
    okDialog() {
      let form = this.$refs.form;
      if ((form && !form.valid()) || !this.isRepeat() || !this.validValueIsEmpty()) {
        return false;
      }
      let keyValueList = [];
      let tbodyList = this.tableData.tbodyList.filter((item) => {
        return item.key;
      });
      tbodyList && tbodyList.forEach((item) => {
        keyValueList.push({
          key: item.key,
          value: item.value,
          type: item.componentType
        });
      });
      let {appSystemId, appModuleId, envId} = this.params;
      let {instanceId} = this.formValue;
      let params = {
        appSystemId,
        appModuleId,
        envId,
        ...this.formValue,
        keyValueList: keyValueList
      };
      if (instanceId && (instanceId != this.instanceId)) {
        params.deleteInstanceId = this.instanceId; // 解决编辑实例，新增了一条新的实例的问题
      } else {
        delete params.deleteInstanceId;
      }
      this.$api.deploy.applicationConfig.saveEnvAutoConfig(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true);
        }
      });
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    searchInstanceDifferenceInfo(currentPage) {
      let {appSystemId, appModuleId, envId} = this.$utils.deepClone(this.params);
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      let params = {
        ...this.searchParam,
        appSystemId,
        appModuleId,
        envId
      };
      this.$api.deploy.applicationConfig.getEnvInfo(params).then((res) => {
        if (res && res.Status == 'OK') {
          let returnData = res.Return;
          this.currentEnvKeyList = [];
          if (!this.instanceId) {
            // 新增
            this.tableData.tbodyList = [];
          } else {
            // 编辑
            returnData.instanceAutoConfigList && returnData.instanceAutoConfigList.forEach((item) => {
              if (item.instanceId == this.instanceId) {
                item.keyValueList && item.keyValueList.forEach((v) => {
                  this.tableData.tbodyList.push({
                    key: v.key,
                    value: v.hasOwnProperty('value') ? v.value : '',
                    isEmpty: (v.hasOwnProperty('value') && !v.value) ? 1 : 0,
                    delOperation: '',
                    componentType: v.type
                  });
                });
              }
            });
          }

          // 当前环境下所有变量名
          if (returnData && returnData.envAutoConfigList && returnData.envAutoConfigList.length > 0) {
            returnData.envAutoConfigList.forEach((item) => {
              this.currentEnvKeyList.push({
                text: item.key,
                value: item.key,
                componentType: item.type || 'text',
                variableValue: item.value // 变量值
              });
            });
          }
        }
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchInstanceDifferenceInfo(1);
    },
    changekey(currentValue, selectedItem, listIndex) {
      // key值改变
      let {variableValue, componentType = 'text'} = selectedItem || {};
      if (!this.isRepeat()) {
        for (let index = 0; index < this.tableData.tbodyList.length; index++) {
          if (this.tableData.tbodyList[index].key == currentValue) {
            this.tableData.tbodyList[index].errorMessage = this.$t('form.validate.repeat', {target: currentValue});
          }
        }
      } else {
        for (let index = 0; index < this.tableData.tbodyList.length; index++) {
          this.tableData.tbodyList[index].errorMessage = '';
          if (index == listIndex) {
            this.tableData.tbodyList[index].value = variableValue;
            this.tableData.tbodyList[index].componentType = componentType;
          }
        }
      }
    },
    isRepeat() {
      let temp = {};
      for (let i = 0; i < this.tableData.tbodyList.length; i++) {
        if (temp[this.tableData.tbodyList[i].key]) {
          return false; // 存在重复
        } else {
          temp[this.tableData.tbodyList[i].key] = this.tableData.tbodyList[i];
        }
      }
      return true;
    },
    switchChange(row, value, index) {
      if (value) {
        let currentValue = this.$utils.deepClone(row);
        currentValue.value = '';
        this.$set(this.tableData.tbodyList, index, currentValue);
      }
    },
    valueChange(row, currentValue, index) {
      if (currentValue) {
        this.$set(this.tableData.tbodyList, index, {...row, valueErrorMessage: ''});
      } else if (row.key && !row.isEmpty) {
        this.$set(this.tableData.tbodyList, index, {...row, valueErrorMessage: this.$t('form.validate.pleaseenterthecontent')});
      }
    },
    validValueIsEmpty() {
      // 验证变量值是否为空，变量名有值+不是设为空+变量值为空，才需要验证必填
      let isValid = true;
      for (let index = 0; index < this.tableData.tbodyList.length; index++) {
        if (this.tableData.tbodyList[index].key && this.tableData.tbodyList[index].isEmpty == 0 && !this.tableData.tbodyList[index].value) {
          this.$set(this.tableData.tbodyList, index, {...this.tableData.tbodyList[index], valueErrorMessage: this.$t('form.validate.pleaseenterthecontent')});
          isValid = false;
        }
      }
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.del-button {
  display: inline-block;
  height: 32px;
  line-height: 32px;
}
.variable-text {
  display: inline-block;
}
</style>
