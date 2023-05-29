<template>
  <div>
    <TsContain class="bg-block">
      <template slot="topLeft">
        <span class="tsfont-plus text-action" @click="addMr()">MR</span>
      </template>
      <template slot="topRight">
        <CombineSearcher
          v-model="searchVal"
          v-bind="searchConfig"
          @change="getTableList(1)"
        ></CombineSearcher>
      </template>
      <div slot="content">
        <div v-if="mrType.length>0" class="detail-container">
          <Tabs v-model="activetab">
            <TabPane
              v-for="(tab,tabindex) in mrType"
              :key="tabindex"
              :label="setTab(tab)"
              :name="tab.status"
            >
              <Loading v-if="isLoad" loadingShow style="height:120px"></Loading>
              <MergeTable
                v-if="activetab == tab.status && !isLoad"
                :mrData="mrData"
                :mrList="mrType"
                @changePageSize="updatePage"
                @changeCurrent="updateCurrent"
              ></MergeTable>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </TsContain>
    <MergeAddDialog
      v-if="isEdit"
      :systemUuid="systemUuid"
      :subsystemUuid="subsystemUuid"
      @close="close"
    ></MergeAddDialog>
  </div>
</template>

<script>
import MergeTable from './overview/merge-table.vue';
export default {
  name: 'MergeOverview',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    MergeAddDialog: resolve => require(['./overview/merge-add-dialog.vue'], resolve),
    MergeTable
  },

  filters: {},
  props: [''],
  data() {
    let _this = this;
    return {
      keyword: '',
      systemUuid: '',
      subsystemUuid: '',
      systemConf: {
        transfer: true,
        dynamicUrl: '/module/codehub/api/rest/system/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        onChange: function(val) {
          _this.updateSub(val);
          _this.getSearch();
        }
      },
      subsystemConf: {
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        onChange: function(val) {
          _this.getSearch();
        }        
      },
      mrData: {pageSize: 20},
      mrType: [],
      activetab: 'open',
      isLoad: false,
      isEdit: false,
      searchVal: {},
      searchConfig: {
        search: true,
        searchList: [
          {
            name: 'systemUuid',
            type: 'select',
            label: '系统',
            transfer: true,
            dynamicUrl: '/api/rest/codehub/system/search',
            rootName: 'list',
            textName: 'name',
            valueName: 'uuid',
            value: this.systemUuid,
            onChange: (val) => {
              this.systemUuid = val;
              this.updateSubSystem(val);
              this.getSearch();
            }
          },
          {
            name: 'subsystemUuid',
            type: 'select',
            label: '子系统',
            transfer: true,
            rootName: 'list',
            textName: 'name',
            valueName: 'uuid',
            value: this.subsystemUuid,
            onChange: (val) => {
              this.subsystemUuid = val;
              this.getSearch();
            }
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getList();
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
    getSearch() {
      this.mrData.currentPage = 1;
      this.getList();
    },
    updatePage(page) {
      this.mrData.pageSize = page;
      this.mrData.currentPage = 1;
      this.getList();
    },
    updateCurrent(page) {
      this.mrData.currentPage = page;
      this.getList();
    },
    updateSubSystem(val) {
      this.subsystemUuid = '';
      if (val) {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'subsystemUuid')) {
            this.$set(item, 'params', {systemId: val});
            this.$set(item, 'dynamicUrl', '/api/rest/codehub/subsystem/search');
          } 
        });
      } else {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'subsystemUuid')) {
            this.$set(item, 'params', {});
            this.$set(item, 'dynamicUrl', '');
          } 
        });
      }
    },
    async getList() {
      await this.getStatuslist();
      let param = {};
      this.mrData.pageSize && Object.assign(param, {pageSize: this.mrData.pageSize});
      this.mrData.currentPage && Object.assign(param, {currentPage: this.mrData.currentPage});
      if (this.subsystemUuid) {
        Object.assign(param, {subsystemUuid: this.subsystemUuid});
      }
      if (this.systemUuid) {
        Object.assign(param, {systemVo: {uuid: this.systemUuid}});
      }
      if (this.keyword) {
        Object.assign(param, {keyword: this.keyword});
      }
      if (this.activetab) {
        Object.assign(param, {status: this.activetab == 'all' ? '' : this.activetab});
      }
      this.isLoad = true;
      this.$api.codehub.merge.getList(param).then(res => {
        this.isLoad = false;
        if (res && res.Status == 'OK') {
          this.mrData.currentPage = res.Return.currentPage;
          this.mrData.pageCount = res.Return.pageCount;
          this.mrData.pageSize = res.Return.pageSize;
          this.mrData.rowNum = res.Return.rowNum;
          this.mrData.tbodyList = res.Return.list || [];
        } else {
          this.mrData.tbodyList = [];
        }
      });
    },
    addMr() {
      this.isEdit = true;
    },
    getStatuslist() {
      let param = {};
      this.subsystemUuid && Object.assign(param, {
        subsystemUuid: this.subsystemUuid
      });
      this.systemUuid && Object.assign(param, {
        systemUuid: this.systemUuid
      });
      this.keyword && Object.assign(param, {
        keyword: this.keyword
      });
      return this.$api.codehub.merge.getStatusCount(param).then(res => {
        if (res && res.Status == 'OK') {
          this.mrType = res.Return.list;
        } else {
          this.mrType = [];
        }
      });
    },
    close() {
      //跳转对应mr创建
      this.isEdit = false;
    }
  },
  computed: {
    setTab(h) {
      return function(tab) {
        return (h) => {
          return h('div', [
            h('span', tab.text),
            h('Badge', {
              props: {
                text: tab.count ? (tab.count > 99 ? '99+' : tab.count.toString()) : '0',
                type: 'normal'
              }
            })
          ]);
        };
      };
    }
  },
  watch: {
    activetab(val) {
      this.getSearch();
    },
    $route: {
      handler: function(val) {
        if (val && val.name == 'merge-overview') {
          this.getList();
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.text-label {
  line-height: 54px;
}
.detail-container{
  padding:8px;
  /deep/ .ivu-badge{
    vertical-align: top;
    transform: scale(0.8);
  }
}
</style>
