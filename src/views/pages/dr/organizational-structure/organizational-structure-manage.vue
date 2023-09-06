<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <TsContain :isSiderHide="isSiderHide" :enableCollapse="true" :siderWidth="300">
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-if="selectedTreeId" class="action-item tsfont-plus" @click="addUser">{{ $t('page.user') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <InputSearcher
          v-model="keyword"
          @change="() => changeCurrent()"
        ></InputSearcher>
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
          <template slot="userName" slot-scope="{row}">
            <UserCard :uuid="row.uuid" hideName></UserCard>
            <span class="text-href" @click.stop="trClick(row)">{{ row.userName||'-' }}</span>
          </template>
          <template slot="teamNameList" slot-scope="{ row }">
            <div @click.stop>
              <Tag v-for="(t, index) in showTableList(row.teamNameList)" :key="index">{{ t }}</Tag>
              <span v-if="row.teamNameList && row.teamNameList.length > 3" @click.stop>
                <Dropdown placement="bottom-start" transfer @click.native.stop>
                  <span class="text-action tsfont-option-horizontal"></span>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(item, index) in showRestText(row.teamNameList)" :key="index">{{ item }}</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </span>
            </div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-trash-o" @click="deleteRow(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <UserAddDialog v-if="isShowUserAddDialog" :treeId="selectedTreeId" @close="closeUserAddDialog"></UserAddDialog>
    <OrganizationalStructureEditDialog
      v-if="isShowOrganizationalStructureEditDialog"
      :id="organizationalStructureTreeId"
      :organizationalStructureName="organizationalStructureName"
      @close="closeOrganizationalStructureDialog"
    ></OrganizationalStructureEditDialog>
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
      loadingShow: true,
      isShowUserAddDialog: false,
      isShowOrganizationalStructureEditDialog: false,
      isSiderHide: false,
      keyword: '',
      organizationalStructureTreeId: null, // 组织架构tree的id
      organizationalStructureName: '',
      selectedTreeId: null,
      theadList: [
        {
          title: this.$t('term.dr.affiliatedorganization'),
          key: 'affiliatedOrganization'
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
        zNodes: [
          {name: '总指挥', id: 1,
            children: [
              {name: '产线单元总指挥', id: 2},
              {name: '寿险单元总指挥', id: 3}]
          }
        ],
        setting: {
          addDomList: [
            {
              icon: 'tsfont-plus',
              desc: this.$t('term.dr.organizationalstructure'),
              isAddFn: (treeNode) => {
                return true;
              },
              clickFn: (treeNode) => {
                this.addTreeChildren(treeNode);
              }
            },
            {
              icon: 'tsfont-edit',
              desc: this.$t('dialog.title.edittarget', {'target': this.$t('page.name')}),
              isAddFn: (treeNode) => {
                return true;
              },
              clickFn: (treeNode) => {
                this.editTreeChildren(treeNode);
              }
            },
            {
              icon: 'tsfont-trash-o',
              desc: this.$t('page.delete'),
              isAddFn: (treeNode) => {
                if (treeNode.id == 1) {
                  return false;
                } else {
                  return true;
                }
              },
              initFn: (treeNode, $span) => {
                if (treeNode.childrenCount == undefined || treeNode.childrenCount == 0) {
                  // 
                } else {
                  $span[0].classList.add('text-disabled');
                  $span[0].title = this.$t('term.dr.organizationalstructurecitenodelete');
                }
              },
              clickFn: (treeNode) => {
                this.deleteTree(treeNode);
              }
            }
          ],
          view: {
            showIcon: true,
            nodeClasses: {add: ['overflow']}
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
  created() {
    this.searchOrangeStructureData();
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
      console.log('addTreeChildren', treeNode);
      this.organizationalStructureTreeId = null;
      this.organizationalStructureName = '';
      this.isShowOrganizationalStructureEditDialog = true;
    },
    editTreeChildren(treeNode) {
      this.organizationalStructureTreeId = treeNode.id;
      this.organizationalStructureName = treeNode.name;
      this.isShowOrganizationalStructureEditDialog = true;
    },
    //服务树点击事件
    ztreeClick(event, treeId, treeNode) {
      this.selectedTreeId = treeNode?.id || null;
      this.searchUserDataByTreeId();
    },
    deleteTree(treeNode) {
      // 删除组织架构
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: treeNode.name}),
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
      this.searchOrangeStructureData();
    },
    changePageSize(pageSize) {
      this.tableConfig.currentPage = 1;
      this.tableConfig.pageSize = pageSize;
      this.searchOrangeStructureData();
    },
    deleteRow(row, index) {
      console.log('121212', row);
      let params = {
        id: row.id
      };
      this.$api.dr.organizationalStructure.deleteUserById(params).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t(this.$t('message.deletesuccess')));
          this.tableConfig.tbodyList.splice(index, 1);
        }
      });
    },
    addUser() {
      this.isShowUserAddDialog = true;
    },
    closeUserAddDialog(needRefresh) {
      this.isShowUserAddDialog = false;
      if (needRefresh) {
        this.searchOrangeStructureData();
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
      this.$api.dr.organizationalStructure.getOrganizationalStructure(params).then(res => {
        if (res.Status == 'OK') {
          this.TsZtree.zNodes = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    searchUserDataByTreeId() {
      let params = {
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize,
        keyword: this.keyword
      };
      this.$api.dr.organizationalStructure.getOrganizationalStructure(params).then(res => {
        if (res.Status == 'OK') {
          Object.assign(this.tableConfig, res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    trClick(item) {
      const { userId = '', uuid = '' } = item || {};
      this.$router.push({
        path: 'user-addview',
        query: { userId, key: 'user', readonly: true, uuid }
      });
    }
  },
  filter: {},
  computed: {
    showRestText() {
      //剩余
      return (list) => {
        list.slice(3);
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
