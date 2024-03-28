<template>
  <div>
    <Button v-if="systemName" class="mb-sm" @click="addSystemTbodyRow()">{{ $t('dialog.title.addtarget',{'target':$t('page.data')}) }}</Button>
    <TsTable v-bind="tableConfig" class="mb-sm">
      <template v-for="(item, tableIndex) in tableConfig.theadList" :slot="item.key" slot-scope="{ row,index }">
        <!--  style="min-width: 130px;" 解决宽度很小时，表头和内容对不齐问题 -->
        <FormComponents
          v-if="systemName"
          :key="tableIndex"
          ref="table1Form"
          v-model="row[item.key]"
          :config="item.config"
          style="min-width: 130px;"
          :allFormValue="tableConfig.tbodyList"
          :rowKey="item.key"
          @change="(val) => OSVersionChange(row, index, item.key, val)"
          @on-focus="(val) => focusFilterSystemNodeList(row, index, item.key, item.config)"
        ></FormComponents>
      </template>
      <template slot="action" slot-scope="{ row, index }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-trash-o" @click="deleteSystemTbodyRow(index, row)">删除</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <template v-for="(item,parentIndex) in otherTableList">
      <div :key="parentIndex">
        <div class="text-center">{{ item.tableName }}</div>
        <Button class="mb-sm" @click.stop="addTbodyListRow(item.uuid, parentIndex)">{{ $t('dialog.title.addtarget',{'target':$t('page.data')}) }}</Button>
        <TsTable :theadList="item.theadList" :tbodyList="item.tbodyList" class="mb-sm">
          <template v-for="(itemTbody, childIndex) in item.theadList" :slot="itemTbody.key" slot-scope="{ row, index }">
            <FormComponents
              :key="childIndex"
              ref="otherTableList"
              v-model="row[itemTbody.key]"
              :config="itemTbody.config"
              style="min-width: 130px;"
              :allFormValue="item.tbodyList"
              :rowKey="itemTbody.key"
              @change="(val, item) => handleChange(parentIndex, index, itemTbody.key, val, itemTbody.config)"
              @on-focus="handleFocus(parentIndex, index, itemTbody.key, itemTbody.config)"
            ></FormComponents>
          </template>
          <template slot="action" slot-scope="{ row, index }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-trash-o" @click="deleteTbodyListRow(parentIndex, index, row)">删除</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </template>
  </div>
