<template>
  <div>
    <TsContain class="bg-block">
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editStrategy()">策略</span>
        </div>
      </template>
      <template slot="topRight">
        <CombineSearcher
          v-model="searchVal"
          v-bind="searchConfig"
          @change="getTableList(1)"
        ></CombineSearcher>
      </template>
      <div slot="content">
        <div>
          <div>
            <Loading v-if="isLoad" loadingShow style="min-height:100px"></Loading>
            <TsCard
              v-else
              v-bind="strategyData"
              headerPosition="right"
              @updatePage="updatePage"
            >
              <template slot="header" slot-scope="{ row }">
                <div v-if="row.canEdit" class="action-group">
                  <div class="action-item text-action ts-plus" @click="addVersion(row)">添加版本</div>
                  <div class="action-item text-action ts-edit" @click="editStrategy(row.uuid)">编辑</div>
                  <div class="action-item text-action ts-trash" @click="deleteLi(row.uuid)">删除</div>
                </div>
              </template>
              <template slot-scope="{ row }">
                <table class="table" style="table-layout: fixed;">
                  <tbody>
                    <tr>
                      <td><h3 class="d_f">{{ row.name }}</h3><Tag :color="typeList[row.type].color" class="ml-10">{{ typeList[row.type].name }}</Tag></td>
                      <td rowspan="2">
                        <i class="ts-branch text-tip h3 text-icon mr-10"></i>
                        {{ row.srcBranch }}
                        <i class="ts-long-arrow-right text-tip h2 branch-sep mr-20 ml-20"></i>
                        <i class="ts-branch text-tip h3 text-icon mr-10"></i>
                        {{ row.targetBranch }}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>
                        <i v-if="row.versionPrefix" class="ts-version text-icon"></i><span v-if="row.versionPrefix" style="margin-left:5px;">{{ row.versionPrefix }}</span>
                      </td>
                      <td class="text-right"><span v-if="row.lcu && row.lcd">最新更新：{{ row.lcu }}</span><span v-if="row.lcd" class="text-tip ml-10">{{ row.lcd | formatDate }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </template>              
            </TsCard>
          </div>
        </div>
      </div>
    </TsContain>
    <StrategyEdit
      v-if="isEdit && editType=='strategy'"
      :uuid="editUuid"
      :systemUuid="systemUuid"
      :subsystemUuid="subsystemUuid"
      :isShow="isEdit"
      @close="close"
    ></StrategyEdit>
    <VersionAdd
      v-if="isEdit && editType=='version'"
      :list="versionlist"
      :isShow="isEdit"
      @close="closeVersion"
    ></VersionAdd>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    StrategyEdit: resolve => require(['./edit/strategy-edit.vue'], resolve),
    VersionAdd: resolve => require(['./edit/version-add.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      versionlist: null,
      isLoad: false,
      isEdit: false,
      editUuid: null,
      editType: 'strategy',
      keyword: '',
      systemUuid: '',
      subsystemUuid: '',
      strategyData: {
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        cardList: []        
      },
      typeList: {
        'branch': {name: '按分支合并', color: 'primary'},
        'issue': {name: '按需求合并', color: 'warning'}
      },
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
      this.strategyData.currentPage = 1;
      this.getList();
    },
    updatePage(page) {
      this.strategyData.currentPage = page;
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
    getList() {
      let param = {};
      this.strategyData.pageSize && Object.assign(param, {pageSize: this.strategyData.pageSize});
      this.strategyData.currentPage && Object.assign(param, {currentPage: this.strategyData.currentPage});
      if (this.subsystemUuid) {
        Object.assign(param, {subsystemUuid: this.subsystemUuid});
      }
      if (this.systemUuid) {
        Object.assign(param, {systemUuid: this.systemUuid});
      }
      if (this.keyword) {
        Object.assign(param, {keyword: this.keyword});
      }
      this.isLoad = true;
      this.$api.codehub.strategy.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this.strategyData, 'pageCount', res.Return.pageCount);
          this.$set(this.strategyData, 'rowNum', res.Return.rowNum);
          this.$set(this.strategyData, 'pageSize', res.Return.pageSize);
          this.$set(this.strategyData, 'currentPage', res.Return.currentPage);
          this.$set(this.strategyData, 'cardList', res.Return.list);
        } else {
          this.$set(this.strategyData, 'cardList', []);
        }
      }).finally(() => {
        this.isLoad = false;
      });
    },
    addVersion(list) {
      this.editType = 'version';
      this.versionlist = list;
      this.isEdit = true;
    },
    editStrategy(id) {
      this.editType = 'strategy';
      this.isEdit = true;
      if (id) {
        this.editUuid = id;
      }
    },
    deleteLi(id) {
      let _this = this;
      _this.$createDialog({
        title: '删除确认',
        content: '是否确认删除该策略',
        btnType: 'error',
        'on-ok': function(vnode) {
          _this.$api.codehub.strategy.delete({uuid: id}).then((res) => {
            if (res && res.Status == 'OK') {
              _this.$Message.success('删除成功');
              _this.getSearch();
              vnode.isShow = false;
            } else {
              _this.$Message.error(res.Message);
            }
          });
        }
      });
    },
    close(isreload) {
      this.isEdit = false;
      this.editUuid = null;
      this.versionlist = null;
      if (isreload) {
        this.getSearch();
      }
    },
    closeVersion() {
      this.isEdit = false;
      this.editUuid = null;      
    }
  },

  filter: {},

  computed: {

  },

  watch: {
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.text-label {
  line-height: 54px;
}
.top-title {
  .title {
    line-height: 30px;
  }
  .desc {
    line-height: 20px;
  }
  padding-left: 20px;
  margin-left: 20px;
  border-left: 1px solid @default-border;
}
</style>
