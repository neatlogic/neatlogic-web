<template>
  <div
    ref="wrapper"
    class="editor-wrapper"
    @mousemove="onMouseMove"
    @mouseleave="hideToolbar"
  >
    <editor-content :editor="editor" class="editor-content" />

    <!-- 插入器 / 拖拽柄浮层 -->
    <div
      v-if="showToolbar"
      :style="{ top: toolbarTop + 'px', left: '0px' }"
      class="insert-toolbar"
    >
      <span class="add-btn tsfont-plus" @click="onAdd"></span>
      <span class="drag-btn tsfont-drag"></span>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { BlockWrapper } from './BlockWrapper.js';
import SlashCommand from './SlashCommand';
import { AutoUuid } from '@/resources/plugins/TsTiptap/extensions/autoUuid.js';

export default {
  components: { EditorContent },
  data() {
    return { editor: null, toolbarTop: 0, showToolbar: false, currentBlockEl: null };
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        AutoUuid,
        StarterKit.configure({
          paragraph: false // 我们用 BlockWrapper 包装 paragraph
        }),
        Placeholder.configure({
          placeholder: '输入“/”快速插入内容' // 这是全局 placeholder
        }),
        Table.configure({ resizable: true }),
        TableHeader,
        TableRow,
        TableCell,
        BlockWrapper,
        SlashCommand
      ],
      onUpdate: ({ editor }) => {
        console.log('文档更新：', editor.getJSON());
      }
    });
  },
  beforeDestroy() {
    this.editor.destroy();
  },
  methods: {
    onMouseMove(e) {
      const wrapper = this.$refs.wrapper;
      const editorEl = wrapper?.querySelector('.editor-content');
      if (!editorEl) return;

      // 从鼠标位置获取元素
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      // 找最近的 block（段落、标题、引用等）
      const blockEl = el.closest('p, h1, h2, h3, blockquote, li');
      // console.log('el', el);
      
      if (!blockEl || !editorEl.contains(blockEl)) {
        // this.showToolbar = false;
        return;
      }

      // 如果是新的 block，就更新浮层位置
      if (blockEl !== this.currentBlockEl) {
        this.currentBlockEl = blockEl;
        const rect = blockEl.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();

        this.toolbarTop = rect.top - wrapperRect.top;
        this.showToolbar = true;
      }
    },
    hideToolbar() {
      // this.showToolbar = false;
      // this.currentBlockEl = null;
    },
    onAdd() {
      if (!this.currentBlockEl) return;
      // 获取当前位置
      const pos = this.editor.state.selection.$anchor.pos;
      this.editor.commands.insertContent('<p>新的一行</p>');
    }
  }
};
</script>

<style>
.editor-wrapper {
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 8px;
  min-height: 200px;
}
.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Slash Menu */
.slash-menu {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 4px;
}
.slash-menu-item {
  padding: 6px 10px;
  cursor: pointer;
}
.slash-menu-item:hover {
  background: #f0f0f0;
}

/* Block Wrapper */
.block-wrapper {
  display: flex;
  align-items: flex-start;
  padding: 2px 0;
  position: relative;
  border-radius: 4px;
}
.block-tools {
  width: 24px;
  margin-right: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}
.block-wrapper:hover .block-tools {
  opacity: 1;
}
.drag-handle {
  cursor: grab;
  font-size: 12px;
  text-align: center;
  user-select: none;
}
.insert-btn {
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  color: #888;
}
.block-content {
  flex: 1;
}
.drag-over {
  background: #f0f8ff;
}
</style>