</template>
<script>
import base from '@/resources/plugins/TsSheet/form/component/base.vue';
import validmixin from '@/resources/plugins/TsSheet/form/component/common/validate-mixin.js';
import {formspecificationsconfig} from '@/resources/plugins/TsSheet/form/component/formspecifications/formspecificationsconfig.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    FormComponents: resolve => require(['./component/component.vue'], resolve)
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      systemName: '',
      otherTableList: [],
      tableTbodyKey: {}, // 新加表格行的时候需要用到
      middlewareTableKey: {},
      dataBaseTableKey: {},
      tableConfig: {
        uuid: 'table1',
        tableName: '操作系统',
        theadList: [],
        tbodyList: []
      },
      middlewareTableConfig: {
        uuid: 'table2',
        tableName: '中间件',
        theadList: [],
        tbodyList: []
      },
      dataBaseTableConfig: {
        uuid: 'table3',
        tableName: '数据库',
        theadList: [],
        tbodyList: []
      }
    };
  },
  beforeCreate() {},
  created() {
    this.initForm();
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
    validConfig() {
      const errorList = [];
      console.log('this.$refs', this.$refs.table1Form);
    },
    validData() {
      const errorList = [];
      let isValid = true;
      let tableList = this.$refs?.table1Form || [];
      for (let i = 0; i < tableList.length; i++) {
        if (tableList[i] && tableList[i].validData && !tableList[i].validData()) {
          isValid = false;
        }
      }
      let otherTableList = this.$refs?.otherTableList || [];
      for (let i = 0; i < otherTableList.length; i++) {
        if (otherTableList[i] && otherTableList[i].validData && !otherTableList[i].validData()) {
          isValid = false;
        }
      }
      if (!isValid) {
        errorList.push({uuid: this.formItem.uuid, error: this.formItem.label + '：' + this.$t('form.validate.required', {'target': this.$t('page.value')})});
      }
      return errorList;
    },
    focusFilterSystemNodeList(row, rowIndex, key, config) {
      // 拿到行OS的数据作为交付标准的过滤条件值
      if (key == 'deliveryStandards' && !this.$utils.isEmpty(row['osVersion'])) {
        this.$set(config.params, 'filterList', [
          {
            uuid: config.params.filterAttrUuid,
            textList: [row['osVersion']],
            valueList: [row['osVersion']]
          }
        ]);
      }
    },
    deleteSystemTbodyRow(index) {
      this.tableConfig.tbodyList.splice(index, 1);
    },
    deleteTbodyListRow(parentIndex, rowIndex) {
      // 删除循环表格
      if (!this.$utils.isEmpty(this.otherTableList[parentIndex])) {
        this.otherTableList[parentIndex]['tbodyList'].splice(rowIndex, 1);
      }
    },
    initForm() {
      let { tbodyList: tableConfigTbodyList, theadList: tableConfigTheadList } = this.handleTableConfig(this.tableConfig.uuid);
      this.tableConfig.theadList = tableConfigTheadList;  
      this.tableTbodyKey = this.$utils.deepClone(tableConfigTbodyList);
      if (this.$utils.isEmpty(this.systemName)) {
        return false;
      } 
      this.middlewareTableConfig.tbodyList = [tableConfigTbodyList];  
    },
    handleTableConfig(uuidKey) {  
      let tbodyList = {};  
      let theadList = [];
      if (!this.$utils.isEmpty(formspecificationsconfig[uuidKey])) {  
        for (let key of Object.keys(formspecificationsconfig[uuidKey])) {  
          if (key) {  
            tbodyList[key] = null; // 直接使用对象属性赋值
            theadList.push({  
              title: formspecificationsconfig[uuidKey][key]['theadTitle'],  
              key: key,  
              config: formspecificationsconfig[uuidKey][key],
              isRequired: formspecificationsconfig[uuidKey][key]['validateList'] ? (this.handleValid(formspecificationsconfig[uuidKey][key]['validateList'])) : false // 有required设置必填
            });  
          }  
        }  
      }  
      theadList.push({ key: 'action' }); 
      return { tbodyList, theadList };  
    },
    handleValid(validateList) {
      let isRequired = false;
      let tempItem = '';
      if (!this.$utils.isEmpty(validateList)) {
        tempItem = validateList.find((item) => item.name == 'required');
        if (!this.$utils.isEmpty(tempItem)) {
          isRequired = true;
        }
      }
      return isRequired;
    },
    handleTheadlistBySystem() {
      // 处理 middlewareTableConfig  
      let { tbodyList: middlewareTbodyList, theadList: middlewareTheadList } = this.handleTableConfig(this.middlewareTableConfig.uuid);  
      this.middlewareTableConfig.theadList = middlewareTheadList;  
      this.middlewareTableKey = this.$utils.deepClone(middlewareTbodyList);  
      this.middlewareTableConfig.tbodyList = [middlewareTbodyList];  
  
      // 处理 dataBaseTableConfig  
      let { tbodyList: dataBaseTbodyList, theadList: dataBaseTheadList } = this.handleTableConfig(this.dataBaseTableConfig.uuid);  
      this.dataBaseTableConfig.theadList = dataBaseTheadList;  
      this.dataBaseTableKey = this.$utils.deepClone(dataBaseTbodyList);
      this.dataBaseTableConfig.tbodyList = [dataBaseTbodyList];
    },
    addSystemTbodyRow() {
      this.tableConfig.tbodyList.push({
        ...this.tableTbodyKey
      });
    },
    addTbodyListRow(uuid, index) {
      if (this.otherTableList[index] && this.otherTableList[index].tbodyList) {
        let tbodyRow = uuid == 'table2' ? this.middlewareTableKey : this.dataBaseTableKey;
        this.otherTableList[index].tbodyList.push({
          ...tbodyRow
        });
      }
    },
    handleFilterCondition(systemName) {
      this.tableConfig.theadList.forEach((item) => {
        if (item.key == 'configurationName') {
          this.$set(item.config, 'params', {
            matrixUuid: formspecificationsconfig.mapping.moduleName.matrixUuid,
            textField: formspecificationsconfig.mapping.moduleName.textField,
            valueField: formspecificationsconfig.mapping.moduleName.valueField,
            filterList: [
              {
                uuid: formspecificationsconfig.mapping.moduleName.attrUuid,
                textList: [systemName],
                valueList: [systemName]
              }
            ]
          });
        }
      });
    },
    filterModuleBySystem(relatedComponentValue) {
      // 根据系统名称过滤模块
      if (!this.$utils.isEmpty(relatedComponentValue)) {
        let val = Object.values(relatedComponentValue);
        this.otherTableList.forEach((item) => {
          item.theadList.forEach((v) => {
            if (v.key == 'configurationName') {
              let tempItem = v.config && v.config.dataList.find((v) => v.value == val[0]);
              if (tempItem) {
                this.$set(v.config, 'dataList', [tempItem]);
              }
            }
          });
        });
      }
    },
    handleFocus(parentIndex, childIndex, key, config) {
      let currentRowServiceValue = '';
      if (key != 'middlewareVersion' && key != 'dataBaseVersion') {
        return false;
      }
      // 拿到当前行的模块的值，去上一个列表查找是否有相同的值，然后Os版本的值
      if (!this.$utils.isEmpty(this.otherTableList[parentIndex]['tbodyList'])) {
        let currentRowList = this.otherTableList[parentIndex]['tbodyList'];
        currentRowList.forEach((item) => {
          if (!this.$utils.isEmpty(item)) {
            for (let keyV in item) {
              if (keyV == 'configurationName') {
                currentRowServiceValue = item[keyV];
                break;
              } else if (keyV == 'dataBaseVersion') {
                currentRowServiceValue = item[keyV];
                break;
              }
            }
          }
        });
      }
      // 遍历tableConfig里面的tbodyList 找到模块名称相同的值，然后拿到OS版本的值
      let findTableConfigItem = this.tableConfig.tbodyList.find((item) => item.configurationName == currentRowServiceValue);
      if (!this.$utils.isEmpty(findTableConfigItem) && !this.$utils.isEmpty(config)) {
        this.$set(config.params, 'filterList', [{
          uuid: 'osName',
          textList: [findTableConfigItem.osVersion],
          valueList: [findTableConfigItem.osVersion]
        }]);
      }
    },
    handleChange(parentIndex, childIndex, key, val, config) {
      // 拿到OS版本的值
      let childTbodyList = !this.$utils.isEmpty(this.otherTableList[parentIndex]) ? this.otherTableList[parentIndex].tbodyList : [];
      if (!this.$utils.isEmpty(childTbodyList) && !this.$utils.isEmpty(this.otherTableList[parentIndex]['tbodyList'][childIndex])) {
        this.$set(this.otherTableList[parentIndex]['tbodyList'][childIndex], [key], val); // 设置第二个值
      }
    },
    OSVersionChange(row, rowIndex, tableKey, val) {
      console.log('OSVersionChange', row, rowIndex, tableKey, val, row['osVersion']);
      if (!this.$utils.isEmpty(this.tableConfig.tbodyList[rowIndex])) {
        this.$set(this.tableConfig.tbodyList[rowIndex], [tableKey], val);
      }
      if (tableKey != 'osVersion') {
        // 不是os版本改变的时候，不新加数据库和中间件
        return false;
      }
      if (this.$utils.isEmpty(row['osVersion']) && !this.$utils.isEmpty(row['deliveryStandards'])) {
        // OS改变的时候把交付标准的值清空
        this.$set(row, 'deliveryStandards', '');
      }
      if (tableKey == 'osVersion' && this.tableConfig.tbodyList[rowIndex] && this.$utils.isEmpty(this.tableConfig.tbodyList[rowIndex]['osVersion'])) {
        // 清空OS，置空数据库和中间件
        this.otherTableList = [];
      } else {
        this.handleTheadlistBySystem();
        this.otherTableList.push({
          ...this.middlewareTableConfig
        }, {
          ...this.dataBaseTableConfig
        });
        this.$forceUpdate();
        console.log('this.otherTableList', this.otherTableList);
        this.filterModuleBySystem();
      }
    }
  },
  filter: {},
  computed: {
    formDataForWatch() {
      return JSON.parse(JSON.stringify(this.formData));
    }
    // allTbodyListValue() {
    //   let value = {};
    //   this.otherTableList.forEach((item) => {
    //     if (item.uuid) {
    //       value[item.uuid] = item.tbodyList;
    //     }
    //   });
    //   return {
    //     [this.tableConfig.uuid]: this.tableConfig.tbodyList,
    //     ...value
    //   };
    // }
    
  },
  watch: {
    formDataForWatch: {
      handler(formData, oldval) {
        if (!this.$utils.isEmpty(this.config.relatedComponentValue)) {
          if (!this.$utils.isSame(formData, oldval) && !this.$utils.isEmpty(oldval)) {
            // 切换不同系统名称，重置值
            this.systemName = '';
            this.otherTableList = [];
          } else {
            for (let key in formData) {
              if (key == this.config.relatedComponentValue) {
                this.systemName = formData[key].value;
                this.handleFilterCondition(formData[key].value);
                break;
              }
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
    // allTbodyListValue: {
    //   handler(formValue) {
    //     console.log('数据库保存值', formValue);
    //     this.setValue(formValue);
    //   },
    //   deep: true
    // }
  }
};
</script>
<style lang="less" scoped>
.label-text{
  white-space: break-spaces;
}
</style>
