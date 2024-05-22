
<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="openTypeEditDialog">{{ $t('term.autoexec.toolclassification') }}</span>
      </template>
      <template v-slot:topRight>
        <InputSearcher
          v-model="keyword"
          :placeholder="$t('page.namedescription')"
          @change="() => changeCurrent()"
        ></InputSearcher>
      </template>
      <template v-slot:content>
        <div slot="content" ref="maintable">
          <TsTable
            v-if="!loadingShow"
            v-bind="tableData"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
          >
            <template slot="referenceCountForScript" slot-scope="{ row }">
              <div v-if="row.referenceCountForScript > 0" class="text-href" @click="gotoManage(row, '/script-manage')">{{ row.referenceCountForScript }}</div>
              <div v-else>{{ row.referenceCountForScript || 0 }}</div>
            </template>
            <template slot="referenceCountForTool" slot-scope="{ row }">
              <div v-if="row.referenceCountForTool > 0" class="text-href" @click="gotoManage(row, '/tool-manage')">{{ row.referenceCountForTool }}</div>
              <div v-else>{{ row.referenceCountForTool || 0 }}</div>
            </template>
            <template slot="referenceCountForCombop" slot-scope="{ row }">
              <div v-if="row.referenceCountForCombop > 0" class="text-href" @click="gotoManage(row, '/action-manage')">{{ row.referenceCountForCombop }}</div>
              <div v-else>{{ row.referenceCountForCombop || 0 }}</div>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-edit" @click.stop="openTypeEditDialog(row)"> {{ $t('page.edit') }}</li>
                  <li
                    class="tsfont-trash-o"
                    :title="row.type==='factory'? $t('term.autoexec.factoryclassnodelete') : ( canDelete(row) ? $t('term.autoexec.usedtooldesc'):'')"
                    :class="{disable: canDelete(row)}"
                    @click.stop="deleteRow(row)"
                  >{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
        </div>
      </template>
    </TsContain>
    <TypeEditDialog v-if="isShowTypeEditDialog" :id="typeId" @close="closeTypeEditDialog"></TypeEditDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TypeEditDialog: () => import('pages/autoexec/manage/type-edit-dialog.vue')
  },
  filters: {},
  props: {},
  data() {
    return {
      keyword: '',
      typeId: null,
      loadingShow: true,
      isShowTypeEditDialog: false,
      tableData: {
        theadList: [
          { title: this.$t('page.name'), key: 'name'},
          { title: this.$t('term.autoexec.customtoollibrary'), key: 'referenceCountForScript'},
          { title: this.$t('term.autoexec.toollibrary'), key: 'referenceCountForTool'},
          { title: this.$t('term.autoexec.combinationtool'), key: 'referenceCountForCombop'},
          { title: this.$t('page.description'), key: 'description'},
          { title: ' ', key: 'action', align: 'right', width: 10 }
        ],
        currentPage: 1,
        pageSize: 20,
        pageCount: 1
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getTableData();
    let query = this.$route.query;
    if (query?.type && query.type == 'add') {
      // 从发布工具分类跳过来
      this.openTypeEditDialog();
    }
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
    changeCurrent(currentPage = 1) {
      this.tableData.currentPage = currentPage;
      this.getTableData();
    },
    changePageSize(pageSize = 20) {
      this.tableData.currentPage = 1;
      this.tableData.pageSize = pageSize;
      this.getTableData();
    },
    getTableData() {
      let data = {
        keyword: this.keyword,
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };
      this.loadingShow = true;
      this.$api.autoexec.action.getActionType(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = Object.assign(this.tableData, res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    deleteRow(row) {
      if (this.canDelete(row)) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.action.deleteType({id: row.id}).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.changeCurrent();
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    openTypeEditDialog(row) {
      this.typeId = row?.id || null;
      this.isShowTypeEditDialog = true;
    },
    closeTypeEditDialog(needRefresh) {
      this.isShowTypeEditDialog = false;
      if (needRefresh) {
        this.changeCurrent();
      }
    },
    gotoManage(row, path) {
      this.$router.push({
        path: path,
        query: {typeId: row.id}
      });
    }
  },
  computed: {
    canDelete() {
      return (row) => {
        return row.referenceCountForScript > 0 || row.referenceCountForTool > 0 || row.referenceCountForCombop > 0;
      };
    }
  },
  watch: {}
};
</script>
