<template>
  <section
    :data_id="uuid"
    type="mardown"
    contenteditable="false"
    class="knowledge-markdown-container"
    @contextmenu.prevent
    @click="
      event => {
        event.stopPropagation();
      }
    "
  >
    <div ref="editorEditor" class="editor-editor">
      <div class="bg-op">
        <div class="tool bg-op shadow">
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
        <mavon-editor v-model="value" class="mavon-markdown-editor-container" v-bind="markdownOption"></mavon-editor>
      </div>
    </div>
    <span
      ref="editorSpan"
      class="editorSpan"
      contenteditable
      @keydown.stop="complexComHandlerKeydown"
      @input.stop="complexComHandlerKeydown"
    ></span>
    <UploadDialog ref="uploadDialog" v-bind="uploadConfig" @on-success="uploadSuccess" />
  </section>
</template>
<script>
import editorMixins from './common/mixins.js';
export default {
  name: '',
  components: {
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve)
  },
  filters: {},
  mixins: [editorMixins],
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object
  },
  data() {
    return {
      value: this.content,
      uploadConfig: {
        //上传图片配置
        actionUrl: BASEURLPREFIX + '/api/binary/file/upload', //导入地址
        formatList: ['png', 'jpg'],
        data: {
          param: 'file'
        },
        dataType: 'knowledge'
      },
      markdownOption: {
        subfield: false, // 单栏(编辑预览分屏)
        toolbarsFlag: false, // 工具栏不显示
        defaultOpen: 'edit'
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
      num: 10
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getContent() {
      return {content: this.value};
    },
    handleClick(value) {
      if (value == 'previewMd') {
        this.markdownOption.defaultOpen = this.markdownOption.defaultOpen == 'edit' ? 'preview' : 'edit';
      } else if (value == 'uploadImg') {
        this.$refs.uploadDialog?.showDialog();
      } else {
        this.value = `${this.value}\n${value}`;
      }
    },
    uploadSuccess(data, file, fileList) {
      const { name = '', url = '' } = data.Return || {};
      if (name && url) {
        const imageMarkdown = `![${name}](${url})`;
        this.value = `${this.value}\n${imageMarkdown}`;
      }
    },
    drag(row, col) {
      this.$set(this, 'tableRow', row);
      this.$set(this, 'tableCol', col);
    },
    selectedTable() {
      // 处理几行几列
      const rows = this.tableRow;
      const columns = this.tableCol;

      let newStr = '';

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          if (j === 0) {
            newStr += '|   ';
          } else if (j === columns - 1) {
            newStr += '|   |\n';
          } else {
            newStr += '|-';
          }
        }

        if (i < rows - 1) {
          for (let k = 0; k < columns; k++) {
            if (k === 0) {
              newStr += '|-';
            } else if (k === columns - 1) {
              newStr += '|-|\n';
            } else {
              newStr += '|-';
            }
          }
        }
      }
      this.value = `${this.value}\n${newStr}`;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style>
.mavon-markdown-editor-container .v-note-show {
  overflow-y: hidden !important;
}
</style>
<style lang="less" scoped>
 section {
  position: relative;
  .editor-editor{
    position: relative;
    padding: 10px;
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
  .editorSpan{
    position: absolute;
    right: 1px;
    bottom: 0px;
    width: 3px;
    height: 24px;
    outline: none;
    z-index: 3;
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
}
</style>
