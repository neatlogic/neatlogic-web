<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
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
            <template slot="type" slot-scope="{row, index}">
              <PoptipSelect
                v-model="row.type"
                :list="paramsTypeList"
                isIcon
                @change="(value) => typeChange(row, value, index)"
              ></PoptipSelect>
            </template>
            <template slot="value" slot-scope="{row, index}">
              <Items
                :is="handlerType(row.type)"
                ref="itemInput"
                v-model="row.value"
                :defaultValue="row.value"
                :config="{...getselectConfig(row.value), errorMessage: row.valueErrorMessage}"
                :disabled="(row.isEmpty ? true : false)"
                :isRequired="row.isEmpty ? false : row.key ? true : false"
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
    </TsDialog>
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
    isEdit: {
      type: Boolean,
      default: false
    },
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
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
      dialogConfig: {
        type: 'modal',
        isShow: true,
        okText: this.$t('page.save'),
        width: 'medium',
        title: this.isEdit ? this.$t('dialog.title.edittarget', {'target': this.$t('page.param')}) : this.$t('dialog.title.addtarget', {'target': this.$t('page.param')})
      },
      paramsTypeList: [],
      typeList: [
        'text',
        'password',
        'textarea'
      ],
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
          title: this.$t('page.type'),
          key: 'type'
        },
        {
          title: this.$t('page.variablevalue'),
          key: 'value'
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
  mounted() {
    this.getParamsTypeLit();
    console.log(this.tableData);
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
        valueErrorMessage: ''
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
          type: item.type === '' ? null : item.type,
          value: item.value
        });
      });
      let params = {
        ...this.params,
        keyValueList: keyValueList
      };
      this.$emit('save', params);
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
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
      for (let index = 0; index < this.tableData.tbodyList.length; index++) {
        if (!this.isRepeat()) {
          if (this.tableData.tbodyList[index].key == currentValue) {
            this.tableData.tbodyList[index].errorMessage = this.$t('form.validate.repeat', {target: currentValue});
          } else {
            this.tableData.tbodyList[index].errorMessage = '';
          }
        }
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
