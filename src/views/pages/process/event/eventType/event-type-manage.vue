<template>
  <div class="event-type-manage">
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template slot="topLeft">
        <span class="tsfont-plus text-action" @click="addRootClassify">{{ $t('page.classify') }}</span>
      </template>
      <template slot="topRight">
        <TsFormSelect v-bind="selectConfig" @on-change="handleSelectChange" @enter-search="handleSearch"></TsFormSelect>
      </template>
      <template slot="content">
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div>
          <TsDragTreeTable
            ref="tree"
            v-bind.sync="treeConfig"
            :loadData="loadData"
            :shouldLoadData="shouldLoadData"
            :checkLeaf="checkLeaf"
            :boxShadow="false"
            :theadList="theadList"
            @on-node-sort="handleNodeSort"
            @on-node-add="handleNodeAdd"
            @on-node-remove="handleNodeRemove"
            @on-page-change="currentPage => getTree({ currentPage })"
            @on-page-size-change="pageSize => getTree({ pageSize })"
          >
            <template v-slot:right="{ node, index, parentNode, path }">
              <ul class="action-group">
                <li class="action-item" @click="showDialog({ operation: 'authorize', node })"><span class="tsfont-auth">{{ $t('page.auth') }}</span></li>
                <li class="action-item" @click="showDialog({ operation: 'rename', path, node })"><span class="tsfont-edit">{{ $t('page.rename') }}</span></li>
                <li class="action-item" @click="showDialog({ operation: 'add', path, node })"><span class="tsfont-plus">{{ $t('term.process.subclassify') }}</span></li>
                <li class="action-item solution" @click="showDialog({ operation: 'linkSolution', node })">
                  <span class="tsfont-question-o">{{ $t('term.process.relsolution') }}</span>
                  <span v-if="node.solutionCount" class="reference-number">{{ node.solutionCount }}</span>
                </li>
                <li class="action-item" :class="{ 'text-grey disable': node.solutionCount !== 0 || node.childCount !== 0 }" @click="showDialog({ operation: 'delete', node, index, parentNode })">
                  <span class="tsfont-trash-o">{{ $t('page.delete') }}</span>
                </li>
              </ul>
            </template>
          </TsDragTreeTable>
        </div>
      </template>
    </TsContain>
    <EventTypeDialog
      v-if="isDialogShow"
      :params.sync="dialogParams"
      @close="closeEventTypeDialog"
      @on-rownum-increase="treeConfig.rowNum++"
      @on-rownum-decrease="handleRownumDecrease"
    ></EventTypeDialog>
  </div>
</template>

<script>

export default {
  name: 'EventTypeManage',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    EventTypeDialog: () => import('./event-type-manage-dialog'),
    TsDragTreeTable: () => import('components/TsDragTreeTable/TsDragTreeTable')
  },
  data() {
    return {
      selectConfig: {
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.eventtype')}),
        dynamicUrl: '/api/rest/eventtype/search',
        rootName: 'eventTypeList',
        textName: 'name',
        valueName: 'id',
        transfer: true,
        search: true,
        enterSearch: true,
        border: 'border'
      },
      theadList: [{
        title: this.$t('page.name'),
        key: 'name'
      }, {
        title: this.$t('page.action'),
        key: 'action'
      }],
      treeConfig: {
        rowNum: 0,
        pageSize: 20,
        currentPage: 1,
        tbodyList: []
      },
      searchParams: {
        parentId: null,
        currentPage: 1,
        pageSize: 20
      },
      isLoading: false,
      isDialogShow: false,
      dialogParams: {}
    };
  },
  created() {
    this.getTree();
  },
  methods: {
    async getTree(searchParams = { currentPage: 1 }) {
      this.isLoading = true;
      this.searchParams = { ...this.searchParams, currentPage: 1, ...searchParams };
      const res = await this.$api.process.eventType.getTree(this.searchParams);
      if (res.Status === 'OK') {
        const { rowNum, pageSize, currentPage, tbodyList: tbodyList } = res.Return;
        this.treeConfig = { rowNum, pageSize, currentPage, tbodyList };
      }
      this.isLoading = false;
    },
    async searchTree(key, value) {
      const params = {
        [key]: value
      };
      const res = await this.$api.process.eventType.searchTree(params);
      if (res.Status === 'OK') {
        this.treeConfig.tbodyList = res.Return.children;
        this.treeConfig.rowNum = 0; //去掉分页
        this.treeConfig.currentPage = 1;
      }
    },
    handleSelectChange(value) {
      if (value) {
        this.searchTree('id', value);
      } else {
        this.getTree();
      }
    },
    handleSearch(value) {
      if (value) {
        this.searchTree('keyword', value);
      } else {
        this.getTree();
      }
    },
    addRootClassify() {
      // 添加根分类
      this.isDialogShow = true;
      this.dialogParams = {
        operation: 'add',
        node: {
          parentId: 0,
          id: 0,
          children: this.treeConfig.tbodyList
        },
        path: []
      };
    },
    handleRownumDecrease(index) {
      this.treeConfig.rowNum--;
      this.treeConfig.tbodyList.splice(index, 1);
    },
    showDialog(params) {
      if (params.operation === 'delete' && params.node.solutionCount !== 0) return;
      if (params.operation === 'delete' && params.node.childCount !== 0) return;
      this.dialogParams = params;
      this.isDialogShow = true;
    },
    closeEventTypeDialog() {
      this.isDialogShow = false;
      this.dialogParams = {};
    },
    async loadData(node, resolve) {
      const params = { parentId: node.id };
      const res = await this.$api.process.eventType.getTree(params);
      if (res.Status === 'OK') {
        resolve(res.Return.tbodyList);
      }
    },
    shouldLoadData(node) {
      return node.children.length < node.childCount;
    },
    checkLeaf(node) {
      return node.childCount === 0;
    },
    async handleNodeSort(node, parentNode, e) {
      const params = {
        id: node.id,
        parentId: parentNode.id,
        sort: e.newIndex
      };
      const res = await this.$api.process.eventType.move(params);
      if (res.Status === 'OK') {
        this.$Message.success(this.$t('message.savesuccess'));
      }
    },
    async handleNodeAdd(node, parentNode, e) {
      try {
        const params = {
          id: node.id,
          parentId: parentNode.id,
          sort: e.newIndex
        };
        const res = await this.$api.process.eventType.move(params);
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          parentNode.childCount += 1;
          const solutionCountConfig = res.Return.idSolutionCountMapList.reduce((result, item) => {
            result[item.id] = item.solutionCount;
            return result;
          }, {});
          this.$refs.tree.flattenTree(node, n => {
            n.solutionCount = solutionCountConfig[n.id];
            return n;
          });
        }
      } catch (error) {
        this.getTree();
      }
    },
    handleNodeRemove(node, parentNode, e) {
      parentNode.childCount -= 1;
    }
  }
};
</script>

<style lang="less" scoped>
</style>
