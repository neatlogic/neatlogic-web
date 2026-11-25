<template>
  <div class="document-layout">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="document-shell">
      <button
        v-if="isSmallScreen && !isTreeCollapsed"
        type="button"
        class="tree-backdrop"
        :aria-label="$t('page.packup')"
        @click="isTreeCollapsed = true"
      ></button>
      <aside
        v-show="!isTreeCollapsed"
        id="document-tree"
        class="document-sidebar"
        :aria-label="$t('page.catalogue')"
      >
        <div class="sidebar-header">
          <span class="tsfont-document-directory text-primary" aria-hidden="true"></span>
          <span>{{ $t('page.catalogue') }}</span>
          <button
            v-if="isSmallScreen"
            type="button"
            class="panel-toggle sidebar-close tsfont-close"
            :aria-label="$t('page.packup')"
            @click="isTreeCollapsed = true"
          ></button>
        </div>
        <div class="document-tree-scroll">
          <DocumentonlineTree :upwardNameList="upwardNameList" @selectTreeNode="selectTreeNode" />
        </div>
      </aside>
      <main class="document-main">
        <header class="document-header">
          <Tooltip :content="$t('page.catalogue')" placement="bottom" transfer>
            <button
              type="button"
              class="panel-toggle tsfont-bar"
              :aria-label="$t('page.catalogue')"
              :aria-expanded="!isTreeCollapsed"
              aria-controls="document-tree"
              @click="isTreeCollapsed = !isTreeCollapsed"
            ></button>
          </Tooltip>
          <Tooltip
            v-if="filePath"
            :content="$t('term.documentonline.articleoutline')"
            placement="bottom"
            transfer
          >
            <button
              type="button"
              class="panel-toggle tsfont-list"
              :aria-label="$t('term.documentonline.articleoutline')"
              :aria-expanded="!isNavigationCollapsed"
              aria-controls="document-navigation"
              @click="toggleNavigation"
            ></button>
          </Tooltip>
          <DocumentonlineNav class="document-breadcrumb" :upwardNameList="upwardNameList" />
          <Tooltip
            v-if="relatedDocumentList.length"
            :content="$t('term.process.relateknowledge')"
            placement="bottom"
            transfer
          >
            <button
              type="button"
              class="panel-toggle tsfont-book"
              :aria-label="$t('term.process.relateknowledge')"
              :aria-expanded="String(!isRelatedCollapsed)"
              aria-controls="document-related"
              @click="toggleRelated"
            ></button>
          </Tooltip>
        </header>
        <div class="document-columns" :class="{'is-reading': filePath}">
          <aside
            v-if="filePath"
            v-show="!isNavigationCollapsed"
            id="document-navigation"
            class="article-panel outline-panel"
            :aria-label="$t('term.documentonline.articleoutline')"
          >
            <h2 class="article-panel-title">{{ $t('page.catalogue') }}</h2>
            <DocumentonlineNavigation
              :headings="headings"
              :anchorPointId="anchorPointId"
              @select-heading="goAnchorPoint"
            />
          </aside>
          <div class="reading-area">
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
              />
            </div>
            <DocumentonlineList v-else-if="!loadingShow" :upwardNameList="upwardNameList" @getDetail="getDetail" />
          </div>
          <aside
            v-if="relatedDocumentList.length"
            v-show="!isRelatedCollapsed"
            id="document-related"
            class="article-panel related-panel"
            :aria-label="$t('term.process.relateknowledge')"
          >
            <h2 class="article-panel-title">{{ $t('term.process.relateknowledge') }}</h2>
            <ul>
              <li v-for="item in relatedDocumentList" :key="item.filePath">
                <button
                  type="button"
                  class="navigation-link"
                  :title="item.fileName"
                  @click="getDetail(item)"
                >{{ item.fileName }}</button>
              </li>
            </ul>
          </aside>
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
      isNavigationCollapsed: window.innerWidth <= 1120,
      isRelatedCollapsed: window.innerWidth <= 1120,
      isNarrowScreen: window.innerWidth <= 1120,
      isTreeCollapsed: window.innerWidth <= 760,
      isSmallScreen: window.innerWidth <= 760,
      filePath: '',
      content: '',
      upwardNameList: [],
      relatedDocumentList: [],
      anchorPoint: '',
      headings: [],
      anchorPointId: ''
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query) {
      this.isTreeCollapsed = this.isSmallScreen || this.$route.query.isSiderHide === 'true';
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
    this.updateResponsivePanels();
    window.addEventListener('resize', this.updateResponsivePanels);
  },
  beforeUpdate() {},
  updated() {},
  activated() {
    this.updateResponsivePanels();
  },
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.updateResponsivePanels);
  },
  destroyed() {},
  methods: {
    updateResponsivePanels() {
      const isNarrowScreen = window.innerWidth <= 1120;
      if (this.isNarrowScreen !== isNarrowScreen) {
        this.isNarrowScreen = isNarrowScreen;
        this.isNavigationCollapsed = isNarrowScreen;
        this.isRelatedCollapsed = isNarrowScreen;
      }
      const isSmallScreen = window.innerWidth <= 760;
      if (this.isSmallScreen !== isSmallScreen) {
        this.isSmallScreen = isSmallScreen;
        this.isTreeCollapsed = isSmallScreen || this.$route.query.isSiderHide === 'true';
      }
    },
    toggleNavigation() {
      this.isNavigationCollapsed = !this.isNavigationCollapsed;
      if (this.isNarrowScreen && !this.isNavigationCollapsed) {
        this.isRelatedCollapsed = true;
      }
    },
    toggleRelated() {
      this.isRelatedCollapsed = !this.isRelatedCollapsed;
      if (this.isNarrowScreen && !this.isRelatedCollapsed) {
        this.isNavigationCollapsed = true;
      }
    },
    async init() {
      const filePath = this.filePath;
      if (!filePath) {
        this.loadingShow = false;
        return;
      }
      const relatedDocuments = this.relatedDocumentList;
      this.loadingShow = true;
      try {
        const res = await this.$api.documentonline.getDocumentDetail({filePath});
        // 切换文档时会替换列表，避免旧请求写回当前页面。
        if (this.relatedDocumentList === relatedDocuments && res.Status === 'OK') {
          this.content = res.Return.content;
          this.upwardNameList = res.Return.upwardNameList || [];
          relatedDocuments.push(...(res.Return.relatedDocumentList || []));
        }
      } finally {
        if (this.relatedDocumentList === relatedDocuments) {
          this.loadingShow = false;
        }
      }
    },
    getDetail(item) {
      if (this.isNarrowScreen) {
        this.isRelatedCollapsed = true;
      }
      this.clearData();
      this.filePath = item.filePath;
      this.anchorPoint = item.anchorPoint || '';
      this.init();
    },
    selectTreeNode(node) {
      if (this.isSmallScreen) {
        this.isTreeCollapsed = true;
      }
      this.clearData();
      this.filePath = node.filePath || '';
      if (!node.isFile) {
        this.upwardNameList = node.upwardNameList;
      }
      this.init();
    },
    clearData() {
      this.headings = [];
      this.anchorPointId = '';
      this.filePath = '';
      this.content = '';
      this.anchorPoint = '';
      this.relatedDocumentList = [];
      this.upwardNameList = [];
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
        if (this.isNarrowScreen) {
          this.isNavigationCollapsed = true;
        }
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
.document-layout,
.document-shell {
  height: 100%;
  min-height: 0;
}
.document-shell {
  position: relative;
  display: flex;
  overflow: hidden;
}
.document-sidebar {
  flex: 0 0 244px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--help-background);
  border-right: 1px solid var(--help-border);
}
.sidebar-header,
.document-header {
  flex: 0 0 52px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0 16px;
  border-bottom: 1px solid var(--help-border);
}
.sidebar-header {
  font-size: 14px;
  font-weight: 650;
}
.sidebar-close {
  margin-left: auto;
}
.document-tree-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px 10px;
}
.document-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.document-header {
  background: var(--help-surface);
}
.panel-toggle {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: 0;
  border-radius: 7px;
  color: var(--help-muted);
  cursor: pointer;
  &:hover,
  &:focus-visible {
    color: var(--help-accent);
    background: var(--help-hover);
  }
}
.document-breadcrumb {
  flex: 1;
  min-width: 0;
}
.document-columns {
  position: relative;
  flex: 1;
  display: flex;
  min-width: 0;
  min-height: 0;
}
.document-columns.is-reading {
  background: var(--help-surface);
}
.reading-area {
  flex: 1;
  min-width: 0;
  overflow: auto;
}
.article-panel {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 12px 12px 16px;
  background: var(--help-surface);
  ::v-deep .navigation-link {
    display: block;
    width: 100%;
    padding: 7px 8px;
    border: 0;
    border-radius: 6px;
    background: none;
    color: var(--help-muted);
    text-align: left;
    cursor: pointer;
    font: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover {
      color: var(--help-accent);
      background: var(--help-hover);
    }
    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: -2px;
    }
    &.is-current {
      color: var(--help-accent);
      background: var(--help-accent-soft);
      font-weight: 600;
    }
  }
}
.article-panel-title {
  margin: 4px 8px 10px;
  font-size: 14px;
  font-weight: 650;
  color: var(--help-ink);
}
.outline-panel {
  flex: 0 0 clamp(156px, 14vw, 208px);
  border-right: 1px solid var(--help-border);
}
.related-panel {
  flex: 0 0 236px;
  border-left: 1px solid var(--help-border);
}
.documentonline-content {
  height: 100%;
  overflow: auto;
  padding: clamp(20px, 4vw, 44px) clamp(14px, 4vw, 48px);
}
.documentonline-content ::v-deep .ts-markdown-editor {
  padding-right: 0;
}
.documentonline-content ::v-deep .cherry {
  box-shadow: none;
}
.documentonline-content ::v-deep .cherry .cherry-previewer {
  max-width: 820px;
  padding: 0 !important; // 覆盖编辑器公共 padding，纵向间距由阅读区统一控制。
  margin: 0 auto;
}
.documentonline-content ::v-deep .cherry-markdown {
  color: var(--help-ink);
  font-size: 15px;
  line-height: 1.8;
  > :first-child {
    margin-top: 0;
  }
  > h1:first-child {
    font-size: clamp(24px, 3vw, 34px);
    line-height: 1.3;
  }
}
@media (max-width: 1120px) {
  .article-panel {
    position: absolute;
    z-index: 2;
    width: min(264px, 100%);
    box-shadow: var(--help-shadow);
  }
  .outline-panel {
    inset: 0 auto 0 0;
  }
  .related-panel {
    inset: 0 0 0 auto;
  }
}
@media (max-width: 760px) {
  .document-header {
    padding: 0 8px;
    gap: 6px;
  }
  .document-sidebar {
    position: absolute;
    z-index: 4;
    inset: 0 auto 0 0;
    width: min(270px, 86%);
    box-shadow: var(--help-shadow);
  }
}
.tree-backdrop {
  position: absolute;
  z-index: 3;
  inset: 0;
  padding: 0;
  border: 0;
  background: var(--help-overlay);
}
</style>
