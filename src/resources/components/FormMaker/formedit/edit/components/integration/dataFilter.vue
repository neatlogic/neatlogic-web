<template>
  <div>
    <div v-if="sourceColumnList && sourceColumnList.length>0" class="input-border">
      <Row
        v-for="(item,index) in sourceColumnList"
        :key="index"
        :gutter="8"
        class="filter-li"
      >
        <Col :span="item.column?9:22">
          <TsFormSelect
            v-model="item.column"
            :dataList="listFilter(dataList,sourceColumnList,item.column)"
            v-bind="uuidConfig"
            @on-change="(val)=>{getIntegrationvalue(val,item)}"
          ></TsFormSelect>
        </Col>
        <Col v-if="item.column" span="13">
          <TsFormSelect
            v-model="item.valueList"
            v-bind="valueConfig(item.column)"
            @on-change="(val)=>{ changeValue(val,index); }"
          ></TsFormSelect>
        </Col>
        <Col span="2">
          <div class="tsfont-close text-action btn-actionbtn" @click="removeFilter(index)"></div>
        </Col>
      </Row>
    </div>
    <div v-if="sourceColumnList.length < dataList.length">
      <Button long @click.native="addFilter">
        <i class="tsfont-plus"></i>
        过滤条件
      </Button>
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {},
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    dataList: [Array],
    integrationUuid: String,
    type: String,
    value: [Array]

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
      sourceColumnList: []
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
      let newList = {
        column: '', 
        valueList: [], 
        defaultValue: [],
        expression: 'include',
        isFilterList: true,
        type: 'input'
      };
      this.$nextTick(() => {
        this.sourceColumnList.push(newList);
      });      
    },
    removeFilter(index) {
      this.$nextTick(() => {
        this.sourceColumnList.splice(index, 1);
      });
    },
    getIntegrationvalue(value, item) {
      if (value) {
        this.$set(item, 'valueList', []);
        this.getitemType(item);
      }
    },
    getitemType(item) {
      let findItem = this.dataList.find(d => d.uuid == item.column);
      if (findItem) {
        this.$set(item, 'type', findItem.type);
      }
    },
    dealDataByUrl(nodeList, value) { 
      let columlist = [];
      if (nodeList && nodeList.length > 0) {
        nodeList.forEach(item => {
          columlist.push({
            text: item[value],
            value: item[value]
          });
        });
      }
      return columlist;
    },
    changeValue(value, index) {
      this.$set(this.sourceColumnList[index], 'defaultValue', value);
    }
  },
  computed: {
    listFilter() {
      return function(all, list, column) {
        let totallist = [];
        let alllist = this.$utils.deepClone(all);
        let headList = [];
        alllist.length && alllist.forEach(item => {
          if (item.isSearchable) { //可搜索过滤的字段
            headList.push(item);
          }
        });
        totallist = headList.filter((all) => {
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
    valueConfig() {
      return (value) => {
        if (value) {
          return {
            dynamicUrl: 'api/rest/integration/column/data/search',
            params: { 
              integrationUuid: this.integrationUuid,
              keywordColumn: value,
              columnList: [value]
            },
            rootName: 'tbodyList',
            dealDataByUrl: (nodeList) => { return this.dealDataByUrl(nodeList, value); },
            transfer: true,
            search: true,
            multiple: true,
            border: 'border' 
          };
        } else {
          return {};
        }
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
    opacity: 0;
    &:hover {
      opacity: 1;
    }
  }
</style>
