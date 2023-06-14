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
    filepathList: Array
  },
  data() {
    return {
      tbodyList: []
    };
  },
  beforeCreate() {},
  created() {},
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
          this.setTreeDataSelect(this.filepathList, tbodyList, 0);
          this.tbodyList = tbodyList;
        }
      });
    },
    setTreeDataSelect(upwardNameList, data, index) {
      if (data && data.length > 0) {
        data.forEach(d => {
          if (this.$utils.isSame(d.upwardNameList, upwardNameList)) {
            d.selected = true;
            d.disabled = true;
          } else {
            d.selected = false;
            d.disabled = false;
            if (d.children) {
              if (d.upwardNameList[index] === upwardNameList[index]) {
                d.expand = true;
              }
              this.setTreeDataSelect(upwardNameList, d.children, index + 1);
            }
          }
        });
      }
    },
    renderContent(h, { root, node, data }) {
      //渲染树的lable名称
      return h('span', {
        staticClass: '',
        domProps: {
          innerHTML: data.name
        }
      });
    },
    selectTreeNode(list, node) {
      if (node) {
        if (node.isFile) {
          this.$router.push({
            path: '/documentonline-detail',
            query: {
              filePath: node.upwardNameList.join('/')
            }
          });
        } else {
          this.$router.push({
            path: '/documentonline-manage',
            query: {
              filePath: node.upwardNameList.join('/')
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
