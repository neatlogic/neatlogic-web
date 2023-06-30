<template>
  <div>
    <div class="mb-sm">
      <span class="text-action tsfont-plus" @click="addProtect()"> {{ $t('term.codehub.protectbranch') }}</span>
    </div>
    <div v-if="!isLoading">
      <TsTable v-bind="tableData" @changeCurrent="changeCurrent" @changePageSize="changePageSize">
        <template slot="developers_can_merge" slot-scope="{ row }">
          <span v-if="row.developers_can_merge" class="tsfont-check-o h3 text-success"></span>
          <span v-else class="tsfont-forbid h3 text-danger"></span>
        </template>
        <template slot="developers_can_push" slot-scope="{ row }">
          <span v-if="row.developers_can_push" class="tsfont-check-o h3 text-success"></span>
          <span v-else class="tsfont-forbid h3 text-danger"></span>
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-trash-o" @click="delProtect(row)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <Loading v-else loadingShow style="min-height:100px"></Loading>
    <ProtectAdd
      v-if="isEdit"
      :id="id"
      @close="close"
    ></ProtectAdd>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    ProtectAdd: resolve => require(['./protect-add.vue'], resolve)
  },
  filters: {},
  props: {
    id: Number
  },
  data() {
    return {
      tableData: {
        theadList: [
          {
            title: this.$t('page.branch'),
            key: 'name'
          },
          {
            title: 'developers_can_merge',
            key: 'developers_can_merge'
          },
          {
            title: 'developers_can_push',
            key: 'developers_can_push'
          },
          {
            key: 'action',
            width: 80
          }
        ],
        tbodyList: []
      },
      isEdit: false,
      isLoading: true
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addProtect() {
      this.isEdit = true;
    },
    changeCurrent() {},
    changePageSize() {},
    close(isReload) {
      if (isReload) {
        this.getList();
      }
      this.isEdit = false;
    },
    delProtect(row) {
      let param = {
        repositoryId: this.id,
        name: row.name
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('term.codehub.protectbranch')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.repositorydetail.deleteProtectBranch(param).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getList();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    getList() {
      let param = {
        repositoryId: this.id
      };
      this.isLoading = true;
      this.$api.codehub.repositorydetail.getProtectBranchList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.tableData.tbodyList = res.Return || [];
        } else {
          this.tableData.tbodyList = [];
        }
      }).finally(res => {
        this.isLoading = false;
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
