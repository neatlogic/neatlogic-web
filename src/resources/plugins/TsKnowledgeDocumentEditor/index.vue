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
          <TipTapMenu
            :isEmptyRow="isEmptyRow"
            :plusPos="plusPos"
            @insert-menu-content="handleInsertMenuContent"
            @replace-menu-content="replaceMenuContent"
          ></TipTapMenu>
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
import InsertMenuCommands from '@/resources/plugins/TsKnowledgeDocumentEditor/commands/index.js';
import { SearchHighlight } from '@/resources/plugins/TsKnowledgeDocumentEditor/extensions/search-highlight.js';

export default {
  components: {
    EditorContent,
    TipTapMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/index.vue'),
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
      plusPos: { top: 0, left: 0 },
      plusBlock: null,
      menuList: [],
      selectHeadingUuid: '',
      selectedText: '',
      selectedNodeTypeName: '' // 选中的节点类型名称
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
          }
        }),
        Placeholder.configure({
          placeholder: '可在此处输入内容' // 这是全局 placeholder
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
      content: '<h1>欢迎使用这是一个示例文档</h1>',
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
        console.log(e, slice);
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
      let json = this.editor.getJSON();
      console.log(json);
    },
    getAllHeadings(editor) {
      const $headings = editor.$nodes('heading');
      let headings = [];
      $headings.forEach((node, index) => {
        let obj = {
          level: node.attributes.level,
          text: node.textContent,
          uuid: node.attributes.uuid
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
      // 👉 如果鼠标在 + 按钮上，直接忽略，不隐藏
      if (event.target.closest('.plus-button') || event.target.closest('.drag-button') || event.target.closest('.menu-wrapper')) {
        return;
      }
      if (!editorEl?.contains(event.target)) {
        return;
      }
      // 找到当前块元素
      let block = event.target.closest('p,h1, h2, h3, h4, h5, h6, li, blockquote, pre,div, table');
      if (!block) {
        // 如果是空行，用 posAtCoords + nodeDOM 获取
        const coords = { left: event.clientX, top: event.clientY };
        const pos = this.editor?.view?.posAtCoords(coords);
        if (pos) {
          const $pos = this.editor?.state?.doc?.resolve(pos.pos);
          const dom = this.editor?.view?.nodeDOM($pos?.before($pos?.depth));
          if (dom && dom.nodeType === 1) block = dom;
        }
        this.isEmptyRow = true;
      } else {
        // 非空行
        const isEmptyBlock = block?.textContent?.trim() === '';
        if (isEmptyBlock) {
          this.isEmptyRow = true;
        } else {
          this.isEmptyRow = false;
        }
      }
      if (!block || block === this.plusBlock) return;

      this.plusBlock = block;
      const blockRect = block.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const editorContentContainerRect = editorContentContainer.getBoundingClientRect();
    
      if (this.isInTable(event)) {
        this.isShowTableMenu = true;
        this.tableMenuPosition = {
          top: Number((blockRect.top - wrapperRect.top - blockRect.height - 6).toFixed(0)),
          left: Number((blockRect.left - editorContentContainerRect.left + 100 / 2).toFixed(0))
        };
      } else {
        this.plusPos = {
          top: Number((blockRect.top - wrapperRect.top + blockRect.height / 2 - 12).toFixed(0)),
          left: -46
        };
        this.isShowTableMenu = false;
      }
    }, 300),
    hidePlus: throttle(function() {
      this.plusBlock = null;
    }, 400),
    isInTable(e) {
      const pos = this.editor.view.posAtCoords({
        left: e.clientX,
        top: e.clientY
      });
      if (!pos) return false;

      const $pos = this.editor.state.doc.resolve(pos.pos);

      for (let d = $pos.depth; d > 0; d--) {
        if ($pos.node(d).type.name === 'table') {
          return true;
        }
      }
      return false;
    },
    getInsertPosition() {
      const view = this?.editor?.view;
      const coords = this.plusBlock?.getBoundingClientRect();
      const pos = coords ? view?.posAtCoords({ left: coords.left, top: coords.top }) : null;
      // 获取光标所在 resolved position
      const { $from } = this.editor.state.selection;
      // 如果外部传入 pos，就用 pos，否则用当前光标所在 block 的结束位置
      let insertPos = pos?.pos ? pos.pos + 1 : $from.end() + 1;
      if (this.$utils.isEmpty($from.doc.textContent)) {
        insertPos = insertPos - 1;
      }
      return insertPos;
    },
    handleInsertMenuContent(menuData) {
      if (!this.editor) return;
      const insertPos = this.getInsertPosition();
      const { commandName, value = {} } = menuData;
      const commandMethod = InsertMenuCommands[commandName];
      if (commandMethod) {
        commandMethod({
          editor: this.editor,
          pos: insertPos,
          options: value,
          https: this.$https
        });
      }
    },
    highlightHeading(node, editor) {
      const isHeading = editor.isActive('heading');
      const contentObj = editor.getJSON();
      const uuid = node.attrs?.uuid || '';
      if (isHeading) {
        this.selectHeadingUuid = uuid;
      } else {
        const contentList = contentObj.content.reverse();
        const index = contentList.findIndex(item => item?.attrs?.uuid === uuid);
        for (let i = index + 1; i < contentList.length; i++) {
          if (contentList[i].type === 'heading') {
            this.selectHeadingUuid = contentList[i].attrs.uuid;
            break;
          }
        }
      }
    },
    selectHeading(item) {
      const { doc } = this.editor.state;
      let targetPos = null;

      doc.descendants((node, pos) => {
        // 假设节点属性里有 node.attrs.uuid
        if (item.uuid === node.attrs.uuid) {
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
      this.editor.chain().focus('end').run();
    },
    replaceMenuContent(menuData) {
      const { type: nodeName, category } = menuData;
      // 替换当前光标所在的节点内容
      const { view, state } = this.editor;

      // 1. 获取 posAtCoords 或 fallback 光标
      let posResult = null;
      if (this.plusBlock) {
        const coords = this.plusBlock.getBoundingClientRect();
        posResult = view.posAtCoords({ left: coords.left, top: coords.top });
      }

      let $pos;
      if (posResult?.pos != null) {
        $pos = state.doc.resolve(posResult.pos);
      } else {
        // fallback 用光标所在位置
        const { $from } = state.selection;
        $pos = $from;
      }

      // 2. 找到最近的 block 节点
      let node, nodeStart, nodeEnd;
      for (let depth = $pos.depth; depth > 0; depth--) {
        const tempNode = $pos.node(depth);
        if (tempNode.type.isBlock) {
          node = tempNode;
          nodeStart = $pos.before(depth);
          nodeEnd = nodeStart + node.nodeSize;
          break;
        }
      }
      console.log('node', node, nodeName);
      if (!node) return; // 没找到 block，直接返回
      const nodeTextContent = node.textContent;
      if (node && nodeTextContent) {
        const { schema } = view.state;
        // 假设替换成 heading
        let attrs = {};
        if (category === 'basic') {
          if (nodeName == 'heading1') {
            attrs = { level: 1 };
            // this.editor.commands.setNode('heading', { level: 1 });
          } else if (nodeName == 'heading2') {
            attrs = { level: 2 };
            // this.editor.commands.setNode('heading', { level: 2 });
          } else if (nodeName == 'heading3') {
            attrs = { level: 3 };
            // this.editor.commands.setNode('heading', { level: 3 });
          } else if (nodeName == 'orderedList') {
            // this.editor.commands.setNode('paragraph');
          }
          // 3. 创建新节点（保留内容）
          const newNode = schema.nodes.heading.create(attrs, schema.text(nodeTextContent));

          // 4. 替换
          view.dispatch(state.tr.replaceWith(nodeStart, nodeEnd, newNode));
          console.log('node', nodeStart, nodeEnd, nodeTextContent);
        } else if (category === 'operation') {
          if (nodeName === 'delete') {
            //删除
            this.editor.commands.deleteRange({ from: nodeStart, to: nodeEnd });
          } else if (nodeName === 'cut') {
            // 剪切
            this.editor.commands.deleteRange({ from: nodeStart, to: nodeEnd });
            navigator.clipboard.writeText(nodeTextContent);
          } else if (nodeName === 'copy') {
            // 复制
            this.editor.chain().focus().setTextSelection({ from: nodeStart, to: nodeEnd }).run();
            // 获取选中文本
            const selectedText = this.editor.state.doc.textBetween(nodeStart, nodeEnd, '\n');
            console.log('selectedText', selectedText);
            // 复制到剪贴板
            if (navigator.clipboard) {
              navigator.clipboard.writeText(selectedText).then(() => {
                console.log('文本复制成功');
              });
            } else {
              // 降级方案
              const textArea = document.createElement('textarea');
              textArea.value = selectedText;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
            }
          }
        }
      }
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
