<template>
  <div class="knowledge-editor-box">
    <div class="editor-main" @click.stop="() => hidePlus()">
      <div class="editor-menu">
        <ul>
          <li v-for="(item, index) in menuList" :key="index" :class="getMenuClass(item)">
            <div class="menu-text" @click="selectHeading(item)">
              <span class="heading-icon" :class="getHeadingIcon(item)" @click.stop="handleClick(item, index)"></span>
              <span :class="{ 'text-href': selectHeadingUuid === item.uuid }">{{ item.text }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div class="editor-wrapper bg-op">
        <div class="head-info-box">
          <TsFormInput
            v-model="title"
            border="none"
            class="document-title"
            placeholder="请输入标题"
          ></TsFormInput>
          <DocumentTag class="mt-nm"></DocumentTag>
          <div class="border-base-bottom mt-nm mb-nm"></div>
        </div>
        <div
          ref="editorWrapper"
          class="editor-content-box"
          @mousemove="handleMouseMove"
          @mouseleave="hidePlus"
          @click="handleClickPlus"
        >
          <div ref="editorContentContainer" class="editor-content-container" @click.stop>
            <EditorContent v-if="editor" :editor="editor" class="editor-content"></EditorContent>
          </div>
          <BlockMenu
            v-show="isShowBlockMenu"
            :isEmptyRow="isEmptyRow"
            :menuPosition="menuPosition"
            :nodeConfig="blockMenuNodeConfig"
            @insert-menu-content="handleInsertMenuContent"
            @replace-menu-content="handleReplaceMenuContent"
            @insert-below-position="handleInsertBelowPosition"
          ></BlockMenu>
          <SelectContentMenu
            v-show="isShowSelectContentMenu"
            ref="selectContentMenuRef"
            :nodeConfig="nodeConfig"
            :nodeName="nodeName"
            :style="{ top: `${selectContentMenuPos.top}px`, left: `${selectContentMenuPos.left}px` }"
            @executeEditorCommand="(menuData)=> executeEditorCommand({menuData: menuData, _this: this})"
          ></SelectContentMenu>
          <TableHoverLayer
            v-show="isShowTableMenu"
            :tableMenuPosition="tableMenuPosition"
            :tableUuid="tableUuid"
            :row-height-list="rowHeightList"
            :editor="editor"
            @click="tableClick"
          ></TableHoverLayer>
        </div>
      </div>
    </div>
    <Button
      style="position: absolute; right: 20px; top: 10px"
      type="primary"
      class="mr-xs"
      @click="getData()"
    >保存</Button>
    <SearchReplaceDialog
      v-if="isShowSearchReplaceDialog"
      :editor="editor"
      :selectedText="selectedText"
      @close="
        () => {
          isShowSearchReplaceDialog = false;
        }
      "
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
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import Image from '@tiptap/extension-image';
import ExtensionsList from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/index.js';
import BaseMixin from './base.js';
import { menuState } from './state.js';
import { SearchHighlight } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/search-highlight.js';
import { PasteUploadImages } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/paste-imges.js'; 
import { ImageResize } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/image-resize.js';
import { RowColSelected } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/table/row-col-selected/index.js';
import { TableUtils } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/table/table-utils.js';
import DataContent from './data.js';  
export default {
  components: {
    EditorContent,
    BlockMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/index.vue'),
    SelectContentMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/index.vue'),
    TableHoverLayer: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/table-hover-layer/index.vue'),
    SearchReplaceDialog: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/components/search-replace-dialog/index.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    DocumentTag: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/components/tag/index.vue')
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
    }
  },
  data() {
    return {
      nodeConfig: null,
      tableUuid: '',
      title: this.documentTitle,
      isShowSelectContentMenu: false,
      isShowBlockMenu: false,
      isShowSearchReplaceDialog: false,
      isShowTableMenu: false,
      tableMenuPosition: {
        top: -12,
        left: 0
      },
      selectContentMenuPos: { // 选中内容菜单的位置
        top: 0,
        left: 0
      },
      isEmptyRow: false, // 是否是空行，用于判断显示鼠标经过时的加号
      editor: null,
      menuPosition: { top: 0, left: 0 },
      currentBlock: null,
      menuList: [],
      selectHeadingUuid: '',
      selectedText: '',
      nodeName: '', // 节点名称，如：heading、paragraph、listItem等
      blockMenuNodeConfig: {
        type: '',
        attrs: {}
      },
      rowHeightList: [] // 行高列表
    };
  },
  mounted() {
    let _this = this;
    this.editor = new Editor({
      // // 启用核心扩展（包含粘贴处理）
      // enableCoreExtensions: true,
      // // 配置核心扩展选项
      // coreExtensionOptions: {
      //   clipboardTextSerializer: {
      //     // 设置块级元素分隔符，例如段落之间用两个换行符分隔
      //     blockSeparator: '\n\n'
      //   }
      // },
      // // 启用粘贴规则系统
      // enablePasteRules: true,
      extensions: [
        StarterKit.configure({
          bulletList: {
            itemTypeName: 'listItem',
            HTMLAttributes: {
              class: 'bullet-list'
            }
          },
          orderedList: {
            itemTypeName: 'listItem',
            HTMLAttributes: {
              class: 'ordered-list'
            }
          },
          heading: {
            HTMLAttributes: {
              class: 'heading'
            }
          }
        }),
        Placeholder.configure({
          placeholder: '可在此处输入内容'
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph']
        }),
        Image,
        Table.configure({
          resizable: true
        }),
        TableRow,
        TableCell,
        TableHeader,
        TextStyleKit,
        ImageResize,
        RowColSelected,
        TableUtils,
        PasteUploadImages.configure({
          upload: file => {
            // 返回 Promise<string>（图片 url）
            return _this.uploadFileToServer(file);
          },
          uploadExternalImages: true // 是否把外链强制下载再上传（true 推荐）
        }),
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        ...ExtensionsList,
        SearchHighlight
      ],
      content: DataContent,
      onUpdate({ editor }) {
        _this.getAllHeadings(editor);
      },
      onFocus({ editor, event }) {
        const { $from } = editor?.state?.selection;
        const node = $from.node($from.depth);
        _this.highlightHeading(node, editor);
      }
    });
    // 监听 selectionUpdate 事件，当选择变化时，高亮当前选中的标题
    this?.editor?.on('selectionUpdate', ({ editor, event }) => {
      // 编辑器获得焦点。
      const { $from, from, to } = editor?.state?.selection;
      this.isShowSelectContentMenu = from != to;
      this.selectedText = editor?.state?.doc?.textBetween(from, to);
      const selectionRect = posToDOMRect(editor.view, from, to);
      const editorWrapperRect = this.$refs?.editorWrapper?.getBoundingClientRect();
      const textSelectedMenuRect = this.$refs?.selectContentMenuRef?.$refs?.bubbleMenuRef?.getBoundingClientRect();
      const { width: bubbleMenuWidth = 0 } = textSelectedMenuRect || {};
      const { top: editorWrapperTop = 0, left: editorWrapperRectLeft = 0 } = editorWrapperRect || {};
      const { top: selectionRectTop = 0, height: selectionRectHight = 0, left: selectionRectLeft = 0, width: selectionRectWidth = 0 } = selectionRect || {};
      this.selectContentMenuPos = {
        top: (selectionRectTop + selectionRectHight - editorWrapperTop + 5).toFixed(0),
        left: Math.max(selectionRectLeft + selectionRectWidth / 2 - editorWrapperRectLeft - bubbleMenuWidth / 2, 10)
      };
      const node = $from.node($from.depth);
      this.nodeName = editor.isActive('table') ? 'table' : editor.isActive('image') ? 'ImageView' : node?.type?.name;
      _this.highlightHeading(node, editor);
    });
    this.editor?.view?.dom?.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault(); // 阻止浏览器默认搜索
        this.isShowSearchReplaceDialog = true;
      }
    });
    menuState.editorData = this.editor;
  },
  beforeDestroy() {
    // this.editor?.destroy();
  },
  methods: {
    getData() {
      const saveData = this.editor.getJSON();
      console.log(saveData);
    },
    getAllHeadings(editor) {
      const $headings = editor.$nodes('heading');
      let headings = [];
      $headings.forEach((node, index) => {
        let obj = {
          level: node.attributes.level,
          text: node.textContent,
          uuid: node.attributes['data-uuid']
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
    handleMouseMove: throttle(function(event) {
      const wrapper = this.$refs.editorWrapper;
      const editorEl = wrapper?.querySelector('.ProseMirror');
      if (event.target.closest('.plus-button') || event.target.closest('.drag-button') || event.target.closest('.menu-wrapper')) {
        return;
      }
      if (!editorEl?.contains(event.target)) {
        return;
      }
      const { view, state } = this.editor;
      const coords = { left: event.clientX, top: event.clientY };
      const position = view.posAtCoords(coords);
      let currentBlock = null;
      if (position) {
        const $pos = state?.doc?.resolve(position.pos);
        if ($pos && $pos.depth > 0) {
          const node = $pos.node($pos.depth); // 获取当前节点
          const parentNode = $pos.node($pos.depth - 1);
          const parentNodeType = parentNode?.type?.name;
          let nodeType = node?.type?.name;
          let nodeAttrs = node?.attrs || {};
          if (parentNodeType === 'listItem' || parentNodeType === 'taskItem') {
            const parentNode = $pos.node($pos.depth - 2);
            nodeType = parentNode?.type?.name;
            nodeAttrs = parentNode?.attrs || {};
          } else if (nodeType === 'paragraph') {
            nodeType = parentNodeType;
            nodeAttrs = parentNode?.attrs || {};
            if (nodeType === 'doc') {
              // 如果父节点是文档根节点，将节点类型设置为 'paragraph'
              nodeType = 'paragraph';
              nodeAttrs = {};
            }
          }
          const dom = view.nodeDOM($pos.before($pos.depth));
          this.$set(this.blockMenuNodeConfig, 'type', nodeType);
          this.$set(this.blockMenuNodeConfig, 'attrs', nodeAttrs);
          if (this.isEmptyBlock(node)) {
            this.isEmptyRow = true;
          } else {
            this.isEmptyRow = false;
          }
          if (dom && dom.nodeType === 1) { // 确保dom是一个元素节点
            currentBlock = dom;
          }
          if (currentBlock === this.currentBlock) return;
          this.currentBlock = currentBlock;
          const blockRect = currentBlock.getBoundingClientRect();
          const wrapperRect = wrapper.getBoundingClientRect();
          
          if (this.isInTable(event)) {
            const cell = event.target.closest('td, th');
            const table = cell?.closest('table');
            const tableRect = table?.getBoundingClientRect();
            const tableNodeAttr = this.getTableNode({editor: this.editor, event: event});
            const { attrs } = tableNodeAttr || {};
            this.tableUuid = attrs?.['data-uuid'];
            this.rowHeightList = this.getTableRowHeights(table);
            if (tableRect) {
              this.isShowTableMenu = true;
              this.tableMenuPosition = {
                top: Number((tableRect.top - wrapperRect.top)).toFixed(0) <= 0 ? -10 : Number((tableRect.top - wrapperRect.top).toFixed(0)) - 10, // 16 头部点击菜单的高度
                left: Number((tableRect.left - wrapperRect.left).toFixed(0))
              };
            }
          } else {
            this.menuPosition = {
              top: Number((blockRect.top - wrapperRect.top + blockRect.height / 2 - 1).toFixed(0)),
              left: -50
            };
            // this.isShowTableMenu = false;
            this.isShowBlockMenu = true;
          }
        }
      }
    }, 500),
    getTableRowHeights(tableEl) {
      if (!tableEl) return [];
      return Array.from(
        tableEl.querySelectorAll('tbody > tr')
      ).map(tr => tr.getBoundingClientRect().height);
    },
    hidePlus: throttle(function() {
      // this.currentBlock = null;
    }, 400),
    tableClick({event, index, type}) {
      const editorWrapperRect = this.$refs?.editorWrapper?.getBoundingClientRect();
      const { nodeType, attrs } = this.findTableNodeByUuid({editor: this.editor, uuid: this.tableUuid}) || {};
      this.nodeConfig = {
        nodeType: nodeType,
        nodeAttrs: attrs,
        index: index,
        type: type
      };
      this.isShowSelectContentMenu = true;
      this.nodeName = 'table';
      this.selectContentMenuPos = {
        top: event.clientY - editorWrapperRect.top - 57,
        left: event.clientX - editorWrapperRect.left
      };
      if (type == 'row') {
        this.selectContentMenuPos = {
          top: event.clientY - editorWrapperRect.top - 60,
          left: event.clientX - editorWrapperRect.left
        };
        this.executeEditorCommand({
          menuData: {
            commandName: 'selectedRow',
            value: {
              nodeType: nodeType,
              nodeAttrs: attrs,
              index: index,
              type: 'row'
            }
          },
          _this: this
        });
      }
      if (type === 'column') {
        this.executeEditorCommand({
          menuData: {
            commandName: 'selectedColumn',
            value: {
              nodeType: nodeType,
              nodeAttrs: attrs,
              index: index,
              type: 'column'
            }
          },
          _this: this
        });
      }
    },
    isTextContentEmpty(node) {
      return node.textContent.trim() === '';
    },
    isImageOrVideoEmpty(node) {
      // 判断图片和视频是否有有效的 src
      return !node.attrs.src;
    },
    isEmptyBlock(node) {
      // 判断是否是空行
      const menuMap = {
        'heading': this.isTextContentEmpty,
        'paragraph': this.isTextContentEmpty,
        'listItem': this.isTextContentEmpty,
        'taskItem': this.isTextContentEmpty,
        'codeBlock': this.isTextContentEmpty,
        'blockquote': this.isTextContentEmpty,
        'highlight': this.isTextContentEmpty,
        'image': this.isImageOrVideoEmpty,
        'insertVideo': this.isImageOrVideoEmpty
      };
      const checkStrategy = menuMap[node.type.name]; // 根据节点类型获取对应的判断策略
      if (checkStrategy) {
        return checkStrategy(node); // 调用对应的策略判断
      }
      // 对于有子节点的块，递归检查子节点
      if (node.childCount > 0) {
        for (let i = 0; i < node.childCount; i++) {
          const childNode = node.child(i);
          if (!this.isEmptyBlock(childNode)) {
            return false; // 只要有一个非空的子节点，就认为该节点不是空的
          }
        }
      }
      return true; // 如果没有子节点或所有子节点都是空的，则认为节点为空
    },
    isInTable(e) {
      const position = this.editor.view.posAtCoords({
        left: e.clientX,
        top: e.clientY
      });
      if (!position) return false;

      const $pos = this.editor.state.doc.resolve(position.pos);

      for (let d = $pos.depth; d > 0; d--) {
        if ($pos.node(d).type.name === 'table') {
          return true;
        }
      }
      return false;
    },
    highlightHeading(node, editor) {
      const isHeading = editor.isActive('heading');
      const contentObj = editor.getJSON();
      const uuid = node.attrs?.['data-uuid'] || '';
      if (isHeading) {
        this.selectHeadingUuid = uuid;
      } else {
        const contentList = contentObj.content.reverse();
        const index = contentList.findIndex(item => item?.attrs?.['data-uuid'] === uuid);
        for (let i = index + 1; i < contentList.length; i++) {
          if (contentList[i].type === 'heading') {
            this.selectHeadingUuid = contentList[i].attrs['data-uuid'];
            break;
          }
        }
      }
    },
    selectHeading(item) {
      const { doc } = this.editor.state;
      let targetPos = null;

      doc.descendants((node, pos) => {
        // 假设节点属性里有 node.attrs['data-uuid']
        if (item.uuid === node.attrs['data-uuid']) {
          // 光标放在节点内容开头
          targetPos = pos + 1;
          return false; // 找到就停止遍历
        }
      });

      if (targetPos !== null) {
        this.editor.commands.focus();
        this.editor.commands.setTextSelection(targetPos);
      }
    },
    handleClickPlus() {
      // this.editor.chain().focus('end').run();
    },
    async uploadFileToServer(file) {
      let formData = new FormData();
      formData.append('file', file);
      formData.append('param', 'file');
      formData.append('type', 'knowledge');
      formData.append('responseType', 'blob');
      let res = await this.$api.knowledge.knowledge.uploadFile(formData);
      return res.Return.url;
    }
  },
  computed: {
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
          classStr = classStr + (item.showNextIcon ? 'tsfont-drop-down' : 'tsfont-drop-right');
        } else if (item.level == 1) {
          classStr = classStr + 'tsfont-dot';
        }
        return classStr;
      };
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
    background: #3b82f6;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    pointer-events: none;
  }
}
</style>
