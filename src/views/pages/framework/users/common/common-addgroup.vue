<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="openGroup">{{ $t('page.group') }}</span>
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
          <!-- <Page
            class="page-container"
            transfer
            size="small"
            show-total
            :total="tableData.rowNum"
            :current="tableData.currentPage"
            :page-size="tableData.pageSize"
            @on-change="searchData(arguments, 'currentPage',true)"
            @on-page-size-change="searchData(arguments, 'pageSize',true)"
          /> -->
        </div>
      </template>
    </TsContain>
    <groupList
      v-if="isDialogShow"
      ref="groupList"
      :roleUuid="roleUuid"
      :selectNum="tableData.tbodyList.length"
      :value="teamList"
      @on-ok="addSave"
    ></groupList>
  </div>
</template>
<script>
export default {
  name: '',
  tagName: 'addgroup',
  components: {
    groupList: () => import('./select-user/group-list'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  filters: {},
  props: {},
  data() {
    return {
      roleUuid: this.$route.query.uuid || null, //角色uuid
      tableData: {
        theadList: [],
        tbodyList: [],
        pageSize: 10,
        currentPage: 1
      },

      isDialogShow: false,
      teamList: [], //角色分组集合
      groupType: this.$route.query.groupType //判断是新增分组还是编辑分组
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
    searchData(arg, type, isSearch) {
      if (this.$route.query.groupType == 'add' || !this.roleUuid) {
        return;
      }
      if (type == 'pageSize') {
        this.tableData.pageSize = arg[0];
        this.tableData.currentPage = 1;
      } else if (type == 'currentPage') {
        this.tableData.currentPage = arg[0];
      } else {
        this.tableData.currentPage = 1;
      }
      let params = {
        roleUuid: this.roleUuid,
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };
      this.$api.framework.group.getGroupList(params).then(res => {
        Object.assign(this.tableData, res.Return);
      });
    },
    delRow(row, index) { //删除列表数据
      if (this.roleUuid) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deletetargetconfirm', {target: row.name}),
          btnType: 'error',
          'on-ok': vnode => {
            let data = {
              roleUuid: this.roleUuid,
              teamUuidList: [row.uuid]
            };
            this.$api.framework.group.delGroupList(data).then(res => {
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
      let data = this.$refs.groupList.dataRetrun();
      return data;
    },
    openGroup() {
      this.isDialogShow = true;
    },
    //新增保存
    addSave(type) {
      this.teamList = this.$refs.groupList.getValue();
      if (type && this.groupType != 'add') { //编辑 直接保存数据
        let params = {roleUuid: this.roleUuid, teamList: this.teamList};
        this.$api.framework.group.saveGroupList(params).then(res => {
          this.teamList = [];
          this.searchData();
        });
      } else if (type) { //新增
        let uuidList = this.teamList.map(item => item.uuid);
        this.$api.framework.team.getTeamListByUuid({teamUuidList: uuidList}).then(res => {
          this.tableData.tbodyList = res.Return.teamList;
        });
      }
      this.isDialogShow = false;
    }
  },
  computed: {},
  watch: {}
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
