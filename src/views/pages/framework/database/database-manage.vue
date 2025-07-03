<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="addDatabase()">{{ $t('page.datasource') }}</span>
        </div>
      </template>
      <template slot="topRight">
      </template>
      <div slot="content">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-test" @click="testDatabase(row)">{{ $t('page.testconnection') }}</li>
                <li class="tsfont-edit" @click="editDatabase(row)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o" @click="deleteDatabase(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <DatabaseEdit v-if="isEditShow" :id="currentDatabaseId" @close="closeEditDialog"></DatabaseEdit>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    DatabaseEdit: () => import('./database-edit.vue')
  },
  props: {},
  data() {
    return {
      isEditShow: false,
      searchParam: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        {
          key: 'name',
          title: this.$t('page.name')
        },
        {
          key: 'type',
          title: this.$t('page.type')
        },
        {
          key: 'action'
        }
      ],
      tableData: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchDatabaseList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchDatabaseList() {
      this.$api.framework.database.searchDatabaseList(this.searchParam).then(res => {
        this.tableData = res.Return;
      });
    },
    changePage(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.searchDatabaseList();
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchParam.currentPage = 1;
      this.searchDatabaseList();
    },
    addDatabase() {
      this.isEditShow = true;
      this.currentDatabaseId = null;
    },
    editDatabase(row) {
      this.isEditShow = true;
      this.currentDatabaseId = row.id;
    },
    closeEditDialog(needRefresh) {
      this.isEditShow = false;
      if (needRefresh) {
        this.searchDatabaseList();
      }
    },
    testDatabase(row) {
      this.$api.framework.database.testDatabaseById({id: row.id}).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('page.connectionsuccessful'));
        }
      });
    },
    deleteDatabase(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.datasource') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.database.deleteDatabaseById({id: row.id}).then(res => {
            if (res.Status == 'OK') {
              this.searchDatabaseList();
              vnode.isShow = false;
            }
          });
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
