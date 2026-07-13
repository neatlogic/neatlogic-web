<template>
  <div class="padding-t">
    <TsContain :hideHeader="true">
      <div slot="content">
        <Tabs v-model="currentTab" :animated="false">
          <TabPane :label="$t('page.database')" name="database">
            <div class="mb-md action-group">
              <div class="action-item tsfont-setting" @click="isWordEdit = true">{{ $t('term.framework.dictionarymanage') }}</div>
            </div>
            <TsTable :tbodyList="fullTextIndexRebuildAuditData['database']" :theadList="theadList">
              <template v-slot:error="{ row }">
                <Poptip
                  v-if="row.error"
                  trigger="hover"
                  :title="$t('page.exception')"
                  word-wrap
                  width="400"
                  :transfer="true"
                  :content="row.error"
                  placement="left"
                >
                  <span class="text-error tsfont-warning-s"></span>
                </Poptip>
              </template>
              <template v-slot:statusText="{ row }">
                <span v-if="row.status === 'done'" class="text-success">{{ row.statusText }}</span>
                <Progress
                  v-else-if="row.status === 'doing'"
                  :percent="99"
                  status="active"
                  style="width: 110px"
                ><span></span></Progress>
              </template>
              <template v-slot:action="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li :class="row.status === 'doing' ? 'text-disabled' : ''" class="tsfont-restart" @click="rebuildIndex(row)">{{ $t('page.rebuildindex') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </TabPane>
          <TabPane label="Elasticsearch" name="elasticsearch">
            <TsTable :tbodyList="fullTextIndexRebuildAuditData['elasticsearch']" :theadList="theadList">
              <template v-slot:error="{ row }">
                <Poptip
                  v-if="row.error"
                  trigger="hover"
                  :title="$t('page.exception')"
                  word-wrap
                  width="400"
                  :transfer="true"
                  :content="row.error"
                  placement="left"
                >
                  <span class="text-error tsfont-warning-s"></span>
                </Poptip>
              </template>
              <template v-slot:statusText="{ row }">
                <span v-if="row.status === 'done'" class="text-success">{{ row.statusText }}</span>
                <Progress
                  v-else-if="row.status === 'doing'"
                  :percent="99"
                  status="active"
                  style="width: 110px"
                ><span></span></Progress>
              </template>
              <template v-slot:action="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li class="tsfont-eye" @click="viewMetadata(row)">{{ $t('term.framework.viewmetadata') }}</li>
                    <li :class="row.status === 'doing' ? 'text-disabled' : ''" class="tsfont-restart" @click="rebuildIndex(row)">{{ $t('page.rebuildindex') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </TabPane>
          <!--<TabPane label="Qdrant" name="qdrant">
            <TsTable :tbodyList="fullTextIndexRebuildAuditData['qdrant']" :theadList="theadList">
              <template v-slot:error="{ row }">
                <Poptip
                  v-if="row.error"
                  trigger="hover"
                  :title="$t('page.exception')"
                  word-wrap
                  width="400"
                  :transfer="true"
                  :content="row.error"
                  placement="left"
                >
                  <span class="text-error tsfont-warning-s"></span>
                </Poptip>
              </template>
              <template v-slot:statusText="{ row }">
                <span v-if="row.status === 'done'" class="text-success">{{ row.statusText }}</span>
                <Progress
                  v-else-if="row.status === 'doing'"
                  :percent="99"
                  status="active"
                  style="width: 110px"
                ><span></span></Progress>
              </template>
              <template v-slot:action="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li :class="row.status === 'doing' ? 'text-disabled' : ''" class="tsfont-restart" @click="rebuildIndex(row)">{{ $t('page.rebuildindex') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </TabPane>-->
        </Tabs>
        <FullIndexRebuildDialog v-if="isRebuildDialogShow" :audit="currentAudit" @close="closeRebuildDialog"></FullIndexRebuildDialog>
        <FulltextIndexMetadataDialog v-if="isMetadataDialogShow" :audit="currentAudit" @close="closeMetadataDialog"></FulltextIndexMetadataDialog>
      </div>
    </TsContain>
    <FulltextIndexDictionaryEdit v-if="isWordEdit" @close="isWordEdit = false"></FulltextIndexDictionaryEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    FullIndexRebuildDialog: () => import('./fulltextindex-rebuild-dialog.vue'),
    FulltextIndexMetadataDialog: () => import('./fulltextindex-metadata-dialog.vue'),
    FulltextIndexDictionaryEdit: () => import('./fulltextindex-dictionay-edit.vue')
  },
  props: {},
  data() {
    return {
      currentTab: 'database',
      isRebuildDialogShow: false,
      isMetadataDialogShow: false,
      currentAudit: null,
      isWordEdit: false,
      isTest: false,
      theadList: [
        {
          key: 'typeName',
          title: this.$t('page.type')
        },
        { key: 'statusText', title: this.$t('page.status') },
        { key: 'indexCount', title: this.$t('page.indexcount') },
        { key: 'startTime', title: this.$t('page.rebuildstartime'), type: 'time' },
        { key: 'endTime', title: this.$t('page.rebuildendtime'), type: 'time' },
        { key: 'error', title: this.$t('page.exception') },
        { key: 'action' }
      ],
      fullTextIndexRebuildAuditData: {
        database: [],
        elasticsearch: [],
        qdrant: []
      },
      doingIdList: {
        database: [],
        elasticsearch: [],
        qdrant: []
      }, //正在创建的type列表
      timer: null //刷新定时器
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    //this.getFullTextIndexRebuildAuditList('database');
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.clearTimer();
  },
  destroyed() {},
  methods: {
    closeRebuildDialog(needRefresh) {
      this.isRebuildDialogShow = false;
      if (needRefresh) {
        this.doingIdList[this.currentAudit.handler].push(this.currentAudit.type);
        this.checkAuditStatusInterval();
      }
    },
    closeMetadataDialog() {
      this.isMetadataDialogShow = false;
      this.currentAudit = null;
    },
    rebuildIndex(audit) {
      if (audit.status !== 'doing') {
        this.currentAudit = audit;
        this.isRebuildDialogShow = true;
      }
    },
    viewMetadata(audit) {
      this.currentAudit = audit;
      this.isMetadataDialogShow = true;
    },
    getFullTextIndexRebuildAuditList(handler) {
      this.$api.framework.fulltextindex.getFullTextIndexRebuildAuditList({ handler: handler }).then(res => {
        this.fullTextIndexRebuildAuditData[handler] = res.Return;
        res.Return.forEach(element => {
          if (element.status === 'doing') {
            this.doingIdList[handler].push(element.type);
          }
        });
        if (this.doingIdList[handler].length > 0) {
          this.timer = setTimeout(() => {
            this.checkAuditStatusInterval();
          }, 3000);
        }
      });
    },
    checkAuditStatusInterval() {
      this.clearTimer();
      if (this.doingIdList[this.currentTab] && this.doingIdList[this.currentTab].length > 0) {
        this.$api.framework.fulltextindex
          .getFullTextIndexRebuildAuditList({
            handler: this.currentTab,
            typeList: this.doingIdList[this.currentTab]
          })
          .then(res => {
            this.doingIdList[this.currentTab] = [];
            if (res.Return && res.Return.length > 0) {
              res.Return.forEach(element => {
                const oldElement = this.fullTextIndexRebuildAuditData[this.currentTab].find(a => a.type == element.type);
                if (element.status === 'doing') {
                  this.doingIdList[element.handler].push(element.type);
                }
                if (oldElement) {
                  this.$set(oldElement, 'status', element.status);
                  this.$set(oldElement, 'statusText', element.statusText);
                  this.$set(oldElement, 'indexCount', element.indexCount);
                  this.$set(oldElement, 'startTime', element.startTime);
                  this.$set(oldElement, 'endTime', element.endTime);
                  this.$set(oldElement, 'error', element.error);
                }
              });
            }
            if (this.doingIdList[this.currentTab].length > 0) {
              this.timer = setTimeout(() => {
                this.checkAuditStatusInterval();
              }, 3000);
            }
          });
      }
    },
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    currentTab: {
      handler(val) {
        this.getFullTextIndexRebuildAuditList(val);
      },
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
