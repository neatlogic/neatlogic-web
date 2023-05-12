<template>
  <div>
    <div class="search-main mb-nm">
      <div
        v-for="(item, index) in searchColumnDetailList"
        :key="index"
        class="search-list"
      >
        <div class="text-right text-title">
          {{ item.name }}
        </div>
        <div>
          <TsFormSelect
            v-model="searchValueList[index].expression"
            :dataList="getExpressionList(item.type)"
            border="border"
            transfer
            @on-change="(val)=>{
              if(val === 'is-null' || val === 'is-not-null') {
                changeValue(null,item.type,index)
              }
            }"
          ></TsFormSelect>
        </div>
        <div>
          <template v-if="searchValueList[index].expression != 'is-null' && searchValueList[index].expression != 'is-not-null'">
            <TsFormDatePicker
              v-if="item.type == 'date'"
              type="datetimerange"
              valueType="format"
              border="border"
              transfer
              @on-change="(val) =>{changeValue(val,item.type,index)}"
            ></TsFormDatePicker>
            <TsFormSelect
              v-else-if="item.type == 'select'"
              :dataList="item.config&& item.config.dataList?item.config.dataList: []"
              :multiple="true"
              border="border"
              transfer
              @on-change="(val) =>{changeValue(val,item.type,index)}"
            ></TsFormSelect>
            <UserSelect
              v-else-if="item.type == 'user' || item.type == 'team' || item.type == 'role'"
              :groupList="[item.type]"
              :multiple="true"
              border="border"
              transfer
              @on-change="(val) =>{changeValue(val,item.type,index)}"
            ></UserSelect>
            <TsFormInput v-else border="border" @change="(val) =>{changeValue(val,item.type,index)}"></TsFormInput>
          </template>
        </div>
      </div>
      <div class="text-right" :style="{'grid-column':isEven? '1 / span 2':''}">
        <Button type="primary" @click="handleSearch">{{ $t('page.search') }}</Button>
      </div>
    </div>
  </div>
</template>
<script>
import expressionConfig from '@/resources/plugins/TsSheet/form/config/common/expression.js';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    searchColumnDetailList: {
      type: Array,
      default: () => []
    },
    filter: Array,
    searchConditionValueList: Array //搜索条件的值列表
  },
  data() {
    return {
      searchValueList: [],
      expressionConfig: expressionConfig
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleSearch() {
      let sourceColumnList = [];
      this.searchValueList.forEach(item => {
        if (item.expression === 'is-null' || item.expression === 'is-not-null' || (item.expression && !this.$utils.isEmpty(item.valueList))) {
          sourceColumnList.push({
            uuid: item.uuid,
            expression: item.expression,
            valueList: item.valueList
          });
        }
      });
      this.$emit('changeConditionValue', {sourceColumnList: sourceColumnList});
    },
    changeValue(val, type, index) {
      let valueList = [];
      if (val && !this.$utils.isEmpty(val)) {
        if (val instanceof Array) {
          valueList.push(...val); 
        } else {
          valueList.push(val);
        }
      }
      this.$set(this.searchValueList[index], 'valueList', valueList);
    }
  },
  filter: {},
  computed: {
    isEven() {
      // 是否是偶数
      return this.searchColumnDetailList.length % 2 == 0;
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
    searchConditionValueList: {
      handler(val) {
        if (val && !this.$utils.isSame(val, this.searchValueList)) {
          this.searchValueList = this.$utils.deepClone(val);
        }
      }, 
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.search-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px;
}
.search-list {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  column-gap: 8px;
  line-height: 32px;
}
</style>

