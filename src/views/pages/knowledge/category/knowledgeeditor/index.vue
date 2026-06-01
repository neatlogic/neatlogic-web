<template>
  <div class="knowledge-editor-box">
    <div class="editor-main" :class="{ 'is-readonly': readonly, 'is-content-readonly': !isContentEditable, 'is-compare': compareMode }" @click.stop="hidePlus">
      <div class="editor-menu">
        <ul>
          <li v-for="(item, index) in menuList" :key="`${item.uuid || 'heading'}_${index}`" :class="getMenuClass(item)">
            <div class="menu-text" @click="selectHeading(item)">
              <span class="heading-icon" :class="getHeadingIcon(item)" @click.stop="handleClick(item, index)"></span>
              <span :class="{ 'text-href': selectHeadingUuid === item.uuid }">{{ item.text }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div
        ref="editorScrollWrapper"
        class="editor-wrapper bg-op"
        @mouseover="$emit('updateMouseover')"
        @scroll="handleContentScroll"
      >
        <div v-if="showHeader && (isShowHeadInfo || hasCompareMetaInfo)" class="head-info-box">
          <TsFormInput
            v-if="!readonly"
            ref="titleInput"
            v-model="title"
            border="none"
            class="document-title"
            readonly-class="document-readonly-title"
            :validateList="['name-special', 'required']"
            :readonly="!isTitleEditable"
            :placeholder="$t('form.placeholder.pleaseinput', { target: $t('page.title') })"
            @on-change="handleTitleChange"
          ></TsFormInput>
          <div v-else-if="hasCompareMetaInfo" class="compare-meta-box">
            <div v-if="compareTagList.length" class="compare-meta-row">
              <span class="compare-meta-label">{{ $t('term.knowledge.documenttag') }}{{ $t('page.colon') }}</span>
              <span class="compare-tag-list">
                <span
                  v-for="(tag, index) in compareTagList"
                  :key="`${tag.text}_${index}`"
                  class="compare-tag-item"
                  :class="getCompareTagClass(tag)"
                >{{ tag.text }}</span>
              </span>
            </div>
          </div>
          <div class="border-base-bottom mt-nm mb-nm"></div>
        </div>
        <div
          ref="editorWrapper"
          class="editor-content-box"
          @mousemove="handleEditorMouseMove"
          @mouseleave="handleEditorMouseLeave"
          @click="handleClickPlus"
        >
          <div ref="editorContentContainer" class="editor-content-container" @click.stop>
            <EditorContent v-if="editor" :editor="editor" class="editor-content"></EditorContent>
          </div>
          <BlockMenu
            v-show="isShowBlockMenu && isContentEditable"
            :is-empty-row="isEmptyRow"
            :menu-position="menuPosition"
            :node-config="blockMenuNodeConfig"
            @insert-menu-content="menuData => handleInsertMenuContent({ menuData, editor, hoverBlockDom })"
            @replace-menu-content="menuData => handleReplaceMenuContent({ menuData, editor, hoverBlockDom })"
            @insert-below-position="menuData => handleInsertBelowPosition({ menuData, editor, hoverBlockDom })"
            @handleMouse="handleMouse"
            @menu-hover="handleBlockMenuHover"
            @drag-start="handleBlockDragStart"
            @dropdown-visible-change="handleBlockMenuDropdownVisible"
          ></BlockMenu>
          <SelectContentMenu
            v-show="isShowSelectContentMenu && isContentEditable"
            ref="selectContentMenuRef"
            :selected-text="selectedText"
            :node-config="nodeConfig"
            :node-name="nodeName"
            :style="{ top: `${selectContentMenuPos.top}px`, left: `${selectContentMenuPos.left}px` }"
            @handle-select-menu-content="menuData => handleSelectMenuContent({ menuData, editor, hoverBlockDom })"
          ></SelectContentMenu>
          <TableHoverLayer
            v-show="isShowTableMenu && isContentEditable"
            ref="tableHoverLayerRef"
            :table-menu-position="tableMenuPosition"
            :table-uuid="tableUuid"
            :row-height-list="rowHeightList"
            :is-clear-highlight="isClearTableRowColHighlight"
            :editor="editor"
            @click="tableRowColHeadClick"
          ></TableHoverLayer>
          <LinkHover
            v-show="isShowLinkHover"
            :link-hover-config="linkHoverConfig"
            :readonly="!isContentEditable"
            @click-menu="menuData => handleReplaceMenuContent({ menuData, editor, hoverBlockDom })"
          ></LinkHover>
          <div
            v-if="isDraggingBlock && blockDragIndicator.visible"
            class="knowledge-document-editor-drag-indicator"
            :style="{ top: `${blockDragIndicator.top}px`, left: `${blockDragIndicator.left}px`, width: `${blockDragIndicator.width}px` }"
          ></div>
        </div>
      </div>
    </div>
    <SearchReplaceDialog
      v-if="isShowSearchReplaceDialog && isContentEditable"
      :editor="editor"
      :selected-text="selectedText"
      @close="isShowSearchReplaceDialog = false"
    ></SearchReplaceDialog>
  </div>
</template>

<script>
import { throttle } from 'lodash';
import { posToDOMRect } from '@tiptap/core';
import { Editor, EditorContent } from '@tiptap/vue-2';
import { Placeholder } from '@tiptap/extensions';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
import { Table, TableRow } from '@tiptap/extension-table';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import ExtensionsList from '@/views/pages/knowledge/category/knowledgeeditor/extensions/index.js';
import BaseMixin from './utils/base.js';
import { menuState } from './utils/state.js';
import { SearchHighlight } from '@/views/pages/knowledge/category/knowledgeeditor/extensions/search-highlight.js';
import { PasteUploadImages } from '@/views/pages/knowledge/category/knowledgeeditor/extensions/paste/upload-images.js';
import { ImageResize } from '@/views/pages/knowledge/category/knowledgeeditor/extensions/image-resize.js';
import { RowColSelected } from '@/views/pages/knowledge/category/knowledgeeditor/extensions/table/row-col-selected/index.js';
import { TableUtils } from '@/views/pages/knowledge/category/knowledgeeditor/extensions/table/table-utils.js';
import { getHoverTargetByEvent, getTableRowHeights, getLinksInfoFromParagraph } from '@/views/pages/knowledge/category/knowledgeeditor/utils/node-utils.js';
import { getSelectedTextInfo, getSelectionNode } from '@/views/pages/knowledge/category/knowledgeeditor/utils/selection-utils.js';
import { HoverHighlightPlugin, hoverHighlightKey } from '@/views/pages/knowledge/category/knowledgeeditor/extensions/hover-highlight.js';
import { EMPTY_TIPTAP_DOC, knowledgePayloadToTiptap, tiptapToKnowledgePayload } from '@/views/pages/knowledge/category/knowledgeeditor/adapters/knowledge-data-adapter.js';
import { compareDocumentVos } from '@/views/pages/knowledge/category/knowledgeeditor/utils/versionCompare/index.js';

export default {
  components: {
    EditorContent,
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    BlockMenu: () => import('@/views/pages/knowledge/category/knowledgeeditor/menus/block-menu/index.vue'),
    SelectContentMenu: () => import('@/views/pages/knowledge/category/knowledgeeditor/menus/select-content-menu/index.vue'),
    TableHoverLayer: () => import('@/views/pages/knowledge/category/knowledgeeditor/menus/table-hover-layer/index.vue'),
    SearchReplaceDialog: () => import('@/views/pages/knowledge/category/knowledgeeditor/components/search-replace-dialog/index.vue'),
    LinkHover: () => import('@/views/pages/knowledge/category/knowledgeeditor/menus/link-hover/index.vue')
  },
  provide() {
    return {
      menuState
    };
  },
  mixins: [BaseMixin],
  props: {
    documentTitle: {
      type: String,
      default: ''
    },
    documentConfig: {
      type: Object,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    canEditTitle: {
      type: Boolean,
      default: true
    },
    canEditContent: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showDebugButton: {
      type: Boolean,
      default: true
    },
    compareMode: {
      type: Boolean,
      default: false
    },
    oldDocumentVo: {
      type: Object,
      default: null
    },
    newDocumentVo: {
      type: Object,
      default: null
    },
    compareSide: {
      type: String,
      default: 'new',
      validator: value => ['old', 'new'].includes(value)
    }
  },
  data() {
    return {
      tableUuid: '',
      title: this.documentTitle,
      tagList: [],
      fileList: [],
      meta: {},
      isSettingContent: false,
      isDestroyingEditor: false,
      selectionUpdateHandler: null,
      isSelectionUpdateBound: false,
      keydownHandler: null,
      editorDomEl: null,
      isShowLinkHover: false,
      isEmptyRow: false,
      isShowBlockMenu: false,
      isShowTableMenu: false,
      isShowSelectContentMenu: false,
      isShowSearchReplaceDialog: false,
      isClearTableRowColHighlight: false,
      isBlockMenuHover: false,
      isBlockMenuDropdownVisible: false,
      blockMenuDropdownVisibleCount: 0,
      blockMenuHideTimer: null,
      lastMouseEvent: null,
      isDraggingBlock: false,
      blockDragSource: null,
      blockDragTarget: null,
      blockDragIndicator: {
        visible: false,
        top: 0,
        left: 0,
        width: 0
      },
      editor: null,
      hoverBlockDom: null,
      menuList: [],
      rowHeightList: [],
      selectHeadingUuid: '',
      selectedText: '',
      nodeName: '',
      nodeConfig: null,
      menuPosition: { top: 0, left: 0 },
      tableMenuPosition: { top: -12, left: 0 },
      selectContentMenuPos: { top: 0, left: 0 },
      blockMenuNodeConfig: {
        type: '',
        attrs: {},
        pos: null,
        nodeSize: null
      },
      linkHoverConfig: {}
    };
  },
  mounted() {
    this.createEditor();
    document.addEventListener('mousemove', this.handleDocumentMouseMove, true);
    if (this.compareMode) {
      this.setCompareData();
    } else if (this.documentConfig) {
      this.setData(this.documentConfig);
    }
  },
  beforeDestroy() {
    this.cleanupEditorRuntime();
  },
  destroyed() {
    this.destroyEditor();
  },
  activated() {
    this.isDestroyingEditor = false;
    document.addEventListener('mousemove', this.handleDocumentMouseMove, true);
    if (!this.editor) {
      this.createEditor();
      if (this.compareMode) {
        this.setCompareData();
      } else if (this.documentConfig) {
        this.setData(this.documentConfig);
      }
    } else {
      if (this.selectionUpdateHandler && !this.isSelectionUpdateBound) {
        this.editor.on('selectionUpdate', this.selectionUpdateHandler);
        this.isSelectionUpdateBound = true;
      }
      menuState.editorData = this.editor;
      this.$nextTick(() => {
        if (!this.editor || this.editor.isDestroyed || this.isDestroyingEditor) {
          return;
        }
        this.editorDomEl = this.$refs.editorContentContainer?.querySelector?.('.ProseMirror') || null;
        this.editorDomEl && this.editorDomEl.addEventListener('keydown', this.keydownHandler);
      });
    }
  },
  deactivated() {
    this.cleanupEditorRuntime();
  },
  methods: {
    createEditor() {
      if (this.editor && !this.editor.isDestroyed) {
        return;
      }
      this.isDestroyingEditor = false;
      this.editor = new Editor({
        editable: this.isContentEditable,
        extensions: [
          StarterKit.configure({
            bulletList: {
              itemTypeName: 'listItem',
              HTMLAttributes: { class: 'bullet-list' }
            },
            orderedList: {
              itemTypeName: 'listItem',
              HTMLAttributes: { class: 'ordered-list' }
            },
            heading: {
              HTMLAttributes: { class: 'heading' }
            },
            link: {
              HTMLAttributes: { class: 'link' }
            }
          }),
          Placeholder.configure({
            placeholder: this.$t('form.placeholder.pleaseinput', { target: this.$t('page.content') })
          }),
          TextAlign.configure({
            types: ['heading', 'paragraph']
          }),
          Table.configure({
            resizable: true,
            cell: false
          }),
          TableRow,
          TextStyleKit,
          ImageResize,
          RowColSelected,
          TableUtils,
          PasteUploadImages.configure({
            upload: file => this.uploadFileToServer(file),
            uploadExternalImages: true
          }),
          TaskList,
          TaskItem.configure({
            nested: true
          }),
          ...ExtensionsList,
          SearchHighlight
        ],
        content: JSON.parse(JSON.stringify(EMPTY_TIPTAP_DOC)),
        onCreate: ({ editor }) => {
          this.getAllHeadings(editor);
          editor.registerPlugin(HoverHighlightPlugin());
        },
        onUpdate: ({ editor }) => {
          this.getAllHeadings(editor);
          if (!this.isSettingContent) {
            this.emitChange();
          }
        },
        onFocus: ({ editor }) => {
          const { $from } = editor?.state?.selection || {};
          const node = $from && $from.node($from.depth);
          node && this.highlightHeading(node, editor);
        }
      });

      this.selectionUpdateHandler = ({ editor }) => {
        const { $from, from, to } = editor?.state?.selection || {};
        if (!$from) {
          return;
        }
        const node = $from.node($from.depth);
        this.highlightHeading(node, editor);
        this.handleSelectionText({ editor, from, to, $from });
      };
      this.editor.on('selectionUpdate', this.selectionUpdateHandler);
      this.isSelectionUpdateBound = true;

      this.keydownHandler = e => {
        if (!this.isContentEditable) {
          return;
        }
        if (e.ctrlKey && e.key === 'f') {
          e.preventDefault();
          this.isShowSearchReplaceDialog = true;
        }
      };
      this.$nextTick(() => {
        if (!this.editor || this.editor.isDestroyed || this.isDestroyingEditor) {
          return;
        }
        this.editorDomEl = this.$refs.editorContentContainer?.querySelector?.('.ProseMirror') || null;
        this.editorDomEl && this.editorDomEl.addEventListener('keydown', this.keydownHandler);
      });
      menuState.editorData = this.editor;
    },
    cleanupEditorRuntime() {
      this.isDestroyingEditor = true;
      this.cancelBlockMenuHide();
      this.handleMouseMove?.cancel && this.handleMouseMove.cancel();
      document.removeEventListener('mousemove', this.handleDocumentMouseMove, true);
      this.removeBlockDragListeners();
      this.isShowBlockMenu = false;
      this.isShowTableMenu = false;
      this.isShowSelectContentMenu = false;
      this.isShowSearchReplaceDialog = false;
      this.isShowLinkHover = false;
      this.hoverBlockDom = null;
      this.lastMouseEvent = null;
      this.isDraggingBlock = false;
      this.blockDragSource = null;
      this.blockDragTarget = null;
      this.blockDragIndicator.visible = false;
      this.linkHoverConfig = {};
      const editor = this.editor;
      if (menuState.editorData === editor) {
        menuState.editorData = null;
      }
      if (!editor) {
        this.isSettingContent = false;
        return;
      }
      if (this.selectionUpdateHandler && this.isSelectionUpdateBound) {
        editor.off('selectionUpdate', this.selectionUpdateHandler);
        this.isSelectionUpdateBound = false;
      }
      if (this.keydownHandler && this.editorDomEl) {
        this.editorDomEl.removeEventListener('keydown', this.keydownHandler);
      }
      this.editorDomEl = null;
      this.isSettingContent = false;
    },
    destroyEditor() {
      const editor = this.editor;
      this.cleanupEditorRuntime();
      this.editor = null;
      if (!editor) {
        return;
      }
      if (!editor.isDestroyed) {
        try {
          editor.destroy();
        } catch (error) {
          // Tiptap may already have detached its view while Vue is leaving the route.
        }
      }
    },
    handleTitleChange() {
      if (!this.isTitleEditable) {
        return;
      }
      this.$emit('title-change', this.title);
      this.$emit('update:documentTitle', this.title);
      this.emitChange();
    },
    emitChange() {
      this.$emit('change', this.getSaveData());
    },
    handleContentScroll(event) {
      this.$emit('updateScrollTop', event.target.scrollTop);
    },
    setScroll(scrollTop) {
      const scrollEl = this.getContentScrollEl();
      if (scrollEl) {
        scrollEl.scrollTop = scrollTop;
      }
    },
    getContentScrollEl() {
      return this.$refs.editorScrollWrapper || null;
    },
    // 新组件内部统一数据模型：以 Tiptap JSON 为正文主格式，标签和附件保持结构化列表
    getSaveData() {
      const hasEditor = this.editor && !this.editor.isDestroyed;
      return {
        title: this.title || '',
        content: hasEditor ? this.editor.getJSON() : JSON.parse(JSON.stringify(EMPTY_TIPTAP_DOC)),
        fileList: this.fileList,
        meta: this.meta || {}
      };
    },
    // 兼容当前知识库后台保存协议，路由保存时仍可直接取数据
    getAllData() {
      return tiptapToKnowledgePayload(this.getSaveData());
    },
    // 支持两种输入：新组件数据模型，或旧知识库详情数据；旧数据会通过 adapter 转成 Tiptap 文档
    setData(config = {}) {
      if (this.compareMode) {
        this.setCompareData();
        return;
      }
      const editorData = config.type === 'doc'
        ? {
          title: this.title || this.documentTitle || '',
          content: config,
          tagList: [],
          fileList: [],
          meta: {}
        }
        : config.content && config.content.type === 'doc'
          ? config
          : knowledgePayloadToTiptap(config);
      this.title = editorData.title || '';
      this.tagList = editorData.tagList || [];
      this.fileList = editorData.fileList || [];
      this.meta = editorData.meta || {};
      this.setContent(editorData.content || EMPTY_TIPTAP_DOC);
    },
    setCompareData() {
      if (!this.editor || this.editor.isDestroyed) {
        return;
      }
      const { oldCompareDoc, newCompareDoc } = compareDocumentVos(this.oldDocumentVo || {}, this.newDocumentVo || {});
      const compareDoc = this.compareSide === 'old' ? oldCompareDoc : newCompareDoc;
      this.title = compareDoc.title || '';
      this.tagList = compareDoc.tagList || [];
      this.fileList = compareDoc.fileList || [];
      this.meta = compareDoc.meta || {};
      this.setContent(compareDoc.content || EMPTY_TIPTAP_DOC);
    },
    setContent(content = EMPTY_TIPTAP_DOC) {
      if (!this.editor || this.editor.isDestroyed) {
        return;
      }
      this.isSettingContent = true;
      try {
        this.editor.commands.setContent(content);
      } catch (error) {
        this.editor.commands.setContent(JSON.parse(JSON.stringify(EMPTY_TIPTAP_DOC)));
        console.error('[KnowledgeEditor] setContent failed:', error);
      }
      this.$nextTick(() => {
        if (!this.editor || this.editor.isDestroyed || this.isDestroyingEditor) {
          return;
        }
        this.isSettingContent = false;
        this.getAllHeadings(this.editor);
      });
    },
    clearContent() {
      this.setContent(JSON.parse(JSON.stringify(EMPTY_TIPTAP_DOC)));
    },
    validData() {
      let titleRef = this.$refs.titleInput;
      let isValid = true;
      if (titleRef && !titleRef.valid()) {
        isValid = false;
      }
      if (!isValid) {
        this.$nextTick(() => {
          this.$refs.titleInput && this.$refs.titleInput.focus && this.$refs.titleInput.focus();
        });
      }
      return isValid;
    },
    focus() {
      if (!this.isContentEditable || !this.editor || this.editor.isDestroyed || this.isDestroyingEditor) {
        return;
      }
      this.editor?.commands?.focus();
    },
    getEditorView(editor = this.editor) {
      if (!editor || editor.isDestroyed) {
        return null;
      }
      try {
        return editor.view || null;
      } catch (error) {
        return null;
      }
    },
    // 模板目录只读h1/h2，保持和旧知识库目录层级一致
    getTemplateData() {
      const { content = [] } = this.editor && !this.editor.isDestroyed ? this.editor.getJSON() : {};
      return content.filter(item => item.type === 'heading' && (item.attrs?.level === 1 || item.attrs?.level === 2));
    },
    handleSelectionText({ editor, from, to }) {
      if (!this.isContentEditable || !editor || editor.isDestroyed || this.isDestroyingEditor) {
        return false;
      }
      const { hasTextSelection = false, selectedText = '' } = getSelectedTextInfo(editor);
      const selectedNode = getSelectionNode(editor);
      if (selectedNode?.type?.includes('table')) {
        return false;
      } else if (selectedNode?.type?.includes('image')) {
        this.isShowSelectContentMenu = true;
        this.selectedText = '';
        this.updateSelectContentMenuPosition(editor, from, to);
        this.nodeName = selectedNode?.type || '';
        return false;
      }
      this.isShowSelectContentMenu = hasTextSelection;
      this.selectedText = selectedText;
      if (hasTextSelection) {
        this.updateSelectContentMenuPosition(editor, from, to);
      }
      this.nodeName = selectedNode?.type || '';
    },
    updateSelectContentMenuPosition(editor, from, to) {
      const view = this.getEditorView(editor);
      if (!view) {
        return;
      }
      const selectionRect = posToDOMRect(view, from, to);
      const editorWrapperRect = this.$refs?.editorWrapper?.getBoundingClientRect();
      const textSelectedMenuRect = this.$refs?.selectContentMenuRef?.$refs?.bubbleMenuRef?.getBoundingClientRect();
      const { width: bubbleMenuWidth = 0 } = textSelectedMenuRect || {};
      const { top: editorWrapperTop = 0, left: editorWrapperRectLeft = 0 } = editorWrapperRect || {};
      const { top: selectionRectTop = 0, height: selectionRectHight = 0, left: selectionRectLeft = 0, width: selectionRectWidth = 0 } = selectionRect || {};
      this.selectContentMenuPos = {
        top: (selectionRectTop + selectionRectHight - editorWrapperTop + 5).toFixed(0),
        left: Math.max(selectionRectLeft + selectionRectWidth / 2 - editorWrapperRectLeft - bubbleMenuWidth / 2, 10)
      };
    },
    normalizeSelectContentMenuPosition(position = {}) {
      const editorWrapperRect = this.$refs?.editorWrapper?.getBoundingClientRect?.();
      const menuRect = this.$refs?.selectContentMenuRef?.$refs?.bubbleMenuRef?.getBoundingClientRect?.();
      const gap = 10;
      const wrapperWidth = editorWrapperRect?.width || 0;
      const menuWidth = menuRect?.width || 0;
      const maxLeft = wrapperWidth ? Math.max(gap, wrapperWidth - menuWidth - gap) : Infinity;
      const top = Math.max(Number(position.top) || 0, gap);
      const left = Math.min(Math.max(Number(position.left) || gap, gap), maxLeft);

      return {
        top,
        left
      };
    },
    getAllHeadings(editor) {
      if (!editor || editor.isDestroyed || this.isDestroyingEditor) {
        this.menuList = [];
        return;
      }
      const $headings = editor.$nodes('heading');
      let headings = [];
      $headings.forEach((node, index) => {
        if (!node.textContent) {
          return;
        }
        let obj = {
          level: node.attributes.level,
          text: node.textContent,
          uuid: node.attributes.blockUuid
        };
        for (let i = index + 1; i < $headings.length; i++) {
          const afterNode = $headings[i];
          const afterLevel = afterNode.attributes.level;
          if (afterLevel && afterLevel > node.attributes.level) {
            obj.showNextIcon = true;
            break;
          }
        }
        headings.push(obj);
      });
      this.menuList = headings;
    },
    handleClick(item, index) {
      this.$set(item, 'showNextIcon', !item.showNextIcon);
      for (let i = index + 1; i < this.menuList.length; i++) {
        if (this.menuList[i].level > item.level) {
          this.$set(this.menuList[i], 'isHide', !item.showNextIcon);
        } else {
          break;
        }
      }
    },
    handleEditorMouseMove(event) {
      if (this.showTableMenuByControlArea(event)) {
        this.handleMouseMove?.cancel && this.handleMouseMove.cancel();
        return;
      }
      const editorEl = this.$refs.editorWrapper?.querySelector?.('.ProseMirror');
      if (!editorEl?.contains(event.target)) {
        this.clearTableRowColHighlight();
        return;
      }
      this.handleMouseMove(event);
    },
    showTableMenuByControlArea(event) {
      if (!this.isContentEditable || this.isDraggingBlock) {
        return false;
      }
      if (event.target?.closest?.('table')) {
        return false;
      }
      const tableTarget = this.getTableControlAreaHoverTarget(event);
      if (!tableTarget) {
        return false;
      }
      const editorWrapperRect = this.$refs.editorWrapper?.getBoundingClientRect?.();
      if (!editorWrapperRect) {
        return false;
      }
      this.lastMouseEvent = event;
      this.cancelBlockMenuHide();
      this.$set(this.blockMenuNodeConfig, 'type', 'table');
      this.$set(this.blockMenuNodeConfig, 'attrs', tableTarget.attrs);
      this.updateTableHoverState({
        ...tableTarget,
        editorWrapperRect
      });
      this.isShowLinkHover = false;
      this.linkHoverConfig = {};
      return true;
    },
    getTableControlAreaHoverTarget(event) {
      const editorEl = this.$refs.editorWrapper?.querySelector?.('.ProseMirror');
      const topHandleSize = 10;
      const leftHandleSize = 54;
      if (!editorEl) {
        return null;
      }
      const tableList = Array.from(editorEl.querySelectorAll('table[data-block-uuid], .tableWrapper[data-block-uuid]'));
      for (const tableDom of tableList) {
        const tableEl = tableDom.tagName === 'TABLE' ? tableDom : tableDom.querySelector('table');
        const tableUuid = tableDom.dataset.blockUuid || tableEl?.dataset?.blockUuid;
        if (!tableEl || !tableUuid) {
          continue;
        }
        const nodeRect = tableEl.getBoundingClientRect?.();
        if (!nodeRect) {
          continue;
        }
        const isInTopControl =
          event.clientX >= nodeRect.left &&
          event.clientX <= nodeRect.right &&
          event.clientY >= nodeRect.top - topHandleSize &&
          event.clientY < nodeRect.top;
        const isInLeftControl =
          event.clientX >= nodeRect.left - leftHandleSize &&
          event.clientX < nodeRect.left &&
          event.clientY >= nodeRect.top &&
          event.clientY <= nodeRect.bottom;
        if (!isInTopControl && !isInLeftControl) {
          continue;
        }
        const attrs = this.getTableAttrsByUuid(tableUuid);
        if (!attrs?.blockUuid) {
          continue;
        }
        return {
          attrs,
          nodeDom: tableEl.closest('.tableWrapper') || tableEl,
          nodeRect
        };
      }
      return null;
    },
    getTableAttrsByUuid(uuid) {
      if (!uuid) {
        return null;
      }
      let attrs = null;
      this.editor?.state?.doc?.descendants((node) => {
        if (node.type.name === 'table' && node.attrs?.blockUuid === uuid) {
          attrs = { ...node.attrs };
          return false;
        }
      });
      return attrs;
    },
    updateTableHoverState({ attrs = {}, nodeDom, nodeRect, editorWrapperRect }) {
      this.tableUuid = attrs?.blockUuid;
      this.rowHeightList = getTableRowHeights(nodeDom);
      this.isShowTableMenu = true;
      this.isClearTableRowColHighlight = false;
      this.hoverBlockDom = nodeDom;
      this.tableMenuPosition = {
        top: Number(nodeRect.top - editorWrapperRect.top).toFixed(0) <= 0 ? -10 : Number((nodeRect.top - editorWrapperRect.top).toFixed(0)) - 10,
        left: Number((nodeRect.left - editorWrapperRect.left).toFixed(0))
      };
      this.isShowBlockMenu = true;
      this.isEmptyRow = false;
      this.menuPosition = {
        top: Number((nodeRect.top - editorWrapperRect.top).toFixed(0)),
        left: -50
      };
    },
    handleMouseMove: throttle(function(event) {
      if (!this.isContentEditable) {
        this.hidePlus();
        return;
      }
      if (this.isDraggingBlock) {
        return;
      }
      this.lastMouseEvent = event;
      const wrapper = this.$refs.editorWrapper;
      const editorEl = wrapper?.querySelector('.ProseMirror');
      const view = this.getEditorView();
      if (!view || this.isBlockMenuTarget(event.target)) {
        this.cancelBlockMenuHide();
        return;
      }
      if (!editorEl?.contains(event.target)) {
        return;
      }
      this.cancelBlockMenuHide();
      const { state } = this.editor;
      const position = view.posAtCoords({ left: event.clientX, top: event.clientY });
      if (!position) return;

      const editorWrapperRect = wrapper.getBoundingClientRect();
      const $pos = state?.doc?.resolve(position.pos);
      if (!$pos || $pos.depth < 0) return;

      const { type, attrs = {}, pos, isEmpty: nodeContentIsEmpty = false, node } = getHoverTargetByEvent({ state, $pos }) || {};
      this.$set(this.blockMenuNodeConfig, 'type', type);
      this.$set(this.blockMenuNodeConfig, 'attrs', attrs);
      this.$set(this.blockMenuNodeConfig, 'pos', pos);
      this.$set(this.blockMenuNodeConfig, 'nodeSize', node?.nodeSize || null);
      const nodeDom = view.nodeDOM(pos);
      const nodeRect = nodeDom && nodeDom.getBoundingClientRect && nodeDom.getBoundingClientRect();
      this.hoverBlockDom = nodeDom;

      const linkInfo = getLinksInfoFromParagraph(node, pos, position.pos);
      const { type: linkType, href: linkHref } = linkInfo;
      if (!nodeRect) return;

      if (type === 'table') {
        this.updateTableHoverState({
          attrs,
          nodeDom,
          nodeRect,
          editorWrapperRect
        });
      } else {
        this.isShowTableMenu = false;
        this.clearTableRowColHighlight();
      }

      if (linkType === 'link' && linkHref) {
        const linkRect = posToDOMRect(view, linkInfo.startPosition, linkInfo.endPosition);
        this.linkHoverConfig = {
          ...(linkInfo || {}),
          top: Number(((linkRect?.top || nodeRect.top) - editorWrapperRect.top).toFixed(0)),
          left: Number(((linkRect?.left || nodeRect.left) - editorWrapperRect.left).toFixed(0))
        };
        this.isShowLinkHover = true;
      } else {
        this.isShowLinkHover = false;
        this.linkHoverConfig = {};
      }

      if (type !== 'table') {
        this.isShowBlockMenu = true;
        this.isEmptyRow = nodeContentIsEmpty;
        this.menuPosition = {
          top: Number((nodeRect.top - editorWrapperRect.top).toFixed(0)),
          left: -50
        };
      }
    }, 500),
    handleDocumentMouseMove(event) {
      this.lastMouseEvent = event;
      if (this.isDraggingBlock) {
        this.cancelBlockMenuHide();
        return;
      }
      if (this.isBlockMenuTarget(event.target)) {
        this.cancelBlockMenuHide();
      }
    },
    isBlockMenuTarget(target) {
      return !!target?.closest?.([
        '.knowledge-document-editor-block-menu',
        '.knowledge-document-editor-plus-box',
        '.ivu-dropdown',
        '.ivu-dropdown-menu',
        '.ivu-dropdown-item',
        '.ivu-select-dropdown',
        '.ivu-poptip-popper',
        '.ivu-tooltip-popper',
        '.link-hover-box'
      ].join(', '));
    },
    isMouseInBlockMenuLayer(event = this.lastMouseEvent) {
      if (!event) {
        return false;
      }
      const target = document.elementFromPoint(event.clientX, event.clientY);
      return this.isBlockMenuTarget(target);
    },
    handleEditorMouseLeave(event) {
      if (this.isDraggingBlock) {
        this.cancelBlockMenuHide();
        return;
      }
      const toEl = event.relatedTarget;
      if (this.isBlockMenuTarget(toEl) || this.isMovingToBlockMenu(event)) {
        this.cancelBlockMenuHide();
        return;
      }
      this.scheduleBlockMenuHide();
    },
    isMovingToBlockMenu(event) {
      const wrapperRect = this.$refs.editorWrapper?.getBoundingClientRect();
      if (!wrapperRect || !this.isShowBlockMenu) {
        return false;
      }
      const blockRect = this.hoverBlockDom?.getBoundingClientRect?.();
      if (blockRect) {
        const safeLeft = wrapperRect.left + Number(this.menuPosition.left || 0) - 24;
        const safeRight = Math.max(blockRect.left + 16, wrapperRect.left + 24);
        const safeTop = blockRect.top - 12;
        const safeBottom = blockRect.bottom + 12;
        if (event.clientX >= safeLeft && event.clientX <= safeRight && event.clientY >= safeTop && event.clientY <= safeBottom) {
          return true;
        }
      }
      const menuTop = wrapperRect.top + Number(this.menuPosition.top || 0);
      const menuBottom = menuTop + 44;
      const menuLeft = wrapperRect.left + Number(this.menuPosition.left || 0) - 8;
      const menuRight = wrapperRect.left + 12;
      return event.clientX >= menuLeft && event.clientX <= menuRight && event.clientY >= menuTop - 8 && event.clientY <= menuBottom;
    },
    handleBlockMenuHover(status, event) {
      if (this.isDraggingBlock) {
        this.cancelBlockMenuHide();
        return;
      }
      if (!status && this.isBlockMenuTarget(event?.relatedTarget)) {
        return;
      }
      this.isBlockMenuHover = status;
      if (!status && !this.isBlockMenuDropdownVisible) {
        this.scheduleBlockMenuHide();
      } else {
        this.cancelBlockMenuHide();
      }
    },
    handleBlockMenuDropdownVisible(status) {
      // iView 的多级 Dropdown 会分别触发显隐事件，用计数保留所有仍打开的菜单层，避免二级菜单打开时左侧菜单被提前隐藏
      this.blockMenuDropdownVisibleCount += status ? 1 : -1;
      if (this.blockMenuDropdownVisibleCount < 0) {
        this.blockMenuDropdownVisibleCount = 0;
      }
      this.isBlockMenuDropdownVisible = this.blockMenuDropdownVisibleCount > 0;
      if (status) {
        this.cancelBlockMenuHide();
      }
    },
    scheduleBlockMenuHide() {
      if (this.isDraggingBlock) {
        this.cancelBlockMenuHide();
        return;
      }
      this.cancelBlockMenuHide();
      this.blockMenuHideTimer = window.setTimeout(() => {
        if (!this.isBlockMenuHover && !this.isBlockMenuDropdownVisible && !this.isMouseInBlockMenuLayer()) {
          this.hidePlus();
        }
      }, 160);
    },
    cancelBlockMenuHide() {
      if (this.blockMenuHideTimer) {
        window.clearTimeout(this.blockMenuHideTimer);
        this.blockMenuHideTimer = null;
      }
    },
    hidePlus() {
      if (this.isDraggingBlock) {
        return;
      }
      if (this.isBlockMenuHover || this.isBlockMenuDropdownVisible || this.isMouseInBlockMenuLayer()) {
        return;
      }
      this.isShowBlockMenu = false;
      this.isShowTableMenu = false;
      this.isShowLinkHover = false;
      this.clearTableRowColHighlight();
      this.hoverBlockDom = null;
    },
    clearTableRowColHighlight() {
      this.isClearTableRowColHighlight = true;
      this.$refs.tableHoverLayerRef?.clearSelected?.();
      if (this.editor && !this.editor.isDestroyed && this.editor.commands?.clearTableHighlight) {
        this.editor.commands.clearTableHighlight();
      }
    },
    handleBlockDragStart(event) {
      if (!this.isContentEditable || !this.hoverBlockDom) {
        return;
      }
      const rect = this.hoverBlockDom.getBoundingClientRect?.();
      const source = rect ? this.getRootBlockRangeByCoords(rect.left + 4, rect.top + Math.min(rect.height / 2, 24)) : null;
      if (!source || !source.node || source.node.type.name === 'doc') {
        return;
      }
      this.isDraggingBlock = true;
      this.blockDragSource = source;
      this.blockDragTarget = null;
      this.blockDragIndicator.visible = false;
      this.cancelBlockMenuHide();
      document.addEventListener('mousemove', this.handleBlockDragMove, true);
      document.addEventListener('mouseup', this.handleBlockDragEnd, true);
      event.dataTransfer && event.dataTransfer.setData('text/plain', '');
    },
    handleBlockDragMove(event) {
      if (!this.isDraggingBlock) {
        return;
      }
      event.preventDefault();
      const target = this.getRootBlockRangeByCoords(event.clientX, event.clientY);
      if (!target || !this.blockDragSource || this.isSameOrInsideDragSource(target)) {
        this.blockDragTarget = null;
        this.blockDragIndicator.visible = false;
        return;
      }
      const view = this.getEditorView();
      const wrapperRect = this.$refs.editorWrapper?.getBoundingClientRect?.();
      const targetDom = view?.nodeDOM(target.from);
      const targetRect = targetDom?.getBoundingClientRect?.();
      if (!wrapperRect || !targetRect) {
        return;
      }
      const dropPosition = event.clientY < targetRect.top + targetRect.height / 2 ? 'before' : 'after';
      this.blockDragTarget = {
        ...target,
        dropPosition,
        insertPosition: dropPosition === 'before' ? target.from : target.to
      };
      this.blockDragIndicator = {
        visible: true,
        top: Math.max((dropPosition === 'before' ? targetRect.top : targetRect.bottom) - wrapperRect.top, 0),
        left: Math.max(targetRect.left - wrapperRect.left, 0),
        width: Math.max(targetRect.width, 80)
      };
    },
    handleBlockDragEnd(event) {
      if (!this.isDraggingBlock) {
        return;
      }
      event.preventDefault();
      const source = this.blockDragSource;
      const target = this.blockDragTarget;
      this.removeBlockDragListeners();
      this.isDraggingBlock = false;
      this.blockDragSource = null;
      this.blockDragTarget = null;
      this.blockDragIndicator.visible = false;
      if (!source || !target) {
        return;
      }
      this.moveBlock(source, target);
    },
    removeBlockDragListeners() {
      document.removeEventListener('mousemove', this.handleBlockDragMove, true);
      document.removeEventListener('mouseup', this.handleBlockDragEnd, true);
    },
    getRootBlockRangeByCoords(clientX, clientY) {
      const view = this.getEditorView();
      const { state } = this.editor || {};
      const { doc } = state || {};
      if (!view || !doc) {
        return null;
      }
      const result = view.posAtCoords({ left: clientX, top: clientY });
      if (!result) {
        return null;
      }
      const safePos = Math.max(0, Math.min(result.pos, doc.content.size));
      const $pos = doc.resolve(safePos);
      if ($pos.depth > 0) {
        const topNode = $pos.node(1);
        const from = $pos.before(1);
        return {
          node: topNode,
          from,
          to: from + topNode.nodeSize
        };
      }
      let range = null;
      doc.descendants((node, pos) => {
        if (range || !node.type.isBlock) {
          return false;
        }
        if (pos <= safePos && safePos <= pos + node.nodeSize) {
          range = {
            node,
            from: pos,
            to: pos + node.nodeSize
          };
          return false;
        }
      });
      return range;
    },
    isSameOrInsideDragSource(target) {
      const source = this.blockDragSource;
      if (!source || !target) {
        return false;
      }
      return target.from === source.from || (target.from > source.from && target.from < source.to);
    },
    moveBlock(source, target) {
      const view = this.getEditorView();
      const { state } = this.editor || {};
      const { doc } = state || {};
      if (!view || !doc || !source.node) {
        return;
      }
      let insertPosition = target.insertPosition;
      if (insertPosition > source.from) {
        insertPosition -= source.node.nodeSize;
      }
      if (insertPosition === source.from || insertPosition === source.to) {
        return;
      }
      const slice = doc.slice(source.from, source.to);
      const tr = state.tr.delete(source.from, source.to).insert(insertPosition, slice.content);
      view.dispatch(tr.scrollIntoView());
      this.emitChange();
      this.$nextTick(() => {
        this.getAllHeadings(this.editor);
      });
    },
    tableRowColHeadClick({ event, index, type, rowHeight }) {
      if (!this.isContentEditable) {
        return;
      }
      const editorWrapperRect = this.$refs?.editorWrapper?.getBoundingClientRect();
      const { nodeType, attrs } = this.findTableNodeByUuid({ editor: this.editor, uuid: this.tableUuid }) || {};

      this.isShowSelectContentMenu = true;
      this.nodeName = 'table';
      this.selectContentMenuPos = this.normalizeSelectContentMenuPosition({
        top: event.clientY - editorWrapperRect.top - 60,
        left: event.clientX - editorWrapperRect.left
      });
      this.nodeConfig = {
        nodeType,
        nodeAttrs: attrs,
        index,
        type
      };

      if (type === 'row') {
        this.selectContentMenuPos = this.normalizeSelectContentMenuPosition({
          top: event.clientY - editorWrapperRect.top - rowHeight - 15,
          left: event.clientX - editorWrapperRect.left + 6
        });
        this.handleSelectMenuContent({
          menuData: {
            commandName: 'selectedRow',
            options: { nodeType, nodeAttrs: attrs, index, type: 'row' }
          },
          editor: this.editor,
          hoverBlockDom: this.hoverBlockDom
        });
      }
      if (type === 'column') {
        this.handleSelectMenuContent({
          menuData: {
            commandName: 'selectedColumn',
            options: { nodeType, nodeAttrs: attrs, index, type: 'column' }
          },
          editor: this.editor,
          hoverBlockDom: this.hoverBlockDom
        });
      }
      this.$nextTick(() => {
        this.selectContentMenuPos = this.normalizeSelectContentMenuPosition(this.selectContentMenuPos);
      });
    },
    highlightHeading(node, editor) {
      const isHeading = editor.isActive('heading');
      const contentObj = editor.getJSON();
      const uuid = node.attrs?.blockUuid || '';
      if (isHeading) {
        this.selectHeadingUuid = uuid;
      } else {
        const contentList = [...(contentObj.content || [])].reverse();
        const index = contentList.findIndex(item => item?.attrs?.blockUuid === uuid);
        for (let i = index + 1; i < contentList.length; i++) {
          if (contentList[i].type === 'heading') {
            this.selectHeadingUuid = contentList[i].attrs.blockUuid;
            break;
          }
        }
      }
    },
    selectHeading(item) {
      if (!this.editor || this.editor.isDestroyed || this.isDestroyingEditor) {
        return;
      }
      const { doc } = this.editor.state || {};
      if (!doc) {
        return;
      }
      let targetPos = null;
      doc.descendants((node, pos) => {
        if (item.uuid === node.attrs.blockUuid) {
          targetPos = pos + 1;
          return false;
        }
      });
      if (targetPos !== null) {
        this.editor.commands.focus();
        this.editor.commands.setTextSelection(targetPos);
      }
    },
    handleClickPlus() {},
    async uploadFileToServer(file) {
      let formData = new FormData();
      formData.append('file', file);
      formData.append('param', 'file');
      formData.append('type', 'knowledge');
      formData.append('responseType', 'blob');
      let res = await this.$api.knowledge.knowledge.uploadFile(formData);
      return res.Return.url;
    },
    handleMouse(status) {
      if (!this.isContentEditable || !this.hoverBlockDom || !this.editor) return;

      const view = this.getEditorView();
      if (!view) return;
      const { state } = this.editor;
      const pos = view.posAtDOM(this.hoverBlockDom, 0);
      if (pos == null) return;

      const $pos = state.doc.resolve(pos);
      const range = $pos.blockRange();
      if (!range) return;

      const from = range.start;
      const to = range.end;

      view.dispatch(
        state.tr.setMeta(hoverHighlightKey, status ? { add: { from, to } } : { clear: true })
      );
    },
    getCompareTagClass(tag = {}) {
      return tag.changeType ? `knowledge-compare-mark knowledge-compare-${tag.changeType}` : '';
    }
  },
  computed: {
    isTitleEditable() {
      return !this.compareMode && !this.readonly && this.canEditTitle;
    },
    isContentEditable() {
      return !this.compareMode && !this.readonly && this.canEditContent;
    },
    isShowHeadInfo() {
      return !this.readonly;
    },
    compareTagList() {
      return this.meta?.tagCompareList || [];
    },
    hasCompareMetaInfo() {
      return this.compareMode && this.compareTagList.length > 0;
    },
    getMenuClass() {
      return item => {
        const className = 'heading-level-' + item.level;
        if (item.hasOwnProperty('isHide') && item.isHide) {
          return className + ' hide';
        }
        return className;
      };
    },
    getHeadingIcon() {
      return item => {
        let classStr = '';
        if (item.hasOwnProperty('showNextIcon')) {
          classStr += item.showNextIcon ? 'tsfont-drop-down' : 'tsfont-drop-right';
        } else if (item.level === 1) {
          classStr += 'tsfont-dot';
        }
        return classStr;
      };
    }
  },
  watch: {
    documentTitle(val) {
      if (val !== this.title) {
        this.title = val || '';
      }
    },
    documentConfig: {
      handler(val) {
        if (!this.compareMode && val && this.editor) {
          this.setData(val);
        }
      },
      deep: true
    },
    oldDocumentVo: {
      handler() {
        if (this.compareMode) {
          this.setCompareData();
        }
      },
      deep: true
    },
    newDocumentVo: {
      handler() {
        if (this.compareMode) {
          this.setCompareData();
        }
      },
      deep: true
    },
    compareSide() {
      if (this.compareMode) {
        this.setCompareData();
      }
    },
    compareMode(val) {
      if (!this.editor) {
        return;
      }
      if (val) {
        this.setCompareData();
      } else if (this.documentConfig) {
        this.setData(this.documentConfig);
      }
    },
    isContentEditable(val) {
      if (this.editor && !this.editor.isDestroyed) {
        this.editor.setEditable(val);
      }
      if (!val) {
        this.hidePlus();
        this.isShowSelectContentMenu = false;
        this.isShowSearchReplaceDialog = false;
      }
    }
  }
};
</script>

<style lang="less">
@import './index.less';
.editor-main {
  height: calc(100vh - 116px);
  display: grid;
  grid-template-columns: 200px auto;
  border-radius: 10px;
  .editor-menu {
    padding: 20px;
    overflow: auto;
    .hide {
      display: none;
    }
    .menu-text {
      position: relative;
    }
    .heading-icon {
      position: absolute;
      left: -14px;
    }
    .heading-level-1 {
      padding-left: 0px;
    }
    .heading-level-2 {
      padding-left: 14px;
    }
    .heading-level-3 {
      padding-left: 28px;
    }
  }
}
.knowledge-editor-box {
  position: relative;
  .row-action-btn {
    position: fixed;
    width: 16px;
    height: 16px;
    background: var(--knowledge-editor-primary);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    pointer-events: none;
  }
}
.knowledge-document-editor-drag-indicator {
  position: absolute;
  height: 2px;
  background: var(--knowledge-editor-primary);
  border-radius: 2px;
  z-index: 20;
  pointer-events: none;
  &:before {
    content: '';
    position: absolute;
    left: -4px;
    top: -3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--knowledge-editor-primary);
  }
}
.editor-content-container {
  line-height: 26px;
}
.block-hover-highlight {
  background-color: var(--knowledge-editor-primary-bg) !important;
  border-radius: 5px;
  transition: background-color 0.15s ease;
}
</style>
