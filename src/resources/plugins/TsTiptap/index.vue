<template>
  <div class="editor-wrapper">
    <editor-content :editor="editor" class="editor" />
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

export default {
  components: { EditorContent },
  data() {
    return { editor: null };
  },
  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit.configure({
          paragraph: false // 我们用 BlockWrapper 包装 paragraph
        }),
        Placeholder.configure({
          placeholder: '输入 / 弹出菜单' // 这是全局 placeholder
        }),
        Table.configure({ resizable: true }),
        TableHeader,
        TableRow,
        TableCell,
        BlockWrapper,
        SlashCommand
      ]
    });
  },
  beforeDestroy() {
    this.editor.destroy();
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
