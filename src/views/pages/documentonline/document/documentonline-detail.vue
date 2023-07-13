<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain
      :isSiderHide="isSiderHide"
      :siderWidth="300"
      :rightWidth="rightWidth"
      enableCollapse
      @toggleSiderHide="toggleSiderHide"
    >
      <template v-slot:topLeft>
        <DocumentonlineNav :upwardNameList="upwardNameList"></DocumentonlineNav>
      </template>
      <template v-slot:sider>
        <DocumentonlineTree
          :upwardNameList="upwardNameList"
          @selectTreeNode="selectTreeNode"
        ></DocumentonlineTree>
      </template>
      <template v-slot:content>
        <!-- 文档详情 -->
        <div
          v-if="!loadingShow && filePath"
          ref="documentonlineContent"
          class="documentonline-content"
          @scroll="handleScroll"
        >
          <DocumentonlineContent
            :content="content"
            :filePath="filePath"
            :anchorPoint="anchorPoint"
            @getHeadings="getHeadings"
          ></DocumentonlineContent>
        </div>
       
        <!-- 文档列表 -->
        <DocumentonlineList v-else-if="!loadingShow" :upwardNameList="upwardNameList" @getDetail="getDetail"></DocumentonlineList>
      </template>
      <template v-if="filePath" v-slot:right>
        <div class="right-list border-color pl-nm">
          <Tabs v-model="currentTab" :animated="false">
            <TabPane :label="$t('page.catalogue')" name="headings">
              <!-- 将目录渲染到页面 -->
              <ul>
                <li
                  v-for="heading in headings"
                  :key="heading.id"
                  class="tsfont-dot overflow pb-sm cursor-pointer"
                  :style="{'padding-left': (heading.level *8) + 'px'}"
                  @click.stop="goAnchorPoint(heading.id)"
                >
                  <span :class="{'text-href':anchorPointId === heading.id}">{{ heading.text }}</span>
                </li>
              </ul>
            </TabPane>
            <TabPane :label="$t('term.process.relateknowledge')" name="file">
              <div
                v-for="(item,index) in list"
                :key="index"
                class="tsfont-dot text-tip-active overflow pb-nm"
                @click="getDetail(item)"
              >
                {{ item.fileName }}
              </div>
              <div v-if="tableData.currentPage< tableData.pageCount" class="text-href pl-nm" @click="changePage()">{{ $t('page.viewmore') }}</div>
            </TabPane>
          </Tabs>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    DocumentonlineTree: resolve => require(['./documentonline-tree.vue'], resolve),
    DocumentonlineNav: resolve => require(['./documentonline-nav.vue'], resolve),
    DocumentonlineContent: resolve => require(['./documentonline-content.vue'], resolve),
    DocumentonlineList: resolve => require(['./documentonline-list.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      isSiderHide: true,
      rightWidth: 300,
      filePath: '',
      content: '',
      upwardNameList: [],
      list: [],
      tableData: {},
      preUpwardNameList: [], //文档上层目录列表
      anchorPoint: '',
      currentTab: 'headings',
      headings: [],
      anchorPointId: ''
    };
  },
  beforeCreate() {},
  created() {
    this.$localStore.remove('searchKeyword', 'common');
    if (this.$route.query) {
      this.filePath = this.$route.query.filePath;
      this.anchorPoint = this.$route.query.anchorPoint || '';
      if (this.$route.query.isSiderHide && this.$route.query.isSiderHide === 'false') {
        this.isSiderHide = false;
      }
      let upwardNameList = this.$route.query.upwardNameList;
      if (upwardNameList) {
        this.upwardNameList = upwardNameList.split('/');
      }
    }
    this.init();
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
    async init() {
      this.loadingShow = true;
      if (this.filePath) {
        await this.getDocumentDetail();
        this.getDocumentonlineList();
      } else {
        this.loadingShow = false;
      }
    },
    getDocumentDetail() {
      if (!this.filePath) {
        return;
      }
      let data = {
        filePath: this.filePath
      };
      return this.$api.documentonline.getDocumentDetail(data).then(res => {
        if (res.Status === 'OK') {
          this.content = res.Return.content; 
          this.upwardNameList = res.Return.upwardNameList || [];
          this.preUpwardNameList = this.upwardNameList.slice(0, this.upwardNameList.length - 1);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getDocumentonlineList(currentPage) { //文档的相关的知识
      let data = {
        currentPage: currentPage || 1,
        upwardNameList: this.preUpwardNameList
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
      this.isSiderHide = siderHide;
    },
    getDetail(item) {
      this.clearData();
      this.filePath = item.filePath;
      this.init();
    },
    selectTreeNode(node) {
      this.clearData();
      this.filePath = node.filePath || '';
      this.isSiderHide = false;
      if (node.isFile) {
        this.init();
      } else {
        this.upwardNameList = node.upwardNameList;
      }
    },
    clearData() {
      this.filePath = '';
      this.content = '';
      this.anchorPoint = '';
      this.list = [];
      this.upwardNameList = [];
      this.preUpwardNameList = [];
    },
    getHeadings(headings) {
      this.headings = headings;
      if (this.headings && this.headings.length > 0) {
        this.anchorPointId = this.headings[0].id;
      }
    },
    goAnchorPoint(id) {
      if (id) {
        this.anchorPointId = id;
        this.$utils.jumpTo('#' + id, 'smooth');
      }
    },
    handleScroll(event) {
      // 监听滚动事件，根据滚动的位置获取当前定位的目录项
      const contentHeight = this.$refs.documentonlineContent.offsetHeight;
      const scrollTop = this.$refs.documentonlineContent.scrollTop;
      const scrollBottom = scrollTop + contentHeight;
      for (let i = 0; i < this.headings.length; i++) {
        const heading = this.headings[i];
        const element = document.getElementById(heading.id);

        if (element) {
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;

          if (elementTop <= scrollBottom && elementBottom >= scrollTop) {
            this.anchorPointId = heading.id;
            return;
          }
        }
      }

      this.anchorPointId = null; // 如果没有匹配的
    }
  },
  filter: {},
  computed: {},
  watch: {
    isSiderHide(val) {
      if (!val) {
        this.rightWidth = 0;
      } else {
        this.rightWidth = 300;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.right-list {
  height: 100%;
  border-left: 1px solid;
}
.documentonline-content {
  height: 100%;
  overflow: auto;
}
</style>
