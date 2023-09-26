<template>
  <div class="drag-tree-table-wrap">
    <div class="dividing-color">
      <div class="card-wrapper">
        <div v-if="tbodyList.length > 0">
          <div class="card-top text-grey">
            <div v-for="(item, index) in theadList" :key="index" :class="item.key == 'action' ? 'action-wrap' : 'title-block'">{{ item.title }}</div>
          </div>
          <NodeList
            v-if="tbodyList.length > 0"
            :children="tbodyList"
            :parentNode="rootNode"
            :boxShadow="boxShadow"
            :nodeDepth="1"
            @update-row-num="$emit('update:rowNum', rowNum + $event)"
          />
        </div>
        <div v-if="rowNum > 0" class="text-right">
          <Page
            :current.sync="treeCurrentPage"
            :total="rowNum"
            :page-size="treePageSize"
            size="small"
            transfer
            show-total
            show-sizer
            @on-change="(currentpage) => $emit('on-page-change', currentpage)"
            @on-page-size-change="(pagesize) => $emit('on-page-size-change', pagesize)"
          />
        </div>
        <NoData v-else-if="!hideNoData && tbodyList.length === 0"></NoData>
      </div>
    </div>
  </div>
</template>

<script>
import NodeList from './NodeList.vue';
export default {
  name: 'TsDragTreeTable',
  components: {
    NodeList: NodeList
  },
  props: {
    draggable: { type: Boolean, default: true },
    currentPage: { type: Number, default: 1 },
    pageSize: { type: Number, default: 20 },
    pageCount: { type: Number },
    rowNum: { type: Number },
    treeDepth: { type: Number, default: Infinity },
    keyConfig: { type: Object, default: () => {} }, // 节点数据的自定义键名配置
    tbodyList: { type: Array, required: true, default: () => [] },
    loadData: { type: Function },
    shouldLoadData: { type: Function, default: () => false },
    boxShadow: {
      //阴影
      type: Boolean,
      default: true
    },
    hideNoData: { type: Boolean, default: false },
    checkLeaf: { type: Function, default: node => node.children && node.children.length === 0 },
    theadList: {
      // 表头
      type: Array,
      default: () => { []; }
    }
  },
  data() {
    return {
      treeCurrentPage: this.currentPage,
      treePageSize: this.pageSize
    };
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
  methods: {
    flattenTree(list = this.tbodyList, callback = item => item) {
      if (!(callback instanceof Function)) throw new Error(this.$t('message.flattentreetip'));
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
      return { [this.propKey.name]: this.$t('message.virtualrootnode'), [this.propKey.id]: 0, children: this.nodeList };
    },
    propKey() {
      const defaultKeyConfig = { name: 'name', id: 'id', parentId: 'parentId' };
      return { ...defaultKeyConfig, ...this.keyConfig };
    }
  }
};
</script>

<style lang="less">
.drag-tree-table-wrap {
  .card-wrapper {
    position: relative;
     .card-top {
      position: relative;
      padding: 0 20px 8px 20px;
      .action {
        text-align: center;
      }
    }
    .action-wrap {
      position: absolute;
      right: 0;
      top: 0;
      width: 450px;
    }
    .btn-list {
      position: absolute;
      right: 0;
      top: 0;
      width: 450px;
      height: 48px;
      line-height: 48px;
    }
    .title-block {
      padding-right: 620px;
    }
  }
}
</style>
