<template>
  <div class="common-resource-type-tree">
    <div v-if="title" class="common-resource-type-tree-title">{{ title }}</div>
    <TsFormTree
      v-if="treeData.length > 0 && showSearch"
      v-model="searchValue"
      v-bind="searchTreeConfig"
      class="common-resource-type-tree-search"
      @change="handleSearchChange"
    ></TsFormTree>
    <Tree
      v-if="treeData.length > 0"
      :data="treeData"
      :render="renderContent"
      :multiple="false"
      class="ts-tree common-resource-type-tree-main"
      @on-select-change="handleTreeSelectedChange"
    ></Tree>
    <div v-else class="common-resource-type-tree-empty text-tip">
      <slot name="empty" :rootCiName="rootCiName" :loaded="loaded">
        <span>{{ emptyText || $t('page.nodata') }}</span>
      </slot>
    </div>
  </div>
</template>

<script>
const isEmptyValue = value => value === null || value === undefined || value === '';
const normalizeValue = value => (isEmptyValue(value) ? null : value);
const getValueKey = value => (isEmptyValue(value) ? '' : String(value));

export default {
  name: 'ResourceTypeTree',
  components: {
    TsFormTree: () => import('@/resources/plugins/TsForm/TsFormTree')
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: [Number, String],
      default: null
    },
    title: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('form.placeholder.keyword');
      }
    },
    emptyText: {
      type: String,
      default: ''
    },
    autoSelectFirst: {
      type: Boolean,
      default: true
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    showSearch: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      treeData: [],
      searchValue: normalizeValue(this.value),
      currentValue: normalizeValue(this.value),
      rootCiName: '',
      loaded: false
    };
  },
  created() {
    this.loadTreeData();
  },
  methods: {
    loadTreeData() {
      return this.$api.cmdb.asset.getResourceTreeType().then(res => {
        if (res && res.Status == 'OK') {
          const result = res.Return || {};
          this.treeData = this.normalizeTreeData(result.tbodyList || []);
          this.rootCiName = result.rootCiName || '';
          this.loaded = true;
          this.$emit('load', {
            treeData: this.treeData,
            rootNode: this.treeData[0] || null,
            rootCiName: this.rootCiName,
            rawData: result.tbodyList || []
          });
          this.applyInitialSelection();
        } else {
          this.rootCiName = '';
          this.loaded = true;
          this.$emit('load', {
            treeData: [],
            rootNode: null,
            rootCiName: '',
            rawData: []
          });
          this.emitChange(null, null, false);
        }
      }, () => {
        this.rootCiName = '';
        this.loaded = true;
        this.$emit('load', {
          treeData: [],
          rootNode: null,
          rootCiName: '',
          rawData: []
        });
        this.emitChange(null, null, false);
      });
    },
    normalizeTreeData(data = [], parentNode = null) {
      return (data || []).map(item => {
        const node = {
          ...item,
          name: item.name || '',
          label: item.label || item.name || '',
          selected: false,
          expand: !parentNode,
          _parent: parentNode
        };
        node.children = this.normalizeTreeData(item.children || [], node);
        return node;
      });
    },
    applyInitialSelection() {
      if (!this.treeData.length) {
        this.emitChange(null, null, false);
        return;
      }
      const selectedNode = !isEmptyValue(this.currentValue)
        ? this.findNodeById(this.currentValue)
        : null;
      if (selectedNode) {
        this.selectNode(selectedNode, { shouldEmit: true, syncSearch: true });
        return;
      }
      if (this.autoSelectFirst) {
        this.selectNode(this.treeData[0], { shouldEmit: true });
      } else {
        this.clearTreeSelection();
      }
    },
    renderContent(h, { data }) {
      return h('span', {
        domProps: {
          innerHTML: data.label || data.name || '-'
        }
      });
    },
    handleTreeSelectedChange(nodeList, node) {
      if (!node) {
        return;
      }
      const isSameNode = String(this.currentValue) === String(node.id);
      if (this.allowClear && isSameNode) {
        this.clearSelection({ syncSearch: false });
        return;
      }
      this.selectNode(node, { shouldEmit: true });
    },
    handleSearchChange(value) {
      if (isEmptyValue(value)) {
        if (this.allowClear) {
          this.clearSelection();
        }
        return;
      }
      const node = this.findNodeById(value);
      if (node) {
        this.selectNode(node, { shouldEmit: true, syncSearch: true });
      }
    },
    selectNode(node, options = {}) {
      if (!node) {
        return;
      }
      const { shouldEmit = false, syncSearch = false } = options;
      this.clearTreeSelection();
      this.$set(node, 'selected', true);
      this.expandParentNode(node);
      this.currentValue = node.id;
      if (syncSearch) {
        this.searchValue = node.id;
      }
      this.$emit('input', node.id);
      if (shouldEmit) {
        this.emitChange(node.id, node, true);
      }
    },
    syncSelectionByValue(value) {
      const normalizedValue = normalizeValue(value);
      this.currentValue = normalizedValue;
      this.searchValue = normalizedValue;
      if (!this.treeData.length) {
        return;
      }
      if (isEmptyValue(value)) {
        this.clearTreeSelection();
        return;
      }
      const node = this.findNodeById(value);
      if (!node) {
        this.clearTreeSelection();
        return;
      }
      this.clearTreeSelection();
      this.$set(node, 'selected', true);
      this.expandParentNode(node);
      this.currentValue = node.id;
      this.searchValue = node.id;
    },
    clearSelection(options = {}) {
      const { syncSearch = true } = options;
      this.currentValue = null;
      if (syncSearch) {
        this.searchValue = null;
      }
      this.clearTreeSelection();
      this.$emit('input', null);
      this.emitChange(null, null, false);
    },
    clearTreeSelection(data = this.treeData) {
      (data || []).forEach(item => {
        this.$set(item, 'selected', false);
        if (item.children && item.children.length > 0) {
          this.clearTreeSelection(item.children);
        }
      });
    },
    expandParentNode(node) {
      if (!node) {
        return;
      }
      this.$set(node, 'expand', true);
      if (node._parent) {
        this.expandParentNode(node._parent);
      }
    },
    findNodeById(id, data = this.treeData) {
      for (const node of data || []) {
        if (String(node.id) === String(id)) {
          return node;
        }
        const childNode = this.findNodeById(id, node.children || []);
        if (childNode) {
          return childNode;
        }
      }
      return null;
    },
    getTypeIdListByNode(node) {
      const result = [];
      const walk = currentNode => {
        if (!currentNode) {
          return;
        }
        if (currentNode.id !== null && currentNode.id !== undefined && currentNode.id !== '') {
          result.push(currentNode.id);
        }
        (currentNode.children || []).forEach(child => walk(child));
      };
      walk(node);
      return result;
    },
    emitChange(selectedId, node, selected) {
      this.$emit('change', {
        selectedId,
        node,
        idList: selected && node ? this.getTypeIdListByNode(node) : [],
        selected: Boolean(selected)
      });
    }
  },
  computed: {
    searchTreeConfig() {
      return {
        multiple: false,
        url: '/api/rest/resourcecenter/resourcetype/tree',
        rootName: 'tbodyList',
        textName: 'label',
        valueName: 'id',
        search: true,
        transfer: true,
        border: 'bottom',
        width: '94%',
        clearable: this.allowClear,
        placeholder: this.placeholder
      };
    }
  },
  watch: {
    value(newValue) {
      if (getValueKey(newValue) === getValueKey(this.currentValue)) {
        return;
      }
      this.syncSelectionByValue(newValue);
    }
  }
};
</script>

<style lang="less" scoped>
.common-resource-type-tree {
  height: 100%;
  min-height: 0;
}

.common-resource-type-tree-title {
  padding: 0 0 12px;
  font-weight: 600;
}

.common-resource-type-tree-search {
  margin-bottom: 8px;
}

.common-resource-type-tree-main {
  overflow: auto;
}

.common-resource-type-tree-empty {
  text-align: center;
  padding: 24px 0;
}
</style>
