<template>
  <div v-if="searchColumnDetailList && searchColumnDetailList.length && Object.keys(cmdbAttrConfig).length">
    <TsRow>
      <Col v-for="c in constSearchList" :key="c.uuid" span="12">
        <TsRow class="search-item">
          <Col span="6">
            <div class="text-grey text-right overflow" :title="c.name">{{ c.name }}</div>
          </Col>
          <Col span="18">
            <template v-if="c.label == 'const_id'">
              <TsFormInput
                v-model="filterCiEntityId"
                border="border"
                :validateList="numberValid"
              ></TsFormInput>
            </template>
            <template v-else-if="c.label='const_ciLabel'">
              <TsFormSelect
                v-model="filterCiId"
                v-bind="ciIdConfig(c.config.ciId)"
                border="border"
                transfer
              ></TsFormSelect>
            </template>
            <template v-else>
              <TsFormInput border="border"></TsFormInput>
            </template>
          </Col>
        </TsRow>
      </Col>
      <Col v-for="attr in attrSearchList" :key="attr.uuid" span="12">
        <TsRow class="search-item">
          <Col span="6">
            <div class="text-grey text-right overflow" :title="attr.name">{{ attr.name }}</div>
          </Col>
          <template v-if="attr.readonly">
            <Col span="18">
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
            </Col>
          </template>
          <template v-else>
            <Col span="6">
              <TsFormSelect
                v-model="attr.expression"
                :dataList="getAttrData(attr.uuid).expressionList"
                :transfer="true"
                :clearable="false"
                border="border"
                @on-change="val => {setAttrData(attr, val ,'expression');}"
              ></TsFormSelect>
            </Col>
            <Col v-if="attr.uuid && (attr.expression!= 'is-null' && attr.expression != 'is-not-null')" span="12" class="search-condition">
              <SearchHandler
                :attrData="getAttrData(attr.uuid)"
                :valueList="attr.valueList"
                @setData="val => {setAttrData(attr, val ,'valueList');}"
              ></SearchHandler>
            </Col>
          </template>
        </TsRow>
      </Col>
      <Col v-for="rel in relSearchList" :key="rel.uuid" span="12">
        <TsRow class="search-item">
          <Col span="6">
            <div class="text-grey text-right overflow" :title="rel.name">{{ rel.name }}</div>
          </Col>
          <template v-if="rel.readonly">
            <Col span="18">
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
            </Col>
          </template>
          <template v-else>
            <Col span="6">
              <TsFormSelect
                v-model="rel.expression"
                :dataList="getAttrData(rel.uuid).expressionList"
                :transfer="true"
                :clearable="false"
                border="border"
                @on-change="val => {setAttrData(rel, val ,'expression');}"
              ></TsFormSelect>
            </Col>
            <Col v-if="rel.uuid && (rel.expression!= 'is-null' && rel.expression != 'is-not-null')" span="12" class="search-condition">
              <TsFormSelect
                v-bind="relSelectConfig(rel.uuid)"
                :value="rel.valueList"
                @on-change="val => {setAttrData(rel, val,'valueList');}"
              ></TsFormSelect>
            </Col>
          </template>
        </TsRow>
      </Col>
    </TsRow>
    <TsRow>
      <Col span="24" class-name="text-right">
        <Button type="primary" :class="!isEven() ? 'is-singel-row-show' : ''" @click="handleSearch">搜索</Button>
      </Col>
    </TsRow>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    SearchHandler: resolve => require(['@/resources/components/FormMaker/formedit/edit/components/dataSource/dataFilter/search-handler.vue'], resolve),
    SelectAttr: resolve => require(['./view/select-attr.vue'], resolve)
  },
  props: {
    searchColumnDetailList: Array,
    config: Object //组件对应的config数据
  },
  data() {
    return {
      constSearchList: [],
      attrSearchList: [],
      relSearchList: [],
      attrFilterList: [], //过滤条件：属性
      relFilterList: [], //过滤条件：关系
      cmdbAttrConfig: {},
      filterCiEntityId: null, //id
      filterCiId: null, //模型
      CiIdDataList: [],
      numberValid: [{ name: 'number', message: '请输入数字' }]
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
    },
    isEven() {
      // 是否是偶数
      let list = [...this.constSearchList, ...this.attrSearchList, ...this.relSearchList];
      return list.length % 2 == 0;
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
        if (attr.expression) {
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
        if (rel.expression) {
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
      if (this.filterCiEntityId) {
        this.$set(data, 'filterCiEntityId', this.filterCiEntityId);
      }
      if (this.filterCiId) {
        this.$set(data, 'filterCiId', this.filterCiId);
      }
      this.$emit('changeSearchCondition', data);
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
    }
  },
  filter: {},
  computed: {
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
        this.getSearchList(val);
      },
      deep: true,
      immediate: true
    } 
  }
};
</script>
<style lang="less" scoped>
.search-item {
  line-height: 38px;
  margin-bottom: 10px;
}
.readonly-class {
  display: flex;
  align-items: center;
}
.is-singel-row-show {
  // 搜索按钮，单行显示还是放在其他行的后面
  position: absolute;
  top: -45px;
  right: 0;
}
</style>
