<template>
  <div class="form-li">
    <span
      v-if="readonly"
      :class="[readonlyClass, readonlyTextHighlightClass]"
      :title="readonlyTitle"
    >
      <template v-if="selectedList.length">
        <Tag v-for="selected in selectedList" :key="selected[valueName]">{{ selected._pathLabel }}</Tag>
      </template>
      <span v-else class="text-grey">-</span>
    </span>
    <div
      v-else
      :class="borderClass"
      class="tsform-cascade"
      :style="getStyle"
    >
      <div
        v-click-outside:false="onClickOutside"
        v-click-outside:false.mousedown="onClickOutside"
        v-click-outside:false.touchstart="onClickOutside"
        class="select-body"
        :class="getClass"
      >
        <Dropdown
          ref="dropdownContain"
          style="width: 100%"
          trigger="custom"
          :visible="isVisible"
          :transfer="transfer"
          transfer-class-name="tsform-cascade-transfer"
          placement="bottom-start"
        >
          <div
            tabindex="0"
            class="select-top"
            :class="{ 'ivu-input': border === 'border' || !border }"
            :disabled="disabled"
            @click="handleOpen"
          >
            <div class="tag-contian">
              <Tag
                v-for="selected in selectedList"
                :key="selected[valueName]"
                :name="selected[valueName]"
                :closable="!disabled"
                :fade="false"
                @click.native.stop="handleOpen"
                @on-close="removeItem(selected[valueName])"
              >
                <Tooltip
                  placement="top-start"
                  max-width="300"
                  transfer
                  theme="light"
                  style="width: 100%"
                  :content="selected._pathLabel"
                >
                  <div class="overflow cascade-tag-text">{{ selected._pathLabel }}</div>
                </Tooltip>
              </Tag>
              <span
                v-if="!selectedList.length"
                class="empty-placeholder"
                :class="[disabled ? 'empty-placeholder-disable' : '']"
              >{{ placeholder }}</span>
            </div>
            <i class="ivu-icon tsfont-down ivu-select-arrow"></i>
            <i v-if="getClearable" class="clearBtn text-icon ivu-icon tsfont-close-s bg-op" @click.stop="clearValue"></i>
          </div>
          <DropdownMenu v-if="!(disabled || readonly)" slot="list" ref="dropdown">
            <div class="cascade-panel" :style="{ width: `${columnList.length * columnWidth}px` }">
              <div
                v-for="(column, columnIndex) in columnList"
                :key="columnIndex"
                class="cascade-column"
                :style="{ width: `${columnWidth}px` }"
              >
                <div class="cascade-title">{{ column.title }}</div>
                <Input
                  v-model="keywordMap[columnIndex]"
                  size="small"
                  clearable
                  :placeholder="searchPlaceholder"
                ></Input>
                <div class="cascade-list" :style="{ height: `${listHeight}px` }">
                  <div
                    v-for="node in getFilteredColumnNodeList(column.list, columnIndex)"
                    :key="node[valueName]"
                    class="cascade-option"
                    :class="{ active: isActiveNode(node), selected: isNodeSelectable(node) && isNodeChecked(node) }"
                    @click.stop="handleNodeClick(node)"
                  >
                    <span v-if="multiple && isNodeSelectable(node)" class="cascade-check" @click.stop>
                      <Checkbox
                        :value="isNodeChecked(node)"
                        :indeterminate="isNodeIndeterminate(node)"
                        @on-change="toggleNode(node, $event)"
                      ></Checkbox>
                    </span>
                    <span class="cascade-name overflow" :title="node[textName]">{{ node[textName] }}</span>
                    <i v-if="hasChildren(node)" class="ivu-icon tsfont-right cascade-arrow"></i>
                  </div>
                  <div v-if="!getFilteredColumnNodeList(column.list, columnIndex).length" class="cascade-empty text-tip">暂无数据</div>
                </div>
              </div>
            </div>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
    <div v-if="desc && !descType" class="text-tip tips">{{ desc }}</div>
    <Alert v-else-if="desc && descType" :type="descType">{{ desc }}</Alert>
    <transition name="fade">
      <slot name="validMessage">
        <span
          v-if="validMesage != ''"
          class="form-error-tip"
          :title="validMesage"
          v-html="validMesage"
        ></span>
      </slot>
    </transition>
  </div>
