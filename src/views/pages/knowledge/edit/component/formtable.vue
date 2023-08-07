<template>
  <section
    :data_id="uuid"
    type="formtable"
    contenteditable="false"
    z-index="0"
    @click="handlerClick"
    @paste.stop.prevent
  >
    <div ref="editorForm" class="editor-form" contenteditable="false">
      <div class="tool bg-op shadow"><span class="tsfont-trash-s" :title="$t('dialog.title.deletetarget', {target: $t('page.table')})" @click="removeItem"></span></div>
      <div
        class="bg-op table-color"
        style="outline: none;"
        contenteditable
        v-html="content"
      ></div>
    </div>
    <span
      ref="editorSpan"
      class="editorSpan"
      contenteditable
      @keydown.stop="complexComHandlerKeydown"
      @input.stop="complexComHandlerKeydown"
    ></span>
  </section>
</template>
<script>
import editorMixins from './common/mixins.js';
import domUtils from '@/views/pages/knowledge/edit/component/range/domUtils.js';
export default {
  name: '',
  components: {},
  filters: {},
  mixins: [editorMixins],
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object
  },
  data() {
    return {};
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
      let _this = this;
      return {
        config: {},
        content: _this.$el.querySelector('.bg-op.table-color').innerHTML
      };
    },
    handlerClick(e) {
      this.comClick();
      if (e.target == this.$refs.editorForm || e.target == this.$el) {
        this.$refs.editorSpan && this.$refs.editorSpan.focus();
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import '~@/resources/plugins/TsCkeditor/ckeditor.less';
section {
  position: relative;
  /deep/.editor-form {
    position: relative;
    padding: 10px;
    &:hover {
      .tool {
        display: block;
      }
    }
    .top-title {
      border-bottom: 0 !important;
      padding: 0px 4px;
      line-height: 32px;
      height: 32px;
      /deep/.TsFormSelect .ivu-input {
        text-align: right;
      }
    }
    .component-tips {
      text-align: left;
      font-size: 90%;
      opacity: 0.6;
      word-break: break-all;
      display: block;
    }
      //静态列表样式
  
      .tstable-container {
        overflow: auto;
        border-top: 0px !important;
        .table-list {
          width:100%;
          border-top: none;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .table-list > thead,
        .table-list > thead > tr > th {
          visibility: visible !important;
          border: none !important;
          vertical-align: middle;
          height: 38px;
          padding-top: 0px;
          padding-bottom: 0px;
          text-align: left;
        }
        .table-list > tbody > tr > td {
          border-left: none !important;
          border-right: none !important;
          border-bottom: none !important;
          border-top: none !important;
          vertical-align: top;
        }
      }

  }
  &:hover {
    border: 1px solid transparent !important;
  }
  .tool {
    position: absolute;
    top: -19px;
    left: 10px;
    z-index: 10;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    padding: 5px;
    display: none;
     &>span{
          padding: 7px 8px;
          cursor: pointer;
    }
  }
  .editorSpan {
    position: absolute;
    right: 1px;
    bottom: 0px;
    width: 3px;
    height: 24px;
    outline: none;
    z-index: 3;
  }
}
/deep/.sheet-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0px;
  table-layout: fixed;
  outline: none;
  thead {
    height: 0;
  }
  tbody {
    tr {
      td {
        border: 1px solid;
        vertical-align: middle;
        padding: 3px;
        height: 40px;
        position: relative;
        word-break: break-all;
        &.text-right {
          padding-right: 12px;
        }
      }
    }
  }
}
.tstable-container .tstable-body tbody tr:hover {
  background: transparent !important;
}
</style>
