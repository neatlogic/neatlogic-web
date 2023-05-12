<template>
  <Draggable
    :scroll="true"
    :list="children"
    :group="{name: 'group'}"
    :animation="150"
    :disabled="!draggable"
    ghostClass="tree-ghost"
    handle=".handle" 
    class="tree"
    @choose="e => handleChoose(parentNode, e)"
    @unchoose="e => handleUnchoose(parentNode, e)"
    @update="e => handleNodeSort(parentNode, e)"
    @add="e => handleNodeAdd(children, parentNode, e)"
    @remove="e => handleNodeRemove(parentNode, e)"
  >
    <div
      v-for="(node, index) in children"
      :id="node[propKey.id]"
      :key="node[propKey.id]"
      class="tree-node"
    >
      <div class="tree-node-content bg-op" :class="[boxShadow===true ? 'block-container' : '' , boxShadow=== false ? 'm-noShadow' : '']" @click.self="showHideSubTree(node)">
        <div class="node-left">
          <i v-if="draggable" class="handle ts-bars"></i>
          <i v-if="draggable" class="dividing-line dividing-bg-color"></i>
          <span v-if="nodeDepth < treeDepth" class="status-icon">
            <i v-if="loadingNodeList.includes(node)" class="ivu-icon ivu-icon-ios-loading ivu-load-loop"></i>
            <i v-else-if="!node.isLeaf" :class="['text-action', 'status-arrow', 'tsfont-right',{'tsfont-down':node.expand}]" @click="showHideSubTree(node)"></i>
          </span>
          <NodeContent
            :treeComponent="treeComponent"
            :rootNode="treeComponent.rootNode"
            :parentNode="parentNode"
            :node="node"
            :index="index"
            :nodeList="children"
            :level="path.length + 1"
            :path="[...path, {node, index}]"
          >
            <span class="overflow">{{ node[propKey.name] }}</span>
          </NodeContent>
        </div>
        <NodeRight
          class="node-right"
          :treeComponent="treeComponent"
          :rootNode="treeComponent.rootNode"
          :parentNode="parentNode"
          :node="node"
          :index="index"
          :nodeList="children"
          :level="path.length + 1"
          :path="[...path, {node, index}]"
        />
      </div>
      <NodeList
        v-if="nodeDepth < treeDepth"
        :path="[...path, {node, index}]"
        :parentNode="node"
        :boxShadow="boxShadow"
        :children="node.children"
        :nodeDepth="nodeDepth + 1"
        :class="['subtree', { 'add-dotted-line': isNotTheLastAndHasChildren(node,index), 'is-folded':!node.expand }]"
      />
    </div>
  </Draggable>
</template>

<script>
import Draggable from 'vuedraggable';
import NodeList from './NodeList';
import NodeContent from './NodeContent';
import NodeRight from './NodeRight';

