<template>
  <div>
    <div v-if="moduleMenuList.length > 0" class="left_tree">
      <Tree
        :data="moduleMenuList"
        :render="renderContent"
        :load-data="getSubTree"
        class="ts-tree"
        @on-select-change="selectTreeNode"
        @on-toggle-expand="toggleExpand"
      ></Tree>
    </div>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
  },
  props: {
    isFile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      moduleMenuList: [],
      routerConfig: {},
      classifiedList: [],
      currentValue: {},
      fileIndex: null,
      whiteList: ['welcome', 'no-authority', 'refresh']
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
    async init() {
      let moduleMenuList = [];  
      let moduleList = [];
      let routerConfig = this.getRouterConfig();
      this.routerConfig = routerConfig;
      const res = await this.$store.state.topMenu.gettingModuleList;
      if (res.Return) {
        moduleList = res.Return;
      }
      moduleList.forEach(m => {
        if (routerConfig[m.group]) {
          let module = {
            name: m.groupName,
            moduleGroup: m.group,
            configFathList: [m.group],
            loading: false,
            children: []
          };
          moduleMenuList.push(module);
        }
      });
      //未分类
      moduleMenuList.push({
        name: this.$t('term.documentonline.unlassifieddoc'),
        moduleGroup: 'unClassified',
        loading: false,
        configFathList: ['unClassified'],
        children: []
      });
      this.$set(moduleMenuList[0], 'selected', true);
      this.moduleMenuList = moduleMenuList;
      this.currentValue = this.moduleMenuList[0];
      this.$emit('selectTreeNode', this.moduleMenuList[0]);
      this.getClassifiedList(moduleList);
    },
    getIsMenu(m, name) {
      let findItem = this.routerConfig[m.group] && this.routerConfig[m.group].find((v) => v.name == name);
      return findItem && findItem.ismenu ? 'tsfont-bar icon-right' : 'tsfont-ITfuwu icon-right';
    },
    getRouterConfig() {
      const routerConfig = require.context('@/views/pages', true, /router.js$/);
      const commercialConfig = require.context('@/commercial-module', true, /router.js$/);
      const routerConfigs = {}; 
      const routerConfigKeys = routerConfig.keys();
      const commercialConfigKeys = commercialConfig.keys() || [];
      routerConfigKeys.forEach(routerPath => {
        const moduleId = routerPath.split('/')[1];
        const routeList = (!this.$utils.isEmpty(commercialConfigKeys) && commercialConfigKeys.indexOf(routerPath) != -1) ? [...routerConfig(routerPath).default, ...(commercialConfig[routerPath] && commercialConfig[routerPath].default || [])] : (routerConfig(routerPath).default || []);
        const menuList = routeList  
          .filter(item => item.name && item.meta && item.meta.title && !this.whiteList.includes(item.name))  
          .map(item => ({  
            name: item.meta && item.meta.title ? (item.name ? `${item.meta.title}(${item.name})` : item.meta.title) : '',  
            moduleGroup: moduleId,  
            menu: item.name,  
            configFathList: [moduleId, item.name],  
            children: [],  
            loading: false,
            ismenu: item.meta?.ismenu || false
          }));
        if (menuList.length) {  
          routerConfigs[moduleId] = menuList;  
        }  
      });
      return routerConfigs;
    },
    getClassifiedList(moduleList) {
      this.classifiedList = [];
      moduleList.forEach(m => {
        if (this.routerConfig[m.group]) {
          let module = {
            name: m.groupName,
            moduleGroup: m.group,
            configFath: m.group,
            children: []
          };
          if (m.group && this.routerConfig[m.group]) {
            module.children = this.routerConfig[m.group].map(item => {
              const { name, moduleGroup, menu, configFathList } = item;
              const config = { name, moduleGroup, menu, configFath: configFathList.join('/'), className: this.getIsMenu(m, name) };
              return config;
            });
          }
          this.classifiedList.push(module);
        }
      });
      this.$emit('getClassifiedList', this.classifiedList);
    },
    renderContent(h, { root, node, data }) {
      //渲染树的lable名称
      return h('span', {
        class: data.isFile ? 'tsfont-file-single icon-right' : (data.ismenu ? 'tsfont-bar icon-right' : (data.ismenu == false ? 'tsfont-ITfuwu icon-right' : (data.nodata ? 'text-tip' : ''))),
        domProps: {
          innerHTML: this.$t(data.name)
        }
      });
    },
    async getSubTree(parentTree, resolve) {
      let data = [];
      let fileList = [];
      fileList = await this.getFileList(parentTree.moduleGroup, parentTree.menu);
      if (!parentTree.menu && parentTree.moduleGroup && this.routerConfig[parentTree.moduleGroup]) {
        data = this.$utils.deepClone(this.routerConfig[parentTree.moduleGroup]);
      }
      if (fileList && fileList.length > 0) {
        data.push(...fileList);
      } else if (parentTree.menu && !fileList.length) {
        data.push({name: this.$t('page.nodata'), disabled: true, nodata: true});
      }
      resolve(data);
    },
    async getFileList(moduleGroup, menu) { //获取模块目录下的文件 
      let res = null;
      let fileList = [];
      if (moduleGroup === 'unClassified') {
        //未分类文档
        res = await this.$api.documentonline.getUnclassifiedList({pageSize: 100});
      } else {
        res = await this.$api.documentonline.getDocumentList({pageSize: 100, moduleGroup: moduleGroup, menu: menu});
      }
      if (res && res.Return && res.Return.tbodyList) {
        fileList = res.Return.tbodyList.map((item, index) => {
          const { fileName, configList, filePath } = item;
          let configFathList = [moduleGroup];
          menu && configFathList.push(menu);
          configFathList.push(fileName);
          const file = { name: fileName, moduleGroup: moduleGroup, menu: menu || '', configFathList: configFathList, configList, filePath, fileIndex: index, isFile: true };
          return file;
        });
      }
      return fileList;
    },
    selectTreeNode(list, node) {
      if (node) {
        this.fileIndex = node.fileIndex;
        this.$set(node, 'selected', true);
        this.$emit('selectTreeNode', node);
        this.setTreeDataSelect(node.configFathList, this.moduleMenuList);
      }
    },
    setTreeDataSelect(configFathList, data) {
      if (data && data.length > 0) {
        data.forEach(d => {
          if (!this.$utils.isSame(d.configFathList, configFathList)) {
            this.$set(d, 'selected', false);
          }
          if (d.children && d.children.length) {
            this.setTreeDataSelect(configFathList, d.children);
          }
        });
      }
    },
    toggleExpand(node) {
      if (!node.expand) {
        this.$set(node, 'children', []);
      }
    },
    async updateModuleMenuList(configFathList, type) { //更新目录
      await this.updateFileList(configFathList, this.moduleMenuList, type);
    },
    async updateFileList(configFathList, data, type) {
      data.forEach(async item => {
        if (item.children && this.$utils.isSame(item.configFathList, configFathList)) {
          let children = [];
          let fileList = await this.getFileList(item.moduleGroup, item.menu);
          if (!item.menu && this.routerConfig[item.moduleGroup]) {
            children = this.$utils.deepClone(this.routerConfig[item.moduleGroup]);
          }
          if (fileList && fileList.length > 0) {
            if (this.isFile && type) { //type(add/delete)：添加或者移除关联关系时，需要更新选中的文档
              fileList[this.fileIndex] && this.$set(fileList[this.fileIndex], 'selected', true);
              this.$emit('selectTreeNode', fileList[this.fileIndex]);
            }
            children.push(...fileList);
          } else {
            children.push({name: this.$t('page.nodata'), disabled: true, nodata: true});
          }
          this.$set(item, 'children', children);
        } else {
          if (item.children && item.children.length) {
            this.updateFileList(configFathList, item.children);
          }
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
