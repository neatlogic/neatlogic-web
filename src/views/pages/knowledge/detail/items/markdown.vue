<template>
  <section
    :data_id="uuid"
    type="markdown"
    contenteditable="false"
    z-index="0"
    @paste.stop.prevent
  >
    <div ref="editorEditor" class="editor-editor" contenteditable="false">
      <div
        v-for="(item, index) in value"
        :key="index"
        class="markdown-body md-code knowledge-markdown"
        v-html="item"
      ></div>
    </div>
  </section>
</template>
<script>
// import 'github-markdown-css';
// import hljs from 'highlight.js';
// import 'highlight.js/styles/atom-one-light.css'; //引入一种语法的高亮
import { marked } from 'marked';
export default {
  name: '',
  components: {},
  filters: {},
  mixins: {},
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object,
    changeType: String
  },
  data() {
    return {
      value: '',
      toolbars: {
        subfield: false // 单双栏模式
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    // this.$nextTick(() => {
    //   hljs.highlightAll();
    // });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {},
  watch: {
    content: {
      handler(val) {
        try {
          let value = JSON.parse(val);
          const str = value?.map(item => marked(item));
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
<style>
.knowledge-markdown img {
  max-width: 200px;
}
</style>
<style lang="less" scoped>
 section {
  position: relative;
  .editor-editor{
    position: relative;
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
  }
  &:hover{
    border-color: transparent !important;
  }
  .tool{
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
