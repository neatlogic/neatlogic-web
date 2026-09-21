<template>
  <div ref="documentLayout" class="document-layout" :class="{'is-narrow-screen': isNarrowScreen}">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="document-shell" :style="{height: layoutHeight}">
      <div
        class="tree-column"
        :class="{'is-collapsed': isTreeCollapsed, 'is-hover-blocked': isTreeHoverBlocked}"
        @mouseleave="isTreeHoverBlocked = false"
      >
        <div v-if="isTreeCollapsed" class="tree-reopen">
          <span
            class="navigation-toggle tree-toggle tsfont-bar text-action"
            @click="toggleTree"
          ></span>
        </div>
        <aside id="document-tree" class="document-sidebar bg-grey border-color">
          <div class="sidebar-header">
            <Tooltip :content="isTreeCollapsed ? $t('page.expand') : $t('page.packup')" placement="top" transfer>
              <span
                class="navigation-toggle tree-toggle tsfont-bar text-action"
                @click="toggleTree"
              ></span>
            </Tooltip>
            <span class="sidebar-title">{{ $t('term.documentonline.helpcenter') }}</span>
          </div>
          <div class="document-tree-scroll">
            <DocumentonlineTree :upwardNameList="upwardNameList" @selectTreeNode="selectTreeNode"></DocumentonlineTree>
          </div>
        </aside>
      </div>
      <main class="document-main bg-op">
        <header class="document-header border-color">
          <div v-if="isTreeCollapsed" class="sidebar-reopen"></div>
          <div class="document-breadcrumb">
            <DocumentonlineNav :upwardNameList="upwardNameList"></DocumentonlineNav>
          </div>
        </header>
        <div class="document-columns" :class="{'is-navigation-collapsed': isNavigationCollapsed}">
          <!-- 阅读区内的文章目录，可独立收起 -->
          <aside
            v-if="filePath"
            class="navigation-column"
            :class="{'is-collapsed': isNavigationCollapsed, 'is-hover-blocked': isNavigationHoverBlocked}"
            @mouseleave="isNavigationHoverBlocked = false"
          >
            <div class="navigation-surface bg-op">
              <div class="navigation-toolbar">
                <Tooltip :content="isNavigationCollapsed ? $t('page.expand') : $t('page.packup')" placement="top" transfer>
                  <span
                    class="navigation-toggle tree-toggle text-grey"
                    :class="isNavigationCollapsed ? 'tsfont-document-directory' : 'tsfont-double-arrow-left'"
                    @click="toggleNavigation"
                  ></span>
                </Tooltip>
              </div>
              <DocumentonlineNavigation
                id="document-navigation"
                class="navigation-panel"
                :headings="headings"
                :anchorPointId="anchorPointId"
                :currentTab.sync="currentTab"
                :list="list"
                :tableData="tableData"
                @select-heading="goAnchorPoint"
                @select-document="getDetail"
                @load-more="changePage"
              />
            </div>
          </aside>
          <!-- 第三列：文档正文 -->
          <div class="reading-area">
            <div
              v-if="!loadingShow && filePath"
              ref="documentonlineContent"
              class="documentonline-content"
              @scroll="handleScroll()"
            >
              <DocumentonlineContent
                :content="content"
                :filePath="filePath"
                :anchorPoint="anchorPoint"
                @getHeadings="getHeadings"
              ></DocumentonlineContent>
            </div>
            <DocumentonlineList v-else-if="!loadingShow" :upwardNameList="upwardNameList" @getDetail="getDetail">
            </DocumentonlineList>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    DocumentonlineNavigation: () => import('./documentonline-navigation.vue'),
    DocumentonlineTree: () => import('./documentonline-tree.vue'),
    DocumentonlineNav: () => import('./documentonline-nav.vue'),
    DocumentonlineContent: () => import('./documentonline-content.vue'),
    DocumentonlineList: () => import('./documentonline-list.vue')
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      isNavigationCollapsed: window.innerWidth < 1200,
      isNarrowScreen: window.innerWidth < 1200,
      isTreeCollapsed: false,
      isTreeHoverBlocked: false,
      isNavigationHoverBlocked: false,
      layoutHeight: 'calc(100vh - 50px)',
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
      this.isTreeCollapsed = this.$route.query.isSiderHide === 'true';
      this.filePath = this.$route.query.filePath;
      this.anchorPoint = this.$route.query.anchorPoint || '';
      let upwardNameList = this.$route.query.upwardNameList;
      if (upwardNameList) {
        this.upwardNameList = upwardNameList.split('/');
      }
    }
    this.init();
  },
  beforeMount() {},
  mounted() {
    this.updateLayoutHeight();
    window.addEventListener('resize', this.updateLayoutHeight);
  },
  beforeUpdate() {},
  updated() {},
  activated() {
    this.updateLayoutHeight();
  },
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.updateLayoutHeight);
  },
  destroyed() {},
  methods: {
    toggleTree() {
      this.isTreeCollapsed = !this.isTreeCollapsed;
      // 点击收起后，等鼠标移出再允许悬浮展开，避免目录立即覆盖回原位置。
      this.isTreeHoverBlocked = this.isTreeCollapsed;
    },
    toggleNavigation() {
      this.isNavigationCollapsed = !this.isNavigationCollapsed;
      this.isNavigationHoverBlocked = this.isNavigationCollapsed;
    },
    updateLayoutHeight() {
      const isNarrowScreen = window.innerWidth < 1200;
      // 仅在跨越断点时自动切换，保留同一宽度区间内的手动展开/收起状态。
      if (this.isNarrowScreen !== isNarrowScreen) {
        this.isNarrowScreen = isNarrowScreen;
        this.isNavigationCollapsed = isNarrowScreen;
      }
      this.$nextTick(() => {
        const layout = this.$refs.documentLayout;
        if (layout) {
          this.layoutHeight = Math.max(0, window.innerHeight - layout.getBoundingClientRect().top) + 'px';
        }
      });
    },
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
      return this.$api.documentonline
        .getDocumentDetail(data)
        .then(res => {
          if (res.Status === 'OK') {
            this.content = res.Return.content;
            this.upwardNameList = res.Return.upwardNameList || [];
            this.preUpwardNameList = this.upwardNameList.slice(0, this.upwardNameList.length - 1);
          }
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    getDocumentonlineList(currentPage) {
      //文档的相关的知识
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
    getDetail(item) {
      this.clearData();
      this.filePath = item.filePath;
      this.init();
    },
    selectTreeNode(node) {
      this.clearData();
      this.filePath = node.filePath || '';
      if (node.isFile) {
        this.init();
      } else {
        this.upwardNameList = node.upwardNameList;
      }
    },
    clearData() {
      this.headings = [];
      this.anchorPointId = '';
      this.tableData = {};
      this.currentTab = 'headings';
      this.filePath = '';
      this.content = '';
      this.anchorPoint = '';
      this.list = [];
      this.upwardNameList = [];
      this.preUpwardNameList = [];
    },
    getHeadings(headings) {
      this.headings = headings || [];
      this.anchorPointId = this.headings.some(heading => heading.id === this.anchorPoint) ? this.anchorPoint : this.headings[0] ? this.headings[0].id : '';
    },
    goAnchorPoint(id) {
      const container = this.$refs.documentonlineContent;
      const element = document.getElementById(id);
      if (container && element && container.contains(element)) {
        this.anchorPointId = id;
        container.scrollTo({
          top: element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 16,
          behavior: 'smooth'
        });
      }
    },
    handleScroll() {
      const container = this.$refs.documentonlineContent;
      if (!container || !this.headings.length) return;
      let activeId = this.headings[0].id;
      const top = container.getBoundingClientRect().top + 24;
      for (const heading of this.headings) {
        const element = document.getElementById(heading.id);
        if (element && container.contains(element) && element.getBoundingClientRect().top <= top) {
          activeId = heading.id;
        }
      }
      if (container.scrollTop > 0 && container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
        activeId = this.headings[this.headings.length - 1].id;
      }
      this.anchorPointId = activeId;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.document-layout {
  width: 100%;
}
.document-shell {
  display: flex;
  min-height: 0;
  overflow: hidden;
}
.tree-column {
  position: relative;
  flex: 0 0 298px;
  min-height: 0;
}
.tree-column.is-collapsed {
  flex-basis: 0;
  width: 0;
  z-index: 3;
  .document-sidebar {
    display: none;
    position: absolute;
    inset: 0 auto 0 0;
    box-shadow: 4px 0 16px rgba(0, 0, 0, 0.12);
  }
  .document-layout.is-narrow-screen &:not(.is-hover-blocked):hover .document-sidebar {
    display: flex;
  }
}
.tree-reopen {
  position: absolute;
  top: 0;
  left: 0;
  width: 66px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.document-sidebar {
  flex: 0 0 298px;
  width: 298px;
  height: 100%;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid;
}
.sidebar-header,
.document-header {
  display: flex;
  align-items: center;
  flex: 0 0 56px;
  min-width: 0;
  padding: 0 16px;
  gap: 12px;
}
.sidebar-title {
  font-size: 16px;
}
.document-tree-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px 12px;
}
.document-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
}
.document-header {
  border-bottom: 1px solid;
}
.sidebar-reopen {
  flex: 0 0 34px;
}
.document-breadcrumb {
  min-width: 0;
  overflow: auto;
}
.document-columns {
  // 小屏收窄目录，为正文留出空间；大屏限制目录宽度。
  --document-navigation-width: clamp(200px, 18vw, 300px);
  --document-title-line-height: 36px;
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  padding-top: 19px;
}
.document-columns.is-navigation-collapsed {
  --document-navigation-width: 48px;
}
.navigation-column {
  position: relative;
  flex: 0 0 var(--document-navigation-width);
  width: var(--document-navigation-width);
  min-width: 0;
  min-height: 0;
  padding-left: 12px;
}
.navigation-surface {
  height: 100%;
}
.navigation-column.is-collapsed {
  z-index: 2;
  .navigation-surface {
    height: var(--document-title-line-height);
  }
  .navigation-panel {
    display: none;
  }
  .document-layout.is-narrow-screen &:not(.is-hover-blocked) .navigation-surface:hover {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    width: min(300px, calc(100vw - 32px));
    padding-left: 12px;
    box-shadow: 4px 0 16px rgba(0, 0, 0, 0.12);
    .navigation-panel {
      display: block;
    }
  }
}
.navigation-toolbar {
  display: flex;
  align-items: center;
  height: var(--document-title-line-height);
}
.navigation-toolbar ::v-deep .ivu-tooltip-rel {
  display: flex;
}
.navigation-toggle {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  flex: 0 0 auto;
}
.tree-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.navigation-toggle:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -2px;
}
.navigation-column .navigation-panel {
  height: calc(100% - var(--document-title-line-height));
  padding: 0 12px 16px 0;
}
.reading-area {
  flex: 1;
  height: 100%;
  min-width: 0;
  overflow: auto;
}
.documentonline-content {
  height: 100%;
  overflow: auto;
  padding: 0 32px 32px;
}
.documentonline-content ::v-deep .ts-markdown-editor {
  padding-right: 0;
}
.documentonline-content ::v-deep .cherry {
  box-shadow: none;
}
.documentonline-content ::v-deep .cherry .cherry-previewer {
  max-width: 960px;
  padding-top: 0 !important;  // 高于编辑器公共 padding !important 的优先级，避免异步加载后恢复顶部留白。
  margin: 0 auto;  // 正文在第三列内居中，左右留白保持一致。
}
.documentonline-content ::v-deep .cherry-markdown > :first-child {
  margin-top: 0;
}
.documentonline-content ::v-deep .cherry-markdown > h1:first-child {
  line-height: var(--document-title-line-height);
}
@media (max-width: 1100px) {
  .documentonline-content {
    padding-right: 16px;
    padding-left: 16px;
  }
}
</style>
