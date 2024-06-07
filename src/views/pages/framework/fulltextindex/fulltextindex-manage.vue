<template>
  <div class="padding-t">
    <TsContain :hideHeader="true">
      <div slot="content">
        <TsTable v-bind="fullTextIndexRebuildAuditData">
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
            <Progress v-if="row.status==='done'" :percent="100">
              <span>{{ row.statusText }}</span>
            </Progress>
            <Progress v-else-if="row.status==='doing'" :percent="99" status="active">
              <span>{{ row.statusText }}</span>
            </Progress>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li :class="row.status == 'doing'?'disabled':''" class="tsfont-restart" @click="rebuildIndex(row)">{{ $t('page.rebuildindex') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
        <FullIndexRebuildDialog v-if="isRebuildDialogShow" :audit="currentAudit" @close="closeRebuildDialog"></FullIndexRebuildDialog>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    FullIndexRebuildDialog: () => import('./fulltextindex-rebuild-dialog.vue')
  },
  props: {},
  data() {
    return {
      isRebuildDialogShow: false,
      currentAudit: null,
      fullTextIndexRebuildAuditData: {
        theadList: [{key: 'typeName', title: this.$t('page.type')},
          {key: 'statusText', title: this.$t('page.status')},
          {key: 'indexCount', title: this.$t('page.indexcount')},
          {key: 'startTime', title: this.$t('page.rebuildstartime'), type: 'time'},
          {key: 'endTime', title: this.$t('page.rebuildendtime'), type: 'time'},
          {key: 'error', title: this.$t('page.exception')},
          {key: 'action'}]
      },
      doingIdList: [], //正在创建的type列表
      timer: null//刷新定时器
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getFullTextIndexRebuildAuditList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    closeRebuildDialog(needRefresh) {
      this.isRebuildDialogShow = false;
      if (needRefresh) {
        this.doingIdList.push(this.currentAudit.type);
        this.checkAuditStatusInterval();
      }
    },
    rebuildIndex(audit) {
      this.currentAudit = audit;
      this.isRebuildDialogShow = true;
    },
    getFullTextIndexRebuildAuditList() {
      this.$api.framework.fulltextindex.getFullTextIndexRebuildAuditList().then(res => {
        this.$set(this.fullTextIndexRebuildAuditData, 'tbodyList', res.Return);
        res.Return.forEach(element => {
          if (element.status == 'doing') {
            this.doingIdList.push(element.type);
          }
        });
        if (this.doingIdList.length > 0) {
          this.timer = setTimeout(() => {
            this.checkAuditStatusInterval();
          }, 3000);
        }
      });
    },
    checkAuditStatusInterval() {
      this.clearTimer();
      if (this.doingIdList && this.doingIdList.length > 0) {
        this.$api.framework.fulltextindex.getFullTextIndexRebuildAuditList({typeList: this.doingIdList}).then(res => {
          this.doingIdList = [];
          if (res.Return && res.Return.length > 0) {
            res.Return.forEach(element => {
              const oldElement = this.fullTextIndexRebuildAuditData.tbodyList.find(a => a.type == element.type);
              if (element.status == 'doing') {
                this.doingIdList.push(element.type);
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
          if (this.doingIdList.length > 0) {
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
  watch: {}
};
</script>
<style lang="less">
</style>
