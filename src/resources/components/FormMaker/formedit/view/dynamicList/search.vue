
<template>
  <div v-if="searchColumnDetailList && searchColumnDetailList.length && searchValueList && searchValueList.length" class="condition-container input-border">
    <Row>
      <Col v-for="(search, index) in searchColumnDetailList" :key="index" span="12">
        <div class="search-item">
          <Row :gutter="8">
            <Col span="5" style="padding-right:6px;">
              <span class="condition-label text-grey overflow" :title="search.name">{{ search.name }}</span>
            </Col>
            <template v-if="!searchValueList[index].isFilterList">
              <Col span="7">
                <TsFormSelect
                  v-model="searchValueList[index].expression"
                  :dataList="search.expressionList || []"
                  valueName="expression"
                  textName="expressionName"
                  transfer
                ></TsFormSelect>
              </Col>
              <Col span="12">
                <TsFormDatePicker
                  v-if="search.type == 'date'"
                  v-model="searchValueList[index].defaultValue"
                  type="datetime"
                  valueType="format"
                  transfer
                  @on-change="(val) =>{changeValue(val,search.type,index)}"
                ></TsFormDatePicker>
                <TsFormSelect
                  v-else-if="search.type == 'select'"
                  v-model="searchValueList[index].defaultValue"
                  :dataList="searchColumnDetailConfig(search.config).dataList"
                  :multiple="true"
                  transfer
                  @on-change="(val) =>{changeValue(val,search.type,index)}"
                ></TsFormSelect>
                <UserSelect
                  v-else-if="search.type == 'user' || search.type == 'team' || search.type == 'role'"
                  v-model="searchValueList[index].defaultValue"
                  :groupList="[search.type]"
                  :multiple="true"
                  transfer
                  @on-change="(val) =>{changeValue(val,search.type,index)}"
                ></UserSelect>
                <TsFormInput
                  v-else
                  v-model="searchValueList[index].defaultValue"
                  @on-change="(val) =>{changeValue(val,'text',index)}"
                ></TsFormInput>
              </Col>
            </template>
            <Col v-else span="19">
              <div class="overflow text-title select-readonly">
                <div class="pr-md">{{ expressionConfig[searchValueList[index].expression] || '包含' }}</div>
                <div v-if="matrixType=='custom' || matrixType=='view'" class="overflow">
                  <template v-if="isFilter(search.uuid)">
                    <template v-if="filterHandler(search.uuid) == 'text'">
                      <div :title="getAllTitle(searchValueList[index].defaultValue)">
                        {{ getAllTitle(searchValueList[index].defaultValue) }}
                      </div>
                    </template>
                    <template v-else>
                      <TsFormSelect
                        :value="searchValueList[index].defaultValue"
                        v-bind="filterConfig(search.uuid)"
                      ></TsFormSelect>
                    </template>
                  </template>
                  <template v-else>
                    <TsFormSelect
                      :value="searchValueList[index].defaultValue"
                      v-bind="valueConfig(search.uuid)"
                    ></TsFormSelect>
                  </template>

                </div>
                <div v-else :title="getAllTitle(searchValueList[index].defaultValue)">
                  {{ getAllTitle(searchValueList[index].defaultValue) }}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Col>
    </Row>
    <Row>
      <Col span="24" class-name="search-btn-right">
        <Button type="primary" :class="!isEven() ? 'is-singel-row-show' : ''" @click="handleSearch">搜索</Button>
      </Col>
    </Row>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';
