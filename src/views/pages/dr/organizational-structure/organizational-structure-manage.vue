<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <TsContain :isSiderHide="isSiderHide" :enableCollapse="true">
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="addUser">{{ $t('page.user') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <InputSearcher
          v-model="keyword"
          @change="() => changeCurrent"
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
    <UserAddDialog v-if="isShowUserAddDialog" @close="closeUserAddDialog"></UserAddDialog>
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
    UserAddDialog: resolve => require(['pages/dr/organizational-structure/user-add-dialog'], resolve)
    
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      isShowUserAddDialog: false,
      isSiderHide: false,
      keyword: '',
      theadList: [
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
        id: 'uuid',
        zNodes: [
          {name: '父节点1', id: 1, children: [
            {name: '子节点1', id: 2},
            {name: '子节点2', id: 3}]
          }
        ]
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
    searchOrangeStructureData() {
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
