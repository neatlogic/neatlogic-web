<template>
  <div>
    <div v-if="sourceColumnList && sourceColumnList.length>0" class="input-border">
      <Row
        v-for="(item,index) in sourceColumnList"
        :key="index"
        :gutter="8"
        class="filter-li"
      >
        <Col :span="item.column?8:22">
          <TsFormSelect
            v-model="item.column"
            :dataList="listFilter(dataList,sourceColumnList,item.column)"
            v-bind="uuidConfig"
            :disabled="disabled"
            @on-change="getMatrixvalue(item)"
          ></TsFormSelect>
        </Col>
        <template v-if="item.column">
          <Col :span="item.expression != 'is-null' && item.expression != 'is-not-null'?6:14">
            <TsFormSelect
              v-model="item.expression"
              :dataList="getExpressionList(item.type)"
              :disabled="disabled"
              @on-change="changeExpression(item)"
            ></TsFormSelect>
          </Col>
          <Col v-if="item.expression != 'is-null' && item.expression != 'is-not-null'" span="8">
            <TsFormSelect
              v-if="item.type === 'select'"
              v-model="item.defaultValue"
              v-bind="valueConfig(item.column)"
              :disabled="disabled"
              @on-change="(value, config, selectItem)=>{ changeValue(selectItem,index,'select'); }"
            ></TsFormSelect>
            <TsFormDatePicker
              v-else-if="item.type === 'date'"
              v-model="item.defaultValue"
              valueType="format"
              type="datetimerange"
              transfer
              :disabled="disabled"
              @on-change="(value)=>{ changeValue(value,index); }"
            ></TsFormDatePicker>
            <UserSelect
              v-else-if="item.type === 'user' || item.type === 'role'|| item.type === 'team'"
              v-model="item.defaultValue"
              :multiple="true"
              :transfer="true"
              :groupList="[item.type]"
              :disabled="disabled"
              @on-change="(value)=>{ changeValue(value,index); }"
            ></UserSelect>
            <TsFormInput
              v-else
              v-model="item.defaultValue[0]"
              :disabled="disabled"
              @on-change="(value)=>{changeValue(value,index);}"
            ></TsFormInput>
          </Col>
        </template>
        <Col span="2">
          <div class="tsfont-close-o btn-actionbtn" :class="disabled ? ' text-disabled' : 'text-action'" @click="removeFilter(index)"></div>
        </Col>
      </Row>
    </div>
    <div v-if="sourceColumnList.length<dataList.length">
      <Button long :disabled="disabled" @click.native="addFilter">
        <i class="tsfont-plus"></i>
        过滤条件
      </Button>
    </div>
  </div>
</template>
<script>
import expressionConfig from './expression.js';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve)
  },
  filters: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    dataList: [Array], //矩阵属性列表
    matrixUuid: String,
    matrixType: String,
    value: [Array],
    disabled: {type: Boolean, default: false}
  },
  data() {
    return {
      uuidConfig: {
        valueName: 'uuid',
        textName: 'name',
        transfer: true,
        clearable: false,
        validateList: ['required']
      },
      sourceColumnList: [],
      expressionConfig: expressionConfig
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.sourceColumnList = this.value || [];
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addFilter() {
      if (this.disabled) {
        return;
      }
      let newList = {
        column: '', 
        defaultValue: [],
        valueList: [], 
        expression: '',
        isFilterList: true,
        type: 'input'
      };
      this.$nextTick(() => {
        this.sourceColumnList.push(newList);
      });      
    },
    removeFilter(index) {
      if (this.disabled) {
        return;
      }
      this.$nextTick(() => {
        this.sourceColumnList.splice(index, 1);
      });
    },
    getMatrixvalue(item) {
      this.$set(item, 'defaultValue', []);
      this.$set(item, 'expression', '');
      this.getitemType(item);
    },
    getitemType(item) {
      let findItem = this.dataList.find(d => d.uuid == item.column);
      if (findItem) {
        this.$set(item, 'type', findItem.type);
      }
    },
    changeExpression(item) {
      this.$set(item, 'defaultValue', []);
      this.$set(item, 'valueList', []);
    },
    changeValue(value, index, type) {
      if (Array.isArray(value)) {
        let valueList = [];
        if (value && value.length > 0) {
          if (type == 'select') {
            value.forEach(s => {
              valueList.push(s.uuid);
            });
          } else {
            valueList = value;
          }
        }
        this.$set(this.sourceColumnList[index], 'valueList', valueList);
      } else {
        this.$set(this.sourceColumnList[index], 'valueList', [value]);
      }
    }
  },
  computed: {
    valueConfig() {
      return (value) => {
        if (value) {
          return {
            dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
            rootName: 'dataList',
            params: {
              matrixUuid: this.matrixUuid,
              keywordColumn: value,
              valueField: value,
              textField: value
            },
            transfer: true,
            search: true,
            multiple: true,
            border: 'border' 
          };
        } else {
          return {};
        }
      };
    },
    listFilter() {
      return function(all, list, column) {
        let totallist = [];
        let alllist = this.$utils.deepClone(all);
        totallist = alllist.filter((all) => {
          if (list && list.length > 0) {
            list.forEach((li) => {
              if (li.column == all.uuid && all.uuid != column) {
                Object.assign(all, {
                  _disabled: true
                });
              }
            });
          }
          return all; 
        });
        return totallist;
      };
    },
    getExpressionList() {
      return (type) => {
        let list = [];
        if (this.expressionConfig[type]) {
          list = this.expressionConfig[type];
        }
        return list;
      };
    }
  },
  watch: {
    sourceColumnList: {
      handler: function(val) {
        this.$emit('change', val);
      },
      deep: true
    },
    value: {
      handler: function(val) {
        if (val && !this.$utils.isSame(val, this.sourceColumnList)) {
          this.sourceColumnList = val;
        }
      },
      deep: true
    }
  }

};

</script>
<style lang='less' scoped>
.filter-li{
  padding-bottom:8px;
  &:last-of-type{
    padding-bottom:16px;
  }
}
.btn-actionbtn {
  line-height: 32px;
  height: 32px;
  width: 50%;
  font-size: 10px;
}
</style>
