<template>
  <div>
    <div><a class="tsfont-plus" @click="addRootCatalog()">目录</a></div>
    <TsZtree
      :nodes="catalogList"
      :hoverDomList="hoverDomList"
      :onClick="clickNode"
      :onDrop="onDrop"
      :value="currentCatalogId"
      :enableToggleClick="true"
    ></TsZtree>
    <EditAppCatalog
      v-if="isEditCatalogShow"
      :id="currentCatalog.id"
      :appId="appId"
      :parentId="currentCatalog.parentId"
      :parentName="currentCatalog.parentName"
      @close="closeEditAppCatalog"
    ></EditAppCatalog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsZtree: resolve => require(['@/resources/plugins/TsZtree/TsZtree.vue'], resolve),
    EditAppCatalog: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-appcatalog-dialog.vue'], resolve)
  },
  props: {
    appId: { type: Number }
  },
  data() {
    return {
      currentCatalogId: null,
      currentCatalog: {},
      isEditCatalogShow: false,
      catalogList: [],
      searchCatalogParam: { needCheckIsInUsed: true },
      hoverDomList: [
        {
          icon: 'tsfont-plus',
          clickFn: treeNode => {
            this.currentCatalog = {};
            this.currentCatalog.parentId = treeNode.id;
            this.currentCatalog.parentName = treeNode.name;
            this.isEditCatalogShow = true;
          }
        },
        {
          icon: 'tsfont-edit',
          clickFn: treeNode => {
            this.currentCatalog = {};
            this.currentCatalog.id = treeNode.id;
            this.isEditCatalogShow = true;
          }
        },
        {
          icon: 'tsfont-trash-o',
          isAddFn: treeNode => {
            if ((treeNode.children && treeNode.children.length > 0) || treeNode.isInUsed) {
              return false;
            }
            return true;
          },
          clickFn: treeNode => {
            this.$createDialog({
              title: this.$t('dialog.title.deleteconfirm'),
              content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('page.catalogue')}),
              btnType: 'error',
              'on-ok': vnode => {
                this.$api.rdm.catalog.deleteCatalog(treeNode.id).then(res => {
                  if (res.Status == 'OK') {
                    this.searchAppCatalog();
                    vnode.isShow = false;
                  }
                });
              }
            });
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchAppCatalog();
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
    clickNode(tree, node) {
      this.$emit('changeCatalog', node);
      this.currentCatalogId = node ? node.id : null;
    },
    addRootCatalog() {
      this.currentCatalog = {};
      this.isEditCatalogShow = true;
    },
    searchAppCatalog() {
      if (this.appId) {
        this.searchCatalogParam.appId = this.appId;
        this.$api.rdm.catalog.searchCatalog(this.searchCatalogParam).then(res => {
          this.catalogList = res.Return;
        });
      }
    },
    closeEditAppCatalog(needRefresh) {
      this.isEditCatalogShow = false;
      if (needRefresh) {
        this.searchAppCatalog();
      }
    },
    onDrop(tree, treeNodes, targetNode, moveType, isCopy) {
      if (moveType != null && targetNode != null) {
        var treeNode = treeNodes[0];
        var parentId = null;
        var keyId = 'id';
        if (moveType == 'inner') {
          parentId = targetNode[keyId];
        } else {
          parentId = targetNode.getParentNode() == null ? 0 : targetNode.getParentNode()[keyId];
        }
        let data = {
          appId: this.appId,
          id: treeNode.id,
          moveType: moveType,
          parentId: parentId,
          targetId: targetNode.id
        };

        this.$api.rdm.catalog.moveCatalog(data).then(res => {
          this.$Message.success(this.$t('message.executesuccess'));
          this.searchAppCatalog();
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
