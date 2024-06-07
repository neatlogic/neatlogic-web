<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addTeam">{{ $t('page.group') }}</span>
      </template>
      <template slot="content">
        <div class="team-manage">
          <ul
            v-for="(item, index) in tableData.tbodyList"
            :key="item.uuid"
            :index="index"
            class="group-ul"
          >
            <li class="bg-op radius-lg mb-md pr-nm pl-nm group-li">
              <span>{{ item.upwardNamePath }} </span>
              <div class="operation-wrap">
                <TsFormSwitch
                  v-if="type === 'owner'"
                  v-model="item.checkedChildren"
                  disabled
                  :showStatus="true"
                  :trueText="$t('term.framework.selectedchild')"
                  :falseText="$t('term.framework.unselectedchild')"
                ></TsFormSwitch>
                <span class="del-text text-action tsfont-trash-o icon-right" @click="delRow(item,index)">{{ $t('page.delete') }}</span>
              </div>
            </li>
          </ul>
        </div>
      </template>
    </TsContain>
    <TeamListDialog
      v-if="isDialogShow"
      ref="teamList"
      :regionId="regionId"
      :selectNum="tableData.tbodyList.length"
      :type="type"
      :value="teamList"
      @on-ok="addSave"
    ></TeamListDialog>
  </div>
</template>
<script>
export default {
  name: '',
  tagName: 'addgroup',
  components: {
    TeamListDialog: () => import('./team-list-dialog'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  filters: {},
  props: {
    regionId: Number,
    type: String
  },
  data() {
    return {
      tableData: {
        theadList: [],
        tbodyList: [],
        pageSize: 10,
        currentPage: 1
      },

      isDialogShow: false,
      teamList: [] //角色分组集合
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    //查询角色分组列表(编辑时查询)
    searchData() {
      if (this.regionId) {
        let params = {
          regionId: this.regionId,
          type: this.type,
          currentPage: this.tableData.currentPage,
          pageSize: this.tableData.pageSize
        };
        this.$api.framework.region.searchRegionTeam(params).then(res => {
          Object.assign(this.tableData, res.Return);
          this.teamList = res.Return.tbodyList;
        });
      }
    },
    delRow(row, index) { //删除列表数据
      if (this.regionId) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deletetargetconfirm', {target: row.name}),
          btnType: 'error',
          'on-ok': vnode => {
            let data = {
              regionId: this.regionId,
              type: this.type,
              teamUuidList: [row.uuid]
            };
            this.$api.framework.region.deleteRegionTeam(data).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.tableData.tbodyList.splice(index, 1);
              //this.searchData();
              }
            });
          }
        });
      } else {
        let delArray = this.tableData.tbodyList.splice(index, 1);
        this.teamList.find((item, i) => {
          if (item.uuid == delArray[0].uuid) {
            this.teamList.splice(i, 1);
            return true;
          }
        });
      }
    },
    dataRetrun() {
      let data = this.$refs.teamList.dataRetrun();
      return data;
    },
    addTeam() {
      this.isDialogShow = true;
    },
    //新增保存
    addSave(isSave) {
      if (isSave) {
        this.teamList = this.$refs.teamList.getValue();
        let params = {regionId: this.regionId, type: this.type, teamList: this.teamList};
        this.$api.framework.region.saveRegionTeam(params).then(res => {
          this.searchData();
        });
      }
      this.isDialogShow = false;
    }
  },
  computed: {},
  watch: {
    regionId: {
      handler(val, oldval) {
        if (val) {
          this.searchData();
        } else {
          this.tableData = {
            theadList: [],
            tbodyList: [],
            pageSize: 10,
            currentPage: 1
          };
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.team-manage {
  overflow: auto;
  height: 88%;
  .group-ul {
    .group-li {
      display: flex;
      justify-content: space-between;
      height: 56px;
      line-height: 56px;
      .operation-wrap {
        display: flex;
        .del-text {
          display: inline-block;
          width: 63px;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
