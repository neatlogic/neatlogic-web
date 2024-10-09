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
            v-if="!$utils.isEmpty(catalogData.id) || !$utils.isEmpty(serviceData.id)"
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
  directives: {},
  props: {},
  data() {
    return {
      positioningKey: '', // 定位失效的key
      isSiderHide: false,
      catalogType: 'catalog', //表单类型,默认目录表单
      catalogTitle: this.$t('term.autoexec.editdirectory'),
      treeloading: true,
      childrenCount: null,
      selectSaveId: '', //保存选中id
      serviceId: null,
      selectedTreeId: null,
      selectedTreeNode: {},
      selectedTreeData: {},
      catalogData: {
        //目录数据
        id: null,
        parentId: 0,
        name: ''
      },
      serviceData: {
        //服务数据
        id: null,
        parentId: 0,
        name: ''
      },
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
          isAddFn: (treeNode) => {
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
          isAddFn: (treeNode) => {
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
          isAddFn: (treeNode) => {
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
  created() {},
  beforeMount() {},
  mounted() {
    let {id = null, key = ''} = this.$route.query || {};
    if (id) {
      this.serviceId = parseInt(id);
      this.positioningKey = key; // 定位到失效参数key值
    }
    this.getTreeList(true);
  },
  methods: {
    addSubcatalog() {
      // 添加子目录
      if (this.selectedTreeNode && !this.$utils.isEmptyObj(this.selectedTreeNode)) {
        this.addCatalogChildren(this.selectedTreeNode);
      }
    },
    //获取服务目录服务树
    getTreeList(isFirstRender = false) {
      this.treeloading = true;
      this.$api.autoexec.catalogManage
        .getAllSeriveTree()
        .then(res => {
          if (res.Status == 'OK') {
            this.nodeList = res.Return || [];
            if (!isFirstRender) {
              this.selectedTreeId = this.selectSaveId;
            } else if (this.serviceId) {
              this.selectedTreeId = this.serviceId;
            } else if (!this.$utils.isEmpty(this.nodeList)) {
              this.selectedTreeId = this.nodeList[0]?.id || null;
            } else {
              this.addRootCatalog(); // 添加根目录
            }
          }
        })
        .finally(() => {
          this.treeloading = false;
        });
    },
    //服务树点击事件
    clickNode(tree, node) {
      let {type = '', id = null, parentId = 0, name = '', childrenCount = null} = node || {};
      this.catalogType = type;
      this.childrenCount = childrenCount;
      this.selectedTreeId = id;
      this.selectedTreeData = {...node, parentId: parentId || 0};
      this.selectedTreeNode = {...node, parentId: parentId || 0};
      if (this.catalogType == 'service') {
        this.catalogTitle = this.$t('term.autoexec.editservice');
        this.$set(this.serviceData, 'id', id);
        this.$set(this.serviceData, 'parentId', parentId || 0);
        this.$set(this.serviceData, 'name', name);
      } else if (this.catalogType == 'catalog') {
        this.catalogTitle = this.$t('term.autoexec.editdirectory');
        this.$set(this.catalogData, 'id', id);
        this.$set(this.catalogData, 'parentId', parentId || 0);
        this.$set(this.catalogData, 'name', name);
      }
    },
    //添加根目录按钮
    addRootCatalog() {
      this.catalogType = 'catalog';
      this.catalogTitle = this.$t('term.autoexec.addrootdirectory');
      this.catalogData = {
        parentId: 0,
        id: null,
        name: ''
      };
      this.selectedTreeId = null;
      this.selectedTreeData = {};
    },
    //搜索服务点击
    handleChange(id) {
      this.selectedTreeId = id;
      this.$set(this.serviceData, 'id', id);
    },
    //保存信息
    handleSave() {
      if (this.disabledConfig.saving && !this.catalogType) {
        return false;
      }
      let apiFunc = this.catalogType == 'catalog' ? this.$api.autoexec.catalogManage.saveSeriveInfo(this.catalogData) : this.$api.autoexec.catalogManage.saveSeriveInfo(this.serviceData);
      this.disabledConfig.saving = true;
      apiFunc
        .then(res => {
          if (res.Status == 'OK') {
            this.selectSaveId = res.Return;
            this.$Message.success(this.$t('message.savesuccess'));
            this.getTreeList();
            if (this.catalogType == 'service') {
              this.$refs[this.catalogType] && this.$refs[this.catalogType].initData(); // 保存成功之后，刷新数据
            }
          }
        })
        .finally(() => {
          this.disabledConfig.saving = false;
        });
    },
    beforeDrop(treeId, treeNodes, targetNode, moveType, isCopy) {
      const firstTreeNode = treeNodes && treeNodes[0];
      const isTargetNodeService = targetNode && targetNode.type === 'service';
      const isFirstTreeNodeService = firstTreeNode && firstTreeNode.type === 'service';
      const isTargetNodeCatalog = targetNode && targetNode.type === 'catalog';
      if (
        (targetNode == null && isFirstTreeNodeService) ||
        (isTargetNodeService && isFirstTreeNodeService && moveType === 'inner') ||
        (isTargetNodeCatalog && isFirstTreeNodeService && moveType === 'prev') ||
        (isTargetNodeCatalog && isFirstTreeNodeService && moveType === 'next')
      ) {
        // 不能将服务拖拽成为根节点, 不能将服务拖拽到服务，不能将服务拖拽到目录节点前面，不能将服务拖拽到目录节点后面
        return false;
      }
    },
    onDrop(tree, treeNodes, targetNode, moveType, isCopy) {
      // treeNodes 被拖拽json集合
      let {id = null} = treeNodes[0] || {};
      let data = {
        id: id,
        moveType: moveType,
        targetId: this.$utils.isEmpty(targetNode) ? 0 : targetNode.id // 将目录拖拽到根目录时，目标为0
      };
      this.$api.autoexec.catalogManage.moveCatalog(data).then(res => {
        if (res?.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    //按钮删除信息
    delService() {
      this.deleteSeriveById({
        childrenCount: this.childrenCount,
        type: this.catalogType,
        id: this.catalogType == 'catalog' ? this.catalogData.id : this.serviceData.id,
        name: this.catalogType == 'catalog' ? this.catalogData.name : this.serviceData.name
      });
    },
    //树节点删除
    deleteSeriveById(treeNode) {
      if (treeNode.childrenCount > 0) {
        return false;
      }
      let data = {
        id: treeNode.id
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: treeNode.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.catalogManage.deleteService(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.getTreeList(true);
            }
          });
        }
      });
    },
    //添加子目录
    addCatalogChildren(treeNode) {
      this.catalogTitle = this.$t('dialog.title.addtarget', { target: this.$t('page.subdirectory') });
      this.catalogType = 'catalog';
      this.catalogData.parentId = treeNode.id;
      this.catalogData.id = '';
      this.catalogData.name = '';
      this.selectedTreeId = null;
      this.selectedTreeData = treeNode;
    },
    //添加服务
    addService(treeNode) {
      this.catalogTitle = this.$t('term.autoexec.addservice');
      this.catalogType = 'service';
      this.serviceData.parentId = treeNode.id;
      this.serviceData.id = '';
      this.serviceData.name = '';
      this.selectedTreeId = null;
      this.selectedTreeData = treeNode;
    },
    editService(treeNode) {
      // 编辑服务
      this.selectedTreeNode = treeNode;
      this.catalogType = treeNode.type;
      this.catalogTitle = this.$t('term.autoexec.editservice');
      this.childrenCount = treeNode.childrenCount;
      this.$set(this.serviceData, 'id', treeNode.id);
      this.$set(this.serviceData, 'parentId', treeNode.parentId || 0);
      this.$set(this.serviceData, 'name', treeNode.name);
      this.selectedTreeId = treeNode.id;
      this.selectedTreeData = treeNode;
    },
    saveEdit(data) {
      //底部保存按钮
      if (data) {
        if (this.catalogType == 'service') {
          Object.assign(this.serviceData, data);
        } else if (this.catalogType == 'catalog') {
          Object.assign(this.catalogData, data);
        }
        this.handleSave();
      }
    },
    saveCurrent() {
      //顶部保存按钮
      if (this.catalogType == 'service') {
        this.$refs.service.saveService();
      } else if (this.catalogType == 'catalog') {
        this.$refs.catalog.save();
      }
    },
    updateName(name) {
      this.serviceData.name = name;
    }
  },
  computed: {
    handleClassName() {
      return (this.childrenCount != 0 && !this.$utils.isEmpty(this.childrenCount)) || this.disabledConfig.saving ? 'disable' : '';
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.service-management {
  /deep/.tscontain-body {
    padding-left: 0px !important;
  }
  /deep/ .ivu-layout-content {
    overflow-y: hidden;
  }
  /deep/ .content {
    height: 100%;
    overflow: auto;
  }
}
</style>
