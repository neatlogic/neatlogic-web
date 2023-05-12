<template>
  <section
    :data_id="uuid"
    type="editor"
    contenteditable="false"
    z-index="0"
    @click="handlerClick"
    @paste.stop.prevent
  >
    <div ref="editorEditor" class="editor-editor" contenteditable="false">
      <div class="bg-op">
        <div class="tool bg-op shadow"><span class="tsfont-trash-s" :title="baseLanguageT('dialog.title.deletetarget', {target: baseLanguageT('term.knowledge.editor')})" @click="removeItem"></span></div>
        <TsCkeditor v-model="value" width="100%"></TsCkeditor>
      </div>
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
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
import editorMixins from './common/mixins.js';
import domUtils from '@/views/pages/knowledge/edit/component/range/domUtils.js';
export default {
  name: '',
  components: {
    TsCkeditor
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
    let _this = this;
    return {
      value: _this.content
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getContent() {
      let _this = this;
      return {content: _this.value};
    },

    handlerClick(e) {
      this.comClick();
      if (e.target == this.$refs.editorEditor || e.target.className == 'top-title' || e.target == this.$el) {
        this.$refs.editorSpan && this.$refs.editorSpan.focus();
      }
    }
  },
  computed: {},
  watch: {
    content(val) {
      this.value = val; 
    }
  }
};
</script>
<style lang="less" scoped>
 section {
  position: relative;
  .editor-editor{
    position: relative;
    padding:10px;
    &:hover{
      .tool{
        display: block;
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
   /deep/ .ck-editor__editable:hover, .ck-editor__editable:focus {
      border-color: #dcdee1 !important;
    }
  }
  &:hover{
    border-color: transparent !important;
  }
  .tool{
    position: absolute;
    top: -40px;
    left: 0px;
    z-index: 10;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    padding: 5px;
    display: none;
    z-index: 1;
     &>span{
        padding: 7px 8px;
        cursor: pointer;
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
