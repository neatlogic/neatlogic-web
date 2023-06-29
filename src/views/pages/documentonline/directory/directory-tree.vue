<template>
  <div>
    <div v-if="moduleMenuList.length > 0" class="left_tree">
      <Tree
        :data="moduleMenuList"
        :render="renderContent"
        :load-data="getSubTree"
        class="ts-tree"
        @on-select-change="selectTreeNode"
      ></Tree>
    </div>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      moduleMenuList: [],
      routerConfig: {}
    };
  },
  beforeCreate() {},
  created() {
    this.init(); 
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
    init() {
      let moduleMenuList = [];
      let moduleList = this.$store.state.topMenu.moduleList;
      let routerConfig = this.getRouterConfig();
      this.routerConfig = routerConfig;
      moduleList.forEach(m => {
        if (routerConfig[m.moduleId]) {
          let module = {
            name: m.moduleName,
            moduleGroup: m.moduleId,
            upwardNameList: [m.moduleId],
            loading: false,
            children: []
          };
          moduleMenuList.push(module);
        }
      });
      //未分类
      moduleMenuList.push({
        name: '未分类文档',
        unclassified: true,
        loading: false,
        upwardNameList: ['unclassified'],
        children: []
      });
      this.$set(moduleMenuList[0], 'selected', true);
      this.moduleMenuList = moduleMenuList;
      this.$emit('selectTreeNode', this.moduleMenuList[0]);
    },
    getRouterConfig() {
      const requireRouter = require.context('@/views/pages', true, /router.js$/);
      return requireRouter.keys().reduce((routerConfig, routerPath) => {
        const moduleId = routerPath.split('/')[1];
        const routeList = requireRouter(routerPath).default || [];
        let menuList = [];
        if (routeList && routeList.length) {
          routeList.forEach(item => {
            if (item.meta && item.meta.ismenu) {
              menuList.push({
                name: item.meta.title,
                moduleGroup: moduleId,
                menu: item.name,
                upwardNameList: [moduleId, item.name],
                children: [],
                loading: false
              });
            }
          });
        }
        routerConfig[moduleId] = menuList;
        return routerConfig;
      }, {});
    },
    renderContent(h, { root, node, data }) {
      //渲染树的lable名称
      return h('span', {
        class: data.isFile ? 'tsfont-file-single' : data.nodata ? 'text-tip' : '',
        domProps: {
          innerHTML: this.$t(data.name)
        }
      });
    },
    async getSubTree(parentTree, resolve) {
      let data = [];
      let fileList = [];
      let res = null;
      if (parentTree.unclassified) {
        //未分类文档
        res = await this.$api.documentonline.getUnclassifiedList({pageSize: 100});
      } else {
        res = await this.$api.documentonline.getDocumentList({pageSize: 100, moduleGroup: parentTree.moduleGroup, menu: parentTree.menu});
      }
      if (res.Return.tbodyList) {
        fileList = res.Return.tbodyList.map(item => {
          const { fileName, upwardNameList } = item;
          const file = { name: fileName, upwardNameList, isFile: true };
          return file;
        });
      }
      if (!parentTree.menu && parentTree.moduleGroup && this.routerConfig[parentTree.moduleGroup]) {
        data = this.routerConfig[parentTree.moduleGroup];
      }
      if (fileList && fileList.length > 0) {
        data.push(...fileList);
      } else if (parentTree.menu && !fileList.length) {
        data.push({name: this.$t('page.nodata'), disabled: true, nodata: true});
      }
      resolve(data);
    },
    selectTreeNode(list, node) {
      if (node) {
        this.$set(node, 'selected', true);
        this.$emit('selectTreeNode', node);
        this.setTreeDataSelect(node.upwardNameList, this.moduleMenuList);
      }
    },
    setTreeDataSelect(upwardNameList, data) {
      if (data && data.length > 0) {
        data.forEach(d => {
          if (!this.$utils.isSame(d.upwardNameList, upwardNameList)) {
            this.$set(d, 'selected', false);
          }
          if (d.children && d.children.length) {
            this.setTreeDataSelect(upwardNameList, d.children);
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
