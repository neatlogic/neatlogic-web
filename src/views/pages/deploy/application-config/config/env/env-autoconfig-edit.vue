<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :ok-text="$t('page.save')"
      width="medium"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div v-if="isEdit">{{ $t('dialog.title.edittarget', {target: $t('term.deploy.adaptationfileadaptation')}) }}</div>
        <div v-else>{{ $t('dialog.title.addtarget', {target: $t('term.deploy.adaptationfileadaptation')}) }}</div>
      </template>
      <template v-slot>
        <TsTable
          :theadList="theadList"
          v-bind="tableData"
        >
          <template slot="key" slot-scope="{row}">
            <TsFormInput
              v-model="row.key"
              :errorMessage="row.errorMessage"
              clearable
              border="border"
              @on-change="inputChange"
            ></TsFormInput>
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
              :errorMessage="row.valueErrorMessage"
              :disabled="(row.isEmpty ? true : false)"
              border="border"
              @on-change="(value) => valueChange(row, value, index)"
            ></TsFormInput>
          </template>
          <template slot="delOperation" slot-scope="{row, index}">
            <div class="action-group">
              <span class="tsfont-trash-o text-action" @click="delVariable(row, index)"></span>
            </div>
          </template>
        </TsTable>
        <span class="variable-text tsfont-plus text-href pt-nm" @click="addVariable">{{ $t('page.variable') }}</span>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 适配文件适配
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    params: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      formValue: {},
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
          title: '',
          key: 'delOperation'
        }
      ],
      tableData: {
        hideAction: false,
        tbodyList: []
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.isEdit) {
      this.getAutoConfigList();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addVariable() {
      this.tableData.tbodyList.push({
        key: '',
        value: '',
        isEmpty: 0,
        delOperation: ''
      });
    },
    delVariable(row, index) {
      if (this.tableData && this.tableData.tbodyList.length > 0) {
        this.tableData.tbodyList.splice(index, 1);
      }
    },
    okDialog() {
      if (!this.isRepeat() || !this.validValueIsEmpty()) {
        return false;
      }
      let keyValueList = [];
      let tbodyList = this.$utils.deepClone(this.tableData.tbodyList);
      tbodyList = tbodyList && tbodyList.filter((item) => {
        return item.key;
      });
      tbodyList && tbodyList.forEach((item) => {
        keyValueList.push({
          key: item.key,
          value: item.value
        });
      }); 
      let params = {
        ...this.params,
        keyValueList: keyValueList
      };
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
    getAutoConfigList() {
      this.$api.deploy.applicationConfig.getEnvInfo(this.params).then((res) => {
        if (res && res.Status == 'OK') {
          let returnData = res.Return;
          this.tableData.tbodyList = [];
          returnData.envAutoConfigList && returnData.envAutoConfigList.forEach((v) => {
            this.tableData.tbodyList.push({
              key: v.key,
              value: v.hasOwnProperty('value') ? v.value : '',
              isEmpty: (!v.hasOwnProperty('value') || (v.value == '')) ? 1 : 0, // 没有value的属性，或者为空字符串，设为空打开
              delOperation: ''
            });
          });
        }
      });
    },
    switchChange(row, value, index) {
      if (value) {
        let currentValue = this.$utils.deepClone(row);
        currentValue.value = '';
        this.$set(this.tableData.tbodyList, index, currentValue);
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
    inputChange(currentValue) {
      if (!this.isRepeat()) {
        for (let index = 0; index < this.tableData.tbodyList.length; index++) {
          if (this.tableData.tbodyList[index].key == currentValue) {
            this.tableData.tbodyList[index].errorMessage = this.$t('form.validate.repeat', {target: currentValue});
          }
        }
      } else {
        for (let index = 0; index < this.tableData.tbodyList.length; index++) {
          this.tableData.tbodyList[index].errorMessage = '';
        }
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
