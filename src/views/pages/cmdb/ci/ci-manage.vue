<template>
  <div>
    <Loading v-if="isLoading" :loading-show="isLoading" type="fix"></Loading>
    <TsContain border="border">
      <template slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="addCi()">{{ $t('term.cmdb.ci') }}</div>
          <div class="action-item tsfont-plus" @click="addCiType()">{{ $t('page.type') }}</div>
          <div class="action-item tsfont-upload" @click="importCi()">{{ $t('term.cmdb.importci') }}</div>
          <div class="action-item tsfont-export" @click="exportCi()">{{ $t('term.cmdb.exportci') }}</div>
          <div class="action-item tsfont-edit" @click="editCiType()">{{ $t('term.cmdb.cilevel') }}</div>
          <div class="action-item tsfont-edit" @click="editCiCatalog()">{{ $t('term.cmdb.cidirectory') }}</div>
          <div class="action-item">
            <TsFormSwitch
              v-model="isCiTopoShow"
              :true-value="true"
              :false-value="false"
              style="display: contents"
            ></TsFormSwitch>
            <span v-if="!isCiTopoShow">{{ $t('term.cmdb.showtopo') }}</span>
            <span v-if="isCiTopoShow">{{ $t('term.cmdb.hidetopo') }}</span>
          </div>
        </div>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="6">
            <RadioGroup v-if="!isCiTopoShow" v-model="showMode" type="button">
              <Radio label="card"><i class="tsfont-blocklist"></i></Radio>
              <Radio label="table"><i class="tsfont-list"></i></Radio>
            </RadioGroup>
          </Col>
          <Col :span="18">
            <CombineSearcher v-model="searchParam" v-bind="searchConfig" @change="searchCiTypeCi"></CombineSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content" class="content border-color">
        <div class="content-main">
          <div v-if="!isCiTopoShow && ciTypeList.length > 0">
            <div v-if="showMode === 'card'">
              <div v-for="(ciType, index) in ciTypeList" :key="index" class="type-main">
                <div v-if="ciType && ciType.cardList && ciType.cardList.length > 0" class="title text-title ci-title-text">
                  <span class="text-grey" :class="ciType.isMenu == 1 ? 'tsfont-formstaticlist' : ''">{{ ciType.name }}</span>
                </div>
                <div>
                  <TsCard
                    v-if="ciType && ciType.cardList && ciType.cardList.length > 0"
                    v-bind="ciType"
                    :sm="8"
                    :lg="6"
                    :xl="6"
                    :xxl="4"
                    :boxShadow="false"
                  >
                    <template slot-scope="{ row }">
                      <div class="ci-main" @click="editCi(row.id)">
                        <div>
                          <div class="ci-icon">
                            <i :class="row.icon + ' ' + getIconClass(row)"></i>
                          </div>
                        </div>
                        <div class="overflow">
                          <div class="ci-label overflow" :title="row.label">{{ row.label }}</div>
                          <div class="ci-name overflow text-grey" :title="row.name">{{ row.name }}</div>
                        </div>
                      </div>
                    </template>
                  </TsCard>
                </div>
              </div>
            </div>
            <div v-else>
              <TsTable
                :theadList="theadList"
                :tbodyList="tbodyList"
                :sortList="sortList"
                :sortOrder="sortOrder"
                :sortMulti="false"
                @updateSort="updateSort"
              >
                <template v-slot:name="{ row }">
                  <a href="javascript:void(0)" @click="editCi(row.id)">
                    <span :class="row.icon">{{ row.label }}</span>
                    <span class="text-grey">({{ row.name }})</span>
                  </a>
                </template>
                <template v-slot:parentCiId="{ row }">
                  <a v-if="row.parentCiId" href="javascript:void(0)" @click="editCi(row.parentCiId)">
                    <span :class="row.parentCiIcon">{{ row.parentCiLabel }}</span>
                    <span class="text-grey">({{ row.parentCiName }})</span>
                  </a>
                </template>
                <template v-slot:isAbstract="{ row }">
                  <span v-if="row.isAbstract" class="text-success">{{ $t('page.yes') }}</span>
                  <span v-else class="text-grey">{{ $t('page.no') }}</span>
                </template>
                <template v-slot:isVirtual="{ row }">
                  <span v-if="row.isVirtual" class="text-success">{{ $t('page.yes') }}</span>
                  <span v-else class="text-grey">{{ $t('page.no') }}</span>
                </template>
                <!--<template v-slot:syncPolicyCount="{ row }">
                  <span v-if="row.syncPolicyCount" class="text-success">是</span>
                  <span v-else class="text-grey">否</span>
                </template>-->
              </TsTable>
            </div>
          </div>
          <NoData v-if="!isCiTopoShow && ciTypeList.length == 0" :text="$t('page.nodata')" />
          <CiTopo
            v-if="isCiTopoShow"
            :searchParam="searchParam"
            :isShow="isCiTopoShow"
            @close="closeCiTopoDialog"
          ></CiTopo>
        </div>
      </div>
    </TsContain>
    <CiTypeEdit v-if="isCiTypeShow" :id="ciTypeId" @close="closeCiTypeDialog"></CiTypeEdit>
    <CiTypeManage v-if="isCiTypeManageShow" @close="closeCiTypeManageDialog"></CiTypeManage>
    <CiEdit v-if="isCiShow" :ciTypeId="newCiTypeId" @close="closeCiDialog"></CiEdit>
    <CiImportDialog v-if="isImportCiShow" @close="closeImportCiDialog"></CiImportDialog>
    <CiExportDialog v-if="isExportCiShow" @close="isExportCiShow = false"></CiExportDialog>
    <CiCatalogDialog v-if="isShowCiCatalog" @close="isShowCiCatalog = false"></CiCatalogDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CiTypeEdit: resolve => require(['../citype/citype-edit.vue'], resolve),
    CiTypeManage: resolve => require(['../citype/citype-manage.vue'], resolve),
    CiEdit: resolve => require(['./ci-edit.vue'], resolve),
    CiTopo: resolve => require(['./ci-topo.vue'], resolve),
    CiImportDialog: resolve => require(['./ci-import-dialog.vue'], resolve),
    CiExportDialog: resolve => require(['./ci-export-dialog.vue'], resolve),
    CiCatalogDialog: resolve => require(['./ci-catalog-dialog'], resolve)
  },
  props: {},
  data() {
    const _this = this;
    return {
      showMode: 'card',
      theadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'typeName', title: this.$t('page.type') },
        { key: 'parentCiId', title: this.$t('term.cmdb.parentci') },
        { key: 'isAbstract', title: this.$t('term.cmdb.abstractci') } + '?',
        { key: 'isVirtual', title: this.$t('term.cmdb.virtualci') } + '?',
        //{ key: 'syncPolicyCount', title: '配置同步策略？' },
        { key: 'description', title: this.$t('page.description') }
      ],
      sortList: ['name', 'typeName', 'parentCiId', 'isAbstract', 'isVirtual'],
      sortOrder: [],
      searchConfig: {
        search: true,
        labelPosition: 'top',
        searchList: [
          {
            type: 'select',
            name: 'typeIdList',
            valueName: 'id',
            textName: 'name',
            url: '/api/rest/cmdb/citype/list',
            label: this.$t('page.type'),
            multiple: true,
            transfer: true
          },
          {
            type: 'radio',
            name: 'isAbstract',
            dataList: [
              { value: 1, text: this.$t('page.yes') },
              { value: 0, text: this.$t('page.no') }
            ],
            label: this.$t('term.cmdb.onlyabstractci')
          },
          {
            type: 'radio',
            name: 'isVirtual',
            dataList: [
              { value: 1, text: this.$t('page.yes') },
              { value: 0, text: this.$t('page.no') }
            ],
            label: this.$t('term.cmdb.onlyvirtualci')
          }
        ]
      },
      searchParam: {},
      ciTypeCiList: [],
      newCiTypeId: null,
      ciTypeId: null,
      isCiTypeShow: false, //添加类型窗口
      isCiTypeManageShow: false, //编辑类型窗口
      isCiShow: false, //编辑模型窗口
      isImportCiShow: false, //导入模型窗口
      isExportCiShow: false, //导出模型窗口
      isCiTopoShow: false, //拓扑开关
      ciTypeList: [],
      isLoading: false,
      isShowCiCatalog: false,
      ciTypeConfig: {
        search: true,
        valueName: 'id',
        textName: 'name',
        placeholder: this.$t('term.cmdb.citype'),
        onChange: function(value) {
          if (!value) {
            _this.searchParam.typeId = null;
          }
          _this.searchCiTypeCi();
        }
      },
      actionUrl: BASEURLPREFIX + '/api/binary/cmdb/ci/import'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCiTypeList();
    this.searchCiTypeCi();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editCiCatalog() {
      this.isShowCiCatalog = true;
    },
    updateSort(sort) {
      this.sortOrder = [];
      this.sortOrder.push(sort);
      this.$addHistoryData('sortOrder', this.sortOrder);
    },
    importCi() {
      this.isImportCiShow = true;
    },
    exportCi() {
      this.isExportCiShow = true;
    },
    restoreHistory(historyData) {
      this.searchParam = historyData['searchParam'];
      this.showMode = historyData['showMode'] || 'card';
      this.sortOrder = historyData['sortOrder'];
    },
    getIconClass(row) {
      if (row.isVirtual) {
        return 'text-grey';
      } else {
        if (!row.isAbstract) {
          return 'text-primary';
        } else {
          return 'text-default';
        }
      }
    },
    getTopo: function() {
      this.isCiTopoShow = true;
    },
    getCiTypeList: function() {
      this.$api.cmdb.citype.listCiType().then(res => {
        if (res.Status == 'OK' && res.Return && res.Return.length > 0) {
          this.ciTypeConfig.dataList = res.Return.filter(d => d.ciCount > 0);
        }
      });
    },
    searchCiTypeCi: function() {
      this.isLoading = true;
      this.$addHistoryData('searchParam', this.searchParam);
      this.$api.cmdb.ci.searchCiTypeCi(this.searchParam).then(res => {
        if (res.Status == 'OK') {
          this.ciTypeList = res.Return;
          this.isLoading = false;
          this.ciTypeList.forEach(citype => {
            citype.cardList = citype.ciList;
          });
        }
      });
    },
    addCiType: function() {
      this.ciTypeId = null;
      this.isCiTypeShow = true;
    },
    editCiType() {
      this.isCiTypeManageShow = true;
    },
    closeCiTypeDialog: function(needRefresh) {
      this.isCiTypeShow = false;
      if (needRefresh) {
        this.getCiTypeList();
        this.searchCiTypeCi();
      }
    },
    closeCiTypeManageDialog(needRefresh) {
      this.isCiTypeManageShow = false;
      if (needRefresh) {
        this.getCiTypeList();
        this.searchCiTypeCi();
      }
    },
    closeCiDialog: function(action, ciId) {
      this.isCiShow = false;
      if (action == 'redirect' && ciId) {
        this.$router.push({ path: 'ci-detail/' + ciId });
      }
    },
    closeImportCiDialog(needRefresh) {
      this.isImportCiShow = false;
      if (needRefresh) {
        this.searchCiTypeCi();
      }
    },
    closeCiTopoDialog() {
      this.isCiTopoShow = false;
    },
    editCi: function(ciId) {
      if (ciId) {
        this.$router.push({
          path: 'ci-detail/' + ciId
        });
      }
    },
    addCi: function(ciTypeId) {
      this.newCiTypeId = ciTypeId;
      this.isCiShow = true;
    },
    toCiView: function(ciId) {
      if (ciId) {
        this.$router.push({
          path: 'ci-view/' + ciId
        });
      }
    }
  },
  filter: {},
  computed: {
    tbodyList() {
      const tbodyList = [];
      this.ciTypeList.forEach(citype => {
        citype.cardList.forEach(ci => {
          ci.typeName = citype.name;
          tbodyList.push(ci);
        });
      });
      if (this.sortOrder && this.sortOrder.length > 0) {
        this.sortOrder.forEach(sort => {
          tbodyList.sort((a, b) => {
            for (const sortKey in sort) {
              if (sort[sortKey]) {
                const x1 = typeof a[sortKey] == 'string' ? a[sortKey].toUpperCase() : a[sortKey];
                const x2 = typeof b[sortKey] == 'string' ? b[sortKey].toUpperCase() : b[sortKey];
                if (x1 && !x2) {
                  return sort[sortKey] === 'DESC' ? -1 : 1;
                } else if (!x1 && x2) {
                  return sort[sortKey] === 'DESC' ? 1 : -1;
                } else if (x1 && x2) {
                  if (x1 < x2) {
                    return sort[sortKey] === 'DESC' ? 1 : -1;
                  }
                  if (x1 > x2) {
                    return sort[sortKey] === 'DESC' ? -1 : 1;
                  }
                }
              }
              return 0;
            }
          });
        });
      }
      return tbodyList;
    }
  },
  watch: {
    showMode: {
      handler: function(val) {
        this.$addHistoryData('showMode', val);
      }
    }
  }
};
</script>
<style lang="less" scoped>
.content-main {
  .type-main {
    margin-bottom: 10px;
  }
  .ci-title-text {
    padding-left: 12px;
  }
}
.ci-main {
  cursor: pointer;
  display: grid;
  width: 100%;
  grid-template-columns: 40px auto;
  margin: 10px;
  .ci-icon {
    font-size: 24px;
  }
  .ci-label {
    font-size: 14px;
    margin-bottom: 2px;
  }
  .ci-name {
    font-size: 12px;
  }
}
</style>
