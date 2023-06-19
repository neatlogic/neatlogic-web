<template>
  <div>
    <div style="margin-bottom:10px;">
      <Button type="primary" @click="addProtect()">
        <i class="ts-plus"></i>
        保护分支
      </Button>
    </div>
    <div v-if="!isLoading">
      <TsTable v-bind="tabledata" @changeCurrent="changeCurrent" @changePageSize="changePageSize">
        <template slot="developers_can_merge" slot-scope="{ row }">
          <i v-if="row.developers_can_merge" class="ts-complete h3 text-success"></i>
          <i v-else class="ts-forbid h3 text-danger"></i>
        </template>
        <template slot="developers_can_push" slot-scope="{ row }">
          <i v-if="row.developers_can_push" class="ts-complete h3 text-success"></i>
          <i v-else class="ts-forbid h3 text-danger"></i>
        </template>
        <template slot="actions" slot-scope="{ row }">
          <div class="text-action ts-trash" @click="delProtect(row)">删除</div>
        </template>
      </TsTable>
    </div>
    <Loading v-else loadingShow style="min-height:100px"></Loading>
    <ProtectAdd
      v-if="isEdit"
      :isShow="isEdit"
      :uuid="uuid"
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
    uuid: String
  },
  data() {
    return {
      tabledata: {
        theadList: [
          {
            title: '分支',
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
            key: 'actions',
            width: 80
          }
        ],
        tbodyList: [],
        rowKey: 'name'
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
        repositoryId: this.uuid,
        name: row.name
      };
      let _this = this;
      _this.$createDialog({
        title: '删除确认',
        content: '是否确认删除该保护分支',
        btnType: 'error',
        'on-ok': function(vnode) {
          _this.$api.codehub.repositorydetail.deleteProtectBranch(param).then((res) => {
            if (res && res.Status == 'OK') {
              _this.$Message.success('删除成功');
              _this.getList();
              vnode.isShow = false;
            } else {
              _this.$Message.error(res.Message);
            }
          });
        }
      });
    },
    getList() {
      let param = {
        repositoryId: this.uuid
      };
      this.isLoading = true;
      this.$api.codehub.repositorydetail.getProtectBranchList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.tabledata.tbodyList = res.Return || [];
        } else {
          this.tabledata.tbodyList = [];
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
