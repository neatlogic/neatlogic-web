<template>
  <div v-imgViewer>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="markdown-body pr-nm" v-html="markdownContent"></div>
  </div>

</template>
<script>
import 'github-markdown-css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css'; //引入一种语法的高亮
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
      markdownContent: ''
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
    getDocumentDetail() {
      if (this.content) {
        this.markdownContent = marked(this.content); 
        this.$nextTick(() => {
          if (this.anchorPoint) {
            this.$utils.jumpTo('#' + this.anchorPoint, 'smooth');
          }
        });
        this.loadingShow = false;
      } else {
        if (!this.filePath) {
          return;
        }
        let data = {
          filePath: this.filePath
        };
        this.loadingShow = true;
        this.$api.documentonline.getDocumentDetail(data).then(res => {
          if (res.Status === 'OK') {
            this.markdownContent = marked(res.Return.content); 
            this.$nextTick(() => {
              if (this.anchorPoint) {
                this.$utils.jumpTo('#' + this.anchorPoint, 'smooth');
              }
            });
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
