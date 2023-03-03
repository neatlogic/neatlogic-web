<template>
  <div class="event-type-manage">
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template slot="topLeft">
        <span class="tsfont-plus text-action" @click="addRootNode">{{ $t('page.classify') }}</span>
      </template>
      <template slot="topRight">
        <TsFormSelect v-bind="selectConfig" @on-change="handleSelectChange" @enter-search="handleSearch"></TsFormSelect>
      </template>
      <template slot="content">
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div class="tree-container">
          <TsTree
            ref="tree"
            v-bind.sync="treeConfig"
            :loadData="loadData"
            :shouldLoadData="shouldLoadData"
            :checkLeaf="checkLeaf"
            :boxShadow="false"
            @on-node-sort="handleNodeSort"
            @on-node-add="handleNodeAdd"
            @on-node-remove="handleNodeRemove"
            @on-page-change="currentPage => getTree({ currentPage })"
            @on-page-size-change="pageSize => getTree({ pageSize })"
          >
            <template v-slot:right="{ node, index, parentNode, path }">
              <div class="btn-list">
                <ul class="action-group">
                  <li class="action-item" @click="showDialog({ operation: 'authorize', node })"><span>{{ $t('button.accredit') }}</span></li>
                  <li class="action-item" @click="showDialog({ operation: 'rename', path, node })"><span>{{ $t('page.rename') }}</span></li>
                  <li class="action-item" @click="showDialog({ operation: 'add', path, node })"><span>{{ $t('term.process.addsubclassify') }}</span></li>
                  <li :class="['action-item', 'solution', { 'no-solution text-grey': node.solutionCount === 0 }]" @click="showDialog({ operation: 'linkSolution', node })">
                    <span>{{ $t('term.process.relsolution') }}</span>
                    <span class="solution-count text-primary">{{ node.solutionCount }}</span>
                  </li>
                  <li class="del" :class="['action-item', { 'text-grey disable': node.solutionCount !== 0 || node.childCount !== 0 }]" @click="showDialog({ operation: 'delete', node, index, parentNode })">
                    <span>{{ $t('button.delete') }}</span>
                  </li>
                </ul>
              </div>
            </template>
          </TsTree>
        </div>
      </template>
    </TsContain>
    <EventTypeDialog
      :params.sync="dialogParams"
      :isShow.sync="isDialogShow"
      @on-rownum-increase="treeConfig.rowNum++"
      @on-rownum-decrease="treeConfig.rowNum--"
    ></EventTypeDialog>
  </div>
</template>

<script>
import TsTree from 'components/TsTree/TsTree.vue';

export default {
  name: 'EventTypeManage',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve),
    EventTypeDialog: resolve => require(['./event-type-manage-dialog'], resolve),
    TsTree
  },
  data() {
    const vm = this;
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
      treeConfig: {
        rowNum: 0,
        pageSize: 20,
        currentPage: 1,
        nodeList: []
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
        const { rowNum, pageSize, currentPage, tbodyList: nodeList } = res.Return;
        this.treeConfig = { rowNum, pageSize, currentPage, nodeList };
      }
      this.isLoading = false;
    },
    async searchTree(key, value) {
      const params = {
        [key]: value
      };
      const res = await this.$api.process.eventType.searchTree(params);
      if (res.Status === 'OK') {
        this.treeConfig.nodeList = res.Return.children;
        // this.treeConfig.rowNum = res.Return.children.length;
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
    addRootNode(params) {
      this.isDialogShow = true;
      this.dialogParams = {
        operation: 'add',
        node: {
          parentId: 0,
          id: 0,
          children: this.treeConfig.nodeList
        },
        path: []
      };
    },
    showDialog(params) {
      if (params.operation === 'delete' && params.node.solutionCount !== 0) return;
      if (params.operation === 'delete' && params.node.childCount !== 0) return;
      this.dialogParams = params;
      this.isDialogShow = true;
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
        this.$Message.success(this.$t('message.content.savesuccess'));
      }
    },
    async handleNodeAdd(node, parentNode, e) {
      const params = {
        id: node.id,
        parentId: parentNode.id,
        sort: e.newIndex
      };
      const res = await this.$api.process.eventType.move(params);
      if (res.Status === 'OK') {
        this.$Message.success(this.$t('message.content.savesuccess'));
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
    },
    handleNodeRemove(node, parentNode, e) {
      parentNode.childCount -= 1;
    }
  }
};
</script>

<style lang="less" scoped>
.del {
  visibility: hidden;
}
/deep/.tree-node:hover {
  .del {
    visibility: visible;
  }
}
/deep/.block-container {
  box-shadow: 0px 0px 0px 0px rgb(0 0 0%) !important;
}
/deep/html .block-container {
  box-shadow: 0px 0px 0px 0px rgb(0 0 0%) !important;
}
.event-type-manage {
  .tree-container {
    .btn-list {
      .action-item {
        padding: 10px;
        &.no-solution .solution-count {
          visibility: hidden;
        }
        .solution-count {
          display: inline-block;
          width: 10px;
          text-align: end;
        }
      }
    }
  }
  .page {
    float: right;
    padding: 10px;
  }
}
</style>
