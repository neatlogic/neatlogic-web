<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain :isSiderHide="isSiderHide" :enableCollapse="true" :siderWidth="300">
      <template v-slot:topLeft>
        <div class="action-group">
          <span
            v-if="selectedTreeId"
            class="action-item tsfont-plus"
            @click="addUser"
          >{{ $t('page.user') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <InputSearcher v-model="keyword" @change="() => changeCurrent()"></InputSearcher>
      </template>
      <template v-slot:sider>
        <TsZtree v-if="TsZtree.zNodes && TsZtree.zNodes.length > 0" ref="ztree" v-bind="TsZtree"></TsZtree>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="tableConfig"
          :theadList="theadList"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template slot="orgName" slot-scope="{row}">
            <Tag v-if="row.orgName">{{ row.orgName }}</Tag>
          </template>
          <template slot="userName" slot-scope="{row}">
            <UserCard :uuid="row.uuid" hideName></UserCard>
            <span>{{ row.userName||'-' }}</span>
          </template>
          <template slot="teamNameList" slot-scope="{ row }">
            <div @click.stop>
              <Tag v-for="(t, index) in ShowUserTeamNumber(row.teamNameList)" :key="index">{{ t }}</Tag>
              <span v-if="row.teamNameList && row.teamNameList.length > 3" @click.stop>
                <Dropdown placement="bottom-start" transfer @click.native.stop>
                  <span class="text-action tsfont-option-horizontal"></span>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(item, index) in ShowRestUserTeamNumber(row.teamNameList)" :key="index">
                      {{ item }}</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </span>
            </div>
          </template>
          <template slot="action" slot-scope="{ row , index}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-trash-o" @click.stop="deleteUser(row, index)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <UserAddDialog v-if="isShowUserAddDialog" :orgId="selectedTreeId" @close="closeUserAddDialog"></UserAddDialog>
    <OrganizationalStructureEditDialog
      v-if="isShowOrganizationalStructureEditDialog"
      :id="organizationalStructureTreeId"
      :parentId="organizationalParentId"
      :organizationalStructureName="organizationalStructureName"
      @close="closeOrganizationalStructureDialog"
    >
    </OrganizationalStructureEditDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsZtree: resolve => require(['@/resources/plugins/ztree/TsZtree.vue'], resolve),
    UserAddDialog: resolve => require(['pages/dr/organizational-structure/user-add-dialog'], resolve),
    OrganizationalStructureEditDialog: resolve => require(['pages/dr/organizational-structure/organizational-structure-edit-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      userCount: 0,
      loadingShow: true,
      isShowUserAddDialog: false,
      isShowOrganizationalStructureEditDialog: false,
      isSiderHide: false,
      keyword: '',
      organizationalStructureTreeId: null, // 组织架构tree的id
      organizationalParentId: null,
      organizationalStructureName: '',
      selectedTreeId: null,
      theadList: [
        {
          title: this.$t('term.dr.affiliatedorganization'),
          key: 'orgName'
        },
        {
          title: this.$t('page.username'),
          key: 'userName'
        },
        {
          title: this.$t('page.userid'),
          key: 'userId'
        },
        {
          title: this.$t('page.userteam'),
          key: 'teamNameList'
        },
        {
          title: this.$t('page.phone'),
          key: 'phone'
        },
        {
          title: this.$t('page.email'),
          key: 'email'
        },
        {
          key: 'action'
        }
      ],
      tableConfig: {
        tbodyList: []
      },
      TsZtree: {
        id: 'organizational-structure-manage',
        zNodes: [],
        setting: {
          addDomList: [
            {
              icon: 'tsfont-plus',
              desc: this.$t('term.dr.organizationalstructure'),
              isAddFn: treeNode => {
                return true;
              },
              clickFn: treeNode => {
                this.addTreeChildren(treeNode);
              }
            },
            {
              icon: 'tsfont-edit',
              desc: this.$t('dialog.title.edittarget', { target: this.$t('page.name') }),
              isAddFn: treeNode => {
                return true;
              },
              clickFn: treeNode => {
                this.editTreeChildren(treeNode);
              }
            },
            {
              icon: 'tsfont-trash-o',
              desc: this.$t('page.delete'),
              isAddFn: treeNode => {
                if (treeNode.id == 975163435630592) {
                  return false; // 总指挥不能删除，必须有一个根节点
                } else {
                  return true;
                }
              },
              initFn: (treeNode, $span) => {
                if (treeNode.childCount == 0 && treeNode.userCount == 0) {
                  // 该组织下没有子级并且没有绑定用户
                } else {
                  const hasChild = treeNode.childCount > 0;
                  const hasUser = treeNode.userCount > 0;
                  $span[0].classList.add('text-disabled');
                  $span[0].title = hasChild ? this.$t('term.dr.currentoranghaschildnodelete') : (hasUser ? this.$t('term.dr.currentorangbindusernodelete') : '');
                }
              },
              clickFn: treeNode => {
                this.deleteTree(treeNode);
              }
            }
          ],
          view: {
            showIcon: true,
            nodeClasses: { add: ['overflow'] }
          },
          data: {
            simpleData: {
              idKey: 'id',
              pIdKey: 'parentId'
            }
          },
          callback: {
            onClick: this.ztreeClick
          }
        }
      }
    };
  },
  beforeCreate() {},
  async created() {
    await this.searchOrangeStructureData();
    this.searchUserDataByOrganizationId();
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
    addTreeChildren(treeNode) {
      this.organizationalStructureTreeId = null;
      this.organizationalStructureName = '';
      this.organizationalParentId = treeNode.id;
      this.isShowOrganizationalStructureEditDialog = true;
    },
    editTreeChildren(treeNode) {
      this.organizationalStructureTreeId = treeNode.id;
      this.organizationalStructureName = treeNode.name;
      this.isShowOrganizationalStructureEditDialog = true;
    },
    //服务树点击事件
    ztreeClick(event, treeId, treeNode) {
      this.selectedTreeId = treeNode.id;
      this.userCount = treeNode.userCount; // 用户数量，用于添加用户成功后，是否需要刷新组织架构树
      this.changeCurrent();
    },
    deleteTree(treeNode) {
      // 删除组织架构
      if (treeNode.childCount != 0 || treeNode.userCount != 0) { 
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: treeNode.name }),
        btnType: 'error',
        'on-ok': vnode => {
          let data = { id: treeNode.id };
          this.$api.dr.organizationalStructure.deleteOrganizationalStructureById(data).then(res => {
            if (res.Status == 'OK') {
              this.searchOrangeStructureData(); // 删除成功，刷新一下列表
              this.$Message.success(this.$t('message.deletesuccess'));
            }
          });
          vnode.isShow = false;
        }
      });
    },
    changeCurrent(currentPage = 1) {
      this.tableConfig.currentPage = currentPage;
      this.searchUserDataByOrganizationId();
    },
    changePageSize(pageSize) {
      this.tableConfig.currentPage = 1;
      this.tableConfig.pageSize = pageSize;
      this.searchUserDataByOrganizationId();
    },
    deleteUser(row, index) {
      let params = {
        orgId: row.orgId,
        userUuid: row.uuid
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.dr.organizationalStructure.deleteOrganizationUserById(params).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t(this.$t('message.deletesuccess')));
              this.tableConfig.tbodyList.splice(index, 1);
              this.searchUserDataByOrganizationId(true);
            }
          });
          vnode.isShow = false;
        }
      });
    },
    addUser() {
      this.isShowUserAddDialog = true;
    },
    closeUserAddDialog(needRefresh) {
      this.isShowUserAddDialog = false;
      if (needRefresh) {
        if (this.userCount == 0) {
          this.searchOrangeStructureData();
        }
        this.searchUserDataByOrganizationId();
      }
    },
    closeOrganizationalStructureDialog(needRefresh) {
      this.isShowOrganizationalStructureEditDialog = false;
      if (needRefresh) {
        this.searchOrangeStructureData();
      }
    },
    searchOrangeStructureData() {
      let params = {
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize
      };
      return this.$api.dr.organizationalStructure
        .searchOrganizationalStructureData(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.TsZtree.zNodes = res.Return ? res.Return : [];
            if (this.selectedTreeId) {
              this.$nextTick(() => {
                this.$refs.ztree?.selectedNodeById(this.selectedTreeId);
              });
            }
          }
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    searchUserDataByOrganizationId(needRefresh = false) {
      let params = {
        orgId: this.selectedTreeId,
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize,
        keyword: this.keyword
      };
      this.loadingShow = true;
      this.$api.dr.organizationalStructure
        .searchOrganizationUser(params)
        .then(res => {
          if (res.Status == 'OK') {
            Object.assign(this.tableConfig, res.Return);
            if (res.Return?.tbodyList && this.$utils.isEmpty(res.Return.tbodyList) && needRefresh) {
              // 删除全部用户后，刷新树列表
              this.searchOrangeStructureData();
            }
          }
        })
        .finally(() => {
          this.loadingShow = false;
        });
    }
  },
  filter: {},
  computed: {
    ShowRestUserTeamNumber() {
      //查看更多，用户组
      return list => {
        list.slice(3);
      };
    },
    ShowUserTeamNumber() {
      // 显示前两个用户组，后面的省略号，查看更多显示
      return val => {
        return val ? val.slice(0, 3) : [];
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
