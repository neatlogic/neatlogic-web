<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="addCorporation()">{{ $t('term.pbc.organization') }}</span>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsCard
            :cardList="corporationList"
            :sm="12"
            :lg="8"
            :xl="6"
            :xxl="4"
            :boxShadow="false"
          >
            <template slot-scope="{ row }">
              <div class="padding corporation-item">
                <div>{{ row.name }}</div>
                <div><span class="text-grey mr-xs">{{ $t('term.pbc.financialorganizationcode') }}</span><span>{{ row.config.facilityOwnerAgency }}</span></div>
                <div v-if="row.itemCount" class="item-count"><Badge type="primary" :count="row.itemCount"></Badge></div>
              </div>
            </template>
            <template v-slot:control="{ row }">
              <div class="tsfont-edit" @click="editCorporation(row)">{{ $t('page.edit') }}</div>
              <div class="tsfont-trash-o" :class="{ 'text-disabled': row.itemCount > 0 }" @click="deleteCorporation(row)">{{ $t('page.delete') }}</div>
            </template>
          </TsCard>
        </div>
      </template>
    </TsContain>
    <CorporationEdit v-if="isCorporationEditShow" :id="currentCorporationId" @close="closeCorporationDialog"></CorporationEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    CorporationEdit: () => import('./corporation-edit-dialog.vue')
  },
  props: {},
  data() {
    return {
      isCorporationEditShow: false,
      currentCorporationId: null,
      corporationList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCorporationList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editCorporation(row) {
      this.isCorporationEditShow = true;
      this.currentCorporationId = row.id;
    },
    deleteCorporation(row) {
      if (row.itemCount <= 0) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('term.pbc.organization')}),
          'on-ok': vnode => {
            this.$api.pbc.corporation.deleteCorporation(row.id).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.getCorporationList();
              }
            });
          }
        });
      }
    },
    addCorporation() {
      this.isCorporationEditShow = true;
      this.currentCorporationId = null;
    },
    getCorporationList() {
      this.$api.pbc.corporation.searchCorporation(true).then(res => {
        this.corporationList = res.Return;
      });
    },
    closeCorporationDialog(needRefresh) {
      this.isCorporationEditShow = false;
      if (needRefresh) {
        this.getCorporationList();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.corporation-item {
  position: relative;
}
.item-count {
  position: absolute;
  right: 16px;
  top: 16px;
}
</style>
