<template>
  <div>
    <TsContain class="bg-block">
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="editStrategy()">{{ $t('term.process.policy') }}</span>
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
                  <div class="action-item text-action tsfont-plus" @click="addVersion(row)">{{ $t('dialog.title.addtarget',{'target':$t('page.versions')}) }}</div>
                  <div class="action-item text-action tsfont-edit" @click="editStrategy(row.uuid)">{{ $t('page.edit') }}</div>
                  <div class="action-item text-action tsfont-trash-o" @click="deleteLi(row.uuid)">{{ $t('page.delete') }}</div>
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
                      <td class="text-right"><span v-if="row.lcu && row.lcd">{{ $t('term.codehub.recentlyupdate') }}：{{ row.lcu }}</span><span v-if="row.lcd" class="text-tip ml-10">{{ row.lcd | formatDate }}</span></td>
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
        branch: {name: this.$t('term.codehub.branchmerge'), color: 'primary'},
        issue: {name: this.$t('term.codehub.issuemerge'), color: 'warning'}
      },
      searchVal: {},
      searchConfig: {
        search: true,
        searchList: [
          {
            name: 'systemUuid',
            type: 'select',
            label: this.$t('page.system'),
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
            label: this.$t('page.subsystem'),
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
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.process.policy')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.strategy.delete({uuid: id}).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getSearch();
              vnode.isShow = false;
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
  computed: {},
  watch: {}
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
