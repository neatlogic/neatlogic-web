<template>
  <div>
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
          <Col span="4">
          </Col>
          <Col span="10">
            <PoptipSelect
              v-model="nodeType"
              :list="dataList"
              transfer
              border="border"
              :clearable="false"
              @change="changeType"
            ></PoptipSelect>
          </Col>
          <Col span="10">
            <FilterSearch :defaultValue="searchVal" @changeValue="changeValue"></FilterSearch>
          </Col>
        </TsRow>
      </div>
      <div v-if="selectNodeList.length > 0" class="show-node pb-sm">
        <div class="node-box overflow">
          <TsRow :gutter="8">
            <Col v-for="(item, index) in getShowList(selectNodeList)" :key="index" :span="nodeSpan">
              <div class="node-list border-color bg-op radius-sm">
                <div class="overflow" :title="targetText(item)">{{ targetText(item) }}</div>
                <span class="tsfont-close btn-remove text-tip-active" @click="removeNode(item)"></span>
              </div>
            </Col>
          </TsRow>
        </div>
        <div v-if="selectNodeList.length > showNumber">
          <span class="text-tip-active tips" style="padding-right: 16px;" @click="isMoreNode = true">
            {{ $t('term.autoexec.viewalltarget', {target: selectNodeList.length}) }}
          </span>
          <span class="text-href" @click="clearAll">
            {{ $t('page.clear') }}
          </span>
        </div>
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
        :canSelectRow="nodeType ==='filter'? false : true"
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
    <MoreTarget
      v-if="isMoreNode"
      v-model="isMoreNode"
      :isReadonly="disabled"
      :dataList="selectNodeList"
      @on-ok="closeMoreNode"
    ></MoreTarget>
  </div>
</template>
<script>
import {mutations} from '@/views/pages/autoexec/detail/actionDetail/actionState.js';
export default {
  name: '',
  components: {
    FilterSearch: () => import('@/views/pages/autoexec/components/common/filter-search.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    PoptipSelect: () => import('@/resources/components/PoptipSelect/PoptipSelect.vue'),
    MoreTarget: () => import('@/resources/components/FormMaker/formedit/view/resourceinput/more-target.vue')

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
      nodeType: 'selectNodeList',
      dataList: [
        {
          text: this.$t('page.node'),
          value: 'selectNodeList',
          description: this.$t('term.autoexec.filterchoosenodedesc')
        },
        {
          text: this.$t('page.filter'),
          value: 'filter',
          description: this.$t('term.autoexec.setfilterdesc')
        }
      ],
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
      searchParams: {},
      isMoreNode: false,
      showNumber: 4
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {},
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
        if (this.nodeType == 'filter') {
          this.theadList[0].key == 'selection' && this.theadList.shift();
        } else {
          this.theadList[0].key != 'selection' && this.theadList.unshift({key: 'selection'});
        }
      }
      this.searchNodeList();
    },
    changeType(val) {
      this.selectList = [];
      this.selectNodeList = [];
      this.searchVal = {};
      if (val == 'filter') {
        this.theadList[0].key == 'selection' && this.theadList.shift();
      } else {
        this.theadList[0].key != 'selection' && this.theadList.unshift({key: 'selection'});
      }
      this.searchNodeList();
    },
    searchNodeList() {
      let data = Object.assign({}, this.searchParams, this.searchVal);
      data.cmdbGroupType = this.opType;
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
        this.$set(this.searchParams, 'currentPage', value);
      } else {
        this.$set(this.searchParams, 'pageSize', value);
      }
      this.searchNodeList();
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
    validSetting(type) { //true不需要提示校验信息
      let list = this.selectNodeList.map(item => {
        let keyList = ['id', 'ip', 'port', 'name'];
        let config = {};
        keyList.forEach(key => (config[key] = item[key]));
        return config;
      });
      this.$emit('validSetting', list);
    },
    removeNode(obj) {
      this.selectNodeList.splice(this.selectNodeList.findIndex(item => item.id === obj.id), 1);
      this.selectList.splice(this.selectList.findIndex(item => item === obj.id), 1);
    },
    clearAll() {
      this.selectList = [];
      this.selectNodeList = [];
    },
    closeMoreNode(val) {
      if (val) {
        let selectList = [];
        this.selectNodeList = val;
        val.length && (selectList = val.map((item) => {
          return item.id;
        }));
        this.selectList = selectList;
      }
      this.isMoreNode = false;
    }
  },
  computed: {
    nodeSpan() {
      let span = 24 / this.showNumber;
      return span;
    },
    getShowList() {
      return function(list) {
        let showList = list.slice(0, this.showNumber);
        return showList;
      };
    },
    targetText() {
      return data => {
        return data.port && data.name ? data.ip + ':' + data.port + '/' + data.name : data.port && !data.name ? data.ip + ':' + data.port : data.ip;
      };
    },
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
.show-node{
 display: flex;
   >div{
    white-space: nowrap;
    align-self: center;
    &:not(:first-child){
      padding-left: 10px;
    }
  }
  .node-box{
    width: 100%;
    flex: 1;
    text-align: left;
  }
  .node-list{
    position: relative;
    height: 32px;
    line-height: 30px;
    padding: 0 4px;
    border: 1px solid;
    text-align: center;
    border-radius: 4px;
    .btn-remove {
      position: absolute;
      right: -3px;
      top: -3px;
      width: 16px;
      height: 16px;
      line-height: 16px;
      display: none;
    }
    &:hover{
      .btn-remove {
        display: block;
      }
    }
  }
}
</style>
