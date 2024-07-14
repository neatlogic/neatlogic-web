<template>
  <div>
    <TsTable
      :theadList="theadList"
      :fixedHeader="false"
      v-bind="tableData"
    >
      <template slot="key" slot-scope="{row}">
        <TsFormInput
          v-model="row.key"
          :errorMessage="row.errorMessage"
          clearable
          border="border"
          :readonly="row.isReadOnly"
          @on-change="inputChange"
        ></TsFormInput>
      </template>
      <template slot="defaultValue" slot-scope="{row, index}">
        <Items
          :is="handlerType('input')"
          ref="itemInput"
          v-model="row.defaultValue"
          :defaultValue="row.defaultValue"
          :config="{...getselectConfig('input'), errorMessage: row.valueErrorMessage}"
          :disabled="false"
          :isRequired="false"
          @getConfig="(config)=>{getParamConfig(index,config)}"
        ></Items>
      </template>
      <template slot="delOperation" slot-scope="{row, index}">
        <div class="action-group">
          <span class="tsfont-trash-o text-action" @click="delVariable(row, index)"></span>
        </div>
      </template>
    </TsTable>
    <span class="variable-text tsfont-plus text-href pt-nm" @click.stop="addVariable">{{ $t('page.variable') }}</span>
  </div>
</template>
<script>
import Items from '@/views/pages/autoexec/components/param/edit';
export default {
  name: '', // 适配文件适配
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    PoptipSelect: () => import('@/resources/components/PoptipSelect/PoptipSelect.vue'),
    ...Items
  },
  props: {
    tableData: {
      type: Object,
      default: function() {
        return {
          hideAction: false,
          tbodyList: []
        }; //配置文件适配的变量
      }
    }
  },
  data() {
    return {
      paramsTypeList: [],
      typeList: [
        'text'
      ],
      theadList: [
        {
          title: this.$t('page.variablename'),
          key: 'key',
          headerIcon: 'require-label'
        },
        {
          title: this.$t('page.variablevalue'),
          key: 'defaultValue'
        },
        {
          title: '',
          key: 'delOperation'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getParamsTypeLit();
    if (this.tableData && !this.$utils.isEmpty(this.tableData.tbodyList)) {
      this.tableData.tbodyList.forEach(o => {
        if (o.key) {
          o.isReadOnly = true;
        }
      });
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getParamConfig(index, config) {
      if (config) {
        this.$set(this.tableData.tbodyList[index], 'config', config);
      }
    },
    getParamsTypeLit() {
      //选择组件类型
      let data = { enumClass: 'neatlogic.framework.autoexec.constvalue.ParamType' };
      return this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.paramsTypeList = res.Return.filter(item => { return this.typeList.includes(item.value); });
        }
      });
    },
    getselectConfig(type) {
      if (this.paramsTypeList.find(item => item.value == type) && !this.$utils.isEmpty(this.paramsTypeList.find(item => item.value == type).config)) {
        return this.paramsTypeList.find(item => item.value == type).config;
      }
      return this.paramsTypeList.find(item => item.value == type);
    },
    addVariable() {
      this.tableData.tbodyList.push({
        name: '',
        key: '',
        type: 'text',
        value: '',
        isEmpty: 0,
        delOperation: '',
        errorMessage: '',
        valueErrorMessage: ''
      });
    },
    delVariable(row, index) {
      if (this.tableData && this.tableData.tbodyList.length > 0) {
        this.tableData.tbodyList.splice(index, 1);
      }
    },
    getData() {
      if (this.validKeyRepeat() || this.validValueIsEmpty()) {
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
          type: 'argument',
          defaultValue: item.defaultValue
        });
      });
      return keyValueList;
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    validKeyRepeat() {
      if (this.$utils.isEmpty(this.tableData.tbodyList)) {
        return false;
      }
      const keysSet = new Set();
      for (let i = 0; i < this.tableData.tbodyList.length; i++) {
        if (this.$utils.isEmpty(this.tableData.tbodyList[i].key)) {
          this.tableData.tbodyList[i]['errorMessage'] = this.$t('form.validate.pleaseenterthecontent');
          return true;
        } else if (keysSet.has(this.tableData.tbodyList[i].key)) {
          return true; // 存在重复
        }
        keysSet.add(this.tableData.tbodyList[i].key);
      }
      return false;
    },
    inputChange(currentKey) {
      let otherList = this.tableData.tbodyList.filter(item => !this.$utils.isEmpty(currentKey) && item.key == currentKey);
      if (otherList.length > 1) {
        for (let index = 0; index < otherList.length; index++) {
          otherList[index].errorMessage = this.$t('form.validate.repeat', {target: currentKey});
        }
      } else {
        for (let index = 0; index < this.tableData.tbodyList.length; index++) {
          this.tableData.tbodyList[index].errorMessage = '';
        }
      }
    },
    validValueIsEmpty() {
      // 验证变量值是否为空，变量名有值+不是设为空+变量值为空，才需要验证必填
      let isValid = false;
      for (let index = 0; index < this.tableData.tbodyList.length; index++) {
        if (this.tableData.tbodyList[index].key && this.tableData.tbodyList[index].isEmpty == 0 && !this.tableData.tbodyList[index].defaultValue) {
          this.$set(this.tableData.tbodyList, index, {...this.tableData.tbodyList[index], valueErrorMessage: this.$t('form.validate.pleaseenterthecontent')});
          isValid = true;
        }
      }
      return isValid;
    },
    typeChange(row, value, index) {
      if (value) {
        let currentValue = this.$utils.deepClone(row);
        currentValue.value = '';
        this.$set(this.tableData.tbodyList, index, currentValue);
      }
    }
  },
  filter: {},
  computed: {
    handlerType() {
      let _this = this;
      return value => {
        let type = 'defaultInput';
        let findConfig = _this.paramsTypeList.find(item => item.value == value);
        if (findConfig) {
          type = findConfig.value + 'Handler';
        }
        return type;
      };
    }
  },
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
