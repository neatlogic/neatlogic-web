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
          <span class="tsfont-trash-s" :title="$t('dialog.title.deletetarget', {target: $t('term.knowledge.editor')})" @click="removeItem"></span>
          <span
            v-for="(item, index) in toolbarsList"
            :key="index"
            :class="item.icon"
            :title="item.title"
            @click.stop="handleClick(item.value)"
          ></span>
        </div>
        <mavon-editor v-model="value" v-bind="markdownOption"></mavon-editor>
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
      value: '',
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
          title: '粗体',
          value: '**粗体**'
        },
        {
          icon: 'tsfont-italic',
          title: '倾斜',
          value: '*斜体*'
        },
        {
          icon: 'tsfont-text-delete',
          title: '中划线',
          value: '~~中划线~~'
        },
        {
          icon: 'tsfont-orderlist',
          title: '有序列表',
          value: '1. 有序列表 '
        },
        {
          icon: 'tsfont-list',
          title: '无序列表',
          value: '- 无序列表'
        },
        {
          icon: 'tsfont-code',
          title: '代码库',
          value: '```js\n\n```'
        },
        {
          icon: 'tsfont-chart-table',
          title: '表格',
          value: ''
        },
        {
          icon: 'tsfont-addimg',
          title: '上传图片',
          value: 'uploadImg'
        },
        {
          icon: 'tsfont-eye',
          title: '预览',
          value: 'previewMd'
        }
      ]
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
      // 使用正则表达式分割数据
      const lines = this.value.split('\n');
      const contentArray = [];

      let tempValue = '';
      lines.forEach((line) => {
        if (line.startsWith('```')) {
          if (tempValue) {
            contentArray.push(tempValue.trim());
            tempValue = '';
          }
          tempValue += line;
        } else if (line.endsWith('```')) {
          tempValue += '\n' + line;
          if (tempValue) {
            contentArray.push(tempValue.trim());
            tempValue = '';
          }
        } else {
          if (tempValue) {
            tempValue += '\n' + line;
          } else {
            contentArray.push(line);
          }
        }
      });
      return {content: contentArray};
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
      this.value = `${this.value}\n![${data.Return.name}](${data.Return.url})`;
    }
  },
  computed: {},
  watch: {
    content: {
      handler(val) {
        try {
          let value = JSON.parse(val);
          const str = value?.map(item => item + '\n').join('');
          this.value = str;
        } catch (error) {
          this.value = '';
        }
      }, 
      immediate: true
    }
  }
};
</script>
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
      &>span{
          padding: 7px 8px;
          cursor: pointer;
      }
    }
    .top-title{
      border-bottom: 0 !important;
      padding: 0px 4px;
      line-height: 32px;
      height: 32px;
      /deep/.TsFormSelect .ivu-input{
        text-align: right;
      }
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
}
</style>
