<template>
  <TsDialog
    type="slider"
    :isShow="visible"
    width="medium"
    :title="$t('page.newtarget', {target: $t('term.autoexec.executetarget')})"
    :hasFooter="!disabled"
    @on-close="close"
  >
    <div class="pb-sm">
      <TsRow>
        <Col span="8">
        </Col>
        <Col span="16">
          <FilterSearch 
            :defaultSearchValue="defaultSearchValue" 
            @changeValue="changeValue"
            @advancedModeSearch="(value) => advancedModeSearch(value, 1, 20)"
          >
          </FilterSearch>
        </Col>
      </TsRow>
    </div>
    <TsTable
      ref="table"
      v-model="selectList"
      v-bind="tableData"
      selectedRemain
      keyName="id"
      multiple
      :fixedHeader="false"
      :loading="loading"
      :disabled="disabled"
      @getSelected="getSelected"
      @changeCurrent="getDataList('currentPage',...arguments)"
      @changePageSize="getDataList('pageSize',...arguments)"
    >
      <template v-slot:appModuleName="{row}">
        <span v-if="row.appModuleName || row.appModuleAbbrName">
          <span v-if="row.appModuleName">{{ row.appModuleName }}</span>
          <span v-if="row.appModuleAbbrName" class="text-tip">({{ row.appModuleAbbrName }})</span>
        </span>
        <span v-else>-</span>
      </template>
      <template v-slot:appSystemName="{row}">
        <span v-if="row.appSystemName || row.appSystemAbbrName">
          <span v-if="row.appSystemName">{{ row.appSystemName }}</span>
          <span v-if="row.appSystemAbbrName" class="text-tip">({{ row.appSystemAbbrName }})</span>
        </span>
        <span v-else>-</span>
      </template>
    </TsTable>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button
        v-if="isValid"
        type="primary"
        ghost
        @click="validSetting()"
      >{{ $t('page.validate') }}</Button>
      <Button type="primary" @click="onOk()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import {mutations} from '@/views/pages/autoexec/detail/actionDetail/actionState.js';
export default {
  name: '',
  components: {
    FilterSearch: () => import('@/views/pages/autoexec/components/common/filter-search.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  filtes: {},
  props: {
    visible: {//是否显示
      type: Boolean,
      default: false
    },
    value: Array, //已经勾选的数据
    nodeList: Array,
    isValid: { //是否需要校验节点
      type: Boolean,
      default: false
    },
    config: Object,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      loading: true,
      searchVal: {},
      theadList: [
        {key: 'selection'},
        { title: this.$t('page.ip'), key: 'ip'},
        { title: this.$t('page.port'), key: 'port'},
        { title: this.$t('page.name'), key: 'name'},
        { title: this.$t('page.tag'), key: 'tagList', type: 'tag'},
        { title: this.$t('page.environment'), key: 'envName'},
        { title: this.$t('term.cmdb.citype'), key: 'typeLabel'},
        { title: this.$t('page.module'), key: 'appModuleName'},
        { title: this.$t('page.apply'), key: 'appSystemName'},
        { title: this.$t('term.autoexec.assetstatus'), key: 'stateName'},
        { title: this.$t('page.networkarea'), key: 'networkArea'},
        { title: this.$t('term.autoexec.subordinatedepartment'), key: 'bgList', type: 'usercards'},
        { title: this.$t('page.owner'), key: 'ownerList', type: 'usercards'},
        { title: this.$t('term.autoexec.maintenanceperiod'), key: 'maintenanceWindow'},
        { title: this.$t('page.description'), key: 'description'}
      ],
      tableData: null,
      selectList: [],
      selectNodeList: _this.$utils.deepClone(_this.nodeList),
      nodeType: '',
      currentPage: 1,
      pageSize: 20,
      complexModeSearchValue: {}, // 复杂模式搜索值
      defaultSearchValue: {}
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {
    if (!this.$utils.isEmpty(this.defaultSearchValue) && this.defaultSearchValue.hasOwnProperty('conditionGroupList')) {
      this.advancedModeSearch(this.defaultSearchValue);
    } else {
      this.searchNodeList();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (!this.$utils.isEmpty(this.config)) {
        this.nodeType = this.config.nodeType || 'selectNodeList';
        this.searchVal = this.config.filter || {};
        this.defaultSearchValue = this.config.filter || {};
      }
      this.searchNodeList();
    },
    searchNodeList() {
      let data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        cmdbGroupType: this.opType,
        ...this.searchVal
      };
      this.$api.autoexec.action.getNodeList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.$set(this.tableData, 'theadList', this.theadList);
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    onOk() {
      let list = this.selectNodeList.map(item => {
        let keyList = ['id', 'ip', 'port', 'name'];
        let config = {};
        keyList.forEach(key => (config[key] = item[key]));
        return config;
      });
      let config = {
        nodeType: this.nodeType,
        filter: this.nodeType == 'filter' ? this.searchVal : {}
      };
      this.$emit('on-ok', list, config);
    },
    close() {
      this.$emit('close');
    },
    getDataList(type, value) {
      if (type == 'currentPage') {
        this.currentPage = value;
      } else {
        this.pageSize = value;
      }

      if (this.complexModeSearchValue && !this.$utils.isEmptyObj(this.complexModeSearchValue)) {
        this.advancedModeSearch(this.complexModeSearchValue);
      } else {
        this.searchNodeList();
      }
    },
    getSelected(indexList, itemList) {
      this.selectNodeList.push(...itemList);
      let selectNodeList = [];
      if (indexList && indexList.length > 0) {
        indexList.forEach(i => {
          let findItem = this.selectNodeList.find(n => n.id == i);
          if (findItem) {
            selectNodeList.push(findItem);
          }
        });
      }
      this.selectNodeList = selectNodeList;
    },
    changeValue(val) {
      this.searchVal = this.$utils.deepClone(val);
      this.getDataList('currentPage', 1);
    },
    advancedModeSearch(complexModeSearchValue, currentPage, pageSize) {
      this.complexModeSearchValue = complexModeSearchValue;
      // 复杂模式搜索
      let params = {
        currentPage: currentPage || this.currentPage,
        pageSize: pageSize || this.pageSize,
        cmdbGroupType: this.opType,
        ...this.defaultSearchValue,
        ...complexModeSearchValue
      };
      this.loading = true;
      this.$api.autoexec.action.searchResourceCustomList(params).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.$set(this.tableData, 'theadList', this.theadList);
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    validSetting(type) { //true不需要提示校验信息
      let list = this.selectNodeList.map(item => {
        let keyList = ['id', 'ip', 'port', 'name'];
        let config = {};
        keyList.forEach(key => (config[key] = item[key]));
        return config;
      });
      this.$emit('validSetting', list);
    }

  },
  computed: {
    opType() {
      return mutations.getOpType();
    }
  },
  watch: {
    value: {
      handler(val) {
        this.selectList = val;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
</style>
