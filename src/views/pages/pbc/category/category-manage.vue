<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="importCategory()">导入</div>
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
            <span v-if="row.isMatch" class="text-success">是</span>
            <span v-else class="text-grey">否</span>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    categoryImportDialog: resolve => require(['./components/category-import-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isImportDialogShow: false,
      searchParam: {},
      theadList: [
        {key: 'interfaceName', title: '数据元名称'},
        {key: 'interfaceId', title: '数据元传输标识'}, 
        {key: 'name1', title: '一级分类'}, 
        {key: 'id1', title: '一级分类标识符'}, 
        {key: 'name2', title: '二级分类'}, 
        {key: 'id2', title: '二级分类标识符'}, 
        {key: 'name3', title: '三级分类'}, 
        {key: 'id3', title: '三级分类标识符'}, 
        {key: 'name4', title: '四级分类'}, 
        {key: 'id4', title: '四级分类标识符'}, 
        {key: 'id', title: '分类标识符'},
        {key: 'isMatch', title: '报送是否符合要求'}
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
        content: '是否确认删除分类:' + category.name + '？',
        btnType: 'error',
        'on-ok': async vnode => { 
          this.$api.pbc.category.deleteCategoryById(category.id).then(res => {
            this.$Message.success(this.$t('message.content.executesuccess'));
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