export default {
  name: '',
  components: {
    TsFormSelect,
    TsFormDatePicker,
    UserSelect,
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  filters: {
  },
  props: {
    config: Object,
    searchColumnDetailList: Array,
    value: Array,
    matrixType: String,
    filterList: Array,
    componentList: Array
  },
  data() {
    return {
      searchValueList: [],
      expressionConfig: {
        like: '包含',
        include: '包括'
      }
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
    searchColumnDetailConfig(config) {
      let obj = config;
      return obj;
    },
    handleSearch() {
      // 点击搜索
      this.$emit('changeConditionValue', this.searchValueList);
    },
    isEven() {
      // 是否是偶数
      return this.searchValueList.length % 2 == 0;
    },
    getAllTitle(item) {
      let allTitle = '';
      let textList = [];
      if (item && !this.$utils.isEmpty(item)) {
        item.forEach((i) => {
          if (i.indexOf('&=&') > -1) {
            textList.push(i.split('&=&')[1]);
          } else {
            textList.push(i);
          }
        });
        allTitle = textList.join(',');
      }
      return allTitle;
    },
    dealDataByUrl(nodeList, value) {
      let columlist = [];
      if (nodeList && nodeList.length > 0) {
        nodeList.forEach(item => {
          columlist.push({
            text: item[value].text,
            value: item[value].compose,
            uuid: item[value].value
          });
        });
      }
      return columlist;
    },
    changeValue(val, type, index) {
      if (val && !this.$utils.isEmpty(val)) {
        if (type == 'date' || type == 'text') {
          this.$set(this.searchValueList[index], 'valueList', [val]);
        } else if (type == 'user' || type == 'team' || type == 'role') {
          let valueList = [];
          val.forEach(v => {
            valueList.push(v.split('#')[1]);
          });
          this.$set(this.searchValueList[index], 'valueList', valueList);
        } else if (type == 'select') {
          this.$set(this.searchValueList[index], 'valueList', val);
        }
      } else {
        this.$set(this.searchValueList[index], 'valueList', []);
      }
    },
    getFilterConfig(uuid) {
      let itemConfig = null;
      let rultItem = this.filterList ? this.filterList.find(item => item.uuid == uuid) : null;
      if (rultItem && rultItem.ruleUuid) {
        itemConfig = this.componentList ? this.componentList.find(item => item.uuid == rultItem.ruleUuid) : null;
      }
      return itemConfig;
    },
    updateSearchValueList() {
      this.searchValueList.forEach(item => {
        let findItem = this.filterList ? this.filterList.find(l => l.uuid == item.column) : null;
        if (findItem) {
          if (!this.$utils.isEmpty(findItem.valueList)) {
            this.$set(item, 'valueList', findItem.valueList);
            this.$set(item, 'defaultValue', findItem.defaultValue);
            this.$set(item, 'isFilterList', true);
          } else {
            this.$set(item, 'isFilterList', false);
            this.$set(item, 'valueList', null);
            this.$set(item, 'defaultValue', null);
          }
        }
      });
      this.$forceUpdate();
    }
  },
  computed: {
    valueConfig() {
      return (value) => {
        if (value) {
          return {
            dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
            params: {
              matrixUuid: this.config.matrixUuid,
              keywordColumn: value,
              valueField: value,
              textField: value
            },
            rootName: 'dataList',
            multiple: true,
            sperateText: ',',
            readonly: true,
            transfer: true
          };
        } else {
          return {};
        }
      };
    },
    isFilter() { //判断是否是联动过滤
      return (uuid) => {
        let filter = false;
        let itemConfig = this.getFilterConfig(uuid);
        if (itemConfig) {
          filter = true;
        }
        return filter;
      };
    },
    filterConfig() { //联动来源组件配置信息
      return (value) => {
        let config = {
          dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
          params: {
            matrixUuid: this.config.matrixUuid,
            keywordColumn: value,
            valueField: value,
            textField: value
          },
          rootName: 'dataList',
          multiple: true,
          sperateText: ',',
          readonly: true,
          transfer: true
        };
        let itemConfig = this.getFilterConfig(value);
        if (itemConfig && itemConfig.config.dataSource == 'matrix') {
          return config;
        } else {
          return {
            dataList: itemConfig.config.dataList,
            multiple: true,
            sperateText: ',',
            readonly: true
          };
        }
      };
    },
    filterHandler() { //联动来源组件类型
      return (uuid) => {
        let handler = this.getFilterConfig(uuid).handler;
        let type = 'text';
        if (handler == 'formselect' || handler == 'formradio' || handler == 'formcheckbox') {
          type = 'select';
        }
        return type;
      };
    }
  },
  watch: {
    value: {
      handler(val) {
        if (!this.$utils.isSame(this.searchValueList, val)) {
          this.searchValueList = this.$utils.deepClone(val);
          this.updateSearchValueList();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.condition-container {
  padding: 6px 0px;
  .condition-label {
    display: inline-block;
    line-height: 32px;
    width: 100%;
    padding-right: 6px;
  }
  .ivu-col-span-12 {
    padding-bottom: 6px;
    &:nth-child(odd) {
      padding-right: 8px;
    }
    &:nth-child(even) {
      padding-left: 8px;
    }
  }
  .is-singel-row-show {
    // 搜索按钮，单行显示还是放在其他行的后面
    position: absolute;
    top: -45px;
    right: 0;
  }
  .search-btn-right {
    display: flex !important;
    justify-content: flex-end;
  }
  .select-readonly {
    display: flex;
    flex-wrap: nowrap;
    line-height: 32px;
    max-height: 32px;
  }
  .search-item {
    height: 44px;
    overflow: hidden;
  }
}
</style>
