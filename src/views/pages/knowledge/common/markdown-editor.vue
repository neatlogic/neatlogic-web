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
              :class="item.icon"
              :title="item.title"
              @click.stop="handleClick(item.value)"
            >
            </span>
          </template>
        </div>
      </div>
      <textarea
        v-show="isEditMode"
        ref="textareaHeight"
        v-model="markdownContent"
        class="border-color"
        :style="{height: textareaHeight + 'px'}"
        @input="changeInput"
      ></textarea>
      <div
        v-show="!isEditMode"
        id="markdownContent"
        class="markdown-body pr-nm"
        v-html="markdownPreviewContent"
      ></div>
    </div>
    <UploadDialog ref="uploadDialog" v-bind="uploadConfig" @on-success="uploadSuccess" />
  </div>
</template>
<script>
import 'github-markdown-css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css'; //引入一种语法的高亮
import {marked} from 'marked';
import editorMixins from 'pages/knowledge/edit/component/common/mixins.js';
export default {
  name: '',
  components: {
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
      textareaHeight: 300,
      markdownContent: this.value,
      markdownPreviewContent: this.value,
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
          value: '```js\n\n```'
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
      isEditMode: this.mode == 'edit'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      hljs.highlightAll();
      this.markdownPreviewContent = marked(this.value);
    });
    this.setTextareaHeight();
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
        this.markdownPreviewContent = marked(this.markdownContent);
      } else if (value == 'uploadImg') {
        this.$refs.uploadDialog?.showDialog();
      } else {
        this.markdownContent = `${this.markdownContent}\n${value}`;
        this.setTextareaHeight();
      }
    },
    uploadSuccess(data, file, fileList) {
      const { name = '', url = '' } = data.Return || {};
      if (name && url) {
        const imageMarkdown = `![${name}](${url})`;
        this.markdownContent = `${this.markdownContent}\n${imageMarkdown}`;
        this.setTextareaHeight();
        this.changeInput();
      }
    },
    drag(row, col) {
      this.tableRow = row;
      this.tableCol = col;
    },
    setTextareaHeight() {
      this.$nextTick(() => {
        this.textareaHeight = this.$refs.textareaHeight?.scrollHeight || 300;
      });
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
      this.markdownContent = `${this.markdownContent}\n${result}`;
      this.changeInput();
      this.setTextareaHeight();
      this.$nextTick(() => {
        this.tableRow = '';
        this.tableCol = '';
      });
    },
    changeInput() {
      console.log('返回的值', this.markdownContent);
      this.$emit('input', this.markdownContent);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
  .editor-editor{
     position: relative;
     padding: 10px;
      /deep/.markdown-body table{
      /* 解决github-markdown 样式影响，导致表格，表头和内容之前有一个很大的空行*/
      display: inline-table !important;
    }
  textarea {
    resize: none;
    width: 100%;
    overflow: hidden;
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
</style>
