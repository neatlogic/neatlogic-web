<template>
  <div ref="editorEditor" class="editor-editor">
    <div class="bg-op">
      <div v-if="mode == 'edit'" class="tool bg-op shadow">
        <div class="action-group" style="display: flex;">
          <span class="action-item tsfont-trash-s" :title="$t('dialog.title.deletetarget', {target: $t('term.knowledge.editor')})" @click="removeItem"></span>
          <template
            v-for="(item, index) in toolbarsList"
          >
            <div v-if="item.value == 'table'" :key="index" class="action-item">
              <Poptip
                trigger="hover"
                word-wrap
                width="250"
              >
                <span :class="item.icon" :title="item.title"></span>
                <div slot="content">
                  <div class="tooltip-title">
                    <div v-if="tableRow">{{ tableRow }}x{{ tableCol }}</div>
                  </div>
                  <div class="table-grid">
                    <div
                      v-for="row in num"
                      :key="row"
                      class="row"
                      @click="selectedTable"
                    >
                      <div
                        v-for="col in num"
                        :key="col"
                        class="cell bg-tip-grey"
                        :class="{'bg-info-grey':tableRow && row <= tableRow && col <= tableCol }"
                        @mouseover="drag(row, col)"
                      ></div>
                    </div>
                  </div>
                </div>
              </Poptip>
            </div>
            <span
              v-else
              :key="index"
              class="action-item"
              :class="[item.value == 'previewMd' && !isEditMode ? 'text-href tsfont-eye-off' : item.icon]"
              :title="item.title"
              @click.stop="handleClick(item.value)"
            >
            </span>
          </template>
        </div>
      </div>
      <mavonEditor
        ref="markdownEditor"
        v-model="markdownContent"
        :toolbarsFlag="false"
        :subfield="false"
        :autofocus="false"
        :defaultOpen="defaultOpen"
        :placeholder="$t('form.validate.pleaseenterthecontent')"
        editorBackground="transparent"
        previewBackground="transparent"
        class="knowledge-markdown-editor"
        @input="changeInput"
      ></mavonEditor>
    </div>
    <UploadDialog ref="uploadDialog" v-bind="uploadConfig" @on-success="uploadSuccess" />
  </div>
</template>
<script>
import editorMixins from 'pages/knowledge/edit/component/common/mixins.js';
import { mavonEditor } from 'mavon-editor';
import 'mavon-editor/dist/css/index.css';

