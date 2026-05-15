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
            ref="formitem_column"
            v-model="item.column"
            :dataList="listFilter(dataList,sourceColumnList,item.column)"
            v-bind="uuidConfig"
            :disabled="disabled"
            :validateList="validateList"
            @on-change="getMatrixvalue(item)"
          ></TsFormSelect>
        </Col>
        <template v-if="item.column">
          <Col :span="item.expression != 'is-null' && item.expression != 'is-not-null'?6:14">
            <TsFormSelect
              ref="formitem_expression"
              v-model="item.expression"
              :dataList="getExpressionList(item.type)"
              :disabled="disabled"
              :validateList="validateList"
              transfer
              @on-change="changeExpression(item)"
            ></TsFormSelect>
          </Col>
          <Col v-if="item.expression != 'is-null' && item.expression != 'is-not-null'" span="8">
            <TsFormSelect
              v-if="item.type === 'select'"
              ref="formitem_value"
              v-model="item.defaultValue"
              v-bind="valueConfig(item.column)"
              :disabled="disabled"
              :validateList="validateList"
              @on-change="(value, config, selectItem)=>{ changeValue(selectItem,index,'select'); }"
            ></TsFormSelect>
            <TsFormDatePicker
              v-else-if="item.type === 'date'"
              ref="formitem_value"
              v-model="item.defaultValue"
              valueType="format"
              type="datetimerange"
              transfer
              :disabled="disabled"
              :validateList="validateList"
              @on-change="(value)=>{ changeValue(value,index); }"
            ></TsFormDatePicker>
            <UserSelect
              v-else-if="item.type === 'user' || item.type === 'role'|| item.type === 'team'"
              ref="formitem_value"
              v-model="item.defaultValue"
              :multiple="true"
              :transfer="true"
              :groupList="[item.type]"
              :disabled="disabled"
              :validateList="validateList"
              @on-change="(value)=>{ changeValue(value,index); }"
            ></UserSelect>
            <TsFormInput
              v-else
              ref="formitem_value"
              v-model="item.defaultValue[0]"
              :disabled="disabled"
              :validateList="validateList"
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
        {{ $t('page.filtercondition') }}
      </Button>
    </div>
  </div>
</template>
<script>
import expressionConfig from './expression.js';
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue')
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
      expressionConfig: expressionConfig,
      validateList: ['required']
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
              !this.$utils.isEmpty(s.value) && valueList.push(s.value);
            });
          } else {
            valueList = value;
          }
        }
        this.$set(this.sourceColumnList[index], 'valueList', valueList);
      } else {
        this.$set(this.sourceColumnList[index], 'valueList', [value]);
      }
    },
    valid() {
      let isValid = true;
      let refs = this.$refs;
      Object.keys(refs).forEach(key => {
        const item = this.$refs[key];
        if (item) {
          if (Array.isArray(item) && item.length) {
            item.forEach(k => {
              if (k.valid && !k.valid()) {
                isValid = false;
              }
            });
          } else {
            if (item.valid && !item.valid()) {
              isValid = false;
            }
          }
        } 
      });
      return isValid;
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
}
</style>
