<template>
  <div>
    <TsContain :siderWidth="300" enableCollapse>
      <template v-slot:topLeft>
        <span>{{ catalogName }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item tsfont-circulation-o" @click="openAuthorityViewDialog">{{ $t('page.viewauthority') }}</span>
          <span
            v-if="!menuType"
            :class="{ disable: saving }"
            class="action-item tsfont-save"
            @click="save()"
          >{{ $t('page.save') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <div class="pr-nm">
          <Alert show-icon>
            {{ $t('term.framework.internalmenuoperationtips') }}
          </Alert>
          <TsZtree
            v-if="!$utils.isEmpty(moduleList)"
            :value="selectedTreeId"
            :nodes="moduleList"
            :hoverDomList="hoverDomList"
            urlKey="xUrl"
            :beforeClick="beforeClick"
            :expandAll="false"
            :onClick="clickNode"
            :beforeDrop="beforeDrop"
            :beforeDrag="beforeDrag"
            :onDrop="onDrop"
          ></TsZtree>
          <NoData v-else-if="!loadingShow && $utils.isEmpty(nodeList)"></NoData>
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div class="content bg-op padding radius-lg">
          <div v-if="menuType == 'innerMenu'">
            <TsTable
              v-bind="tableConfig"
              :theadList="theadList"
            >
              <template slot="authority" slot-scope="{ row }">
                <div v-for="(item, index) in row.authorityList" :key="index" :class="index != row.authorityList.length - 1 ? 'mb-xs' : ''">
                  <template v-if="item.displayName">
                    <span>{{ item.displayName }}</span>
                    <span class="text-grey">·</span>
                  </template>
                  <span v-if="item.name" class="text-grey">{{ item.name }}</span>
                </div>
              </template>
            </TsTable>
          </div>
          <template v-else>
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
          </template>
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
    TsZtree: () => import('@/resources/plugins/TsZtree/TsZtree.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    MenuEdit: () => import('./menu-edit'),
    AuthorityViewDialog: () => import('./authority-view-dialog')
  },
  props: {},
  data() {
    return {
      isShowAuthorityViewDialog: false,
      loadingShow: true,
      saving: false,
      selectedTreeId: null,
      nodeList: [],
      menuAuthList: [],
      menuType: '',
      routerAuth: {},
      tableConfig: {
        tbodyList: [],
        currentPage: 1,
        pageSize: 100,
        fixedHeader: false
      },
      theadList: [
        {
          title: this.$t('page.menuname'),
          key: 'menuName'
        },
        {
          title: this.$t('term.framework.belongmodule'),
          key: 'moduleName'
        },
        {
          title: this.$t('page.authority'),
          key: 'authority'
        }
      ],
      hoverDomList: [
        {
          icon: 'tsfont-plus',
          desc: this.$t('page.subdirectory'),
          isAddFn: (treeNode) => {
            if (treeNode.type == 1 || treeNode.menuType == 'innerMenu' || treeNode.menuType == 'customMenu') {
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
            if (treeNode.type == 1 || treeNode.menuType == 'innerMenu' || treeNode.menuType == 'customMenu') {
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
            if (this.$utils.isEmpty(treeNode.parentId) || treeNode.parentId == 0 || treeNode.menuType == 'innerMenu' || treeNode.menuType == 'customMenu') {
              return false; // 总的根节点不能删除
            } else {
              return true;
            }
          },
          initFn: (treeNode, $span) => {
            if (treeNode.childCount > 0 || treeNode.menuType == 'innerMenu') {
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
      selectSaveId: null, //是否存在，判断是否是新建
      authList: [] // 权限列表，用于根据权限名称去获取英文名
    };
  },
  beforeCreate() {},
  created() {
    this.routerAuth = this.handleRouterAuth();
  },
  beforeMount() {},
  mounted() {
    this.init(true);
    this.updateMenu();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async init(isFirst) {
      try {
        await this.getAuthList();
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
    getAuthList() {
      return this.$api.common
        .getAuthGrouplist()
        .then(res => {
          this.authList = [];
          let { Status, Return } = res || {};
          let {authGroupList = []} = Return || {};
          if (Status == 'OK') {
            authGroupList.forEach((item) => {
              if (item && item.authVoList && item.authVoList.length > 0) {
                this.authList.push(...(item.authVoList || []));
              }
            });
          }
        });
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
      if (node && node.menuType == 'customMenu') {
        return false;
      }
      if (!this.selectSaveId || this.selectSaveId != node.id) {
        zTreeObj.cancelSelectedNode();
        return true;
      } else {
        return false;
      }
    },
    flattenArrayWithChildren(array) {
      let result = [];
      let _this = this;
      function flatten(items) {
        items && items.forEach(item => {
          result.push(item);
          if (!_this.$utils.isEmpty(item) && Array.isArray(item.children)) {
            flatten(item.children); // 递归调用 flatten 函数
          }
        });
      }
      flatten(array); // 开始扁平化过程
      return result;
    },
    clickNode(tree, node) {
      this.menuType = '';
      this.catalogName = this.$t('dialog.title.edittarget', { target: this.$t('page.catalogue') });
      this.tableConfig.tbodyList = [];
      if (node.isMenu || node.menuType == 'innerMenu') {
        this.handleMenuAuth(node);
      } else {
        const { type = 0, id = null, parentId } = node || {};
        this.isMenu = type;
        this.selectedTreeId = id;
        this.selectSaveId = id;
        this.parentId = parentId == 2 ? null : parentId;
        if (type == 0) {
        // 编辑目录
          this.catalogName = this.$t('dialog.title.edittarget', { target: this.$t('page.catalogue') });
        } else if (type == 1) {
        // 编辑菜单
          this.catalogName = this.$t('dialog.title.edittarget', { target: this.$t('page.menu')});
        }
        this.getMenuTreeNode();
      }
    },
    getMenuAuthority(moduleId, menu) {
      if (!moduleId || !this.routerAuth[moduleId] || menu === '/') {
        return '';
      }
      let authList = this.routerAuth[moduleId] || [];
      let findItem = authList.find((v) => {
        if (menu && v.authority) {
          if (v.path && menu.indexOf(v.path) != -1) {
            return v;
          } else if (v.name && menu.indexOf(v.name) != -1) {
            return v;
          }
        }
      });
      return findItem ? findItem.authority : '';
    },
    handleMenuAuth(node) {
      this.menuType = 'innerMenu';
      this.isMenu = 0;
      this.selectedTreeId = node.id;
      this.selectSaveId = node.id;
      this.parentId = null;
      this.catalogName = this.$t('page.viewauthority');
      if (node && this.$utils.isEmpty(node.moduleId)) {
        this.tableConfig.tbodyList = this.menuAuthList;
      } else {
        let childrenList = this.flattenArrayWithChildren(this.$utils.deepClone(Array.isArray(node.children) && !this.$utils.isEmpty(node.children) ? node.children : [node]));
        let moduleAuthList = this.routerAuth[node.moduleId] && this.routerAuth[node.moduleId] || []; // 获取点击的模块菜单权限
        childrenList.forEach((item) => {
          let findItem = moduleAuthList.find((v) => (item.id.indexOf(v.path) != -1) || item.id.indexOf(v.name) > 0);
          if (findItem) {
            let {authority = ''} = findItem || {};
            this.tableConfig.tbodyList.push({
              menuName: item.name,
              moduleName: node.moduleName,
              authority: authority,
              authorityList: this.getAuthorityName(authority)
            });
          }
        });
      }
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
      this.$set(data, 'parentId', this.parentId);
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
      } else if ((treeNodes && treeNodes[0] && treeNodes[0].menuType == 'innerMenu') || targetNode.menuType == 'innerMenu' || targetNode.menuType == 'customMenu') {
        // 内部菜单不可拖拽
        return false;
      } else if (moveType === 'inner' && targetNode.type === 1) {
        return false;
      } else if ((moveType === 'prev' || moveType === 'next') && !targetNode.parentId) {
        return false;
      }
    },
    beforeDrag(treeId, treeNodes) {
      // 拖拽前的操作，可去掉节点拖拽功能
      if (this.$utils.isEmpty(treeNodes)) {
        return false;
      }
      for (let i = 0; i < treeNodes.length; i++) {
        if (treeNodes[i] && (treeNodes[i].drag === false)) {
          return false;
        }
      }
      return true;
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
    },
    updateMenu() {
      this.$store.dispatch('updateMenu');
    },
    handleChildren(moduleId, moduleName, menuGroupList) {
      let list = [];
      if (this.$utils.isEmpty(menuGroupList)) {
        return list;
      }
      menuGroupList.forEach((item) => {
        if (item.menuTypeName) {
          list.push({
            id: item.menuType || this.$utils.setUuid(),
            name: item.menuTypeName,
            menuType: 'innerMenu',
            moduleId: moduleId,
            moduleName: moduleName,
            drag: false, // 内部菜单不可拖拽
            children: item.menuList.map((v) => ({
              id: `${moduleId}_${v.path}`,
              name: v.name,
              menuType: 'innerMenu',
              isMenu: true,
              moduleId: moduleId,
              moduleName: moduleName,
              drag: false
            }))
          });
        }
      });
      return list;
    },
    handleRouterAuth() {
      let routerConfig = {};
      let routerJsPathList = [];
      const communityConfig = require.context('@/views/pages', true, /\/router\.js$/); // 正则匹配/router.js文件
      const commercialConfig = require.context('@/commercial-module', true, /\/router\.js$/);
      const commercialRouterPathList = commercialConfig.keys() || [];
      const communityRouterPathList = communityConfig.keys() || [];
      let uniqueToCommercialList = commercialRouterPathList.filter(item => !communityRouterPathList.includes(item));// 过滤不存在社区版的模块
      routerJsPathList.push(...communityRouterPathList, ...uniqueToCommercialList);
      routerJsPathList.forEach(routerPath => {
        const moduleId = routerPath.split('/')[1];
        let routeList = [];
        if (!this.$utils.isEmpty(commercialRouterPathList) && commercialRouterPathList.indexOf(routerPath) != -1) {
          routeList = [...(communityRouterPathList.indexOf(routerPath) != -1 ? communityConfig(routerPath).default : []), ...(commercialConfig(routerPath) ? commercialConfig(routerPath).default : [])];
        } else {
          routeList = (communityConfig(routerPath).default || []);
        }
        const menuList = routeList
          .filter(item => item.meta)
          .map(item => ({
            title: item.meta.title,
            name: item.name,
            path: item.path,
            authority: item.meta.authority
          }));
        if (menuList.length) {
          routerConfig[moduleId] = menuList;
        }
      });
      return routerConfig;
    }
  },
  filter: {},
  computed: {
    moduleList() {
      const moduleList = [];
      let menuAuthList = [];
      this.$store.state.topMenu.moduleList.forEach((item, index) => {
        if (item.moduleId && item.moduleName) {
          moduleList.push({
            id: item.moduleId,
            name: item.moduleName,
            children: this.handleChildren(item.moduleId, item.moduleName, item.menuGroupList),
            menuType: 'innerMenu',
            moduleId: item.moduleId,
            moduleName: item.moduleName,
            drag: false // 内部菜单不可拖拽
          });
          // 获取菜单模块列表
          item.menuGroupList && item.menuGroupList.forEach((v) => {
            if (v.menuList && v.menuList.length > 0) {
              v.menuList.forEach((n) => {
                if (n && n.name && n.path) {
                  menuAuthList.push({
                    moduleId: item.moduleId,
                    moduleName: item.moduleName,
                    menuName: n.name,
                    authority: this.getMenuAuthority(item.moduleId, n.path),
                    authorityList: this.getAuthorityName(this.getMenuAuthority(item.moduleId, n.path))
                  });
                }
              });
            }
          });
        }
      });
      this.menuAuthList = menuAuthList;
      return [
        {
          id: 0,
          name: this.$t('page.allofthem'),
          menuType: 'innerMenu', // 用于判断不能新增和编辑菜单
          children: [
            {
              id: 1,
              name: this.$t('term.framework.internalmenu'),
              children: moduleList,
              menuType: 'innerMenu',
              drag: false // 内部菜单不可拖拽
            },
            {
              id: 2,
              name: this.$t('term.framework.custommenu'),
              children: this.nodeList,
              menuType: 'customMenu'
            }
          ]
        }
      ];
    },
    getAuthorityName() {
      return (authority) => {
        if (typeof authority !== 'string' && !Array.isArray(authority)) {
          return [];
        }
        const authItems = Array.isArray(authority) ? authority : [authority];
        return authItems.map(authorityEnName => {
          const authItem = this.authList.find(v => v.name && authorityEnName && v.name === authorityEnName);
          let {displayName, name} = authItem || {};
          return { displayName, name: name || authorityEnName };
        });
      };
    }
  },
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
