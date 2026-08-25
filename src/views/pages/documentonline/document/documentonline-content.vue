<template>
  <div v-imgViewer>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsMarkdownEditor
      v-if="!loadingShow"
      ref="markdownEditor"
      class="pr-nm"
      :value="markdownSource"
      model="previewOnly"
      readonly
      :toolbar="false"
      height="auto"
      @ready="handleMarkdownReady"
    ></TsMarkdownEditor>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: '',
  components: {
    TsMarkdownEditor: () => import('@/resources/components/TsMarkdownEditor/index.vue')
  },
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
      headings: []
    };
  },
  beforeCreate() {},
  created() {
    this.getDocumentDetail();
  },
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
      if (!this.filePath) {
        return;
      }
      let data = {
        filePath: this.filePath
      };
      this.loadingShow = true;
      return this.$api.documentonline
        .getDocumentDetail(data)
        .then(res => {
          if (res.Status === 'OK') {
            if (res.Return.content) {
              this.markdownSource = res.Return.content;
            }
          }
        })
        .finally(() => {
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
    },
    handleMarkdownReady() {
      this.$nextTick(() => {
        this.getHeadings();
        if (this.anchorPoint) {
          this.$utils.jumpTo('#' + this.anchorPoint, 'smooth');
        }
      });
    },
    getHeadings() {
      //获取目录
      this.headings = [];
      const editor = this.$refs.markdownEditor;
      const headings = editor && editor.$el
        ? editor.$el.querySelectorAll('.cherry-previewer h1, .cherry-previewer h2, .cherry-previewer h3, .cherry-previewer h4, .cherry-previewer h5, .cherry-previewer h6')
        : [];
      headings.forEach(heading => {
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
