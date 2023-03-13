<template>
  <div>
    <TsContain border="border" navBorderBottom="none" :gutter="10">
      <template slot="topLeft">
        <div class="action-group">
          <div class="action-item">
            <TsFormSwitch
              v-model="isCiTopoShow"
              :true-value="true"
              :false-value="false"
              :trueText="$t('term.cmdb.hidetopo')"
              :falseText="$t('term.cmdb.showtopo')"
              showStatus
              style="display:contents"
            ></TsFormSwitch>
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
          <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
          <div v-if="!isCiTopoShow && ciTypeList.length > 0">
            <div v-if="showMode === 'card'">
              <div v-for="(ciType, index) in ciTypeList" :key="index" class="type-main">
                <div v-if="ciType && ciType.cardList && ciType.cardList.length > 0" class="title text-title ci-title-text">
                  <span class="text-grey" :class="ciType.isMenu == 1 ? 'ts-catalogue' : ''">{{ ciType.name }}</span>
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
                      <div class="ci-main" @click="toCiView(row.id)">
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
                  <a href="javascript:void(0)" @click="toCiView(row.id)">
                    <span :class="row.icon">{{ row.label }}</span>
                    <span class="text-grey">({{ row.name }})</span>
                  </a>
                </template>
                <template v-slot:parentCiId="{ row }">
                  <a v-if="row.parentCiId" href="javascript:void(0)" @click="toCiView(row.parentCiId)">
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
                <template v-slot:syncPolicyCount="{ row }">
                  <span v-if="row.syncPolicyCount" class="text-success">{{ $t('page.yes') }}</span>
                  <span v-else class="text-grey">{{ $t('page.no') }}</span>
                </template>
              </TsTable>
            </div>
          </div>
          <NoData v-if="!isCiTopoShow && ciTypeList.length == 0" :text="$t('page.nodata')" />
          <CiTopo v-if="isCiTopoShow" :searchParam="searchParam" :isShow="isCiTopoShow"></CiTopo>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CiTopo: resolve => require(['../ci/ci-topo.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {},
  data() {
    const _this = this;
    return {
      showMode: 'card',
      theadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'typeName', title: this.$t('page.classify') },
        { key: 'parentCiId', title: this.$t('term.cmdb.parentci') },
        { key: 'isAbstract', title: this.$t('term.cmdb.abstractci') + '？' },
        { key: 'isVirtual', title: this.$t('term.cmdb.virtualci') + '？' },
        { key: 'description', title: this.$t('page.description') }
      ],
      sortList: ['name', 'typeName', 'parentCiId', 'isAbstract', 'isVirtual', 'syncPolicyCount'],
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
            label: this.$t('page.classify'),
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
      isCiTopoShow: false, //拓扑开关
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
      }
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
    updateSort(sort) {
      this.sortOrder = [];
      this.sortOrder.push(sort);
      this.$addHistoryData('sortOrder', this.sortOrder);
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
    toCiView: function(ciId) {
      if (ciId) {
        this.$router.push({
          path: 'ci-view/' + ciId
        });
      }
    }
  },
  filter: {},
  computed: { tbodyList() {
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
          //debugger;
          for (const sortKey in sort) {
            if (sort[sortKey]) {
              const x1 = (typeof a[sortKey] == 'string' ? a[sortKey].toUpperCase() : a[sortKey]);
              const x2 = (typeof b[sortKey] == 'string' ? b[sortKey].toUpperCase() : b[sortKey]);
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
  }},
  watch: { showMode: {
    handler: function(val) {
      this.$addHistoryData('showMode', val);
    }
  }}
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
