<template>
  <div class="pr-nm">
    <Tree
      :data="tbodyList"
      :render="renderContent"
      class="ts-tree"
      @on-select-change="selectTreeNode"
    ></Tree>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    id: String,
    filePath: String,
    moduleGroup: String
  },
  data() {
    return {
      routerConfig: {},
      tbodyList: []
    };
  },
  beforeCreate() {},
  created() {
    this.routerConfig = this.$utils.getRouterConfig();
  },
  beforeMount() {},
  mounted() {
    this.getDirectory();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getDirectory() {
      this.$api.documentonline.getDirectory().then(res => {
        if (res.Status === 'OK') {
          let tbodyList = res.Return.tbodyList || [];
          this.setTreeDataSelect(this.id, tbodyList, this.moduleGroup);
          this.tbodyList = tbodyList;
        }
      });
    },
    setTreeDataSelect(id, data, moduleGroup) {
      if (data && data.length > 0) {
        data.forEach(d => {
          if (d.id == id) {
            d.selected = true;
            d.disabled = true;
          } else {
            d.selected = false;
            d.disabled = false;
            if (!d.moduleGroup || (d.moduleGroup && d.moduleGroup === moduleGroup)) {
              d.expand = true;
            }
            if (d.children) {
              this.setTreeDataSelect(id, d.children, moduleGroup);
            }
          }
        });
      }
    },
    getPathName(data) {
      let text = data.name || '';
      if (data.type === 'menu' && this.routerConfig[data.moduleGroup]) {
        let findItem = this.routerConfig[data.moduleGroup].find(i => (i.name === data.id));
        if (findItem) {
          text = findItem.meta.title;
        }
      }
      return text;
    },
    renderContent(h, { root, node, data }) {
      //渲染树的lable名称
      return h('span', {
        staticClass: '',
        domProps: {
          innerHTML: this.getPathName(data)
        }
      });
    },
    selectTreeNode(list, node) {
      if (node) {
        if (node.type === 'file') {
          this.$router.push({
            path: '/documentonline-detail',
            query: {
              type: node.type,
              moduleGroup: node.moduleGroup,
              menu: node.menu,
              id: node.id,
              filePath: node.moduleGroup + '/' + node.menu + '/' + node.name + '.md'
            }
          });
        } else if (node.type === 'moduleGroup') {
          this.$router.push({
            path: '/documentonline-manage',
            query: {
              type: node.type,
              moduleGroup: node.id
            }
          });
        } else {
          this.$router.push({
            path: '/documentonline-manage',
            query: {
              type: node.type,
              id: node.id,
              moduleGroup: node.moduleGroup,
              menu: node.id,
              filePath: node.moduleGroup + '/' + node.id
            }
          });
        }
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
