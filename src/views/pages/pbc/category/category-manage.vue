<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="importCategory()">{{ $t('page.import') }}</div>
        </div>
      </template>
      <template slot="topRight">
        <InputSearcher
          v-model="searchParam.keyword"
          @change="searchCategory()"
        ></InputSearcher>
      </template>
      <div slot="content">
        <TsTable
          v-if="categoryData"
          :theadList="theadList"
          v-bind="categoryData"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:isMatch="{ row }">
            <span v-if="row.isMatch" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <categoryImportDialog v-if="isImportDialogShow" @close="closeImportDialog"></categoryImportDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    categoryImportDialog: () => import('./components/category-import-dialog.vue')
  },
  props: {},
  data() {
    return {
      isImportDialogShow: false,
      searchParam: {},
      theadList: [
        {key: 'interfaceName', title: this.$t('term.pbc.dataelementname')},
        {key: 'interfaceId', title: this.$t('term.pbc.dataelementtransferid')},
        {key: 'name1', title: this.$t('term.knowledge.primaryclassification')},
        {key: 'id1', title: this.$t('term.pbc.firstclassidentifier')},
        {key: 'name2', title: this.$t('term.pbc.secondclass')},
        {key: 'id2', title: this.$t('term.pbc.secondclassidentifier')},
        {key: 'name3', title: this.$t('term.pbc.thirdclass')},
        {key: 'id3', title: this.$t('term.pbc.thirdclassidentifier')},
        {key: 'name4', title: this.$t('term.pbc.fourthclass')},
        {key: 'id4', title: this.$t('term.pbc.fourthclassidentifier')},
        {key: 'id', title: this.$t('term.pbc.classidentifier')},
        {key: 'isMatch', title: this.$t('term.pbc.conform')}
      ],
      categoryData: { },
      currentId: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchCategory();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    delCategory(category) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.tipcomfirm', {'target': this.$t('page.delete'), 'name': category.name}),
        btnType: 'error',
        'on-ok': async vnode => {
          this.$api.pbc.category.deleteCategoryById(category.id).then(res => {
            this.$Message.success(this.$t('message.executesuccess'));
            vnode.isShow = false;
            this.searchCategory();
          });
        }
      });
    },
    changePage(page) {
      this.searchCategory(page);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchCategory();
    },
    closeImportDialog(needRefresh) {
      this.isImportDialogShow = false;
      if (needRefresh) {
        this.searchCategory();
      }
    },
    searchCategory(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.pbc.category.searchCategory(this.searchParam).then(res => {
        this.categoryData = res.Return;
      });
    },
    importCategory() {
      this.isImportDialogShow = true;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
