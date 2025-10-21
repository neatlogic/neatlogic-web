<template>
  <div
    ref="editorWrapper"
    class="editor-wrapper border-base"
    @mousemove="handleMouseMove"
    @mouseleave="hidePlus"
  >
    <editor-content :editor="editor" class="editor-content" />
    <!-- 悬浮的 + 号按钮 -->
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
      menuVisible: true
    };
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        AutoUuid,
        StarterKit.configure({
        }),
        Placeholder.configure({
          placeholder: '可在此处输入内容' // 这是全局 placeholder
        }),
        Table.configure({ resizable: true }),
        TableHeader,
        TableRow,
        TableCell
      ],
      onUpdate: ({ editor }) => {
        console.log('文档更新：', editor.getJSON());
      },
      onFocus: ({ editor }) => {
        const { $from } = editor.state.selection;
        const node = $from.node($from.depth);
      }
    });
  },
  beforeDestroy() {
    this.editor.destroy();
  },
  methods: {
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
      const insertPos = pos?.pos ? pos.pos + 1 : $from.end() + 1;
      console.log('menuType', menuType);
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
    }
  }
};
</script>

<style>
.editor-wrapper {
  position: relative;
  padding: 16px 16px 16px 32px;
  border-radius: 8px;
  min-height: 200px;
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
