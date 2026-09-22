<template>
  <div>
    <Loading v-if="isLoading" :loading-show="isLoading" type="fix"></Loading>
    <TsContain
      border="border"
      siderPosition="right"
      :isSiderHide="!needSider || isSiderHide"
    >
      <template slot="topLeft">
        <div class="action-group">
          <div v-auth="['CI_MODIFY']" class="action-item tsfont-plus" @click="addCi()">{{ $t('page.model') }}</div>
          <div v-auth="['CI_MODIFY']" class="action-item tsfont-upload" @click="importCi()">{{ $t('term.cmdb.importci') }}</div>
          <div v-auth="['CI_MODIFY']" class="action-item tsfont-download" @click="exportCi()">{{ $t('term.cmdb.exportci') }}</div>
          <div v-auth="['CI_MODIFY']" class="action-item tsfont-plus" @click="addCiType()">{{ $t('page.hierarchy') }}</div>
          <div v-auth="['CI_MODIFY']" class="action-item tsfont-edit" @click="editCiType()">{{ $t('page.hierarchy') }}</div>
          <div
            v-auth="['CI_MODIFY']"
            class="action-item"
            :class="isBatchAuthMode ? 'tsfont-close' : 'tsfont-permission'"
            @click="toggleBatchAuthMode()"
          >{{ isBatchAuthMode ? $t('page.exitedit') : $t('term.cmdb.batcheditmodelauth') }}</div>
          <div class="action-item">
            <TsFormSwitch
              v-model="isCiTopoShow"
              :true-value="true"
              :false-value="false"
              :disabled="isBatchAuthMode"
              style="display: contents"
            ></TsFormSwitch>
            <span v-if="!isCiTopoShow">{{ $t('term.cmdb.showtopo') }}</span>
            <span v-if="isCiTopoShow">{{ $t('term.cmdb.hidetopo') }}</span>
          </div>
        </div>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="needSider ? 5 : 6">
            <RadioGroup v-if="!isCiTopoShow" v-model="showMode" type="button">
              <Radio label="card"><i class="tsfont-blocklist"></i></Radio>
              <Radio label="table"><i class="tsfont-list"></i></Radio>
            </RadioGroup>
          </Col>
          <Col :span="18">
            <CombineSearcher v-model="searchParam" v-bind="searchConfig" @change="searchCiTypeCi"></CombineSearcher>
          </Col>
          <Col v-if="needSider" :span="1"><div class="action-item tsfont-bar cursor" @click="toggleSiderHide()"></div></Col>
        </TsRow>
      </template>
      <template v-slot:sider>
        <!--必须通过needSider让tsanchor重新初始化，否则隐藏再显示后会有问题，原因不明-->
        <TsAnchor
          v-if="needSider"
          :itemList="ciTypeList"
          itemIdPrefix="type"
          @click="toCiType"
        ></TsAnchor>
      </template>
      <div slot="content" class="content border-color">
        <div class="content-main">
          <div v-if="isBatchAuthMode" class="flex-between align-center bg-grey radius-md pt-sm pr-sm pb-sm pl-sm mb-sm">
            <div>
              <Checkbox
                :value="isAllCurrentCiSelected"
                :indeterminate="isSomeCurrentCiSelected"
                @on-change="toggleSelectCurrentCi"
              >{{ $t('term.cmdb.selectcurrentmodels') }}</Checkbox>
              <span class="text-grey ml-md">{{ $t('term.cmdb.selectedmodelcount', { count: selectedCiIdList.length }) }}</span>
            </div>
            <Button type="primary" :disabled="selectedCiIdList.length === 0" @click="openBatchAuthDialog()">{{ $t('term.cmdb.editselectedmodelauth') }}</Button>
          </div>
          <div v-if="!isCiTopoShow && ciTypeList.length > 0">
            <div v-if="showMode === 'card'">
              <div v-for="(ciType, index) in ciTypeList" :key="index" class="type-main">
                <div v-if="ciType && ciType.cardList && ciType.cardList.length > 0" :id="'type' + ciType.id" class="title text-title ci-title-text">
                  <span class="text-grey">{{ ciType.name }}</span>
                </div>
                <div>
                  <TsCard
                    v-if="ciType && ciType.cardList && ciType.cardList.length > 0"
                    v-bind="ciType"
                    :class="{ 'ci-select-card': isBatchAuthMode }"
                    :sm="8"
                    :lg="6"
                    :xl="6"
                    :xxl="4"
                    :boxShadow="false"
                    :canSelect="isBatchAuthMode"
                    :value="selectedCiIdList"
                    :multiple="true"
                    keyName="id"
                    :headerPosition="isBatchAuthMode ? 'right' : null"
                    :alwaysShowHeader="isBatchAuthMode"
                    @change="handleSelectedCiChange"
                  >
                    <template slot="header" slot-scope="{ row }">
                      <span v-if="isBatchAuthMode" @click.stop>
                        <Checkbox :value="isCiSelected(row.id)" @on-change="toggleCiSelection(row)"></Checkbox>
                      </span>
                    </template>
                    <template slot-scope="{ row }">
                      <div class="ci-main" @click="handleCardCiClick(row)">
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
                v-model="selectedCiIdList"
                :theadList="currentTheadList"
                :tbodyList="tbodyList"
                :sortList="sortList"
                :sortOrder="sortOrder"
                :sortMulti="false"
                :multiple="true"
                :selectedRemain="true"
                keyName="id"
                @updateSort="updateSort"
                @getSelected="handleSelectedCiChange"
              >
                <template v-slot:name="{ row }">
                  <a href="javascript:void(0)" @click.prevent="handleTableCiClick(row)">
                    <span :class="row.icon">{{ row.label }}</span>
                    <span class="text-grey">({{ row.name }})</span>
                  </a>
                </template>
                <template v-slot:parentCiId="{ row }">
                  <template v-if="row.parentCiId">
                    <span v-if="isBatchAuthMode">
                      <span :class="row.parentCiIcon">{{ row.parentCiLabel }}</span>
                      <span class="text-grey">({{ row.parentCiName }})</span>
                    </span>
                    <a v-else href="javascript:void(0)" @click="editCi(row.parentCiId)">
                      <span :class="row.parentCiIcon">{{ row.parentCiLabel }}</span>
                      <span class="text-grey">({{ row.parentCiName }})</span>
                    </a>
                  </template>
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
    <BatchAuthEdit
      v-if="isBatchAuthDialogShow"
      :selectedCiList="selectedCiList"
      @close="closeBatchAuthDialog"
    ></BatchAuthEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CiTypeEdit: () => import('../citype/citype-edit.vue'),
    CiTypeManage: () => import('../citype/citype-manage.vue'),
    CiEdit: () => import('./ci-edit.vue'),
    CiTopo: () => import('./ci-topo.vue'),
    CiImportDialog: () => import('./ci-import-dialog.vue'),
    CiExportDialog: () => import('./ci-export-dialog.vue'),
    BatchAuthEdit: () => import('./batch-auth-edit.vue'),
    TsAnchor: () => import('@/resources/components/TsAnchor/TsAnchor.vue')
  },
  props: {},
  data() {
    const _this = this;
    return {
      isSiderHide: this.$localStore.get('isSiderHide') || false,
      showMode: this.$localStore.get('showMode') || 'card',
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
            label: this.$t('page.hierarchy'),
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
      isBatchAuthMode: false, //批量权限编辑模式
      isBatchAuthDialogShow: false, //批量权限编辑弹窗
      selectedCiIdList: [],
      selectedCiMap: {},
      ciTypeList: [],
      isLoading: false,
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
    toggleSiderHide() {
      this.isSiderHide = !this.isSiderHide;
      this.$localStore.set('isSiderHide', this.isSiderHide);
    },
    toCiType(item) {
      console.log(item);
      this.$utils.jumpTo('#type' + item.id);
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
    toggleBatchAuthMode() {
      if (this.isBatchAuthMode) {
        this.exitBatchAuthMode();
      } else {
        this.isCiTopoShow = false;
        this.isBatchAuthMode = true;
      }
    },
    exitBatchAuthMode() {
      this.isBatchAuthMode = false;
      this.isBatchAuthDialogShow = false;
      this.selectedCiIdList = [];
      this.selectedCiMap = {};
    },
    openBatchAuthDialog() {
      if (this.selectedCiIdList.length > 0) {
        this.isBatchAuthDialogShow = true;
      }
    },
    closeBatchAuthDialog(needRefresh) {
      this.isBatchAuthDialogShow = false;
      if (needRefresh) {
        this.exitBatchAuthMode();
        this.searchCiTypeCi();
      }
    },
    handleSelectedCiChange(idList) {
      this.selectedCiIdList = idList ? idList.slice() : [];
      this.syncSelectedCiMap();
    },
    syncSelectedCiMap() {
      Object.keys(this.selectedCiMap).forEach(ciId => {
        if (!this.selectedCiIdList.some(id => String(id) === ciId)) {
          this.$delete(this.selectedCiMap, ciId);
        }
      });
      this.allCiList.forEach(ci => {
        if (this.selectedCiIdList.includes(ci.id)) {
          this.$set(this.selectedCiMap, ci.id, ci);
        }
      });
    },
    toggleCiSelection(ci) {
      const selectedCiIdList = this.selectedCiIdList.slice();
      const index = selectedCiIdList.indexOf(ci.id);
      if (index > -1) {
        selectedCiIdList.splice(index, 1);
      } else {
        selectedCiIdList.push(ci.id);
      }
      this.handleSelectedCiChange(selectedCiIdList);
    },
    toggleSelectCurrentCi(isSelected) {
      const selectedCiIdSet = new Set(this.selectedCiIdList);
      this.allCiList.forEach(ci => {
        if (isSelected) {
          selectedCiIdSet.add(ci.id);
        } else {
          selectedCiIdSet.delete(ci.id);
        }
      });
      this.handleSelectedCiChange(Array.from(selectedCiIdSet));
    },
    isCiSelected(ciId) {
      return this.selectedCiIdList.includes(ciId);
    },
    handleCardCiClick(ci) {
      if (!this.isBatchAuthMode) {
        this.editCi(ci.id);
      }
    },
    handleTableCiClick(ci) {
      if (this.isBatchAuthMode) {
        this.toggleCiSelection(ci);
      } else {
        this.editCi(ci.id);
      }
    },
    restoreHistory(historyData) {
      this.searchParam = historyData['searchParam'];
      //this.showMode = historyData['showMode'] || 'card';
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
          this.syncSelectedCiMap();
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
    currentTheadList() {
      if (this.isBatchAuthMode) {
        return [{ key: 'selection', multiple: true }].concat(this.theadList);
      } else {
        return this.theadList;
      }
    },
    allCiList() {
      const ciList = [];
      this.ciTypeList.forEach(ciType => {
        if (ciType.cardList) {
          ciType.cardList.forEach(ci => {
            ciList.push(ci);
          });
        }
      });
      return ciList;
    },
    selectedCiList() {
      return this.selectedCiIdList.map(ciId => this.selectedCiMap[ciId]).filter(ci => !!ci);
    },
    isAllCurrentCiSelected() {
      return this.allCiList.length > 0 && this.allCiList.every(ci => this.isCiSelected(ci.id));
    },
    isSomeCurrentCiSelected() {
      const selectedCount = this.allCiList.filter(ci => this.isCiSelected(ci.id)).length;
      return selectedCount > 0 && selectedCount < this.allCiList.length;
    },
    needSider() {
      if (this.showMode === 'card' && !this.isCiTopoShow) {
        return true;
      } else {
        return false;
      }
    },
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
        //this.$addHistoryData('showMode', val);
        this.$localStore.set('showMode', val);
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
.ci-select-card {
  ::v-deep .tscard-body {
    border: 1px solid transparent;
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
