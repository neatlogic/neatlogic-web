<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Loading
            v-if="loadingShow"
            :loadingShow="loadingShow"
            type="fix"
          ></Loading>
          <div class="mb-sm">
            <span class="tsfont-plus text-action" @click="addRoot">{{ $t('page.rootdirectory') }}</span>
          </div>
          <TsZtree
            idKey="id"
            :nodes="nodeList"
            :hoverDomList="hoverDomList"
            :onClick="clickNode"
            :onDrop="onDrop"
            :value="treeId"
          ></TsZtree>
          <div v-if="$utils.isEmpty(nodeList)">
            <NoData text=""></NoData>
            <div class="text-center">{{ $t('term.cmdb.noaddcidirectory') }}<span class="text-href" @click="addRoot">{{ $t('term.deploy.clickadd') }}</span></div>
          </div>
        </div>
      </template>
    </TsDialog>
    <CatalogEditDialog v-if="isShowCatalogEditDialog" :catalogData="catalogData" @close="closeCatalogEditDialog"></CatalogEditDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsZtree: resolve => require(['@/resources/plugins/TsZtree/TsZtree.vue'], resolve),
    CatalogEditDialog: resolve => require(['./catalog-edit-dialog'], resolve)
  },
  props: {},
  data() {
    return {
      isShowCatalogEditDialog: false,
      loadingShow: true,
      treeId: '',
      catalogData: {
        parentId: '',
        id: ''
      },
      dialogSetting: {
        title: this.$t('term.cmdb.cidirectory'),
        isShow: true,
        hasFooter: false,
        type: 'slider'
      },
      nodeList: [],
      hoverDomList: [
        {
          icon: 'tsfont-plus',
          desc: this.$t('page.subdirectory'),
          clickFn: (treeNode) => {
            this.addSubCatalog(treeNode);
          }
        },
        {
          icon: 'tsfont-trash-o',
          desc: this.$t('page.delete'),
          initFn: (treeNode, $span) => {
            if (!this.$utils.isEmpty(treeNode.childrenCount) && treeNode.childrenCount) {
              $span[0].classList.add('text-disabled');
              $span[0].title = this.$t('term.cmdb.currentcatalogcitenodeletedescrition');
            }
          },
          clickFn: (treeNode) => {
            if (treeNode && !treeNode.childrenCount) {
              this.deleteTreeNode(treeNode);
            }
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getTreeList();
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
    getTreeList() {
      this.loadingShow = true;
      this.$api.cmdb.cicatalog.getCiCatalogTreeList().then(res => {
        if (res.Status == 'OK') {
          this.nodeList = res.Return || [];
          this.loadingShow = false;
        }
      });
    },
    clickNode(tree, node) {
      // 节点选中
      let {id = '', parentId = null} = node || {};
      if (id && !this.$utils.isSame(this.treeId, id)) {
        this.treeId = id;
        this.$set(this.catalogData, 'id', id);
        this.$set(this.catalogData, 'parentId', parentId);
        this.isShowCatalogEditDialog = true;
      }
    },
    //添加根目录按钮
    addRoot() {
      this.catalogData.parentId = '0';
      this.catalogData.id = '';
      this.isShowCatalogEditDialog = true;
    },
    onDrop(tree, treeNodes, targetNode, moveType, isCopy) {
      let treeNode = treeNodes[0];
      let data = {
        id: treeNode.id,
        moveType: moveType,
        targetId: targetNode?.id || 0
      };
      if (moveType != null) {
        this.$api.cmdb.cicatalog.moveCicatalog(data).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.getTreeList();
          }
        });
      }
    },
    deleteTreeNode(node) {
      let {name = '', id = null} = node || {};
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.cmdb.cicatalog.deleteCiCatalog({id: id}).then(res => {
            if (res.Status == 'OK') {
              this.getTreeList();
              this.$Message.success(this.$t('message.deletesuccess'));
            }
          });
          vnode.isShow = false;
        }
      });
    },
    //添加子目录
    addSubCatalog(treeNode) {
      this.catalogData.parentId = treeNode.id;
      this.catalogData.id = '';
      this.isShowCatalogEditDialog = true;
    },
    closeCatalogEditDialog(id) {
      this.isShowCatalogEditDialog = false;
      if (id) {
        this.treeId = id;
        this.getTreeList();
      }
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
