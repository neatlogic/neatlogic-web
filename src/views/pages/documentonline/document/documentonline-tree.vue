<template>
  <div class="pr-nm">
    <Tree
      v-if="!loadingShow"
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
    upwardNameList: Array
  },
  data() {
    return {
      loadingShow: true,
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
          this.setTreeDataSelect(this.upwardNameList, tbodyList, 0);
          this.tbodyList = tbodyList;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    setTreeDataSelect(upwardNameList, data, index) {
      if (data && data.length > 0) {
        data.forEach(d => {
          if (this.$utils.isSame(d.upwardNameList, upwardNameList)) {
            d.selected = true;
          } else {
            d.selected = false;
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
        if (this.$utils.isSame(node.upwardNameList, this.upwardNameList)) {
          node.selected = true;
        } else {
          this.$emit('selectTreeNode', node);
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    upwardNameList: {
      handler(val) {
        if (!this.$utils.isEmpty(val) && !this.$utils.isEmpty(this.tbodyList)) {
          this.setTreeDataSelect(val, this.tbodyList, 0);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
