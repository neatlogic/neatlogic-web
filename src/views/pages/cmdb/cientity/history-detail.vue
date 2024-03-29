<template>
  <div>
    <TsDialog v-if="historyData" v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
        <div v-if="transactionData.inputFrom" class="mb-md" style="text-align: right">
          <span class="text-grey">{{ $t('page.updatefrom') }}：</span>
          <span>{{ transactionData.inputFromText }}</span>
        </div>
        <TsTable :fixedHeader="false" :tbodyList="historyData.tbodyList" :theadList="theadList">
          <template v-slot:type="{ row }">
            <span v-if="row.type === 'attr'">{{ $t('page.attribute') }}</span>
            <span v-else-if="row.type === 'rel'">{{ $t('page.relation') }}</span>
            <span v-else-if="row.type === 'globalattr'">{{ $t('term.cmdb.globalattr') }}</span>
          </template>
          <template v-slot:oldValueList="{ row }">
            <div v-if="row.type === 'attr'">
              <AttrViewer v-if="row.oldValue" :handler="row.oldValue.type" :attrEntity="row.oldValue"></AttrViewer>
              <span v-else class="text-grey">-</span>
            </div>
            <div v-else-if="row.type === 'rel'">
              <div v-if="row.oldValue && row.oldValue.length > 0">
                <Tag
                  v-for="(relentity, rindex) in row.oldValue"
                  :key="rindex"
                  color="primary"
                  type="dot"
                  style="cursor: pointer"
                >
                  <span @click="toCiEntity(relentity.ciEntityId, relentity.ciId)">{{ relentity.ciEntityName }}</span>
                </Tag>
              </div>
              <div v-else class="text-grey">-</div>
            </div>
            <div v-else-if="row.type === 'globalattr'">
              <div v-if="row.oldValue && row.oldValue.length > 0">
                <Tag v-for="(attr, aindex) in row.oldValue" :key="aindex">{{ attr.value }}</Tag>
              </div>
              <span v-else class="text-grey">-</span>
            </div>
          </template>
          <template v-slot:newValueList="{ row }">
            <div v-if="row.type == 'attr'">
              <AttrViewer v-if="row.newValue" :handler="row.newValue.type" :attrEntity="row.newValue"></AttrViewer>
              <span v-else class="text-grey">-</span>
            </div>
            <div v-else-if="row.type == 'rel'">
              <div v-if="row.newValue && row.newValue.length > 0">
                <Tag
                  v-for="(relentity, rindex) in row.newValue"
                  :key="rindex"
                  :color="relentity.action == 'insert' ? 'success' : 'primary'"
                  type="dot"
                >
                  <span v-if="relentity.ciEntityId && relentity.ciId" style="cursor: pointer" @click="toCiEntity(relentity.ciEntityId, relentity.ciId)">{{ relentity.ciEntityName }}</span>
                  <span v-else>{{ relentity.ciEntityName }}</span>
                  <span style="margin-left: 3px; font-size: 12px" class="text-grey">{{ relentity.actionText }}</span>
                </Tag>
              </div>
              <span v-else class="text-grey">-</span>
            </div>
            <div v-else-if="row.type === 'globalattr'">
              <div v-if="row.newValue && row.newValue.length > 0">
                <Tag v-for="(attr, aindex) in row.newValue" :key="aindex">{{ attr.value }}</Tag>
              </div>
              <span v-else class="text-grey">-</span>
            </div>
          </template>
        </TsTable>
        <Divider v-if="transactionData.description" orientation="left">{{ $t('page.memo') }}</Divider>
        <div v-if="transactionData.description" class="fz10 text-grey">{{ transactionData.description }}</div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    AttrViewer: resolve => require(['./attr-viewer.vue'], resolve)
  },
  props: {
    transactionId: { type: Number },
    ciId: { type: Number },
    ciEntityId: { type: Number },
    isShow: { type: Boolean },
    isOpenNewPage: {
      //是否需要打开新窗口查看详情
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: false,
      transactionData: {},
      attrList: [],
      authData: {},
      dialogConfig: {
        title: this.$t('page.detail'),
        type: 'modal',
        maskClose: true,
        isShow: true,
        hasFooter: false,
        width: 'large',
        btnList: [
          {
            text: this.$t('page.recover'),
            type: 'primary',
            fn: vnode => {
              this.recoverCiEntity();
            }
          }
        ]
      },
      historyData: {},
      theadList: Object.freeze([
        {
          key: 'label',
          title: ''
        },
        {
          key: 'type',
          title: this.$t('page.type')
        },
        {
          key: 'oldValueList',
          title: this.$t('page.beforeedit'),
          width: 320
        },
        {
          key: 'newValueList',
          title: this.$t('page.afteredit'),
          width: 320
        }
      ])
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async init() {
      this.getAttrByCiId();
      await this.getCientityTransaction();
      this.getCiEntityAuth();
    },
    async recoverCiEntity() {
      if (!this.authData || !this.authData.cientityrecover) {
        return;
      }
      let brotherTransactionCount = 0;
      if (this.transactionData.id && this.transactionData.transactionGroupId) {
        await this.$api.cmdb.transaction.getBrotherTransactionCount(this.transactionData.id, this.transactionData.transactionGroupId).then(res => {
          brotherTransactionCount = res.Return;
        });
      }
      let content = this.$t('dialog.content.recoverconfirm', { target: this.$t('term.cmdb.cientity') });
      if (brotherTransactionCount > 0) {
        content = this.$t('dialog.content.invokerecoverconfirm', { count: brotherTransactionCount });
      }
      this.$createDialog({
        title: this.$t('dialog.title.recoverconfirm'),
        content: content,
        btnType: 'success',
        'on-ok': vnode => {
          this.$api.cmdb.transaction.recoverTransaction(this.transactionData.id).then(res => {
            this.$Message.success(this.$t('message.recoversuccess'));
            vnode.isShow = false;
            this.close(true);
          });
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    toCiEntity(ciEntityId, ciId) {
      if (this.isOpenNewPage) {
        window.open(HOME + '/cmdb.html#/ci/' + ciId + '/cientity-view/' + ciEntityId, '_blank');
      } else {
        this.$router.push({ path: '/ci/' + ciId + '/cientity-view/' + ciEntityId });
      }
    },
    getAttrByCiId() {
      this.$api.cmdb.ci.getAttrByCiId(this.ciId).then(res => {
        this.attrList = res.Return;
      });
    },
    getCiEntityAuth() {
      this.$api.cmdb.cientity.getCiEntityAuthById(this.ciEntityId, this.ciId, ['cientityrecover']).then(res => {
        this.authData = res.Return;
        if (this.transactionData && this.transactionData.status == 'commited' && this.transactionData.action != 'insert' && this.authData && this.authData['cientityrecover']) {
          this.dialogConfig.hasFooter = true;
        }
      });
    },
    async getCientityTransaction() {
      this.isLoading = true;
      await this.$api.cmdb.transaction
        .getCientityTransaction(this.transactionId, this.ciId, this.ciEntityId)
        .then(res => {
          const data = res.Return.detail;
          this.transactionData = res.Return.transaction;
          this.$set(this.historyData, 'tbodyList', data);
          this.$set(this.historyData, 'theadList', this.theadList);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.historyTable {
  display: grid;
  grid-template-columns: 150px 80px auto;
  .cell {
    padding: 9px;
    border-bottom: 1px solid;
  }
  .diffHeader,
  .diffContent {
    display: grid;
    grid-template-columns: 50% 50%;
    grid-gap: 10px;
    word-break: break-all;
  }
}
.historyTable:last-child {
  .cell {
    border-bottom: 0px;
  }
}
</style>
