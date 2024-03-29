<template>
  <div class="service-management">
    <TsContain
      :isSiderHide="isSiderHide"
      border="border"
      :siderWidth="300"
      :enableCollapse="true"
    ><template v-slot:navigation>
       <span class="tsfont-plus text-action" @click="addRoot()">{{ $t('page.rootdirectory') }}</span>
     </template>
      <template v-slot:topLeft>
        <span>{{ catalogName }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span
            v-if="catalogData.uuid !== '' || channelData.uuid !== ''"
            class="action-item tsfont-trash-o"
            :class="handleClassName"
            @click="handleDelete()"
          >{{ $t('page.delete') }}</span>
          <span :class="{ disable: disabledConfig.saving }" class="action-item tsfont-save" @click="saveCurrent()">{{ $t('page.save') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="pl-md pr-md">
          <Loading v-if="treeloading" :loadingShow="treeloading" type="fix"></Loading>
          <TsFormSelect v-bind="selectSetting" @on-change="selectChannel"></TsFormSelect>
          <TsZtree
            idKey="uuid"
            :nodes="nodeList"
            :hoverDomList="hoverDomList"
            :beforeClick="beforeClick"
            :onClick="clickNode"
            :onDrop="onDrop"
            :value="treeUuid"
            :beforeDrop="beforeDrop"
          ></TsZtree>
        </div>
      </template>
      <template v-slot:content>
        <div class="content bg-op pt-md radius-lg" :class="!isSiderHide ? 'ml-md' : ''">
          <component
            :is="catalogTypeName"
            :ref="catalogTypeName"
            :uuid="currentUuid"
            :processUuid="processUuid"
            @save="saveEdit"
            @updateName="updateName"
          ></component>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'CatalogManage',
  components: {
    TsZtree: resolve => require(['@/resources/plugins/TsZtree/TsZtree.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    catalog: resolve => require(['./catalog/edit/catalog.vue'], resolve),
    channel: resolve => require(['./catalog/edit/channel.vue'], resolve)
  },
  directives: {},
  props: [''],
  data() {
    return {
      isCancelSelected: false, // 从流程管理跳转过来选中对应节点，再次选中，取消从流程管理跳转过来节点
      firstTreeUuid: '', // 用于从流程编辑跳转到服务目录，新增服务，需要默认选中第一个目录，但是打开新增服务的页面
      currentUuid: null,
      treeUuid: null,
      isSiderHide: false,
      catalogTypeName: 'catalog', // 类型,默认目录表单
      catalogName: this.$t('dialog.title.edittarget', { target: this.$t('page.catalogue') }), //表单标题
      treeloading: true,
      parentUuid: '', //浏览器携带根目录
      processUuid: '', //流程id
      uuid: '', //服务id
      childrenCount: null,
      selectSaveUuid: '', //保存选中uuid
      catalogData: {
        //目录数据
        uuid: '',
        parentUuid: '0'
      },
      channelData: {
        //服务数据
        uuid: '',
        parentUuid: '0'
      },
      selectSetting: {
        name: 'ServiceSearch',
        search: true,
        dynamicUrl: '/api/rest/process/catalog/channel/search',
        rootName: 'treeList',
        valueName: 'uuid',
        textName: 'name',
        onChange: this.treeSelected,
        placeholder: this.$t('page.search'),
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
          clickFn: (treeNode) => {
            this.addCatalogChildren(treeNode);
          }
        },
        {
          icon: 'tsfont-putongjigui',
          desc: this.$t('dialog.title.addtarget', { target: this.$t('term.process.catalog') }),
          isAddFn: (treeNode) => {
            if (treeNode.type == 'catalog') {
              return true;
            } else {
              return false;
            }
          },
          clickFn: (treeNode) => {
            this.addChannel(treeNode?.uuid);
          }
        },
        {
          icon: 'tsfont-trash-o',
          desc: this.$t('page.delete'),
          initFn: (treeNode, $span) => {
            if (treeNode.childrenCount == undefined || treeNode.childrenCount == 0) {
              //
            } else {
              $span[0].classList.add('text-disabled');
              $span[0].title = treeNode.type == 'catalog' ? this.$t('term.autoexec.citecatalognodelete') : this.$t('term.autoexec.citeservicenodelete');
            }
          },
          clickFn: (treeNode) => {
            this.nodeDelete(treeNode);
          }
        }
      ]
    };
  },
  created() {
    let {processUuid = '', uuid = ''} = this.$route.query || {};
    this.processUuid = processUuid;
    this.uuid = uuid;
  },
  beforeMount() {},
  mounted() {
    this.getTreeList(true);
  },
  methods: {
    //获取服务目录服务树
    getTreeList(isFirst) {
      this.$api.process.service.searchTree().then(res => {
        if (res.Status == 'OK') {
          this.nodeList = res.Return || [];
          if (!isFirst) {
            this.currentUuid = this.selectSaveUuid;
            this.treeUuid = this.selectSaveUuid;
          } else if (this.uuid) {
            this.currentUuid = this.uuid;
            this.treeUuid = this.uuid;
            this.catalogTypeName = 'channel';//服务
            this.firstTreeUuid = this.uuid;
          } else if (this.processUuid) {
            this.treeUuid = !this.$utils.isEmpty(this.nodeList) ? this.nodeList[0]?.uuid : null;
            this.firstTreeUuid = this.treeUuid;
            this.catalogTypeName = 'channel';//服务
          } else if (!this.$utils.isEmpty(this.nodeList)) {
            this.currentUuid = this.nodeList[0]?.uuid || null;
            this.treeUuid = this.nodeList[0]?.uuid || null;
          } else {
            this.addRoot();
          }
          this.treeloading = false;
        }
      });
    },
    beforeClick(zTreeObj, node) {
      if (!this.isCancelSelected) {
        this.isCancelSelected = true;
      } else {
        this.processUuid = null;
        this.uuid = null;
        this.firstTreeUuid = null;
      }
      if (!this.currentUuid || this.currentUuid != node.uuid) {
        zTreeObj.cancelSelectedNode();
        return true;
      } else {
        return false;
      }
    },
    clickNode(tree, node) {
      // 节点选中
      if (node?.uuid && this.firstTreeUuid == node.uuid) {
        // 从流程管理跳转到服务目录，有目录列表就打开新增服务的页面，没有就新增根目录
        if (this.$utils.isEmpty(this.nodeList)) {
          this.addRoot();
        } else {
          if (this.processUuid) {
            this.addChannel(node.uuid);// 新加服务
          } else if (this.uuid) {
            this.catalogName = this.$t('dialog.title.edittarget', { target: this.$t('term.process.catalog')});
            this.channelData.parentUuid = node.parentUuid; // 编辑服务
            this.channelData.uuid = node.uuid;
          }
        }
        return false;
      }
      this.catalogTypeName = node?.type;
      if (this.catalogTypeName) {
        let {uuid = '', parentUuid = null, childrenCount = null, type = ''} = node || {};
        this.childrenCount = childrenCount;
        this.currentUuid = uuid;
        this.treeUuid = uuid;
        if (type == 'catalog') {
          // 编辑目录
          this.catalogName = this.$t('dialog.title.edittarget', { target: this.$t('page.catalogue') });
          this.$set(this.catalogData, 'uuid', uuid);
          this.$set(this.catalogData, 'parentUuid', parentUuid);
        } else if (type == 'channel') {
          // 编辑服务
          this.catalogName = this.$t('dialog.title.edittarget', { target: this.$t('term.process.catalog')});
          this.$set(this.channelData, 'uuid', uuid);
          this.$set(this.channelData, 'parentUuid', parentUuid);
        }
      }
    },
    treeSelected(uuid) {
      //树select选择中
      this.currentUuid = uuid;
      this.treeUuid = uuid;
    },
    //添加根目录按钮
    addRoot() {
      this.catalogTypeName = 'catalog';
      this.catalogName = this.$t('dialog.title.addtarget', { target: this.$t('page.rootdirectory') });
      this.catalogData.parentUuid = '0';
      this.catalogData.uuid = '';
      this.currentUuid = null;
    },
    //搜索服务点击
    selectChannel(uuid) {
      this.$set(this.channelData, 'uuid', uuid);
    },
    handleSave() {
      if (this.disabledConfig.saving) {
        return;
      }
      this.disabledConfig.saving = true;
      const apiFunc = this.catalogTypeName === 'catalog' ? this.$api.process.service.saveCatalogInfo : this.$api.process.service.saveChannelInfo;
      const data = this.catalogTypeName === 'catalog' ? this.catalogData : this.channelData;
      apiFunc(data)
        .then(res => {
          if (res.Status === 'OK') {
            this.selectSaveUuid = res.Return;
            this.$Message.success(this.$t('message.savesuccess'));
            this.getTreeList();
          }
        })
        .finally(() => {
          this.disabledConfig.saving = false;
        });
    },
    beforeDrop(tree, treeNodes, targetNode, moveType) {
      const firstTreeNode = treeNodes && treeNodes[0];
      const isTargetNodeService = targetNode && targetNode.type === 'channel';
      const isFirstTreeNodeService = firstTreeNode && firstTreeNode.type === 'channel';
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
      let treeNode = treeNodes[0];
      let parentId = null;
      let keyId = 'uuid';
      if (moveType === 'inner') {
        parentId = targetNode?.[keyId] || 0;
      } else {
        parentId = targetNode && targetNode.getParentNode() === null ? 0 : (targetNode?.getParentNode()?.[keyId] || 0);
      }
      let data = {
        uuid: treeNode.uuid,
        moveType: moveType,
        parentUuid: parentId,
        targetUuid: targetNode?.uuid || 0
      };
     
      if (moveType != null) {
        if (treeNode.type == 'catalog') {
          this.$api.process.service.moveCatalog(data).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
            }
          });
        } else if (treeNode.type == 'channel') {
          this.$api.process.service.moveChannel(data).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
            }
          });
        }
      }
    },
    handleDelete() {
      if (this.childrenCount > 0) {
        return false;
      }
      if (this.disabledConfig.deleting) {
        return false;
      }
      let deleteContentName = this.catalogTypeName == 'catalog' ? this.catalogData.name : this.channelData.name;
      let apiFunc = this.catalogTypeName == 'catalog' ? this.$api.process.service.deleteCatalog({ uuid: this.catalogData.uuid}) : this.$api.process.service.deleteChannel({ uuid: this.channelData.uuid});
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: deleteContentName}),
        btnType: 'error',
        'on-ok': vnode => {
          apiFunc
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.getTreeList(true);
              }
            })
            .finally(() => {
              this.disabledConfig.deleting = false;
            });
        }
      });
    },
    //树节点删除
    nodeDelete(treeNode) {
      let {uuid = null, name = '', type = '', childrenCount = 0} = treeNode || {};
      if (childrenCount > 0 || !type) {
        return false;
      }
      let apiFunc = type == 'catalog' ? this.$api.process.service.deleteCatalog({uuid: uuid}) : this.$api.process.service.deleteChannel({uuid: uuid});
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          apiFunc
            .then(res => {
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
      this.catalogName = this.$t('dialog.title.addtarget', { target: this.$t('page.subdirectory') });
      this.catalogTypeName = 'catalog';
      this.catalogData.parentUuid = treeNode.uuid;
      this.catalogData.uuid = '';
      this.currentUuid = null;
    },
    //添加服务
    addChannel(uuid) {
      this.catalogName = this.$t('dialog.title.addtarget', { target: this.$t('term.process.catalog') });
      this.catalogTypeName = 'channel';
      this.channelData.parentUuid = uuid;
      this.channelData.uuid = '';
      if (this.processUuid) {
        this.channelData.processUuid = this.processUuid;
      }
      this.currentUuid = null;
    },
    saveEdit(data) {
      //底部保存按钮
      if (data) {
        if (this.catalogTypeName == 'channel') {
          Object.assign(this.channelData, data);
        } else if (this.catalogTypeName == 'catalog') {
          Object.assign(this.catalogData, data);
        }
        this.handleSave();
      }
    },
    saveCurrent() {
      //顶部保存按钮
      if (this.catalogTypeName == 'channel') {
        this.$refs.channel.save();
      } else if (this.catalogTypeName == 'catalog') {
        this.$refs.catalog.save();
      }
    },
    updateName(name) {
      this.channelData.name = name;
    }
  },
  computed: {
    handleClassName() {
      return !(this.childrenCount == undefined || this.childrenCount == 0) || this.disabledConfig.saving ? 'disable' : '';
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.service-management {
  /deep/.tscontain-body{
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
