<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
    @on-ok="close({ selectedUuidList: getSelectedUuidList() })"
  >
    <template v-slot>
      <div class="userselect-search-dialog">
        <TsRow :gutter="12">
          <Col span="8">
            <div class="search-form-item">
              <div class="search-label text-grey">{{ $t('page.group') }}</div>
              <TsFormTree
                v-model="searchValue.teamUuidList"
                v-bind="teamTreeConfig"
                @load-data="loadTeamTreeData"
              ></TsFormTree>
            </div>
          </Col>
          <Col span="7">
            <div class="search-form-item">
              <div class="search-label text-grey">{{ $t('page.role') }}</div>
              <TsFormSelect
                v-model="searchValue.roleUuidList"
                v-bind="roleSelectConfig"
              ></TsFormSelect>
            </div>
          </Col>
          <Col span="7">
            <div class="search-form-item">
              <div class="search-label text-grey">{{ $t('page.keyword') }}</div>
              <TsFormInput
                v-model="searchValue.keyword"
                search
                clearable
                :placeholder="$t('page.inputusernameuseridemail')"
                border="border"
                @on-enter="searchUser(1)"
                @on-search="searchUser(1)"
                @on-clear="searchUser(1)"
              ></TsFormInput>
            </div>
          </Col>
          <Col span="2">
            <div>
              <Button type="primary" long @click="searchUser(1)">{{ $t('page.search') }}</Button>
            </div>
          </Col>
        </TsRow>
        <div class="mt-md">
          <TsTable
            v-if="tableData"
            v-model="selectedUuidList"
            v-bind="tableData"
            :theadList="theadList"
            keyName="uuid"
            selectedRemain
            :multiple="multiple"
            :loading="isTableLoading"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
            @getSelected="getSelected"
          >
            <template v-slot:userName="{ row }">
              <UserCard :uuid="row.uuid" hideName></UserCard>
              <span>{{ row.userName || '-' }}</span>
            </template>
            <template v-slot:roleDescriptionList="{ row }">
              <template v-if="row.roleList && row.roleList.length > 0">
                <Tag v-for="(role, index) in showTableList(row.roleList)" :key="index">{{ role.description }}</Tag>
              </template>
              <Dropdown v-if="row.roleList && row.roleList.length > 3" placement="bottom-start" transfer>
                <span class="text-action tsfont-option-horizontal"></span>
                <DropdownMenu slot="list">
                  <DropdownItem v-for="(role, index) in showRestText(row.roleList)" :key="index">{{ role.description }}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </template>
            <template v-slot:teamNameList="{ row }">
              <template v-if="row.teamNameList && row.teamNameList.length > 0"> 
                <Tag v-for="(team, index) in showTableList(row.teamNameList)" :key="index">{{ team }}</Tag>
              </template>
              <Dropdown v-if="row.teamNameList && row.teamNameList.length > 3" placement="bottom-start" transfer>
                <span class="text-action tsfont-option-horizontal"></span>
                <DropdownMenu slot="list">
                  <DropdownItem v-for="(team, index) in showRestText(row.teamNameList)" :key="index">{{ team }}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </template>
          </TsTable>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: 'UserselectSearchDialog',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  props: {
    multiple: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('page.advancesearch'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large',
        zindex: 1200
      },
      roleSelectConfig: {
        multiple: true,
        dynamicUrl: '/api/rest/role/search',
        rootName: 'tbodyList',
        textName: 'description',
        valueName: 'uuid',
        clearable: true,
        transfer: true,
        border: 'border',
        placeholder: this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.role')})
      },
      teamTreeList: [],
      teamTreeConfig: {
        multiple: true,
        dataList: [],
        textName: 'name',
        valueName: '_treeValue',
        childrenKey: 'children',
        showPath: true,
        sperateText: '>',
        clearable: true,
        transfer: true,
        border: 'border',
        placeholder: this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.group')})
      },
      searchValue: {},
      tableData: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 10,
        currentPage: 1
      },
      theadList: [
        { key: 'selection', width: 60, align: 'center' },
        { title: this.$t('page.username'), key: 'userName' },
        { title: this.$t('page.userid'), key: 'userId' },
        { title: this.$t('page.role'), key: 'roleDescriptionList' },
        { title: this.$t('page.userteam'), key: 'teamNameList' },
        { title: this.$t('page.phone'), key: 'phone' },
        { title: this.$t('page.email'), key: 'email' }
      ],
      selectedUuidList: [],
      isTableLoading: false,
      searchParams: {
        currentPage: 1,
        pageSize: 20
      }
    };
  },
  mounted() {
    this.getTeamTreeList();
    this.searchUser(1);
  },
  methods: {
    searchUser(currentPage, pageSize) {
      let params = {
        ...this.searchParams,
        ...this.searchValue,
        currentPage: currentPage || this.tableData.currentPage,
        pageSize: pageSize || this.tableData.pageSize
      };
      params.teamUuidList = this.getTeamUuidListByTreeValue(params.teamUuidList);
      this.searchParams.currentPage = params.currentPage;
      this.searchParams.pageSize = params.pageSize;
      this.isTableLoading = true;
      this.$api.framework.user.searchUser(params).then(res => {
        if (res.Status == 'OK') {
          this.tableData = {
            ...this.tableData,
            ...res.Return
          };
        }
      }).finally(() => {
        this.isTableLoading = false;
      });
    },
    getTeamTreeParams(parentUuid) {
      let params = {
        needPage: false,
        isActive: 1
      };
      if (parentUuid) {
        params.parentUuid = parentUuid;
      }
      return params;
    },
    getTeamTreeList() {
      this.$api.framework.team.getTeamTreeList(this.getTeamTreeParams()).then(res => {
        if (res.Status == 'OK') {
          this.teamTreeList = this.normalizeTeamTreeList(res.Return && res.Return.tbodyList);
          this.teamTreeConfig = {
            ...this.teamTreeConfig,
            dataList: this.teamTreeList
          };
        }
      });
    },
    loadTeamTreeData(item, callback) {
      if (!item || !item.uuid) {
        callback([]);
        return;
      }
      this.$api.framework.team.getTeamTreeList(this.getTeamTreeParams(item.uuid)).then(res => {
        let children = [];
        if (res.Status == 'OK') {
          children = this.normalizeTeamTreeList(res.Return && res.Return.tbodyList, item._path || item.name, item._treeValue);
        }
        callback(children);
      }).catch(() => {
        callback([]);
      });
    },
    normalizeTeamTreeList(list, parentPath, parentTreeValue) {
      return (list || []).map((item, index) => {
        let node = { ...item };
        node._treeValue = this.getTeamTreeValue(node, parentTreeValue, index);
        node.nodeKey = node._treeValue;
        if (parentPath) {
          node._path = parentPath + ' > ' + node.name;
        }
        if (node.children && node.children.length > 0) {
          node.children = this.normalizeTeamTreeList(node.children, node._path || node.name, node._treeValue);
        } else {
          node.children = [];
        }
        if (node.childCount && node.childCount > 0 && node.children.length == 0) {
          node.loading = false;
        }
        return node;
      });
    },
    getTeamTreeValue(node, parentTreeValue, index) {
      return [parentTreeValue || 'root', node.uuid || '', index].join('#');
    },
    getTeamUuidListByTreeValue(teamTreeValueList) {
      if (!teamTreeValueList || !teamTreeValueList.length) {
        return teamTreeValueList;
      }
      return [...new Set(teamTreeValueList.map(value => this.getTeamUuidByTreeValue(value)).filter(uuid => !!uuid))];
    },
    getTeamUuidByTreeValue(teamTreeValue) {
      let team = this.findTeamNodeByTreeValue(this.teamTreeList, teamTreeValue);
      if (team) {
        return team.uuid;
      }
      let valueList = String(teamTreeValue).split('#');
      return valueList.length > 2 ? valueList[valueList.length - 2] : teamTreeValue;
    },
    findTeamNodeByTreeValue(list, teamTreeValue) {
      for (let i = 0; i < (list || []).length; i++) {
        let item = list[i];
        if (item._treeValue == teamTreeValue) {
          return item;
        }
        let child = this.findTeamNodeByTreeValue(item.children, teamTreeValue);
        if (child) {
          return child;
        }
      }
      return null;
    },
    changeCurrent(currentPage) {
      this.searchUser(currentPage);
    },
    changePageSize(pageSize) {
      this.searchUser(1, pageSize);
    },
    getSelected(selectedUuidList) {
      this.selectedUuidList = selectedUuidList || [];
    },
    showTableList(list) {
      return list && list.length > 3 ? list.slice(0, 3) : list;
    },
    showRestText(list) {
      return list && list.length > 3 ? list.slice(3) : [];
    },
    getSelectedUuidList() {
      return (this.selectedUuidList || []).filter(uuid => !!uuid).map(uuid => (uuid.includes('#') ? uuid : 'user#' + uuid));
    },
    close(params) {
      this.$emit('close', params);
    }
  }
};
</script>
<style lang="less" scoped>
.userselect-search-dialog {
  .search-form-item {
    display: grid;
    align-items: center;
    grid-template-columns: 45px 1fr;
  }
  .search-label {
    height: 20px;
    margin-bottom: 4px;
    line-height: 20px;
    white-space: nowrap;
  }
}
</style>
