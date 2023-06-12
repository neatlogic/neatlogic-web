<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain
      v-model="isSiderHide"
      :siderWidth="300"
      :rightWidth="rightWidth"
      enableCollapse
      @toggleSiderHide="toggleSiderHide"
    >
      <template v-slot:topLeft>
        <DocumentonlineNav :filepathList="filepathList" :moduleGroup="moduleGroup" :menu="menu"></DocumentonlineNav>
      </template>
      <template v-slot:sider>
        <DocumentonlineTree
          :id="id"
          :moduleGroup="moduleGroup"
          :menu="menu"
          :filePath="filePath"
        ></DocumentonlineTree>
      </template>
      <template v-slot:content>
        <div class="markdown-body pr-nm" v-html="content"></div>
      </template>
      <template v-slot:right>
        <div class="right-list border-color pl-nm">
          <div class="tsfont-file-single pb-nm">相关知识</div>
          <div v-for="(item,index) in list" :key="index" class="tsfont-dot text-title overflow pb-nm">
            {{ item.fileName }}
          </div>
          <div v-if="tableData.currentPage< tableData.pageCount" class="text-href pl-nm" @click="changePage()">{{ $t('page.viewmore') }}</div>
        </div>
      </template>
    </TsContain>
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
    DocumentonlineTree: resolve => require(['./documentonline-tree.vue'], resolve),
    DocumentonlineNav: resolve => require(['./documentonline-nav.vue'], resolve)
  },
  props: {},
  data() {
    return {
      rightWidth: 0,
      loadingShow: true,
      id: '',
      moduleGroup: '',
      menu: '',
      filePath: '',
      content: '',
      filepathList: [],
      isSiderHide: true,
      list: [],
      tableData: {}
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query) {
      this.id = this.$route.query.id;
      this.filePath = this.$route.query.filePath;
      this.moduleGroup = this.$route.query.moduleGroup;
      this.menu = this.$route.query.menu;
      if (this.filePath) {
        this.filepathList = this.filePath.split('/');
      }
    }
    this.getDocumentDetail();
    this.getDocumentonlineList();
    this.$nextTick(() => {
      hljs.highlightAll();
    });
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
    getDocumentDetail() {
      if (!this.filePath) {
        return;
      }
      let data = {
        filePath: this.id
      };
      this.$api.documentonline.getDocumentDetail(data).then(res => {
        if (res.Status === 'OK') {
          this.content = marked(res.Return.content); 
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getDocumentonlineList(currentPage) {
      let data = {
        currentPage: currentPage || 1,
        moduleGroup: this.moduleGroup,
        menu: this.menu
      };
      this.$api.documentonline.getDocumentList(data).then(res => {
        if (res.Status === 'OK') {
          this.tableData = res.Return || {};
          if (this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
            this.list.push(...this.tableData.tbodyList);
          }
        }
      });
    },
    changePage() {
      let currentPage = this.tableData.currentPage + 1;
      this.getDocumentonlineList(currentPage);
    },
    toggleSiderHide(siderHide) {
      if (!siderHide) {
        this.rightWidth = 0;
      } else {
        this.rightWidth = 300;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.right-list {
  height: 100%;
  border-left: 1px solid;
}
</style>
