<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <span v-if="tagIdList.length == 1" class="text-action tsfont-plus" @click="addTeam">{{ $t('page.group') }}</span>
        <Tooltip
          v-else
          max-width="400"
          placement="right"
          transfer
        >
          <span class="text-action text-disabled tsfont-plus">{{ $t('page.group') }}</span>
          <div slot="content">
            请先选择且仅能选择左侧一个标签
          </div>
        </Tooltip>
      </template>
      <template slot="content">
        <div class="content bg-op pt-md radius-lg">
          <div v-if="tagIdList.length > 0" class="team-manage">
            <div v-if="tableData && tableData.tbodyList && tableData.tbodyList.length> 0">
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
            </div>
            <div v-else class="center">
              暂无数据
            </div>
          </div>
          <div v-else class="center">
            请选择左侧标签
          </div>
        </div>
      </template>
    </TsContain>
    <TeamListDialog
      v-if="isDialogShow"
      ref="teamList"
      :selectNum="tableData.tbodyList.length" 
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
    TeamListDialog: resolve => require(['../team-list-dialog'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  filters: {},
  props: {
    tagIdList: Array
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
      if (this.tagIdList && this.tagIdList.length > 0) {
        let params = { 
          tagIdList: this.tagIdList,
          currentPage: this.tableData.currentPage,
          pageSize: this.tableData.pageSize
        };
        this.$api.framework.teamtag.searchTeamTagTeam(params).then(res => {
          Object.assign(this.tableData, res.Return);
          this.teamList = res.Return.tbodyList;
        });
      }
    },
    delRow(row, index) { //删除列表数据
      if (this.tagIdList) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deletetargetconfirm', {target: row.name}),
          btnType: 'error',
          'on-ok': vnode => {
            let data = {
              tagIdList: this.tagIdList,
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
      if (this.tagIdList && this.tagIdList.length == 1) {
        this.isDialogShow = true;
      }
    },
    //新增保存
    addSave(isSave) {
      if (isSave) {
        this.teamList = this.$refs.teamList.getValue();
        let params = {tagId: this.tagIdList[0], teamList: this.teamList};
        this.$api.framework.teamtag.saveTeamTagTeam(params).then(res => {
          this.searchData();
        });
      }
      this.isDialogShow = false;
    }
  },
  computed: {},
  watch: {
    tagIdList: {
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
/deep/ .content {
  height: 100%;
  overflow: auto;
}
.center {
  position: absolute; /* 绝对定位 */
  top: 50%; /* 相对于父元素的50%处 */
  left: 50%; /* 相对于父元素的50%处 */
  transform: translate(-50%, -50%); /* 通过平移来使元素居中 */
}
</style>