export default {
  name: 'NodeList',
  components: {
    Draggable,
    NodeList,
    NodeContent,
    NodeRight
  },
  props: {
    path: {type: Array, default: () => []},
    nodeDepth: {type: Number},
    parentNode: {type: Object},
    boxShadow: { //阴影
      type: Boolean,
      default: true
    },
    children: { type: Array, required: true }
  },
	
  data() {
    return {
      loadingNodeList: [],
      dragingNode: null
    };
  },
  inject: ['dispatch', 'treeComponent', 'loadData', 'shouldLoadData', 'checkLeaf', 'propKey', 'draggable', 'treeDepth'],
  methods: {
    handleChoose(parentNode, e) {
      this.dragingNode = this.children.find(node => node[this.propKey.id] == e.item.id);
      this.dragingNode.initialExpandStatus = this.dragingNode.expand;
      this.dragingNode.expand = false;
      this.dispatch('on-choose', this.dragingNode, parentNode, e);
    },
    handleUnchoose(parentNode, e) {
      this.dragingNode.expand = this.dragingNode.initialExpandStatus;
      delete this.dragingNode.initialExpandStatus;
      this.dispatch('on-unchoose', this.dragingNode, parentNode, e);
      setTimeout(() => {
        this.dragingNode = null;
      }, 0);
    },
    handleNodeSort(parentNode, e) {
      this.dispatch('on-node-sort', this.dragingNode, parentNode, e);
    },
    handleNodeAdd(nodeList, parentNode, e) {
      const node = nodeList[e.newIndex];
      node[this.propKey.parentId] = parentNode[this.propKey.id];
      this.dispatch('on-node-add', node, parentNode, e);
      if (parentNode[this.propKey.id] == 0) {
        this.$emit('update-row-num', 1);
      }
    },
    handleNodeRemove(parentNode, e) {
      this.dispatch('on-node-remove', this.dragingNode, parentNode, e);
      if (parentNode[this.propKey.id] == 0) {
        this.$emit('update-row-num', -1);
      }
    },
    showHideSubTree(node) {
      this.$set(node, 'expand', !node.expand);
      if (this.shouldLoadData(node)) {
        this.loadingNodeList.push(node);
        this.loadData && this.loadData(node, children => {
          const nodeIndex = this.loadingNodeList.indexOf(node);
          this.loadingNodeList.splice(nodeIndex, 1);
          if (children instanceof Array) {
            this.$set(node, 'children', children);
          } else {
            throw new Error('children' + this.$t('message.mustbeanarray'));
          }
        });
      }
    },
    isNotTheLastAndHasChildren(node, index) {
      if (index < this.children.length - 1 && node.children.length !== 0 && node.expand) { 
        return true;
      } 
      return false;
    }
  },
  watch: {
    children: {
      immediate: true,
      handler() {
        for (let node of this.children) {
          if (!node.hasOwnProperty('children')) {
            this.$set(node, 'children', []);
          }
          const hasChildren = node.children.length > 0;
          this.$set(node, 'expand', hasChildren);
          if (node.hasOwnProperty('isLeaf')) continue;
          Object.defineProperty(node, 'isLeaf', {
            get: () => this.checkLeaf(node)
          });
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';

.tree {
  padding-left: 40px;
  &.is-folded {
    .tree-node {
      display: none;
      &.tree-ghost {
        display: block;
      }
    }
  }
  .tree-node {
    position: relative;
    .tree-node-content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      height: 48px;
      margin-bottom: 10px;
      padding-left: 10px;
      padding-right: 20px;
      .node-left {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      .node-right {
        user-select: none;
      }
    }
    .handle {
      padding: 0 10px;
      cursor: move;
    }
    .dividing-line {
      display: inline-block;
      height: 28px;
      width: 1px;
      margin-right: 8px;
    }
    .status-icon {
      display: inline-block;
      width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      margin-right: 6px;
      margin-bottom: 2px;
      .status-arrow {
        &::before {
          margin-right: 0;
        }
      }
    }
  }
}
</style>

<style lang="less" scoped>
// 子树虚线的布局
@import (reference) '~@/resources/assets/css/variable.less';
.subtree {
   .tree-node {
    position: relative;
    &::before {
      content: '';
      display: block;
      position: absolute;
      width: 20px;
      height: 0;
      top: 22px;
      left: -20px;
      border-top: 1px dotted;
      border-color: @default-border;
    }
    &::after {
      content: '';
      display: block;
      position: absolute;
      width: 0;
      height: 48px + 10px;
      border-right: 1px dotted;
      border-color: @default-border;
      left: -20px;
      top: -35px;
    }
    &:first-of-type {
      &::after {
        height: 31px;
        top: -10px;
      }
    }
  }
  .add-dotted-line {
    &::before {
      content: '';
      display: block;
      position: absolute;
      width: 0;
      height: calc(100% - 48px);
      border-right: 1px dotted;
      border-color: @default-border;
      left: -20px;
      top: 23px;
    }
  }
}
</style>

<style lang="less" scoped>
// 过渡动画CSS
.fade-enter-active, .fade-leave-active {
  transition: opacity .1s;
}
.fade-enter, .fade-leave-to  {
  opacity: 0;
}
.status-arrow {
  transition: transform .1s;
  &.arrow-expand {
    transform: rotate(90deg);
  }
}
</style>
