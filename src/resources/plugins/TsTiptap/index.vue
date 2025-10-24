<template>
  <div class="editor-main" @click.stop="()=> hidePlus()">
    <div class="editor-menu">
      <ul>
        <li v-for="(item, index) in menuList" :key="index" :class="getMenuClass(item)">
          <div class="menu-text" @click="selectHeading(item)">
            <span class="heading-icon" :class="getHeadingIcon(item)" @click.stop="handleClick(item, index)"></span>
            <span :class="{'text-href': selectHeadingUuid === item.uuid}">{{ item.text }}</span>
          </div>
        </li>
      </ul>
    </div>
    <div
      ref="editorWrapper"
      class="editor-wrapper bg-op"
      @mousemove="handleMouseMove"
      @mouseleave="hidePlus"
      @click="handleClickPlus"
    >
      <div class="editor-content-container" @click.stop>
        <editor-content :editor="editor" class="editor-content" />
      </div>
    
      <div
        v-if="showPlus"
        class="bg-op border-base"
        :class="isEmptyRow ? 'plus-button' : `drag-button shadow`"
        :style="{
          position: 'absolute',
          top: plusPos.top + 'px',
          left: plusPos.left + 'px'
        }"
        @mouseenter="toggleMenu"
      >
        <span v-if="!isEmptyRow" :class="iconClassName" class="text-primary"></span>
        <span :class="isEmptyRow ? 'tsfont-plus' : `tsfont-drag`"></span>
      </div>
      <template v-if="menuVisible">
        <EmptyMenuList
          v-if="isEmptyRow"
          class="menu-wrapper"
          :style="{
            position: 'absolute',
            top: menuPos.top + 'px',
            left: menuPos.left + 'px'
          }"
          @click-menu="handleClickMenu"
        >
        </EmptyMenuList>
        <NormalMenuList
          v-else
          :style="{
            position: 'absolute',
            top: menuPos.top + 'px',
            left: menuPos.left + 'px'
          }"
          @replace-menu-content="replaceMenuContent"
        ></NormalMenuList>
      </template>
     
    </div>
    <Button
      style="position:absolute;right:20px;top:10px;"
      type="primary"
      class="tsfont-save mr-xs"
      @click="getData()"
    >保存</Button>
  </div>
</template>

