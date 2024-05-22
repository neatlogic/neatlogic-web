<template>
  <div class="node-main">
    <div class="bg-op content radius-sm" :class="isRequired?'border-error':''">
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
            查看所有{{ selectNodeList.length }}个目标
          </span>
          <span class="text-href" @click="clearAll">
            清空
          </span>
        </div>
      </div>
      <div class="node-table">
        <div class="search input-border">
          <FilterSearch @changeValue="changeValue"></FilterSearch>
        </div>
        <template v-if="!loadingShow">
          <TsTable
            ref="table"
            v-model="selectList"
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
    <MoreTarget
      v-if="isMoreNode"
      v-model="isMoreNode"
      :dataList="selectNodeList"
      @on-ok="onOk"
    ></MoreTarget>
  </div>
</template>
<script>

import FilterSearch from './filter-search.vue';
export default {
  name: 'Resourcenode',
  components: {
    FilterSearch,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    MoreTarget: () => import('@/resources/components/FormMaker/formedit/view/resourceinput/more-target.vue')
  },
  filtes: {},
  props: {
    desc: String,
    showNumber: {
      //展示文件数
      type: Number,
      default: 6
    },
    currentValue: Object
  },
  data() {
    return {
      searchVal: {},
      theadList: [
        {key: 'selection'},
        { title: 'ip', key: 'ip'},
        { title: '端口', key: 'port'},
        { title: '名称', key: 'name'},
        { title: '标签', key: 'tagList', type: 'tag'},
        { title: '环境', key: 'envName'},
        { title: '模型类型', key: 'typeLabel'},
        { title: '模块', key: 'appModuleName'},
        { title: '应用', key: 'appSystemName'},
        { title: '资产状态', key: 'stateName'},
        { title: '网络区域', key: 'networkArea'},
        { title: '所属部门', key: 'bgList', type: 'usercards'},
        { title: '所有者', key: 'ownerList', type: 'usercards'},
        { title: '维护期', key: 'maintenanceWindow'},
        { title: '描述', key: 'description'}
      ],
      tableData: null,
      selectList: [],
      selectNodeList: [],
      currentPage: 1,
      pageSize: 10,
      isMoreNode: false,
      loadingShow: true,
      disabledList: [],
      isRequired: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchNodeList();
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
        pageSize: this.pageSize
      };
      if (param) {
        Object.assign(data, param);
      }
      this.$api.common.getNodeList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.$set(this.tableData, 'theadList', this.theadList);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getDataList(type, value) {
      type == 'pageSize' && (this.pageSize = value);
      let param = {
        currentPage: type == 'currentPage' ? value : this.currentPage,
        pageSize: type == 'pageSize' ? value : this.pageSize
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
      !this.selectNodeList.length && (this.isRequired = true);
    },
    save() {
      this.valid();
      let list = this.selectNodeList.map(item => {
        let keyList = ['id', 'ip', 'port', 'name'];
        let config = {};
        keyList.forEach(key => (config[key] = item[key]));
        return config;
      });
      return list;
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
    }
  },
  watch: {
    currentValue: {
      handler(val) {
        if (!this.$utils.isEmptyObj(val)) {
          let data = this.$utils.deepClone(val);
          let selectList = [];
          this.selectNodeList = data.selectNodeList || [];
          this.selectNodeList.length && this.selectNodeList.forEach(item => {
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
  margin-bottom: 16px;
  .top{
    display: flex;
    padding: 16px;
    line-height: 1;
    border: 1px solid;
    >div {
      align-self: center;
    }
    .type-name{
      min-width: 70px;
    }
  }
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
   padding: 16px;
  .search {
    padding-bottom: 10px;
  }
}
</style>
