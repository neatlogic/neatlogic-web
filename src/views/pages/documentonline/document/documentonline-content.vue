<template>
  <div v-imgViewer>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div id="markdownContent" class="markdown-body pr-nm" v-html="markdownContent"></div>
  </div>
</template>
<script>
import hljs from 'highlight.js';
import {marked} from 'marked';
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: '',
  components: {},
  directives: { imgViewer },
  props: {
    content: String,
    filePath: String,
    anchorPoint: String //锚点id
  },
  data() {
    return {
      loadingShow: true,
      markdownSource: '',
      markdownContent: '',
      merkedSetting: {
        mangle: false,
        headerIds: false
      },
      headings: []
    };
  },
  beforeCreate() {},
  created() {
    this.getDocumentDetail();
  },
  beforeMount() {},
  mounted() { 
    this.$nextTick(() => {
      hljs.highlightAll();
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getContent() {
      if (!this.filePath) {
        return;
      }
      let data = {
        filePath: this.filePath
      };
      this.loadingShow = true;
      return this.$api.documentonline.getDocumentDetail(data).then(res => {
        if (res.Status === 'OK') {
          if (res.Return.content) {
            this.markdownSource = res.Return.content;
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    async getDocumentDetail() {
      if (this.content) {
        this.markdownSource = this.content;
        this.loadingShow = false;
      } else {
        await this.getContent();
      }
      let _this = this;
      // 创建一个新的renderer实例
      const renderer = new marked.Renderer();
      // 重写heading方法，为h1-h6标签添加唯一的ID
      renderer.heading = function(text, level) {
        let id = 'heading_' + _this.$utils.setUuid();
        return `<h${level} id="${id}">${text}</h${level}>`;
      };
      //替换文档中a标签链接参数的特殊字符&
      renderer.link = (href, title, text) => {
        const newhref = href.replace(/\&/g, '%26');
        return `<a href="${newhref}">${text}</a>`;
      };
      this.markdownContent = marked(this.markdownSource, { renderer }); 
      this.getHeadings();
      this.$nextTick(() => {
        if (this.anchorPoint) {
          this.$utils.jumpTo('#' + this.anchorPoint, 'smooth');
        }
      });
    },
    getHeadings() { //获取目录
      this.headings = [];
      // 提取 h1 到 h6 标签
      const parser = new DOMParser();
      const doc = parser.parseFromString(this.markdownContent, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent;
        const id = heading.id;
        this.headings.push({
          level: level,
          text: text,
          id: id
        });
      });
      this.$emit('getHeadings', this.headings);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
@import 'github-markdown-css';
@import 'highlight.js/styles/atom-one-light.css'; //引入一种语法的高亮
</style>
