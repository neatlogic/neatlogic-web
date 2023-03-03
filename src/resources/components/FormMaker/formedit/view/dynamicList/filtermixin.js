export default {
  methods: {
    getFilterListValue(filterList, uuid) {
      // 获取联动数据过滤列表数据
      let value = '';
      let arr = [];
      if (filterList && !this.$utils.isEmpty(filterList)) {
        arr = filterList.filter((val) => {
          return val.column == uuid;
        });
        if (!this.$utils.isEmpty(arr)) {
          value = arr[0].valueList && arr[0].valueList.length > 0 ? arr[0].valueList : '';
        } else {
          value = '';
        }
      }
      return value;
    },
    getSearchValueList(searchColumnDetailList, sourceColumnList, filterList) { //搜索数据转换
      let _this = this;
      let searchValueList = [];
      let filter = null;
      searchColumnDetailList &&
        searchColumnDetailList.forEach(item => {
          let obj = {
            type: item.type,
            column: item.uuid,
            valueList: _this.getFilterListValue(sourceColumnList, item.uuid), // 解决根据联动条件回显值
            expression: item.defaultExpression.expression,
            isFilterList: false,
            defaultValue: ''
          };
          filterList && (filter = filterList.find(f => f.uuid == item.uuid));
          if (filter) { //联动过滤
            if (!this.$utils.isEmpty(filter.valueList)) {
              this.$set(obj, 'expression', 'include');
              this.$set(obj, 'isFilterList', true);
              this.$set(obj, 'valueList', filter.valueList);
              this.$set(obj, 'defaultValue', filter.defaultValue);
            } else {
              this.$set(obj, 'expression', '');
              this.$set(obj, 'isFilterList', false);
              this.$set(obj, 'valueList', null);
              this.$set(obj, 'defaultValue', null);
            }
          } else {
            let findFilterItem = null;
            sourceColumnList && !this.$utils.isEmpty(sourceColumnList) && (findFilterItem = sourceColumnList.find(f => f.column == item.uuid));
            if (findFilterItem) {
              this.$set(obj, 'expression', findFilterItem.expression);
              this.$set(obj, 'isFilterList', true);
              this.$set(obj, 'valueList', findFilterItem.valueList);
              this.$set(obj, 'defaultValue', findFilterItem.defaultValue);
            }
          }
         
          searchValueList.push(obj);
        });
      return searchValueList;
    },
    updateFilterList(list) { //更新联动过滤
      let searchList = [];
      let filterList = list || [];
      if (filterList.length > 0) {
        filterList.forEach(item => {
          if (item.uuid && !this.$utils.isEmpty(item.valueList)) {
            searchList.push({
              uuid: item.uuid,
              valueList: item.valueList
            });
          }
        });
      }
      return searchList;
    },
    searchSourceColumnList(list, filterList) { //搜索数据sourceColumnList整理
      let sourceColumnList = [];
      if (list.length > 0) {
        list.forEach((s) => {
          let filterItem = null;
          if (filterList && filterList.length > 0) {
            filterItem = filterList.find(i => !this.$utils.isEmpty(i.valueList) && (i.uuid == s.column));
          }
          if (!filterItem && !this.$utils.isEmpty(s.valueList)) {
            sourceColumnList.push({
              column: s.column,
              expression: s.expression,
              valueList: s.valueList
            });
          }
        });
      }
      return sourceColumnList;
    }
  }
};
