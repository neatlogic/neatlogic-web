<template>
  <div class="editor-main">
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
      <div @click.stop>
        <editor-content :editor="editor" class="editor-content" />
      </div>
      <span
        v-if="showPlus"
        class="plus-button tsfont-plus bg-op"
        :style="{
          top: plusPos.top + 'px',
          left: plusPos.left + 'px'
        }"
        @click.stop="toggleMenu"
      >
      </span>
      <MenuList
        v-if="menuVisible"
        :style="{
          position: 'absolute',
          top: plusPos.top + 'px',
          left: plusPos.left + 'px'
        }"
        @click-menu="handleClickMenu"
      >
      </MenuList>
      <div class="tsfont-save mr-xs" @click="getData()">保存</div>
    </div>
  </div>
</template>

<script>
import { throttle } from 'lodash';
import { Editor, EditorContent } from '@tiptap/vue-2';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { AutoUuid } from '@/resources/plugins/TsTiptap/extensions/autoUuid.js';

export default {
  components: {
    EditorContent,
    MenuList: () => import('./menu/index.vue') },
  data() {
    return {
      editor: null,
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
        AutoUuid,
        StarterKit.configure({}),
        Placeholder.configure({
          placeholder: '可在此处输入内容' // 这是全局 placeholder
        }),
        Table.configure({ resizable: true }),
        TableHeader,
        TableRow,
        TableCell
      ],
      onUpdate({ editor }) {
        console.log(editor);
        _this.getAllHeadings(editor);
      },
      onFocus({ editor, event }) {
        const { $from } = editor.state.selection;
        const node = $from.node($from.depth);
        _this.highlightHeading(node, editor);
      }
    });
   
    // 监听 selectionUpdate 事件，当选择变化时，高亮当前选中的标题
    this.editor.on('selectionUpdate', ({ editor, event }) => {
      // 编辑器获得焦点。
      const { $from } = editor.state.selection;
      const node = $from.node($from.depth);
      _this.highlightHeading(node, editor);
    });
  },
  beforeDestroy() {
    this.editor.destroy();
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
      const editorEl = wrapper.querySelector('.ProseMirror');
      // 👉 如果鼠标在 + 按钮上，直接忽略，不隐藏
      if (event.target.closest('.plus-button')) {
        return;
      }
      if (!editorEl.contains(event.target)) {
        this.hidePlus();
        return;
      }
      // 找到当前块元素
      let block = event.target.closest(
        'p, h1, h2, h3, li, blockquote, pre, div'
      );
      if (!block) {
        // 如果是空行，用 posAtCoords + nodeDOM 获取
        const coords = { left: event.clientX, top: event.clientY };
        const pos = this.editor.view.posAtCoords(coords);
        if (pos) {
          const $pos = this.editor.state.doc.resolve(pos.pos);
          const dom = this.editor.view.nodeDOM($pos.before($pos.depth));
          if (dom && dom.nodeType === 1) block = dom;
        }
      }
      if (!block || block === this.plusBlock) return;

      this.plusBlock = block;
      const blockRect = block.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();

      this.plusPos = {
        top: (blockRect.top - wrapperRect.top + blockRect.height / 2 - 12).toFixed(0),
        left: 5
      };
      this.showPlus = true;
    }, 300),
    hidePlus: throttle(function() {
      this.showPlus = false;
      this.plusBlock = null;
    }, 400),
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    handleClickMenu(menuType) {
      this.menuVisible = false;
      if (!this.editor) return;

      const view = this.editor.view;
      const coords = this.plusBlock?.getBoundingClientRect();
      const pos = coords
        ? view.posAtCoords({ left: coords.left, top: coords.top })
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
        case 'image':
          this.editor
            .chain()
            .focus()
            .insertContentAt(insertPos, {
              type: 'paragraph',
              content: [{ type: 'text', text: '[插入图片位置]' }]
            })
            .run();
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
        console.log(contentList);
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
      this.editor.commands.focus('end');
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
  padding: 16px 16px 16px 32px;
  border-radius: 8px;
  min-height: 200px;
   overflow: auto;
}
.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
}
.plus-button {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  line-height: 22px;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  z-index: 10;
}
.plus-button:hover {
  background: #f5f5f5;
}
</style>