export default {
  name: '',
  components: {
    mavonEditor,
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve)
  },
  mixins: [editorMixins],
  props: {
    model: {
      prop: 'value',
      event: 'input'
    },
    value: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      validator: function(value) {
        return ['edit', 'read'].includes(value); // 只读和编辑模式
      },
      default: 'edit'
    }
  },
  data() {
    return {
      markdownContent: this.value,
      uploadConfig: {
        //上传图片配置
        actionUrl: BASEURLPREFIX + '/api/binary/file/upload', //导入地址
        formatList: ['png', 'jpg'],
        data: {
          param: 'file'
        },
        dataType: 'knowledge'
      },
      toolbarsList: [
        {
          icon: 'tsfont-bold',
          title: this.$t('term.report.fontweight.bold'),
          value: `**${this.$t('term.report.fontweight.bold')}**`
        },
        {
          icon: 'tsfont-italic',
          title: this.$t('message.plugin.italic'),
          value: `*${this.$t('message.plugin.italic')}*`
        },
        {
          icon: 'tsfont-bind',
          title: this.$t('page.link'),
          value: `[${this.$t('term.knowledge.enterlinkdescription')}](http://)`
        },
        {
          icon: 'tsfont-text-delete',
          title: this.$t('term.knowledge.strikethrough'),
          value: `~~${this.$t('term.knowledge.strikethrough')}~~`
        },
        {
          icon: 'tsfont-orderlist',
          title: this.$t('page.orderedlist'),
          value: `1. ${this.$t('page.orderedlist')} `
        },
        {
          icon: 'tsfont-list',
          title: this.$t('page.unorderedlist'),
          value: `- ${this.$t('page.unorderedlist')}`
        },
        {
          icon: 'tsfont-code',
          title: this.$t('page.code'),
          value: '```plaintext\n\n```'
        },
        {
          icon: 'tsfont-chart-table',
          title: this.$t('page.table'),
          value: 'table'
        },
        {
          icon: 'tsfont-addimg',
          title: this.$t('term.knowledge.uploadimages'),
          value: 'uploadImg'
        },
        {
          icon: 'tsfont-eye',
          title: this.$t('page.preview'),
          value: 'previewMd'
        }
      ],
      tableRow: 0,
      tableCol: 0,
      num: 10,
      isEditMode: this.mode == 'edit',
      defaultOpen: 'edit'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.mode != 'edit') {
      this.defaultOpen = 'preview';
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleClick(value) {
      if (value == 'previewMd') {
        this.isEditMode = !this.isEditMode;
        this.defaultOpen = this.defaultOpen == 'edit' ? 'preview' : 'edit';
      } else if (value == 'uploadImg') {
        this.$refs.uploadDialog?.showDialog();
      } else {
        this.insertContent(value);
      }
    },
    insertContent(text) {
      // 在指定位置插入指定字符串，并且把光标放到插入新内容后
      const textarea = this.$refs?.markdownEditor?.$refs?.vNoteTextarea?.$refs?.vTextarea;
      const startPos = textarea?.selectionStart; // 光标所在位置
      const endPos = textarea?.selectionEnd; // 光标结束位置
      this.markdownContent = this.markdownContent.substring(0, startPos) + text + this.markdownContent.substring(endPos);
      this.$nextTick(() => {
        // 加$nextTick，可以让光标的位置在插入新内容的后面
        const newCursorPosition = startPos + text.length; // 新的光标位置
        textarea.setSelectionRange(newCursorPosition, newCursorPosition); // 设置新的光标位置
        textarea.focus(); // 获取焦点
      });
    },
    uploadSuccess(data, file, fileList) {
      const { name = '', url = '' } = data.Return || {};
      if (name && url) {
        const imageMarkdown = `![${name}](${url})`;
        this.insertContent(imageMarkdown);
        this.changeInput();
      }
    },
    drag(row, col) {
      this.tableRow = row;
      this.tableCol = col;
    },
    selectedTable() {
      // 根据选择的行列，生成表格
      const row = this.tableRow;
      const col = this.tableCol;
      let result = '';

      // 生成表头
      result += '|   '.repeat(col) + '|\n';
      result += '|---'.repeat(col) + '|\n';

      // 生成每行的内容
      for (let i = 0; i < row; i++) {
        result += '|   '.repeat(col) + '|\n';
      }
      // 返回生成的字符串
      this.insertContent(result);
      this.changeInput();
      this.$nextTick(() => {
        this.tableRow = '';
        this.tableCol = '';
      });
    },
    changeInput() {
      this.$emit('input', this.markdownContent);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.editor-editor{
     position: relative;
     padding: 10px;
     /deep/ .markdown-body table {
      display: table;
     }
    /deep/ .markdown-body em {
      font-style: italic; // 修复markdown中的倾斜样式不生效问题
    }
    &:hover{
      .tool{
        display: block;
      }
    }
    .tool {
      position: absolute;
      top: -20px !important;
      left: 9px !important;
      z-index: 30;
      box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
      border-radius: 2px;
      padding: 5px;
      display: none;
    }
  }
  .tooltip-title {
    display: flex;
    justify-content: space-between;
  }
  .table-grid {
    display: grid;
    gap: 2px;
    .row {
      display: grid;
      grid-template-columns: repeat(10,auto);
      gap: 2px;
    }
    .cell {
      width: 16px;
      height: 16px;
    }
  }
  /deep/ .hljs {
    background: transparent;
  }
  .knowledge-markdown-editor {
    /deep/ textarea {
    background-color: transparent;
   }
   /deep/ &.v-note-wrapper {
    z-index: 2; // 修改层级，会导致选择表格行列会被遮挡
   }
  }
  .theme(@text-color) {
    .knowledge-markdown-editor {
        /deep/ .auto-textarea-wrapper .auto-textarea-input {
          color: @text-color;
        }
      }
  }
  html {
    .theme(@default-text);
    &.theme-dark {
      .theme(@dark-text);
    }
  }
</style>
