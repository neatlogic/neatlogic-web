<template>
  <div class="help-directory">
    <Tree
      v-if="!loadingShow"
      :data="tbodyList"
      :render="renderContent"
      @on-select-change="selectTreeNode"
    ></Tree>
    <NoData v-if="!loadingShow && !tbodyList.length" />
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
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
            if (d.children && d.upwardNameList[index] === upwardNameList[index]) {
              d.expand = true;
            }
          }
          if (d.children) {
            this.setTreeDataSelect(upwardNameList, d.children, index + 1);
          }
        });
      }
    },
    renderContent(h, {data}) {
      const icon = data.isFile ? 'tsfont-file-single' : 'tsfont-folder-o';
      return h('span', {class: 'directory-label', attrs: {title: data.name}}, [
        h('i', {class: icon, attrs: {'aria-hidden': 'true'}}),
        h('span', {class: 'overflow'}, [data.name])
      ]);
    },
    selectTreeNode(list, node) {
      if (node) {
        node.selected = true;
        if (!this.$utils.isSame(node.upwardNameList, this.upwardNameList)) {
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
<style lang="less" scoped>
.help-directory {
  ::v-deep .ivu-tree-children {
    padding-left: 12px;
  }
  ::v-deep .ivu-tree > .ivu-tree-children {
    padding-left: 0;
  }
  ::v-deep .ivu-tree-children > li {
    margin: 2px 0;
  }
  ::v-deep .ivu-tree-arrow {
    width: 18px;
    transform: none;
    vertical-align: middle;
  }
  ::v-deep .ivu-tree-title {
    width: calc(100% - 18px);
    padding: 6px 8px;
    border-radius: 7px;
    color: var(--help-ink);
    vertical-align: middle;
    &:hover {
      background: var(--help-hover);
    }
  }
  ::v-deep .ivu-tree-title-selected,
  ::v-deep .ivu-tree-title-selected:hover {
    color: var(--help-accent);
    background: var(--help-accent-soft);
  }
  ::v-deep .directory-label {
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 1.5;
    i {
      color: var(--help-muted);
    }
  }
  ::v-deep .ivu-tree-title-selected .directory-label i {
    color: inherit;
  }
}
</style>
