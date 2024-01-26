<template>
  <div>
    <TsContain :siderWidth="300" enableCollapse>
      <template v-slot:topLeft>
        <span>{{ catalogName }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item tsfont-circulation-o" @click="openAuthorityViewDialog">{{ $t('page.viewauthority') }}</span>
          <span :class="{ disable: saving }" class="action-item tsfont-save" @click="save()">{{ $t('page.save') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="pr-nm">
          <TsZtree
            v-if="!$utils.isEmpty(nodeList)"
            :value="selectedTreeId"
            :nodes="nodeList"
            :hoverDomList="hoverDomList"
            urlKey="xUrl"
            :beforeClick="beforeClick"
            :onClick="clickNode"
            :beforeDrop="beforeDrop"
            :onDrop="onDrop"
          ></TsZtree>
          <NoData v-else-if="!loadingShow && $utils.isEmpty(nodeList)"></NoData>
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div class="content bg-op padding radius-lg">
          <MenuEdit
            v-if="!loadingShow"
            ref="editComponent"
            :isMenu="isMenu"
            :data="selectData"
            :parentId="parentId"
          ></MenuEdit>
          <div class="footer-btn">
            <Button
              class="save"
              type="primary"
              :disabled="saving"
              @click="save()"
            >{{ $t('page.save') }}</Button>
          </div>
        </div>
      </template>
    </TsContain>
    <AuthorityViewDialog v-if="isShowAuthorityViewDialog" @close="isShowAuthorityViewDialog = false"></AuthorityViewDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsZtree: resolve => require(['@/resources/plugins/TsZtree/TsZtree.vue'], resolve),
    MenuEdit: resolve => require(['./menu-edit'], resolve),
    AuthorityViewDialog: resolve => require(['./authority-view-dialog'], resolve)
  },
  props: {},
  data() {
    return {
      isShowAuthorityViewDialog: false,
      loadingShow: true,
      saving: false,
      selectedTreeId: null,
      nodeList: [],
      hoverDomList: [
        {
          icon: 'tsfont-plus',
          desc: this.$t('page.subdirectory'),
          isAddFn: (treeNode) => {
            if (treeNode.type == 1) {
              return false; //菜单不能添加目录
            } else {
              return true;
            }
          },
          clickFn: (treeNode) => {
            this.addTreeChildren(treeNode);
          }
        },
        {
          icon: 'tsfont-putongjigui',
          desc: this.$t('dialog.title.addtarget', { target: this.$t('page.menu') }),
          isAddFn: (treeNode) => {
            if (treeNode.type == 1) {
              return false; //菜单不能添加菜单
            } else {
              return true;
            }
          },
          clickFn: (treeNode) => {
            this.addMenu(treeNode);
          }
        },
        {
          icon: 'tsfont-trash-o',
          desc: this.$t('page.delete'),
          isAddFn: treeNode => {
            if (this.$utils.isEmpty(treeNode.parentId) || treeNode.parentId == 0) {
              return false; // 总的根节点不能删除
            } else {
              return true;
            }
          },
          initFn: (treeNode, $span) => {
            if (treeNode.childCount > 0) {
              $span[0].classList.add('text-disabled');
              $span[0].title = this.$t('term.framework.iscannotdeletenode');
            }
          },
          clickFn: (treeNode) => {
            this.deleteTreeNode(treeNode);
          }
        }
      ],
      selectData: {},
      isMenu: 0, //0(目录)/1(菜单)
      catalogName: this.$t('dialog.title.edittarget', { target: this.$t('page.catalogue') }),
      parentId: null,
      selectSaveId: null //是否存在，判断是否是新建
    };
  },
  beforeCreate() {},
  created() {
    this.init(true);
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
    async init(isFirst) {
      try {
        await this.getTreeList(isFirst);
      } catch (error) {
        console.error(error);
      }
      if (!this.selectedTreeId) {
        this.loadingShow = false;
        return;
      }
      this.getMenuTreeNode();
    },
    getTreeList(isFirst) {
      return this.$api.framework.extramenu.getMenuTreeList().then(res => {
        if (res.Status == 'OK') {
          if (!this.$utils.isEmpty(res.Return)) {
            this.nodeList = [res.Return];
            if (isFirst) {
              this.selectedTreeId = !this.$utils.isEmpty(this.nodeList) ? this.nodeList[0]?.id : null;
            } else {
              this.selectedTreeId = this.selectSaveId;
            }
          }
        }
      });
    },
    getMenuTreeNode() {
      this.loadingShow = true; 
      this.$api.framework.extramenu.getMenuTreeNode({id: this.selectedTreeId}).then(res => {
        if (res.Status == 'OK') {
          this.selectData = res.Return || {};
          this.isMenu = this.selectData.type;
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.loadingShow = false;
        });
      });
    },
    beforeClick(zTreeObj, node) {
      if (!this.selectSaveId || this.selectSaveId != node.id) {
        zTreeObj.cancelSelectedNode();
        return true;
      } else {
        return false;
      }
    },
    clickNode(tree, node) {
      this.isMenu = node.type;
      this.selectedTreeId = node.id;
      this.selectSaveId = node.id;
      this.parentId = node.parentId;
      if (node.type == 0) {
        // 编辑目录
        this.catalogName = this.$t('dialog.title.edittarget', { target: this.$t('page.catalogue') });
      } else if (node.type == 1) {
        // 编辑菜单
        this.catalogName = this.$t('dialog.title.edittarget', { target: this.$t('page.menu')});
      }
      this.getMenuTreeNode();
    },
    addTreeChildren(node) {
      this.loadingShow = true;
      this.selectData = {};
      this.isMenu = 0;
      this.catalogName = this.$t('dialog.title.addtarget', { target: this.$t('page.subdirectory') });
      this.parentId = node.id;
      this.selectSaveId = null;
      this.$nextTick(() => {
        this.loadingShow = false;
      });
    },
    addMenu(node) {
      this.loadingShow = true;
      this.selectData = {};
      this.isMenu = 1;
      this.catalogName = this.$t('dialog.title.addtarget', { target: this.$t('page.menu') });
      this.parentId = node.id;
      this.selectSaveId = null;
      this.$nextTick(() => {
        this.loadingShow = false;
      });
    },
    deleteTreeNode(treeNode) {
      if (treeNode.childCount > 0) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: treeNode.name }),
        btnType: 'error',
        'on-ok': vnode => {
          let data = { id: treeNode.id };
          this.$api.framework.extramenu.deleteMenuTreeNode(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.init(true);
              this.$store.commit('setExtramenu', true);
            }
          });
          vnode.isShow = false;
        }
      });
    },
    save() {
      if (this.saving || !this.$refs.editComponent.valid()) {
        return;
      }
      let data = this.$refs.editComponent.save();
      this.$set(data, 'type', this.isMenu);
      this.parentId && this.$set(data, 'parentId', this.parentId);
      if (this.selectSaveId) {
        this.$set(data, 'id', this.selectSaveId);
      }
      this.saving = true;
      this.$api.framework.extramenu.saveMenuTreeNode(data).then(res => {
        if (res.Status == 'OK') {
          this.selectSaveId = res.Return;
          this.$Message.success(this.$t('message.savesuccess'));
          this.init();
          this.$store.commit('setExtramenu', true); 
        }
      }).finally(() => {
        this.saving = false;
      });
    },
    beforeDrop(treeId, treeNodes, targetNode, moveType) {
      if (targetNode === null) {
        return;
      } else if (moveType === 'inner' && targetNode.type === 1) {
        return false;
      } else if ((moveType === 'prev' || moveType === 'next') && !targetNode.parentId) {
        return false;
      }
    },
    onDrop(tree, treeNodes, targetNode, moveType) {
      let treeNode = treeNodes[0];
      let data = {
        id: treeNode.id,
        moveType: moveType,
        targetId: targetNode?.id || 0
      };
      this.$api.framework.extramenu.moveExtramenu(data).then(res => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.$store.commit('setExtramenu', true); 
        }
      }).finally(() => {
        this.getTreeList();
      });
    },
    openAuthorityViewDialog() {
      this.isShowAuthorityViewDialog = true;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.content {
  position: relative;
  height: 100%;
  overflow: auto;
  .footer-btn {
    padding: 16px 16px 16px 120px;
  }
}
</style>
