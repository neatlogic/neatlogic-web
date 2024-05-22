<template>
  <div>
    <template v-if="filterList && filterList.length>0">
      <TsRow
        v-for="(filter,findex) in filterList"
        :key="findex"
        :gutter="8"
        class="filter-li"
      >
        <Col :span="spanNum(filter)">
          <TsFormSelect
            v-model="filter.uuid"
            :dataList="listFilter(cmdbAttrList,filterList,filter.uuid)"
            v-bind="uuidConfig"
            @on-change="(val)=>{changeUuid(val,findex)}"
          ></TsFormSelect>
        </Col>
        <Col v-if="filter.uuid" :span="filter.expression== 'is-null' || filter.expression == 'is-not-null'?11:5">
          <TsFormSelect
            v-model="filter.expression"
            :dataList="getAttrData(filter.uuid).expressionList"
            :transfer="true"
            :clearable="false"
            @on-change="val=>{setAttrData(filter,val,'expression');}"
          ></TsFormSelect>
        </Col>
        <Col v-if="filter.uuid && (filter.expression!= 'is-null' && filter.expression != 'is-not-null')" span="12">
          <template v-if="cmdbAttrConfig[filter.uuid] && cmdbAttrConfig[filter.uuid].config['attr']">
            <SearchHandler
              :attrData="getAttrData(filter.uuid)"
              :valueList="filter.valueList"
              @setData="val => {setAttrData(filter, val,'valueList');}"
            ></SearchHandler>
          </template>
          <template v-else>
            <TsFormSelect
              v-bind="relSelectConfig(filter.uuid)"
              :value="filter.valueList"
              @on-change="val => {setAttrData(filter, val,'valueList');}"
            ></TsFormSelect>
          </template>
        </Col>
        <Col span="2">
          <div class="tsfont-close text-tip-active btn-actionbtn" @click="removeFilter(findex)"></div>
        </Col>
      </TsRow>
    </template>
    <div v-if="filterList.length < cmdbAttrList.length">
      <Button long @click.native="addFilter">
        <i class="tsfont-plus"></i>
        过滤条件
      </Button>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    SearchHandler: () => import('./search-handler.vue')
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: [Array],
    dataList: Array
  },
  data() {
    return {
      filterList: [],
      uuidConfig: {
        valueName: 'uuid',
        textName: 'name',
        transfer: true,
        clearable: false,
        validateList: ['required']
      },
      cmdbAttrConfig: {},
      cmdbAttrList: []
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
    addFilter() {
      let newList = {uuid: '', expression: '', valueList: []};
      this.$nextTick(() => {
        this.filterList.push(newList);
      });
    },
    removeFilter(index) {
      this.$nextTick(() => {
        this.filterList.splice(index, 1);
      });
    },
    getitemConfig(item) {
      let obj = item.config || {};
      let config = {};
      if (obj && obj['attr']) {
        config = obj['attr'];
      } else if (obj && obj['rel']) {
        config = obj['rel'];
      }
      return config;
    },
    getCmdbAttrConfig(list) {
      this.cmdbAttrConfig = {};
      let newList = [];
      if (list && list.length > 0) {
        list.forEach(item => {
          let config = this.getitemConfig(item);
          if (!this.$utils.isEmpty(config)) {
            this.$set(this.cmdbAttrConfig, item.uuid, item);
            newList.push(item);
          }
        });
      }
      this.cmdbAttrList = newList;
    },
    changeUuid(uuid, index) {
      this.filterList[index].expression = '';
      this.filterList[index].valueList = [];
      let config = {};
      if (this.cmdbAttrConfig[uuid] && this.cmdbAttrConfig[uuid].config['rel']) {
        let config = this.cmdbAttrConfig[uuid].config['rel'];
        this.filterList[index].direction = config.direction;
        this.filterList[index].relId = config.id;
      } else {
        this.filterList[index].hasOwnProperty('direction') && this.$delete(this.filterList[index], direction);
        if (this.cmdbAttrConfig[uuid].config['attr']) {
          config = this.cmdbAttrConfig[uuid].config['attr'];
          this.filterList[index].attrId = config.id;
        }
      }
    },
    setAttrData(item, value, type) {
      if (type == 'valueList') {
        if (value instanceof Array) {
          this.$set(item, 'valueList', value);
        } else {
          this.$set(item, 'valueList', [value]);
        }
      } else if (type == 'expression') {
        if (value == 'is-null' || value == 'is-not-null') {
          this.$set(item, 'valueList', []);
        }
      }
    }
  },
  filter: {},
  computed: {
    spanNum() {
      return (filter) => {
        let num = 22;
        if (filter.uuid && filter.expression && (filter.expression == 'is-null' || filter.expression == 'is-not-null')) {
          num = 11;
        } else if (filter.uuid) {
          num = 5;
        }
        return num;
      };
    },
    listFilter() {
      return (all, list, uuid) => {
        let totallist = [];
        let alllist = this.$utils.deepClone(all);
        totallist = alllist.filter((all) => {
          if (list && list.length > 0) {
            list.forEach((li) => {
              if (li.uuid == all.uuid && all.uuid != uuid) {
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
    getAttrData() {
      return (uuid) => {
        let config = {};
        if (this.cmdbAttrConfig[uuid]) {
          let item = this.cmdbAttrConfig[uuid];
          config = this.getitemConfig(item);
        }
        return config;
      };
    },
    relSelectConfig() {
      return (uuid) => {
        let obj = this.cmdbAttrConfig[uuid] && this.cmdbAttrConfig[uuid].config ? this.cmdbAttrConfig[uuid].config['rel'] : {};
        if (!this.$utils.isEmpty(obj)) {
          return {
            border: 'border',
            dynamicUrl: '/api/rest/cmdb/cientity/search',
            params: { ciId: obj.direction == 'from' ? obj.toCiId : obj.fromCiId },
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            transfer: true
          };
        } else {
          return {};
        }
      };
    }
  },
  watch: {
    filterList: {
      handler(val) {
        this.$emit('change', val);
      },
      deep: true
    },
    value: {
      handler: function(val) {
        if (val && !this.$utils.isSame(val, this.filterList)) {
          this.filterList = val;
        }
      },
      deep: true
    },
    dataList: {
      handler(val) {
        this.getCmdbAttrConfig(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.filter-li {
  padding-bottom: 10px;
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
