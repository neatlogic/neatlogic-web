<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="editAlertType()">{{ $t('term.alert.alerttype') }}</div>
        </div>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="alertTypeData"
          :theadList="theadList"
          @changeCurrent="searchAlertType"
          @changePageSize="changePageSize"
        >
          <template v-slot:isActive="{ row }">
            <span v-if="row.isActive" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit" @click="editAlertType(row)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o" @click="delAlertType(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <AlertTypeEidt v-if="isShowAlerType" :id="currentAlertTypeId" @close="closeAlertType"></AlertTypeEidt>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    AlertTypeEidt: () => import('@/views/pages/alert/alerttype/alerttype-edit-dialog.vue')
  },
  props: {},
  data() {
    return {
      searchParam: {},
      alertTypeData: {},
      currentAlertTypeId: null,
      isShowAlerType: false,
      theadList: [
        {
          key: 'name',
          title: '唯一标识'
        },
        { key: 'label', title: '名称' },
        { key: 'isActive', title: '是否激活' },
        { key: 'action' }
      ]
    };
  },
  beforeCreate() {},
  async created() {
    this.searchAlertType();
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
    closeAlertType(needRefresh) {
      this.isShowAlerType = false;
      this.currentAlertTypeId = null;
      if (needRefresh) {
        this.searchAlertType();
      }
    },
    editAlertType(row) {
      if (row) {
        this.currentAlertTypeId = row.id;
      } else {
        this.currentAlertTypeId = null;
      }
      this.isShowAlerType = true;
    },
    changePageSize(pageSize) {
      if (pageSize) {
        this.searchParam.pageSize = pageSize;
        this.searchAlertType(1);
      }
    },
    searchAlertType(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.alert.alerttype.searchAlertType(this.searchParam).then(res => {
        this.alertTypeData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
