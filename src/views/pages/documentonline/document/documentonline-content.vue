<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="markdown-body pr-nm" v-html="content"></div>
  </div>

</template>
<script>
import 'github-markdown-css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css'; //引入一种语法的高亮
import {marked} from 'marked';
export default {
  name: '',
  components: {
   
  },
  props: {
    filePath: String
  },
  data() {
    return {
      loadingShow: true,
      content: ''
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
      if (!this.filePath) {
        return;
      }
      let data = {
        filePath: this.filePath
      };
      this.loadingShow = true;
      this.$api.documentonline.getDocumentDetail(data).then(res => {
        if (res.Status === 'OK') {
          this.content = marked(res.Return.content); 
          this.$nextTick(() => {
            if (res.Return.anchorPoint) {
              this.$utils.jumpTo('#' + res.Return.anchorPoint, 'smooth');
            }
          });
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
