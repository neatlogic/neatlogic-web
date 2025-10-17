<template>
  <div class="editor-main">
    <div class="editor-menu">
      <ul>
        <li v-for="(item, index) in menuList" :key="index" :class="getMenuClass(item)">
          <div class="menu-text">
            <span class="heading-icon" :class="getHeadingIcon(item)" @click="handleClick(item, index)"></span>
            <span :class="{'text-href': selectHeadingUuid === item.attrs?.uuid}">{{ item.text }}</span>
          </div>
        </li>
      </ul>
    </div>
    <div class="editor-wrapper bg-op">
      <div>
        <button @click="editor.chain().focus().toggleBold().run()">Bold</button>
        <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">
          H1
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
          H2
        </button>
        <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">
          H3
        </button>
      </div>

      <editor-content :editor="editor" class="editor" />
      <div @click="getData()">aaa</div>
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
    return { 
      editor: null, 
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
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3]
          },
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
      onUpdate({ editor }) {
        _this.getAllHeadings(editor);
        console.log(editor.getJSON());
      },
      onFocus({ editor}) {
        const { $from } = editor.state.selection;
        const node = $from.node($from.depth);
        _this.highlightHeading(node, editor.isActive('heading'));
        console.log(editor, editor.isActive('heading'), node);
      }
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
      const headings = $headings.map((node) => {
        const afterNode = node.after;
        const afterLevel = afterNode.attributes.level;
        console.log(node);
        let obj = {
          level: node.attributes.level,
          text: node.textContent,
          attrs: node.attrs
        };
        if (afterLevel && afterLevel > node.attributes.level) {
          obj.showNextIcon = true;
        }
        return obj;
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
    highlightHeading(node, isHeading) {
      console.log(node.attrs);
      if (isHeading) {
        this.selectHeadingUuid = node.attrs?.uuid || '';
      } else {
        //
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
  // border: 1px solid #ddd;
  padding: 12px;
  // border-radius: 8px;
  overflow: auto;
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
