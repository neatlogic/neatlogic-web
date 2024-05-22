<template>
  <div>
    <TsDialog
      v-if="historyData"
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot>
        <TsTable
          v-if="historyData"
          v-bind="historyData"
          :border="false"
          :fixedHeader="false"
        >
          <template slot="type" slot-scope="{ row }">
            <span v-if="row.type=='attr'">{{ $t('page.attribute') }}</span>
            <span v-else-if="row.type='rel'">{{ $t('page.relation') }}</span>
          </template>
          <template slot="oldValueList" slot-scope="{ row }">
            <div v-if="row.type == 'attr' && row.oldValue">
              <AttrViewer :handler="row.oldValue.type" :ciEntity="row" :attrEntity="row.oldValue"></AttrViewer>
            </div>
            <div v-else-if="row.type=='rel'">
              <Tag
                v-for="(relentity,rindex) in row.oldValue"
                :key="rindex"
                color="primary"
                type="dot"
                style="cursor:pointer"
              >
                <span @click="toCiEntity(relentity.ciEntityId, relentity.ciId)">{{ relentity.ciEntityName }}</span>
              </Tag>
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
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    AttrViewer: () => import('./attr-viewer.vue')
  },
  props: {
    transactionId: {type: Number},
    ciId: {type: Number},
    isShow: {type: Boolean}
  },
  data() {
    return {
      transactionData: {},
      dialogConfig: {
        title: this.$t('page.detail'),
        type: 'modal',
        maskClose: true,
        isShow: true,
        hasFooter: false,
        width: 'medium'
      },
      historyData: {},
      theadList: Object.freeze([
        {
          key: 'label',
          title: '',
          width: 150
        }, {
          key: 'type',
          title: this.$t('page.type')
        }, {
          key: 'oldValueList',
          title: this.$t('page.value')
        }
      ])
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCientityTransaction();
    // this.getAttrByCiId();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toCiEntity(ciEntityId, ciId) {
      this.$router.push({path: '/ci/' + ciId + '/cientity-view/' + ciEntityId});
    },
    getCientityTransaction() {
      this.$api.cmdb.transaction.getDeletedCientityTransaction(this.transactionId).then(res => {
        const data = res.Return.detail;
        this.transactionData = res.Return.transaction;
        this.$set(this.historyData, 'tbodyList', data);
        this.$set(this.historyData, 'theadList', this.theadList);
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
</style>
