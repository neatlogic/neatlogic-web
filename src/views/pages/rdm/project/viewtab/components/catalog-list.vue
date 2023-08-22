<template>
  <div>
    <div v-if="$AuthUtils.hasRole('PROJECT_MANAGE') || (projectData && projectData.isOwner && projectData.isLeader)">
      <a @click="addRootCatalog()">
        <span class="tsfont-plus" style="margin-left: 3px; margin-right: 4px"></span>
        <span>{{ $t('page.catalogue') }}</span>
      </a>
    </div>
    <TsZtree
      :nodes="catalogList"
      :hoverDomList="hoverItemList"
      :onClick="clickNode"
      :onDrop="($AuthUtils.hasRole('PROJECT_MANAGE') || (projectData && projectData.isOwner && projectData.isLeader)) ? onDrop : null"
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
    appId: { type: Number },
    projectId: { type: Number }
  },
  data() {
    return {
      projectData: null,
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
              content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.catalogue') }),
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
    this.getProjectById();
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
    restoreHistory(historyData) {
      if (historyData && historyData['catalogId']) {
        this.currentCatalogId = historyData['catalogId'];
      }
    },
    getProjectById() {
      if (this.projectId) {
        this.$api.rdm.project.getProjectById(this.projectId).then(res => {
          this.projectData = res.Return;
        });
      }
    },
    clickNode(tree, node) {
      this.$emit('changeCatalog', node);
      this.currentCatalogId = node ? node.id : null;
      this.$addHistoryData('catalogId', node ? node.id : null);
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
  computed: {
    hoverItemList() {
      if (this.$AuthUtils.hasRole('PROJECT_MANAGE') || (this.projectData && this.projectData.isOwner && this.projectData.isLeader)) {
        return this.hoverDomList;
      }
      return [];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
