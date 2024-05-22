<template>
  <div>
    <TsContain :enableCollapse="true">
      <div slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-setting" @click="toDiscoveryRule">{{ $t('term.cmdb.discoveryrule') }}</div>
          <div v-if="unknowCount > 0" class="action-item" @click="toUnknownManage">
            <Badge :count="unknowCount"></Badge>
            <span>{{ $t('term.cmdb.unknowndevice') }}</span>
          </div>
        </div>
      </div>
      <div slot="topRight">
        <TsRow>
          <Col :span="6">
            <RadioGroup v-model="showMode" type="button">
              <Radio label="card"><i class="tsfont-blocklist"></i></Radio>
              <Radio label="table"><i class="tsfont-list"></i></Radio>
            </RadioGroup>
          </Col>
          <Col :span="18">
            <InputSearcher v-model="keyword"></InputSearcher>
          </Col>
        </TsRow>
      </div>
      <div slot="content" class="content-main">
        <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
        <div v-if="showMode === 'card'">
          <div v-for="(collectionType, index) in filtedCollectionTypeList" :key="index" class="mb-sm">
            <div
              v-if="collectionType && collectionType.cardList && collectionType.cardList.length > 0"
              style="cursor:pointer;text-decoration:underline;"
              class="text-grey"
              @click="toSyncManager(collectionType.name)"
            >
              <span>{{ collectionType.label }}</span>
              <span>({{ collectionType.name }})</span>
            </div>
            <div class="mt-nm">
              <TsCard
                v-bind="collectionType"
                :padding="false"
                :boxShadow="false"
                :sm="8"
                :lg="6"
                :xl="6"
                :xxl="4"
                @action="doAction"
              >
                <template slot-scope="{ row }" style="position:relative">
                  <div class="ci-main">
                    <div style="text-align:center">
                      <div class="ci-icon">
                        <i v-if="row.name" :class="'tsfont-' + row.name"></i>
                        <i v-else :class="'tsfont-ci-o'"></i>
                      </div>
                    </div>
                    <div class="overflow">
                      <div class="ci-label overflow" :title="row.label">{{ row.label }}</div>
                      <div class="ci-name overflow text-grey" :title="row.name">{{ row.name }}</div>
                    </div>
                    <div style="text-align:center"><Badge :count="row.dataCount" type="primary"></Badge></div>
                  </div>
                </template>
                <template v-slot:control="{ row }">
                  <div v-if="row.dataCount > 0" class="tsfont-search" @click="toDiscoveryData(row.name)">{{ $t('page.data') }}</div>
                  <div class="tsfont-edit" @click="toSyncManager(row.type, row.name)">{{ $t('page.config') }}</div>
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
              <span v-if="row.name" :class="'tsfont-' + row.name"></span>
              <span v-else :class="'tsfont-ci-o'"></span>
              <span>{{ row.label }}</span>
              <span class="text-grey">({{ row.name }})</span>
            </template>
            <template v-slot:type="{ row }">
              <span>{{ row.typeLabel }}</span>
              <span class="text-grey">({{ row.type }})</span>
            </template>
            <template v-slot:dataCount="{ row }">
              <Badge :count="row.dataCount" type="primary"></Badge>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li v-if="row.dataCount > 0" class="tsfont-search" @click="toDiscoveryData(row.name)">{{ $t('page.data') }}</li>
                  <li class="tsfont-edit" @click="toSyncManager(row.type, row.name)">{{ $t('page.config') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {},
  data() {
    return {
      showMode: this.$localStore.get('showMode') || 'card',
      theadList: [
        {
          key: 'name',
          title: this.$t('page.name')
        },
        { key: 'type', title: this.$t('page.classify') },
        { key: 'dataCount', title: this.$t('page.datacapacity') },
        { key: 'action' }
      ],
      sortList: ['name', 'type', 'dataCount'],
      sortOrder: [],
      collectionTypeList: [],
      isLoading: false,
      keyword: '',
      unknowCount: 0
    };
  },
  beforeCreate() {},
  created() {
    this.getUnknownCollectionList();
    this.getCollectionList();
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
    updateSort(sort) {
      this.sortOrder = [];
      this.sortOrder.push(sort);
      this.$addHistoryData('sortOrder', this.sortOrder);
    },
    doAction(row, type) {
      if (type === 'data') {
        this.toDiscoveryData(row.name);
      } else if (type === 'config') {
        this.toSyncManager(row.type, row.name);
      }
    },
    toDiscoveryRule() {
      this.$router.push({ path: '/discovery-rule-manage' });
    },
    toUnknownManage() {
      this.$router.push({ path: '/unknown-manage' });
    },
    getUnknownCollectionList() {
      this.$api.cmdb.sync.searchCollectionData({ collection: 'unknown' }).then(res => {
        this.unknowCount = res.Return.rowNum;
      });
    },
    getCollectionList() {
      this.isLoading = true;
      this.$api.cmdb.sync
        .getCollectionList({ needCount: true })
        .then(res => {
          const collectionList = res.Return;
          this.collectionTypeList = [];
          collectionList.forEach(element => {
            let collectionType = this.collectionTypeList.find(d => d.name == element.collection);
            if (!collectionType) {
              collectionType = {
                name: element.collection,
                label: element.collection_label,
                cardList: []
              };
              this.collectionTypeList.push(collectionType);
            }
            const cardData = {
              name: element.name,
              type: collectionType.name,
              label: element.label,
              dataCount: element.dataCount
            };
            collectionType.cardList.push(cardData);
          });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    toDiscoveryData(collection) {
      this.$router.push({ path: '/discovery-data/' + collection });
    },
    toSyncManager(collectionType, collection) {
      this.$router.push({ path: '/sync-manage/' + collectionType + (collection ? '/' + collection : '') });
    },
    restoreHistory(data) {
      this.keyword = data['keyword'] || '';
      this.showMode = data['showMode'];
      this.sortOrder = data['sortOrder'];
    }
  },
  filter: {},
  computed: {
    filtedCollectionTypeList() {
      let returnList = [];
      const collectionTypeList = this.$utils.deepClone(this.collectionTypeList);
      if (collectionTypeList && collectionTypeList.length > 0) {
        if (this.keyword) {
          collectionTypeList.forEach(type => {
            if ((type.name && type.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) || (type.label && type.label.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1)) {
              returnList.push(type);
            } else {
              const collectionList = type.cardList.filter(d => (d.name && d.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) || (d.label && d.label.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1));
              if (collectionList && collectionList.length > 0) {
                type.cardList = collectionList;
                returnList.push(type);
              }
            }
          });
        } else {
          returnList = collectionTypeList;
        }
      }
      return returnList;
    },
    tbodyList() {
      let tbodyList = [];
      const collectionTypeList = this.$utils.deepClone(this.collectionTypeList);
      if (collectionTypeList && collectionTypeList.length > 0) {
        collectionTypeList.forEach(type => {
          if (this.keyword) {
            if ((type.name && type.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) || (type.label && type.label.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1)) {
              type.cardList.forEach(d => {
                d.type = type.name;
                d.typeLabel = type.label;
              });
              tbodyList.push(...type.cardList);
            } else {
              const collectionList = type.cardList.filter(d => (d.name && d.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) || (d.label && d.label.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1));
              if (collectionList && collectionList.length > 0) {
                collectionList.forEach(d => {
                  d.type = type.name;
                  d.typeLabel = type.label;
                });
                tbodyList.push(...collectionList);
              }
            }
          } else {
            type.cardList.forEach(d => {
              d.type = type.name;
              d.typeLabel = type.label;
            });
            tbodyList.push(...type.cardList);
          }
        });
      }
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
    keyword: {
      handler: function(val) {
        this.$addHistoryData('keyword', val);
      }
    },
    showMode: {
      handler: function(val) {
        this.$addHistoryData('showMode', val);
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
}
.ci-main {
  cursor: pointer;
  display: grid;
  width: 100%;
  grid-template-columns: 40px auto 40px;
  margin: 10px 0px;
  .ci-icon {
    font-size: 24px;
  }
  .ci-label {
    font-size: 14px;
    margin-bottom: 2px;
    padding-right: 20px;
  }
  .ci-name {
    font-size: 12px;
  }
}
</style>
