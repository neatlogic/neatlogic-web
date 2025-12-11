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
          <!-- <ToolBar class="mb-nm" @insert-menu-content="(menuContentData) => executeEditorCommand({menuData: menuContentData, currentInstanceThis: this})"></ToolBar> -->
          <div ref="editorContentContainer" class="editor-content-container" @click.stop>
            <EditorContent v-if="editor" :editor="editor" class="editor-content"></EditorContent>
          </div>
          <BlockMenu
            v-show="isShowBlockMenu"
            :isEmptyRow="isEmptyRow"
            :menuPosition="menuPosition"
            :currentNode="currentNode"
            @insert-menu-content="handleInsertMenuContent"
            @replace-menu-content="handleReplaceMenuContent"
            @insert-below-position="handleInsertBelowPosition"
          ></BlockMenu>
          <TextSelectedMenu
            v-show="isShowBubbleMenu"
            ref="textSelectedMenuWrapper"
            :selectedNodeTypeName="selectedNodeTypeName"
            :style="{ top: `${textSelectedMenuPosition.top}px`, left: `${textSelectedMenuPosition.left}px` }"
            @executeEditorCommand="(menuData)=> executeEditorCommand({menuData: menuData, currentInstanceThis: this})"
          ></TextSelectedMenu>
          <div
            v-show="isShowTableMenu"
            :style="{
              position: 'absolute',
              top: `${tableMenuPosition.top}px`,
              left: `${tableMenuPosition.left}px`
            }"
            @click.stop
          >
            <div style="width: 100px;height: 16px;" class="bg-grey radius-sm text-center cursor-pointer">
              <span
                class="tsfont-option-horizontal"
                @click.stop="()=> {
                  isShowBubbleMenu = true;
                  selectedNodeTypeName = 'table';
                  textSelectedMenuPosition = {
                    top: tableMenuPosition.top - 25,
                    left: tableMenuPosition.left - 30
                  }
                  isShowTableMenu = false;
                }"
              ></span>
            </div>
          </div>
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
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import ExtensionsList from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/index.js';
import BaseMixin from './base.js';
import { menuState } from './state.js';
import { SearchHighlight } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/search-highlight.js';
import DataContent from './data.js';
export default {
  components: {
    EditorContent,
    BlockMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/index.vue'),
    // ToolBar: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/toolbar/index.vue'),
    TextSelectedMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/text-selected-menu/index.vue'),
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
      title: this.documentTitle,
      isShowBubbleMenu: false,
      isShowBlockMenu: false,
      isShowSearchReplaceDialog: false,
      isShowTableMenu: false,
      tableMenuPosition: {
        top: 0,
        left: 0
      },
      textSelectedMenuPosition: {
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
      selectedNodeTypeName: '', // 选中的节点类型名称
      currentNode: {
        type: '',
        attrs: {}
      }
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
        TableKit.configure({
          table: { resizable: true }
        }),
        TextStyleKit,
        Image,
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        ...ExtensionsList,
        SearchHighlight
      ],
      content: '<p>欢迎使用知识文档编辑器</p>',
      onUpdate({ editor }) {
        _this.getAllHeadings(editor);
      },
      onFocus({ editor, event }) {
        const { $from } = editor?.state?.selection;
        const node = $from.node($from.depth);
        _this.highlightHeading(node, editor);
      },
      onPaste(e, slice) {
        // 处理粘贴事件
        e.preventDefault();
        return true;
      }
    });
    // 监听 selectionUpdate 事件，当选择变化时，高亮当前选中的标题
    this?.editor?.on('selectionUpdate', ({ editor, event }) => {
      // 编辑器获得焦点。
      const { $from, from, to } = editor?.state?.selection;
      this.isShowBubbleMenu = from != to;
      this.selectedText = editor?.state?.doc?.textBetween(from, to);
      const selectionRect = posToDOMRect(editor.view, from, to);
      const editorWrapperRect = this.$refs?.editorWrapper?.getBoundingClientRect();
      const textSelectedMenuRect = this.$refs?.textSelectedMenuWrapper?.$refs?.bubbleMenuRef?.getBoundingClientRect();
      const { width: bubbleMenuWidth = 0 } = textSelectedMenuRect || {};
      const { top: editorWrapperTop = 0, left: editorWrapperRectLeft = 0 } = editorWrapperRect || {};
      const { top: selectionRectTop = 0, height: selectionRectHight = 0, left: selectionRectLeft = 0, width: selectionRectWidth = 0 } = selectionRect || {};
      this.textSelectedMenuPosition = {
        top: (selectionRectTop + selectionRectHight - editorWrapperTop + 5).toFixed(0),
        left: Math.max(selectionRectLeft + selectionRectWidth / 2 - editorWrapperRectLeft - bubbleMenuWidth / 2, 10)
      };
      const node = $from.node($from.depth);
      this.selectedNodeTypeName = editor.isActive('table') ? 'table' : node?.type?.name;
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
      console.log(JSON.stringify(saveData, null, 2));
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
      const editorContentContainer = this.$refs?.editorContentContainer;
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
          this.$set(this.currentNode, 'type', nodeType);
          this.$set(this.currentNode, 'attrs', nodeAttrs);
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
          const editorContentContainerRect = editorContentContainer.getBoundingClientRect();
    
          if (this.isInTable(event)) {
            this.isShowTableMenu = true;
            this.tableMenuPosition = {
              top: Number((blockRect.top - wrapperRect.top - blockRect.height - 6).toFixed(0)),
              left: Number((blockRect.left - editorContentContainerRect.left + 100 / 2).toFixed(0))
            };
          } else {
            this.menuPosition = {
              top: Number((blockRect.top - wrapperRect.top + blockRect.height / 2 - 12).toFixed(0)),
              left: -50
            };
            this.isShowTableMenu = false;
            this.isShowBlockMenu = true;
          }
        }
      }
    }, 500),
    hidePlus: throttle(function() {
      // this.currentBlock = null;
    }, 400),
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
