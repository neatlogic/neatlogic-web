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
          class="mr-xs"
          @change="() => changeCurrentPage(1)"
        ></CombineSearcher>
      </template>
      <div slot="content">
        <div>
          <Loading v-if="loadingShow" loadingShow type="fix"></Loading>
          <TsCard
            v-else
            v-bind="strategyData"
            headerPosition="right"
            @updatePage="changeCurrentPage"
            @updateSize="changePageSize"
          >
            <template slot="header" slot-scope="{ row }">
              <div v-if="row.canEdit" class="action-group" @click.stop>
                <div class="action-item tsfont-plus" @click="addVersion(row)">{{ $t('page.versions') }}</div>
                <div class="action-item tsfont-edit" @click="editStrategy(row.id)">{{ $t('page.edit') }}</div>
                <div class="action-item tsfont-trash-o" @click="deleteStrategy(row.id)">{{ $t('page.delete') }}</div>
              </div>
            </template>
            <template slot-scope="{ row }">
              <div class="padding-sm">
                <TsRow class="mb-xs">
                  <Col span="24">
                    {{ row.name }}
                    <Tag :color="typeList[row.type].color" class="ml-sm">{{ typeList[row.type].name }}</Tag>
                  </Col>
                </TsRow>
                <TsRow>
                  <Col span="8">
                    <span v-if="row.versionPrefix" class="tsfont-version text-grey">
                      {{ row.versionPrefix }}
                    </span>
                  </Col>
                  <Col span="8">
                    <span class="tsfont-proxy text-grey" :class="row.srcBranch ? 'mr-sm' : ''"></span>
                    {{ row.srcBranch }}
                    <span class="tsfont-arrow-right text-grey ml-sm mr-sm"></span>
                    <span class="tsfont-proxy text-grey mr-sm"></span>
                    {{ row.targetBranch }}
                  </Col>
                  <Col span="8">
                    <span>
                      {{ $t('term.codehub.recentlyupdate') }}：
                      <UserCard
                        v-if="row.lcu"
                        :uuid="row.lcu"
                        :hideAvatar="true"
                      ></UserCard>
                    </span>
                    <span v-if="row.lcd" class="text-tip pl-sm">{{ row.lcd | formatDate }}</span>
                  </Col>
                </TsRow>
              </div>
            </template>              
          </TsCard>
        </div>
      </div>
    </TsContain>
    <StrategyEditDialog
      v-if="isShowStrategyEditDialog"
      :id="strategyId"
      @close="closeStrategyEditDialog"
    ></StrategyEditDialog>
    <VersionAddDialog
      v-if="isShowVersionAddDialog"
      :versionData="versionData"
      @close="closeVersion"
    ></VersionAddDialog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    StrategyEditDialog: resolve => require(['./edit/strategy-edit-dialog.vue'], resolve),
    VersionAddDialog: resolve => require(['./edit/version-add-dialog.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      versionData: null,
      loadingShow: true,
      isShowStrategyEditDialog: false,
      isShowVersionAddDialog: false,
      strategyId: null,
      strategyData: {
        span: 24,
        sm: 24,
        md: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        padding: false,
        boxShadow: false,
        hasHoverShadow: true,
        cardList: [],
        pageType: 'number',
        currentPage: 1,
        pageSize: 20,
        rowNum: 0
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
            name: 'appSystemId',
            type: 'select',
            label: this.$t('page.system'),
            transfer: true,
            dynamicUrl: '/api/rest/codehub/appsystem/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            onChange: (val) => {
              this.updateAppModule(val);
            }
          },
          {
            name: 'appModuleId',
            type: 'select',
            label: this.$t('page.subsystem'),
            transfer: true,
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getStrategyList();
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
    changeCurrentPage(currentPage) {
      this.strategyData.currentPage = currentPage;
      this.getStrategyList();
    },
    changePageSize(pageSize) {
      this.strategyData.currentPage = 1;
      this.strategyData.pageSize = pageSize;
      this.getStrategyList();
    },
    updateAppModule(appSystemId) {
      const params = appSystemId ? { appSystemId } : {};
      const dynamicUrl = appSystemId ? '/api/rest/codehub/appmodule/search' : '';

      this.searchConfig.searchList.forEach((item) => {
        if (item && item.name === 'appModuleId') {
          this.$set(item, 'params', params);
          this.$set(item, 'dynamicUrl', dynamicUrl);
        }
      });
    },
    getStrategyList() {
      let param = {
        currentPage: this.strategyData.currentPage,
        pageSize: this.strategyData.pageSize,
        ...this.searchVal
      };
      this.loadingShow = true;
      this.$api.codehub.strategy.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          const {pageCount = 0, rowNum = 0, pageSize = 10, currentPage = 1, tbodyList = []} = res?.Return || {};
          this.$set(this.strategyData, 'pageCount', pageCount);
          this.$set(this.strategyData, 'rowNum', rowNum);
          this.$set(this.strategyData, 'pageSize', pageSize);
          this.$set(this.strategyData, 'currentPage', currentPage);
          this.$set(this.strategyData, 'cardList', tbodyList);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    addVersion(row) {
      this.versionData = row;
      this.isShowVersionAddDialog = true;
    },
    editStrategy(id) {
      this.isShowStrategyEditDialog = true;
      if (id) {
        this.strategyId = id;
      }
    },
    deleteStrategy(id) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.process.policy')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.strategy.delete({id: id}).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.changeCurrentPage(1);
              vnode.isShow = false;
            }
          });
        }
      });
    },
    closeStrategyEditDialog(needRefresh) {
      this.isShowStrategyEditDialog = false;
      this.strategyId = null;
      if (needRefresh) {
        this.changeCurrentPage(1);
      }
    },
    closeVersion() {
      this.isShowVersionAddDialog = false;
      this.versionData = null;      
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
