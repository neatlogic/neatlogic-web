<template>
  <div v-if="Object.keys(cmdbAttrConfig).length">
    <div class="search-main mb-nm">
      <div
        v-for="c in constSearchList"
        :key="c.uuid"
        class="search-list"
      >
        <div class="text-grey text-right overflow" :title="c.name">{{ c.name }}</div>
        <div style="grid-column: 2 / span 3">
          <template v-if="c.label == 'const_id'">
            <TsFormInput
              v-model="filterCiEntityId"
              border="border"
              :validateList="numberValid"
              clearable
            ></TsFormInput>
          </template>
          <template v-else-if="c.label='const_ciLabel'">
            <TsFormSelect
              v-model="filterCiId"
              v-bind="ciIdConfig(c.config.ciId)"
              border="border"
              transfer
              clearable
            ></TsFormSelect>
          </template>
          <template v-else>
            <TsFormInput border="border"></TsFormInput>
          </template>
        </div>
      </div>
      <div
        v-for="attr in attrSearchList"
        :key="attr.uuid"

        class="search-list"
      >
        <div class="text-grey text-right overflow" :title="attr.name">{{ attr.name }}</div>
        <template v-if="isReadOnly(attr.uuid)">
          <div class="text-tip overflow" style="grid-column: 2 / span 3">
            <span class="pr-xs">{{ $t('term.expression.eq') }}</span>
            <span :title="getFilterText(attr.uuid)">{{ getFilterText(attr.uuid) }}</span>
          </div>
        </template>
        <template v-else-if="attr.readonly">
          <div class="readonly-class text-title overflow">
            <TsFormSelect
              v-model="attr.expression"
              :dataList="getAttrData(attr.uuid).expressionList"
              :transfer="true"
              :clearable="false"
              border="border"
              :readonly="true"
            ></TsFormSelect>
            <div v-if="cmdbAttrConfig[attr.uuid].config['attr'].type !='select'" class="pl-md">
              {{ attr.valueList[0] }}
            </div>
            <div v-else class="pl-md">
              <SelectAttr :attrData="cmdbAttrConfig[attr.uuid].config['attr']" :valueList="attr.valueList"></SelectAttr>
            </div>
          </div>
        </template>
        <template v-else>
          <div>
            <TsFormSelect
              v-model="attr.expression"
              :dataList="getAttrData(attr.uuid).expressionList"
              :transfer="true"
              :clearable="false"
              border="border"
              @on-change="val => {setAttrData(attr, val ,'expression');}"
            ></TsFormSelect>
          </div>
          <div v-if="attr.uuid && (attr.expression!= 'is-null' && attr.expression != 'is-not-null')" class="search-condition">
            <SearchHandler
              :attrData="getAttrData(attr.uuid)"
              :valueList="attr.valueList"
              @setData="val => {setAttrData(attr, val ,'valueList');}"
            ></SearchHandler>
          </div>
        </template>
      </div>
      <div
        v-for="rel in relSearchList"
        :key="rel.uuid"

        class="search-list"
      >
        <div class="text-grey text-right overflow" :title="rel.name">{{ rel.name }}</div>
        <template v-if="isReadOnly(rel.uuid)">
          <div class="text-tip overflow" style="grid-column: 2 / span 3">
            <span class="pr-xs">{{ $t('term.expression.eq') }}</span>
            <span :title="getFilterText(rel.uuid)">{{ getFilterText(rel.uuid) }}</span>
          </div>
        </template>
        <template v-else-if="rel.readonly">
          <div>
            <div class="readonly-class text-title overflow">
              <TsFormSelect
                v-model="rel.expression"
                :dataList="getAttrData(rel.uuid).expressionList"
                border="border"
                :readonly="true"
              ></TsFormSelect>
              <template v-if="!$utils.isEmpty(rel.valueList)">
                <TsFormSelect
                  v-bind="relSelectConfig(rel.uuid)"
                  :value="rel.valueList"
                  :readonly="true"
                  class="pl-md"
                ></TsFormSelect>
              </template>
            </div>
          </div>
        </template>
        <template v-else>
          <div>
            <TsFormSelect
              v-model="rel.expression"
              :dataList="getAttrData(rel.uuid).expressionList"
              :transfer="true"
              :clearable="false"
              border="border"
              @on-change="val => {setAttrData(rel, val ,'expression');}"
            ></TsFormSelect>
          </div>
          <div v-if="rel.uuid && (rel.expression!= 'is-null' && rel.expression != 'is-not-null')" class="search-condition">
            <TsFormSelect
              v-bind="relSelectConfig(rel.uuid)"
              :value="rel.valueList"
              @on-change="val => {setAttrData(rel, val,'valueList');}"
            ></TsFormSelect>
          </div>
        </template>
      </div>
      <div class="text-right" :style="{'grid-column':isEven? '1 / span 2':''}">
        <Button type="primary" @click="handleSearch">{{ $t('page.search') }}</Button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    SearchHandler: () => import('@/resources/components/FormMaker/formedit/edit/components/dataSource/dataFilter/search-handler.vue'),
    SelectAttr: () => import('./view/select-attr.vue')
  },
  props: {
    searchColumnDetailList: {
      type: Array,
      default: () => []
    },
    filter: Array,
    searchConditionValueList: Array, //搜索条件的值列表
    config: Object //组件config配置
  },
  data() {
    return {
      initSearchList: [],
      constSearchList: [],
      attrSearchList: [],
      relSearchList: [],
      attrFilterList: [], //过滤条件：属性
      relFilterList: [], //过滤条件：关系
      cmdbAttrConfig: {},
      filterCiEntityId: null, //id
      filterCiId: null, //模型
      CiIdDataList: [],
      numberValid: [{ name: 'number', message: this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.number')}) }]
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
    getSearchList(val) { //可搜索列表
      let list = val ? this.$utils.deepClone(val) : [];
      let constSearchList = [];
      let attrSearchList = [];
      let relSearchList = [];
      list.forEach(item => {
        let config = item.config || {};
        this.$set(this.cmdbAttrConfig, item.uuid, item);
        if (!this.$utils.isEmpty(config)) {
          if (config['attr']) {
            let attrObj = {
              attrId: config['attr'].id,
              uuid: item.uuid,
              expression: '',
              valueList: [],
              name: item.name
            };
            attrObj = this.getFilterValueList('attr', item.uuid, attrObj);
            attrSearchList.push(attrObj);
          } else if (config['rel']) {
            let relObj = {
              relId: config['rel'].id,
              uuid: item.uuid,
              expression: '',
              valueList: [],
              direction: config['rel'].direction,
              name: item.name
            };
            relObj = this.getFilterValueList('rel', item.uuid, relObj);
            relSearchList.push(relObj);
          } else {
            constSearchList.push({
              uuid: item.uuid,
              name: item.name,
              label: item.label,
              config: config
            });
          }
        } else {
          constSearchList.push({
            uuid: item.uuid,
            name: item.name,
            label: item.label
          });
        }
      });
      this.constSearchList = constSearchList;
      this.attrSearchList = attrSearchList;
      this.relSearchList = relSearchList;
    },
    getFilterList(data) { //过滤条件
      if (data) {
        this.attrFilterList = data.attrFilterList || [];
        this.relFilterList = data.relFilterList || [];
      }
    },
    setAttrData(item, value, type) {
      if (type == 'valueList') {
        if (value) {
          if (value instanceof Array) {
            this.$set(item, 'valueList', value);
          } else {
            this.$set(item, 'valueList', [value]);
          }
        } else {
          this.$set(item, 'valueList', []);
        }
      } else if (type == 'expression') {
        if (value == 'is-null' || value == 'is-not-null') {
          this.$set(item, 'valueList', []);
        }
      }
    },
    getFilterValueList(type, uuid, obj) {
      let config = this.$utils.deepClone(obj);
      let findItem = null;
      if (type == 'attr') {
        findItem = this.attrFilterList.find(item => item.uuid == uuid);
      } else if (type == 'rel') {
        findItem = this.relFilterList.find(item => item.uuid == uuid);
      }
      if (findItem) {
        this.$set(config, 'expression', findItem.expression);
        this.$set(config, 'valueList', findItem.valueList);
        this.$set(config, 'readonly', true);
      }
      return config;
    },
    dealDataByUrl(nodeList, config) { //模型数据处理
      let columlist = [];
      if (nodeList && nodeList.length > 0) {
        nodeList.forEach((item, index) => {
          if (index > 0) {
            columlist.push(item);
          }
        });
      }
      return columlist;
    },
    handleSearch() { //点击搜索
      let reg = /^[0-9]\d*$/;
      if (this.filterCiEntityId && !reg.test(this.filterCiEntityId)) {
        return false;
      }
      let data = {
        type: 'cmdbci'
      };
      let attrFilterList = [];
      let relFilterList = [];
      this.attrSearchList.forEach(attr => {
        if (attr.expression && !this.$utils.isEmpty(attr.valueList)) {
          attrFilterList.push(
            {
              attrId: attr.attrId,
              expression: attr.expression,
              valueList: attr.valueList
            }
          );
        }
      });
      this.relSearchList.forEach(rel => {
        if (rel.expression && !this.$utils.isEmpty(rel.valueList)) {
          relFilterList.push(
            {
              relId: rel.relId,
              expression: rel.expression,
              valueList: rel.valueList,
              direction: rel.direction
            }
          );
        }
      });
      this.$set(data, 'attrFilterList', attrFilterList);
      this.$set(data, 'relFilterList', relFilterList);
      this.$set(data, 'filterCiEntityId', this.filterCiEntityId);
      this.$set(data, 'filterCiId', this.filterCiId);
      this.$emit('changeConditionValue', data);
    }
  },
  filter: {},
  computed: {
    isEven() {
      // 是否是偶数
      let list = [...this.constSearchList, ...this.attrSearchList, ...this.relSearchList];
      return list.length % 2 == 0;
    },
    isReadOnly() {
      return (uuid) => {
        if (!this.$utils.isEmpty(this.filter) && this.filter.find(f => f.uuid === uuid)) {
          return true;
        }
        return false;
      };
    },
    getFilterText() {
      return (uuid) => {
        let item = this.filter.find(f => f.uuid === uuid);
        return item.textList.join(',');
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
    },
    ciIdConfig() {
      let _this = this;
      return (id) => {
        if (id) {
          return {
            border: 'border',
            url: '/api/rest/cmdb/ci/downward/list',
            params: { id: id },
            textName: 'label',
            valueName: 'id',
            transfer: true,
            dealDataByUrl: _this.dealDataByUrl || null
          };
        } else {
          return {};
        }
      };
    }
  },
  watch: {
    config: {
      handler(val) {
        this.getFilterList(val);
      },
      deep: true,
      immediate: true
    },
    searchColumnDetailList: {
      handler(val) {
        if (val && !this.$utils.isSame(val, this.initSearchList)) {
          this.initSearchList = this.$utils.deepClone(val);
          this.getSearchList(val);
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
