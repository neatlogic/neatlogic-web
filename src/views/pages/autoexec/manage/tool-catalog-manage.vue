
<template>
  <div class="tool-catalog-manage-wrap">
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="openEditDialog">{{ $t('term.autoexec.directorytool') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <TsFormSelect
            v-model.trim="keyword"
            v-bind="selectSetting"
            @on-change="searchKeyword"
            @enter-search="searchKeyword"
          ></TsFormSelect>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsDragTreeTable
            ref="tree"
            v-bind.sync="treeSetting"
            :loadData="loadData"
            :shouldLoadData="shouldLoadData"
            :checkLeaf="checkLeaf"
            :boxShadow="false"
            :theadList="theadList"
            @on-node-sort="handleNodeSort"
            @on-node-add="handleNodeAdd"
            @on-node-remove="handleNodeRemove"
            @on-page-change="currentPage => changeCurrentPage(currentPage)"
            @on-page-size-change="pageSize => changePageSize(pageSize)"
          >
            <template v-slot:right="{ node, index, parentNode}">
              <ul class="action-group">
                <li class="action-item tsfont-edit" @click.stop="operation('edit', {node, parentNode})">{{ $t('page.rename') }}</li>
                <li class="action-item tsfont-plus" @click.stop="operation('add', {node, parentNode})">{{ $t('page.lowerdirectory') }}</li>
                <li class="action-item flex-start">
                  <!-- 关联自定义工具  -->
                  <ReferenceSelect
                    :id="node.id"
                    calleeType="autoexeccatalog"
                    numberClassName="text-href bg-op"
                    :title="$t('term.autoexec.associateacustomtool')"
                    :referenceCount="node.referenceCountForScript"
                    :isShowStatus="true"
                  ></ReferenceSelect>
                </li>
                <li
                  class="action-item tsfont-trash-o"
                  :title="node.referenceCountOfSelfAndChildren > 0 ? $t('term.autoexec.disassociatecandeletecatalog') : ''"
                  :class="node.referenceCountOfSelfAndChildren > 0 ? 'disable' : ''"
                  @click.stop="deleteToolCatalog(node, index, parentNode)"
                >{{ $t('page.delete') }}</li>
              </ul>
            </template>
          </TsDragTreeTable>
        </div>
      </template>
    </TsContain>
    <ToolCatalogEditDialog
      v-if="isShowEditDialog"
      :nodeData="formValue"
      @close="closeEditDialog"
    ></ToolCatalogEditDialog>
  </div>
</template>
<script>
export default {
  name: 'ToolCatalogManage', // 工具目录管理
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    TsDragTreeTable: () => import('components/TsDragTreeTable/TsDragTreeTable'),
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue'),
    ToolCatalogEditDialog: () => import('./tool/tool-catalog-edit-dialog') // 工具目录编辑
  },
  filters: {},
  props: {},
  data() {
    return {
      keyword: '',
      formValue: {}, // 工具目录form表单值
      isShowEditDialog: false,
      loadingShow: false,
      searchParams: {
        currentPage: 1,
        pageSize: 10
      },
      treeSetting: {
        tbodyList: [],
        currentPage: 1,
        rowNum: 0,
        pageSize: 10
      },
      selectSetting: {
        placeholder: this.$t('term.autoexec.pleaseselectdirectoryname'),
        search: true,
        multiple: false,
        dynamicUrl: '/api/rest/autoexec/catalog/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        transfer: true,
        clear: true,
        border: 'border',
        enterSearch: true
      },
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.action'),
          key: 'action'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getTree();
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
    changeCurrentPage(currentPage) {
      this.searchParams.currentPage = currentPage || 1;
      this.getTree();
    },
    changePageSize(pageSize) {
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = pageSize;
      this.getTree();
    },
    operation(type, item) {
      this.isShowEditDialog = true;
      this.formValue = (type == 'edit' ? {value: {name: item.node.name, id: item.node.id, parentId: item.node.parentId}, ...item} : {value: {name: '', parentId: item.node.id, id: null}, ...item });
    },
    deleteToolCatalog(node, index, parentNode) {
      if (node && !node.id) {
        return false;
      }
      if (node && node.referenceCountOfSelfAndChildren) {
        // 大于0不可删除
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('term.autoexec.bysubcatalogalldeletetips'),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.catalog.delCatalogById(node.id).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.deletesuccess'));
              parentNode.children && parentNode.children.splice(index, 1);
              if (parentNode.childCount != undefined) {
                parentNode.childCount--;
              } else {
                this.treeSetting.rowNum--; // 树第一层，删除后，总页码数需要变化
                this.treeSetting.tbodyList.splice(index, 1);
              }
            }
          });
        }
      });
    },
    openEditDialog() {
      // 添加根目录
      this.isShowEditDialog = true;
      this.formValue = {};
    },
    closeEditDialog(needRefresh) {
      // 更新列表数据
      this.isShowEditDialog = false;
      if (needRefresh) {
        this.getTree();
      }
    },
    searchKeyword() {
      // 搜索根据关键字
      if (this.keyword) {
        let params = {
          id: this.keyword,
          keyword: ''
        };
        this.$api.autoexec.catalog.searchCatalogByKeyword(params).then((res) => {
          if (res.Status == 'OK') {
            this.treeSetting.tbodyList = res.Return.children || [];
            this.treeSetting.rowNum = res.Return.children.length || 0;
          }
        });
      } else {
        this.getTree();
      }
    },
    getTree() {
      this.loadingShow = true;
      this.$api.autoexec.catalog.getCatalogList({parentId: null, ...this.searchParams}).then((res) => {
        if (res.Status === 'OK') {
          Object.assign(this.treeSetting, res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    async loadData(node, resolve) {
      const params = { parentId: node.id };
      const res = await this.$api.autoexec.catalog.getCatalogList(params);
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
      const res = await this.$api.autoexec.catalog.moveCatalog(params);
      if (res.Status === 'OK') {
        this.$Message.success(this.$t('message.savesuccess'));
      }
    },
    async handleNodeAdd(node, parentNode, e) {
      const params = {
        id: node.id,
        parentId: parentNode.id,
        sort: e.newIndex
      };
      const res = await this.$api.autoexec.catalog.moveCatalog(params);
      if (res.Status === 'OK') {
        this.$Message.success(this.$t('message.savesuccess'));
        parentNode.childCount += 1;
      }
    },
    handleNodeRemove(node, parentNode, e) {
      parentNode.childCount -= 1;
    }
  },
  computed: {},
  watch: {}
};
</script>