</template>

<script>
import formMixins from '@/resources/mixins/formMixins.js';
import formScrollMixins from '@/resources/mixins/formScrollMixins.js';
import { directive as ClickOutside } from '../../directives/v-click-outside-x.js';

export default {
  name: 'TsFormCascade',
  tagComponent: 'TsForm',
  directives: { ClickOutside },
  mixins: [formMixins, formScrollMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: [Array, String, Number],
      default: null
    },
    dataList: {
      type: Array,
      default: () => []
    },
    valueName: {
      type: String,
      default: 'value'
    },
    textName: {
      type: String,
      default: 'text'
    },
    childrenKey: {
      type: String,
      default: 'children'
    },
    multiple: {
      type: Boolean,
      default: true
    },
    transfer: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('page.pleaseselect');
      }
    },
    searchPlaceholder: {
      type: String,
      default: '请输入关键字'
    },
    levelTitleList: {
      type: Array,
      default: () => []
    },
    pathSeparator: {
      type: String,
      default: ' / '
    },
    columnWidth: {
      type: Number,
      default: 260
    },
    listHeight: {
      type: Number,
      default: 300
    },
    allowParentCheck: {
      type: Boolean,
      default: false
    },
    allowParentCheckLevelList: {
      type: Array,
      default: null
    },
    onChange: Function
  },
  data() {
    return {
      isVisible: false,
      currentValue: [],
      nodeList: [],
      nodeMap: {},
      activeValueList: [],
      keywordMap: {},
      validMesage: this.errorMessage || '',
      currentValidList: this.filterValid(this.validateList) || [],
      readonlyTitle: '',
      isValidPass: true
    };
  },
  created() {
    this.initNodeList();
  },
  methods: {
    initNodeList() {
      const nodeMap = {};
      const transferNodeList = (list = [], parentValueList = [], parentTextList = []) => {
        return (list || []).map(item => {
          const node = { ...item };
          const value = node[this.valueName];
          const text = node[this.textName] || value;
          const pathValueList = parentValueList.concat(value);
          const pathTextList = parentTextList.concat(text);
          node._pathValueList = pathValueList;
          node._pathTextList = pathTextList;
          node._pathLabel = pathTextList.join(this.pathSeparator);
          if (this.hasChildren(node)) {
            node[this.childrenKey] = transferNodeList(node[this.childrenKey], pathValueList, pathTextList);
          }
          if (value != null) {
            nodeMap[String(value)] = node;
          }
          return node;
        });
      };
      this.nodeList = transferNodeList(this.dataList || []);
      this.nodeMap = nodeMap;
      this.ensureActivePath();
      this.setReadonlyTitle();
    },
    hasChildren(node) {
      return !!(node && node[this.childrenKey] && node[this.childrenKey].length);
    },
    isNodeSelectable(node) {
      if (!this.hasChildren(node)) {
        return true;
      }
      if (!this.allowParentCheck) {
        return false;
      }
      if (Array.isArray(this.allowParentCheckLevelList)) {
        return this.allowParentCheckLevelList.includes((node._pathValueList || []).length - 1);
      }
      return true;
    },
    ensureActivePath() {
      if (this.activeValueList.length && this.getNodeByValue(this.activeValueList[this.activeValueList.length - 1])) {
        return;
      }
      const selectedNode = this.selectedList[0];
      if (selectedNode) {
        this.activeValueList = selectedNode._pathValueList.slice(0, -1);
        return;
      }
      const firstNode = this.nodeList[0];
      this.activeValueList = firstNode ? [firstNode[this.valueName]] : [];
    },
    getNodeByValue(value) {
      return this.nodeMap[String(value)] || null;
    },
    getColumnTitle(index) {
      return this.levelTitleList[index] || `第${index + 1}层`;
    },
    getFilteredColumnNodeList(list, columnIndex) {
      const keyword = String(this.keywordMap[columnIndex] || '').trim().toLowerCase();
      if (!keyword) {
        return list || [];
      }
      return (list || []).filter(node => String(node[this.textName] || '').toLowerCase().includes(keyword));
    },
    handleOpen() {
      if (this.disabled || this.readonly) {
        return false;
      }
      this.isVisible = !this.isVisible;
      if (this.isVisible) {
        this.ensureActivePath();
      }
      return false;
    },
    handleNodeClick(node) {
      if (this.hasChildren(node)) {
        this.activeValueList = node._pathValueList;
      } else {
        this.toggleNode(node, !this.isNodeChecked(node));
      }
    },
    isActiveNode(node) {
      return this.activeValueList.some(value => String(value) === String(node[this.valueName]));
    },
    getLeafNodeList(node) {
      if (!this.hasChildren(node)) {
        return [node];
      }
      return (node[this.childrenKey] || []).reduce((list, child) => list.concat(this.getLeafNodeList(child)), []);
    },
    isNodeChecked(node) {
      const leafNodeList = this.getLeafNodeList(node);
      return !!leafNodeList.length && leafNodeList.every(leaf => this.currentValue.some(value => String(value) === String(leaf[this.valueName])));
    },
    isNodeIndeterminate(node) {
      const leafNodeList = this.getLeafNodeList(node);
      const selectedCount = leafNodeList.filter(leaf => this.currentValue.some(value => String(value) === String(leaf[this.valueName]))).length;
      return selectedCount > 0 && selectedCount < leafNodeList.length;
    },
    toggleNode(node, checked) {
      if (!this.isNodeSelectable(node)) {
        return;
      }
      const currentValue = this.currentValue.slice();
      const valueSet = new Set(currentValue.map(value => String(value)));
      this.getLeafNodeList(node).forEach(leaf => {
        const value = leaf[this.valueName];
        const valueKey = String(value);
        const index = currentValue.findIndex(item => String(item) === valueKey);
        if (checked && !valueSet.has(valueKey)) {
          currentValue.push(value);
          valueSet.add(valueKey);
        } else if (!checked && index >= 0) {
          currentValue.splice(index, 1);
          valueSet.delete(valueKey);
        }
      });
      this.setCurrentValue(currentValue);
    },
    removeItem(value) {
      this.setCurrentValue(this.currentValue.filter(item => String(item) !== String(value)));
    },
    clearValue() {
      this.setCurrentValue([]);
    },
    setCurrentValue(value) {
      const oldValue = this.currentValue;
      this.currentValue = this.multiple ? value : value.slice(0, 1);
      this.$emit('change', this.currentValue);
      this.$emit('update:value', this.currentValue);
      this.$emit('on-change', this.currentValue, this.selectedList);
      this.$emit('change-label', this.selectedList.map(item => item._pathLabel));
      typeof this.onChange === 'function' && this.onChange(this.currentValue, this.selectedList);
      if (!this.$utils.isSame(oldValue, this.currentValue) && this.currentValidList.length > 0 && this.canValid('change', this.currentValidList)) {
        this.valid(this.currentValue);
      } else {
        this.validMesage = '';
        this.isValidPass = true;
      }
      this.setReadonlyTitle();
    },
    setReadonlyTitle() {
      this.readonlyTitle = this.selectedList.map(item => item._pathLabel).join('、');
    },
    updatePosition() {
      this.$nextTick(() => {
        this.$refs.dropdownContain && this.$refs.dropdownContain.$refs.drop && this.$refs.dropdownContain.$refs.drop.update();
      });
    },
    onClickOutside(event) {
      if (!this.isVisible) {
        return;
      }
      const $dropdown = this.$refs.dropdown ? this.$refs.dropdown.$el || null : null;
      if ($dropdown && ($dropdown === event.target || $dropdown.contains(event.target))) {
        return;
      }
      const $contain = this.$refs.dropdownContain ? this.$refs.dropdownContain.$el || null : null;
      if ($contain && ($contain === event.target || $contain.contains(event.target))) {
        return;
      }
      if (this.transfer && $dropdown && $dropdown.offsetParent && ($dropdown.offsetParent === event.target || $dropdown.offsetParent.contains(event.target))) {
        return;
      }
      this.isVisible = false;
    },
    onScroll() {
      this.isVisible = false;
    }
  },
  computed: {
    selectedList() {
      return (this.currentValue || []).map(value => this.getNodeByValue(value)).filter(Boolean);
    },
    columnList() {
      const result = [{ title: this.getColumnTitle(0), list: this.nodeList }];
      let currentList = this.nodeList;
      this.activeValueList.forEach((value, index) => {
        const activeNode = (currentList || []).find(node => String(node[this.valueName]) === String(value));
        if (activeNode && this.hasChildren(activeNode)) {
          currentList = activeNode[this.childrenKey];
          result.push({ title: this.getColumnTitle(index + 1), list: currentList });
        }
      });
      return result;
    },
    getClass() {
      const classNameList = [];
      this.disabled && classNameList.push('tsform-select-disabled');
      this.readonly && classNameList.push('tsform-select-readonly');
      this.isVisible && classNameList.push('ivu-select-visible');
      if (!this.isValidPass) {
        classNameList.push('tsForm-formItem-error');
      }
      return classNameList;
    },
    getClearable() {
      return this.clearable && !this.disabled && !this.readonly && this.currentValue.length > 0;
    }
  },
  watch: {
    value: {
      handler(value) {
        const currentValue = this.$utils.isEmpty(value) ? [] : [].concat(value);
        if (!this.$utils.isSame(currentValue, this.currentValue)) {
          this.currentValue = currentValue;
          this.validMesage = '';
          this.isValidPass = true;
          this.ensureActivePath();
          this.setReadonlyTitle();
        }
      },
      immediate: true,
      deep: true
    },
    dataList: {
      handler() {
        this.initNodeList();
      },
      deep: true
    },
    isVisible(value) {
      if (value) {
        this.updatePosition();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.tsform-cascade {
  .select-body {
    position: relative;
    width: 100%;
  }

  .select-top {
    position: relative;
    min-height: 32px;
    height: auto;
    padding: 2px 28px 2px 4px;
    line-height: 26px;
    cursor: pointer;

    .tag-contian {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      min-height: 26px;
    }

    .ivu-tag {
      max-width: 220px;
      margin: 2px 4px 2px 0;
    }

    .cascade-tag-text {
      max-width: 180px;
    }

    .empty-placeholder {
      color: #b8b8b8;
      line-height: 26px;
    }

    .ivu-select-arrow {
      position: absolute;
      top: 50%;
      right: 8px;
      transform: translateY(-50%);
      color: #808695;
    }
  }
}
</style>

<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';

.tsform-cascade-transfer {
  z-index: 1002;
  max-height: none !important;
  overflow: visible !important;

  .ivu-dropdown-menu {
    padding: 0;
    max-height: none !important;
    overflow: visible !important;
  }

  .cascade-panel {
    display: flex;
    min-width: 260px;
    max-width: 780px;
    max-height: none;
    overflow-x: auto;
    background: #fff;
  }

  .cascade-column {
    padding: 10px 10px 8px;

    & + .cascade-column {
      border-left: 1px solid #e8eaec;
    }
  }

  .cascade-title {
    margin-bottom: 8px;
    line-height: 20px;
    color: #515a6e;
    font-weight: 500;
  }

  .cascade-list {
    min-height: 300px;
    margin-top: 8px;
    overflow-y: auto;
  }

  .cascade-option {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 8px;
    border-radius: 2px;
    color: #515a6e;
    cursor: pointer;

    &:hover,
    &.active {
      background: #f3f5f8;
    }

    &.selected {
      color: #2d8cf0;
    }
  }

  .cascade-check {
    display: inline-flex;
    align-items: center;
    width: 22px;
    flex: 0 0 22px;
  }

  .cascade-name {
    display: inline-block;
    flex: 1;
    min-width: 0;
  }

  .cascade-arrow {
    margin-left: 8px;
    color: #b8b8b8;
  }

  .cascade-empty {
    padding: 16px 8px;
    text-align: center;
  }
}

html.theme-dark {
  .tsform-cascade-transfer {
    background: @dark-blockbg;

    .ivu-dropdown-menu {
      background: @dark-blockbg;
    }

    .cascade-panel {
      background: @dark-blockbg;
    }

    .cascade-column {
      & + .cascade-column {
        border-left-color: @dark-border;
      }
    }

    .cascade-title {
      color: @dark-title;
    }

    .cascade-option {
      color: @dark-text;

      &:hover,
      &.active {
        background: @dark-table-hover-color;
      }

      &.selected {
        color: @dark-primary-color;
      }
    }

    .cascade-arrow {
      color: @dark-icon;
    }

    .cascade-empty {
      color: @dark-tip;
    }
  }
}
</style>
