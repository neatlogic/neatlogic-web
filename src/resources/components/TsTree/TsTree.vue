<template>
  <div class="tstree-container">
    <div v-if="nodeList.length > 0" class="tstree-body">
      <NodeList
        v-if="nodeList.length > 0"
        :children="nodeList"
        :parentNode="rootNode"
        :boxShadow="boxShadow"
        :nodeDepth="1"
        @update-row-num="$emit('update:rowNum', rowNum + $event)"
      />
    </div>
    <div v-if="rowNum > 0" class="tstree-page">
      <Page
        :current.sync="currentPage"
        :total="rowNum"
        :page-size="pageSize"
        size="small"
        transfer
        show-total
        show-sizer
        @on-change="$emit('on-page-change')"
        @on-page-size-change="$emit('on-page-size-change')"
      />
    </div>
    <NoData v-else-if="nodeList.length === 0"></NoData>
  </div>
</template>

<script>
import NodeList from './NodeList.vue';
export default {
  name: 'TsTree',
  components: {
    NodeList: NodeList
  },
  provide() {
    return {
      dispatch: (event, ...args) => {
        this.$emit(event, ...args);
      },
      treeComponent: this,
      treeDepth: this.treeDepth,
      loadData: this.loadData,
      shouldLoadData: this.shouldLoadData,
      checkLeaf: this.checkLeaf,
      propKey: this.propKey,
      draggable: this.draggable
    };
  },
  props: {
    draggable: {type: Boolean, default: true},
    currentPage: {type: Number, default: 1},
    pageSize: {type: Number, default: 20},
    pageCount: {type: Number},
    rowNum: {type: Number},
    treeDepth: {type: Number, default: Infinity},
    keyConfig: { type: Object, default: () => {}}, // 节点数据的自定义键名配置
    nodeList: { type: Array, required: true, default: () => []},
    loadData: { type: Function }, 
    shouldLoadData: {type: Function, default: () => false},
    boxShadow: { //阴影
      type: Boolean,
      default: true
    },
    checkLeaf: {type: Function, default: node => node.children && node.children.length === 0}
  },
  methods: {
    flattenTree(list = this.nodeList, callback = item => item) {
      if (!(callback instanceof Function)) throw new Error('flattenTree的第二个参数必须是个有返回值的function');
      if (!(list instanceof Array)) list = [list];
      const result = [];
      const getChildNode = arr => {
        arr.forEach(item => {
          result.push(callback(item));
          getChildNode(item.children);
        });
      };
      getChildNode(list);
      return result;
    }
  },
  computed: {
    rootNode() {
      return {[this.propKey.name]: '虚拟的根节点', [this.propKey.id]: 0, children: this.nodeList};
    },
    propKey() {
      const defaultKeyConfig = { name: 'name', id: 'id', parentId: 'parentId' };
      return {...defaultKeyConfig, ...this.keyConfig};
    }
  }
};
</script>

<style lang="less" scoped>
.tstree-container {
  .tstree-body {
    margin-left: -40px;
  }
  .tstree-page {
    float: right;
    padding: 10px;
  }
}
</style>
