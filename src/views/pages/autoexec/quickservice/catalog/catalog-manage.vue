<template>
  <div class="service-management">
    <Loading :loadingShow="treeloading" type="fix"></Loading>
    <TsContain
      :isSiderHide="isSiderHide"
      border="border"
      :siderWidth="300"
      :enableCollapse="true"
    >
      <template v-slot:navigation>
        <span class="tsfont-plus text-action" @click="addRootCatalog()">{{ $t('page.rootdirectory') }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ catalogTitle }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span
            v-if="catalogType == 'catalog'"
            class="action-item tsfont-plus"
            @click="addSubcatalog"
          >{{ $t('page.subdirectory') }}</span>
          <span
            v-if="selectedTreeId"
            class="action-item tsfont-trash-o"
            :class="handleClassName"
            @click="delService()"
          >
            {{ catalogType == 'catalog' ? $t('term.autoexec.deletedirectory') : $t('term.autoexec.deleteservice') }}
          </span>
          <div class="action-item">
            <Button
              :disabled="disabledConfig.saving"
              type="primary"
              @click="saveCurrent()"
            >{{ $t('page.save') }}</Button>
          </div>
        </div>
      </template>
      <template v-slot:sider>
        <div class="pl-md pr-md">
          <TsFormSelect v-bind="tsFormSelectSetting" @change="handleChange"></TsFormSelect>
          <TsZtree
            ref="ztree"
            :nodes="nodeList"
            :hoverDomList="hoverDomList"
            :onClick="clickNode"
            :onDrop="onDrop"
            :beforeDrop="beforeDrop"
            :value="selectedTreeId"
          ></TsZtree>
        </div>
      </template>
      <template v-slot:content>
        <div
          class="content pt-md"
          :class="[!isSiderHide ? 'ml-md' : '', catalogType == 'catalog' ? 'radius-lg bg-op' : '']"
        >
          <Component
            :is="catalogType"
            :id="selectedTreeId"
            :key="editorKey"
            :ref="catalogType"
            :positioningKey="positioningKey"
            :selectedTreeNode="selectedTreeData"
            @save="saveEdit"
            @updateName="updateName"
          ></Component>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'CatalogManage',
  components: {
    TsZtree: () => import('@/resources/plugins/TsZtree/TsZtree.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    catalog: () => import('./catalog.vue'),
    service: () => import('./service.vue')
  },
  data() {
    return {
      positioningKey: '', // 定位失效的参数键
      isSiderHide: false,
      editState: { node: null, type: 'catalog', parent: null, draft: { id: null, parentId: 0, name: '' } },
      editRevision: 0,
      treeloading: true,
      serviceId: null,
      tsFormSelectSetting: {
        name: 'ServiceSearch',
        search: true,
        dynamicUrl: '/api/rest/autoexec/service/search',
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        placeholder: this.$t('term.autoexec.searchservice'),
        transfer: true,
        border: 'bottom'
      },
      disabledConfig: {
        //禁止按钮连续调用接口
        deleting: false,
        saving: false
      },
      nodeList: [],
      hoverDomList: [
        {
          icon: 'tsfont-plus',
          desc: this.$t('page.subdirectory'),
          isAddFn: treeNode => {
            if (treeNode.type == 'catalog') {
              return true;
            } else {
              return false;
            }
          },
          clickFn: treeNode => {
            this.addCatalogChildren(treeNode);
          }
        },
        {
          icon: 'text-warning tsfont-warning-o',
          desc: this.$t('term.autoexec.servicehasexpired'),
          isAddFn: treeNode => {
            // 处理服务失效提示
            if (treeNode.type == 'service' && treeNode.configExpired) {
              return true;
            } else {
              return false;
            }
          },
          clickFn: treeNode => {
            this.editService(treeNode);
          }
        },
        {
          icon: 'tsfont-flow-children',
          desc: this.$t('term.autoexec.addservice'),
          isAddFn: treeNode => {
            if (treeNode.type == 'catalog') {
              return true;
            } else {
              return false;
            }
          },
          clickFn: treeNode => {
            this.addService(treeNode);
          }
        },
        {
          icon: 'tsfont-trash-o',
          desc: this.$t('page.delete'),
          initFn: (treeNode, $span) => {
            if (treeNode.childrenCount != 0 && !this.$utils.isEmpty(treeNode.childrenCount)) {
              $span[0].classList.add('text-disabled');
              $span[0].title = this.$t('term.autoexec.citecatalognodelete');
            }
          },
          clickFn: treeNode => {
            this.deleteSeriveById(treeNode);
          }
        }
      ]
    };
  },
  mounted() {
    let { id = null, key = '' } = this.$route.query || {};
    if (id) {
      this.serviceId = parseInt(id);
      this.positioningKey = key; // 定位到失效参数对应的键
    }
    this.getTreeList(true);
  },
  methods: {
    getTree() {
      return this.$refs.ztree && this.$refs.ztree.getZTreeObj();
    },
    findNode(id, nodes = this.nodeList) {
      for (const node of nodes) {
        if (node.id == id) return node;
        const child = this.findNode(id, node.children || []);
        if (child) return child;
      }
      return null;
    },
    selectNode(node) {
      if (!node) return this.addRootCatalog();
      if (this.editState.node === node) return;
      this.editRevision++;
      this.editState = {
        node,
        type: node.type,
        parent: null,
        draft: { id: node.id, parentId: node.parentId || 0, name: node.name || '' }
      };
    },
    startCreate(type, parent = null) {
      this.editRevision++;
      this.editState = { node: null, type, parent, draft: { id: null, parentId: parent ? parent.id : 0, name: '' } };
    },
    addSubcatalog() {
      const parent = this.editState.node || this.editState.parent;
      if (parent) this.addCatalogChildren(parent);
    },
    async getTreeList(isFirstRender = false) {
      this.treeloading = true;
      try {
        const res = await this.$api.autoexec.catalogManage.getAllSeriveTree();
        if (res.Status !== 'OK') return;
        const nodes = res.Return || [];
        const id = isFirstRender ? this.serviceId : this.selectedTreeId;
        const node = this.findNode(id, nodes) || nodes[0];
        this.selectNode(node);
        this.nodeList = nodes;
      } finally {
        this.treeloading = false;
      }
    },
    clickNode(tree, node) {
      this.selectNode(node);
    },
    addRootCatalog() {
      this.startCreate('catalog');
    },
    async handleChange(id) {
      if (this.$utils.isEmpty(id)) return;
      const tree = this.getTree();
      const node = tree && tree.getNodeByParam('id', id, null);
      if (node) return this.selectNode(node);
      const revision = this.editRevision;
      const response = await this.$api.autoexec.catalogManage.getSeriveInfo({ id });
      if (revision === this.editRevision && response.Status === 'OK') this.selectNode({ ...response.Return, type: 'service' });
    },
    async handleSave(data) {
      if (this.disabledConfig.saving) return false;
      this.disabledConfig.saving = true;
      const revision = this.editRevision;
      const target = this.$utils.deepClone({ ...this.editState.draft, ...data, type: this.catalogType });
      try {
        const res = await this.$api.autoexec.catalogManage.saveSeriveInfo(target);
        if (res.Status !== 'OK') return false;
        this.$Message.success(this.$t('message.savesuccess'));
        const saved = { ...target, id: res.Return };
        this.updateZtree(target.id ? 'edit' : 'add', saved);
        // 请求完成后始终更新提交目标；只有编辑位置未变时才回填当前编辑器。
        if (revision === this.editRevision) {
          const tree = this.getTree();
          this.selectNode((tree && tree.getNodeByParam('id', saved.id, null)) || saved);
          if (target.id) {
            const editor = this.$refs[target.type];
            if (editor) target.type === 'service' ? editor.initData() : editor.getCatalogData();
          }
        }
        return true;
      } finally {
        this.disabledConfig.saving = false;
      }
    },
    beforeDrop(treeId, treeNodes, targetNode, moveType, isCopy) {
      const firstTreeNode = treeNodes && treeNodes[0];
      const isTargetNodeService = targetNode && targetNode.type === 'service';
      const isFirstTreeNodeService = firstTreeNode && firstTreeNode.type === 'service';
      const isTargetNodeCatalog = targetNode && targetNode.type === 'catalog';
      if ((targetNode == null && isFirstTreeNodeService) || (isTargetNodeService && isFirstTreeNodeService && moveType === 'inner') || (isTargetNodeCatalog && isFirstTreeNodeService && moveType === 'prev') || (isTargetNodeCatalog && isFirstTreeNodeService && moveType === 'next')) {
        // 不能将服务拖拽成为根节点, 不能将服务拖拽到服务，不能将服务拖拽到目录节点前面，不能将服务拖拽到目录节点后面
        return false;
      }
    },
    async onDrop(tree, treeNodes, targetNode, moveType) {
      try {
        const res = await this.$api.autoexec.catalogManage.moveCatalog({
          id: treeNodes[0].id,
          moveType,
          targetId: targetNode ? targetNode.id : 0
        });
        if (res.Status === 'OK') this.$Message.success(this.$t('message.executesuccess'));
      } finally {
        // 拖拽在 zTree 中先行变更；成功或失败均重载后端树，恢复真实父节点与子节点数量。
        await this.getTreeList();
      }
    },
    delService() {
      if (this.handleClassName) return;
      this.deleteSeriveById(this.editState.node);
    },
    deleteSeriveById(node) {
      if (!node || node.childrenCount > 0 || this.disabledConfig.deleting || this.disabledConfig.saving) return false;
      const target = { ...node };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: target.name }),
        btnType: 'error',
        'on-ok': async vnode => {
          if (this.disabledConfig.deleting) return false;
          this.disabledConfig.deleting = true;
          try {
            const res = await this.$api.autoexec.catalogManage.deleteService({ id: target.id });
            if (res.Status !== 'OK') return false;
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.updateZtree('delete', target);
            return true;
          } finally {
            this.disabledConfig.deleting = false;
          }
        }
      });
    },
    addCatalogChildren(node) {
      this.startCreate('catalog', node);
    },
    addService(node) {
      this.startCreate('service', node);
    },
    editService(node) {
      this.selectNode(node);
    },
    saveEdit(data) {
      if (data) return this.handleSave(data);
    },
    saveCurrent() {
      if (this.disabledConfig.saving) return;
      const editor = this.$refs[this.catalogType];
      if (editor) return this.catalogType === 'service' ? editor.saveService() : editor.save();
    },
    updateName(name) {
      this.editState.draft.name = name;
    },
    updateZtree(action, target) {
      const tree = this.getTree();
      if (!tree) return;
      const node = tree.getNodeByParam('id', target.id, null);
      if (action === 'add') {
        const parent = tree.getNodeByParam('id', target.parentId, null);
        tree.addNodes(parent, target);
        if (parent) {
          parent.childrenCount = (Number(parent.childrenCount) || 0) + 1;
          tree.updateNode(parent);
        }
      } else if (action === 'edit' && node) {
        Object.assign(node, target);
        tree.updateNode(node);
      } else if (action === 'delete' && node) {
        const parent = tree.getNodeByParam('id', node.parentId, null);
        tree.removeNode(node);
        if (parent) {
          parent.childrenCount = Math.max(0, (Number(parent.childrenCount) || 0) - 1);
          tree.updateNode(parent);
        }
        if (this.selectedTreeId == target.id) this.selectNode(parent || tree.getNodes()[0]);
      }
    }
  },
  computed: {
    catalogType() {
      return this.editState.type;
    },
    selectedTreeId() {
      return this.editState.draft.id;
    },
    selectedTreeData() {
      return this.editState.node || this.editState.parent || {};
    },
    editorKey() {
      return `${this.catalogType}:${this.selectedTreeId || 'new'}:${this.editState.draft.parentId}`;
    },
    catalogTitle() {
      if (this.selectedTreeId) return this.$t(this.catalogType === 'catalog' ? 'term.autoexec.editdirectory' : 'term.autoexec.editservice');
      if (this.catalogType === 'service') return this.$t('term.autoexec.addservice');
      return this.editState.parent ? this.$t('dialog.title.addtarget', { target: this.$t('page.subdirectory') }) : this.$t('term.autoexec.addrootdirectory');
    },
    handleClassName() {
      return (this.editState.node && this.editState.node.childrenCount > 0) || this.disabledConfig.saving || this.disabledConfig.deleting ? 'disable' : '';
    }
  }
};
</script>
<style lang="less" scoped>
.service-management {
  ::v-deep .tscontain-body {
    padding-left: 0px !important;
  }
  ::v-deep .ivu-layout-content {
    overflow-y: hidden;
  }
  ::v-deep .content {
    height: 100%;
    overflow: auto;
  }
}
</style>
