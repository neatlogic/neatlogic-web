<template>
  <div class="node-main">
    <div class="bg-op content radius-sm" :class="!isValid?'border-error':''">
      <div v-if="canEdit">
        <div v-if="selectNodeList.length > 0" class="show-node">
          <div class="node-box overflow">
            <TsRow :gutter="8">
              <Col v-for="(item, index) in getShowList(selectNodeList)" :key="index" :span="fileSpan">
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
        <div class="node-table">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <div class="search input-border">
            <FilterSearch
              style="width:100%;display: inline-block;"
              :defaultValue="defaultSearchValue"
              :defaultSearchValue="defaultSearchValue"
              @changeValue="changeValue"
              @advancedModeSearch="advancedModeSearch"
            ></FilterSearch>
          </div>
          <template v-if="!loadingShow">
            <TsTable
              ref="table"
              v-model="selectList"
              :theadList="theadList"
              v-bind="tableData"
              selectedRemain
              keyName="id"
              height="500"
              multiple
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
          </template>
        </div>
      </div>
      <template v-else>
        <NodeView :list="selectNodeList"></NodeView>
      </template>
    </div>
    <MoreTarget
      v-if="isMoreNode"
      v-model="isMoreNode"
      :isReadonly="!canEdit"
      :dataList="selectNodeList"
      @on-ok="onOk"
    ></MoreTarget>
  </div>
</template>
<script>
import addtargetmixin from './addtargetmixin.js';
import FilterSearch from '@/views/pages/autoexec/components/common/filter-search.vue';
import {mutations} from '@/views/pages/autoexec/detail/actionDetail/actionState.js';
export default {
  name: '',
  components: {
    FilterSearch,
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    MoreTarget: resolve => require(['@/resources/components/FormMaker/formedit/view/resourceinput/more-target.vue'], resolve),
    NodeView: resolve => require(['../targetView/node-view'], resolve)
  },
  filtes: {},
  mixins: [addtargetmixin],
  props: {
    desc: String,
    showNumber: {
      //展示文件数
      type: Number,
      default: 4
    }
  },
  data() {
    return {
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
      selectNodeList: [],
      executeConfig: {
        selectNodeList: []
      },
      currentPage: 1,
      pageSize: 10,
      isMoreNode: false,
      loadingShow: true,
      disabledList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchNodeList(this.defaultSearchValue);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchNodeList(param) {
      let data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        cmdbGroupType: this.opType
      };
      if (param) {
        Object.assign(data, param);
      }
      this.$api.autoexec.action.getNodeList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getDataList(type, value) {
      type == 'pageSize' && (this.pageSize = value);
      let param = {
        currentPage: type == 'currentPage' ? value : this.currentPage,
        pageSize: type == 'pageSize' ? value : this.pageSize,
        cmdbGroupType: this.opType
      };
      param = Object.assign(param, this.searchVal);
      this.searchNodeList(param);
    },
    getSelected(indexList, itemList) {
      if (itemList && itemList.length > 0) {
        itemList.forEach(item => {
          let findId = this.selectNodeList.find(s => s.id == item.id);
          if (!findId) {
            this.selectNodeList.push(item);
          }
        });
      }
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
    removeNode(obj) {
      this.selectNodeList.splice(this.selectNodeList.findIndex(item => item.id === obj.id), 1);
      this.selectList.splice(this.selectList.findIndex(item => item === obj.id), 1);
    },
    valid() {
      if (!this.selectNodeList.length) {
        this.isValid = false;
      } else {
        this.isValid = true;
      }
      return this.isValid;
    },
    save() {
      this.executeConfig.selectNodeList = this.selectNodeList;
      let list = this.executeConfig.selectNodeList.map(item => {
        let keyList = ['id', 'ip', 'port', 'name'];
        let config = {};
        keyList.forEach(key => (config[key] = item[key]));
        return config;
      });
      return {selectNodeList: list};
    },
    onOk(val) {
      if (val) {
        let selectList = [];
        this.selectNodeList = val;
        val.length && (selectList = val.map((item) => {
          return item.id;
        }));
        this.selectList = selectList;
      }
      this.isMoreNode = false;
    },
    clearAll() {
      this.selectList = [];
      this.selectNodeList = [];
    },
    changeValue(val) {
      this.searchVal = this.$utils.deepClone(val);
      this.getDataList('currentPage', 1);
    },
    advancedModeSearch(searchVal) {
      // 复杂模式搜索
      let params = Object.assign({currentPage: 1, pageSize: 10, cmdbGroupType: this.opType}, searchVal);
      this.loadingShow = true;
      this.$api.autoexec.action.searchResourceCustomList(params).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  computed: {
    fileSpan() {
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
    defaultValue: {
      handler(val) {
        if (val && val.length > 0) {
          let selectList = [];
          this.selectNodeList = this.$utils.deepClone(val);
          val.forEach(item => {
            selectList.push(item.id);
          });
          this.selectList = selectList;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.node-main{
  .content{
    margin-top: 4px;
  }
}
.show-node{
 display: flex;
  padding: 16px 16px 0;
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
.node-table{
  position: relative;
  padding: 16px;
  .search {
    padding-bottom: 10px;
  }
}
</style>