<script>
import { throttle } from 'lodash';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extensions';
import { AutoUuid } from '@/resources/plugins/TsTiptap/extensions/autoUuid.js';
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list';
import { Editor, EditorContent } from '@tiptap/vue-2';
export default {
  components: {
    EditorContent,
    EmptyMenuList: () => import('./menu/empty-menu.vue'),
    // MenuList: () => import('@/resources/plugins/TsTiptap/menu/menu-list.vue'),
    NormalMenuList: () => import('./menu/normal-menu.vue')
  },
  data() {
    return {
      isEmptyRow: true, // 是否是空行，用于判断显示鼠标经过时的加号
      iconClassName: '',
      editor: null,
      menuPos: { top: 0, left: 0 },
      plusPos: { top: 0, left: 0 },
      showPlus: false,
      plusBlock: null,
      menuVisible: false,
      toolbarTop: 0, 
      showToolbar: false,
      currentBlockEl: null,
      menuList: [],
      selectHeadingUuid: ''
    };
  },
  mounted() {
    let _this = this;
    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        BulletList,
        OrderedList,
        ListItem,
        AutoUuid,
        Placeholder.configure({
          placeholder: '可在此处输入内容' // 这是全局 placeholder
        }),
        BulletList.configure({
          itemTypeName: 'listItem',
          HTMLAttributes: {
            class: 'bullet-list'
          }
        }),
        OrderedList.configure({
          itemTypeName: 'listItem',
          HTMLAttributes: {
            class: 'ordered-list'
          }
        })
      ],
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
      const { $from } = editor?.state?.selection;
      const node = $from.node($from.depth);
      _this.highlightHeading(node, editor);
    });
  },
  beforeDestroy() {
    this.editor?.destroy();
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
      const editorEl = wrapper?.querySelector('.ProseMirror');
      // 👉 如果鼠标在 + 按钮上，直接忽略，不隐藏
      if (event.target.closest('.plus-button') || event.target.closest('.drag-button') || event.target.closest('.menu-wrapper')) {
        return;
      }
      if (!editorEl?.contains(event.target)) {
        return;
      }
      this.iconClassName = '';
      // 找到当前块元素
      let block = event.target.closest(
        'p, h1, h2, h3, li, blockquote, pre, div'
      );
      if (!block) {
        // 如果是空行，用 posAtCoords + nodeDOM 获取
        const coords = { left: event.clientX, top: event.clientY };
        const pos = this.editor?.view?.posAtCoords(coords);
        if (pos) {
          const $pos = this.editor?.state?.doc?.resolve(pos.pos);
          const dom = this.editor?.view?.nodeDOM($pos.before($pos.depth));
          if (dom && dom.nodeType === 1) block = dom;
        }
        this.isEmptyRow = true;
      } else {
        // 非空行
        const elementName = block?.tagName?.toLowerCase();
        const isEmptyBlock = block?.textContent?.trim() === '';
        if (elementName == 'pre') {
          this.iconClassName = 'tsfont-code';
        } else {
          this.iconClassName = 'tsfont-font-size'; // 默认先用字体大小图标来替换先
        }
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

      this.plusPos = {
        top: Number((blockRect.top - wrapperRect.top + blockRect.height / 2 - 12).toFixed(0)),
        left: 5
      };
      this.showPlus = true;
    }, 300),
    hidePlus: throttle(function() {
      this.showPlus = false;
      this.plusBlock = null;
      this.menuVisible = false;
    }, 400),
    toggleMenu() {
      this.$set(this.menuPos, 'top', this.plusPos.top + 25);
      this.$set(this.menuPos, 'left', this.plusPos.left);
      this.menuVisible = !this.menuVisible;
    },
    handleClickMenu(menuType) {
      this.menuVisible = false;
      if (!this.editor) return;

      const view = this?.editor?.view;
      const coords = this.plusBlock?.getBoundingClientRect();
      const pos = coords
        ? view?.posAtCoords({ left: coords.left, top: coords.top })
        : null;
      // 获取光标所在 resolved position
      const { $from } = this.editor.state.selection;
      // 如果外部传入 pos，就用 pos，否则用当前光标所在 block 的结束位置
      let insertPos = pos?.pos ? pos.pos + 1 : $from.end() + 1;
      console.log('menuType', menuType);
      if (this.$utils.isEmpty($from.doc.textContent)) {
        insertPos = insertPos - 1;
      }
      switch (menuType) {
        case 'heading1':
          this.editor
            .chain()
            .focus()
            .insertContentAt(insertPos, {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '新标题内容' }]
            })
            .run();
          break;
        case 'heading2':
          this.editor
            .chain()
            .focus()
            .insertContentAt(insertPos, {
              type: 'heading',
              attrs: { level: 2 },
              content: [
                {
                  type: 'text',
                  text: '新标题h2的内容'
                }
              ]
            })
            .run();
          break;
        case 'heading3':
          this.editor
            .chain()
            .focus()
            .insertContentAt(insertPos, {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: '新标题3内容' }]
            })
            .run();
          break;
        case 'heading4':
          this.editor
            .chain()
            .focus()
            .insertContentAt(insertPos, {
              type: 'heading',
              attrs: { level: 4 },
              content: [{ type: 'text', text: '新标题4内容' }]
            })
            .run();
          break;
        case 'heading5':
          this.editor
            .chain()
            .focus()
            .insertContentAt(insertPos, {
              type: 'heading',
              attrs: { level: 5 },
              content: [{ type: 'text', text: '新标题5内容' }]
            })
            .run();
          break;
        case 'heading6':
          this.editor
            .chain()
            .focus()
            .insertContentAt(insertPos, {
              type: 'heading',
              attrs: { level: 6 },
              content: [{ type: 'text', text: '新标题内容' }]
            })
            .run();
          break;
        case 'codeBlock':
          this.editor
            .chain()
            .focus()
            .insertContentAt(insertPos, {
              type: 'codeBlock',
              content: [{ type: 'text', text: '新代码块内容' }]
            })
            .run();
          break;
        case 'unorderedList':
          this.editor.chain().focus().toggleBulletList().run();
          break;
        case 'orderedList':
          this.editor.chain().focus().toggleOrderedList().run();
          break;
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
        const index = contentList.findIndex((item) => item.attrs.uuid === uuid);
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
    replaceMenuContent(nodeName) {
      // 替换当前光标所在的节点内容
      this.menuVisible = false;
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
      }
    }
  },
  computed: {
    getMenuClass() {
      return (item) => {
        const className = 'heading-level-' + item.level;
        if (item.hasOwnProperty('isHide') && item.isHide) {
          return className + ' hide';
        }
        return className;
      };
    },
    getHeadingIcon() {
      return (item) => {
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
@import "./index.less";
.editor-main {
  height: calc(100vh - 116px);
  display: grid;
  grid-template-columns: 200px auto;
  border-radius: 10px;
  .editor-menu {
    padding: 20px;
    overflow: auto;
    .hide{
      display: none;
    }
    .menu-text {
      position: relative;
    }
    .heading-icon{
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
.editor-wrapper {
  position: relative;
  padding: 16px 54px;
  border-radius: 8px;
  min-height: 200px;
  overflow: auto;
  .bullet-list,.bullet-list li{
    list-style: initial;
  }
  .ordered-list,.ordered-list li {
    list-style: decimal;
  }
  .tiptap p.is-editor-empty:first-child::before {
    float: left;
    height: 0;
    pointer-events: none;
    content: attr(data-placeholder);
    color: #adb5bd;
  }
}
.plus-button {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  line-height: 22px;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  z-index: 10;
}
.plus-button:hover {
  background: #1f23291f !important;
}
.drag-button {
  display: flex;
  align-items: center;
  max-width: 59px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 10;
}
</style>
