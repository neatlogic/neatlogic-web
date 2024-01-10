<template>
  <div class="history-message">
    <TsContain :hideHeader="true" border="border">
      <template v-slot:sider>
        <div class="tree-container">
          <Tree
            :data="tree"
            :render="renderTreeNode"
            emptyText=""
            class="ts-tree"
            @on-select-change="handleNodeSelect"
            @on-toggle-expand="handleNodeExpand"
          />
        </div>
      </template>
      <template v-slot:content>
        <div class="main" :class="tableConfig.rowNum > 0 ? 'main-position' : ''">
          <div v-if="unreadCount > 0" class="top-container flex-start">
            <i class="tsfont-mark-all text-action" @click="readAll">{{ $t('page.allmarkread') }}</i>
          </div>

          <Loading :loadingShow="isLoading" type="fix"></Loading>
          <div v-if="tableConfig.rowNum > 0" class="message-container" :class="{'all-read': unreadCount === 0}">
            <section v-for="(messages, daysAgo) in messagesOfDaysAgo" :key="daysAgo" class="message-group">
              <div v-if="messages.length > 0" class="text-title">
                {{ daysAgo === '0' ? $t('page.today') : daysAgo === '1' ? $t('page.yesterday') : $t('term.framework.targetdayago',{target:daysAgo}) }}
              </div>
              <section 
                v-for="message in messages"
                :key="message.id"
                v-imgViewer
                class="message bg-block block-container" 
                :class="{'message-isread': !message.isRead}"
                @click="read(message)"
              >
                <!-- 收起时 -->
                <div v-if="!message.expand" class="fold flex-between">
                  <header class="title-container overflow flex-start">
                    <i :class="message.isRead ? 'tsfont-message-o text-pending' : 'tsfont-message-o text-success'"></i>
                    <div class="title overflow" v-html="message.title"></div>
                  </header>
                  <article class="content overflow" v-html="message.content"></article>
                  <time class="time text-grey">{{ message.fcd | formatDate }}</time>
                </div>
                <!-- 展开时 -->
                <div v-else class="expand">
                  <div class="flex-between align-start">
                    <header class="title-container overflow flex-start align-start">
                      <i :class="message.isRead ? 'tsfont-message-o text-pending' : 'tsfont-message-o text-success'"></i>
                      <div class="title overflow" v-html="message.title"></div>
                    </header>
                    <time class="time text-grey">{{ message.fcd | formatDate }}</time>
                  </div>
                  <article class="content" v-html="message.content"></article>
                </div>
              </section>
            </section>
          </div>

          <div v-if="tableConfig.rowNum > 0" class="page-container clearfix bg-grey">
            <Page
              :current.sync="tableConfig.currentPage"
              :page-size="tableConfig.pageSize"
              :total="tableConfig.rowNum" 
              size="small"
              transfer
              show-total
              show-sizer
              class="page"
              @on-change="currentPage => getHistoryList({ currentPage })" 
              @on-page-size-change="pageSize => getHistoryList({ pageSize })"
            />
          </div>
          <NoData v-else :isVerticalCenter="true" />
        </div>
      </template>
    </TsContain>
  </div>
  
</template>

<script>
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: 'HistoryMessage',
  directives: { imgViewer },
  components: {},
  props: {
    timeParams: Object,
    triggerSearch: Boolean,
    keyword: String
  },
  data() {
    return {
      isLoading: false,
      unreadCount: 0,
      tree: [],
      selectedNodeUuid: null,
      expandNodeUuidSet: new Set([null]),
      searchParams: {
        messageTypePath: [],
        currentPage: 1,
        pageSize: 20
      },
      todayTimestamp: new Date().setHours(24, 0, 0, 0), //今天晚上24点的时间戳
      tableConfig: {}
    };
  },
  mounted() {
    this.getHistoryList();
    this.getTree('init');
  },
  beforeDestroy() {
    clearTimeout(this.timeoutId);
  },
  methods: {
    async getHistoryList(searchParams = {}) {
      this.searchParams = { 
        ...this.searchParams, 
        currentPage: 1, 
        ...searchParams 
      };
      const params = { 
        ...this.searchParams,
        ...this.timeParams,
        keyword: this.keyword
      };
      this.isLoading = true;
      const res = await this.$api.framework.message.getHistoryList(params);
      const {currentPage, pageSize, rowNum, tbodyList, unreadCount} = res.Return;
      this.tableConfig = {currentPage, pageSize, rowNum, tbodyList};
      this.unreadCount = unreadCount;
      this.isLoading = false;
    },
    async getTree(type = 'refresh') {
      clearTimeout(this.timeoutId);
      const params = {
        ...this.timeParams,
        keyword: this.keyword
      };
      const res = await this.$api.framework.message.getTree(params);
      const rootNode = {
        name: this.$t('page.allofthem'),
        uuid: null,
        expand: this.expandNodeUuidSet.has(null),
        selected: this.selectedNodeUuid === null
      };
      rootNode.children = this.traverseTree(res.Return, node => {
        node.selected = this.selectedNodeUuid === node.uuid;
        if (type === 'init') {
          if (node.name === this.$t('page.allofthem') || node.total || node.unreadCount) {
            node.expand = true;
            this.expandNodeUuidSet.add(node.uuid);
          }
        } else {
          node.expand = this.expandNodeUuidSet.has(node.uuid);
        }
        return node;
      }, rootNode);
      this.tree = [rootNode];
      await this.$nextTick();
      this.$el.querySelector('.ivu-tree-arrow').classList.add('all');
      this.timeoutId = setTimeout(() => {
        this.getTree('refresh');
        this.getHistoryList({currentPage: this.searchParams.currentPage});
      }, 60 * 1000);
    },
    async readAll() {
      const params = {
        messageTypePath: this.searchParams.messageTypePath,
        keyword: this.keyword,
        ...this.timeParams
      };
      await this.$api.framework.message.readMessage(params);
      this.tableConfig.tbodyList.forEach(message => {
        message.isRead = 1;
      });
      this.unreadCount = 0;
    },
    async read(message) {
      if (window.getSelection().toString()) return;
      this.$set(message, 'expand', !message.expand);
      if (message.isRead) return;
      await this.$api.framework.message.readMessage({messageId: message.id});
      message.isRead = 1;
      this.unreadCount -= 1;
      this.traverseTree(this.tree, node => {
        if (node.uuid === message.trigger) {
          let currentNode = node;
          do {
            currentNode.unreadCount -= 1;
            currentNode = currentNode.parentNode;
          } while (currentNode && currentNode.name !== this.$t('page.allofthem'));
        }
      });
    },
    traverseTree(tree, callback = () => {}, parentNode) {
      return tree.map(node => {
        node.parentNode = parentNode;
        callback(node);
        if (node.children) {
          this.traverseTree(node.children, callback, node);
        }
        return node;
      });
    },
    renderTreeNode(h, { data }) {
      let countVnode;
      const {total, unreadCount, children} = data;
      if (unreadCount) {
        if (children) {
          countVnode = h('span', {class: 'red-dot bg-danger'}); 
        } else if (unreadCount < 100) {
          countVnode = h('span', {class: 'count bg-danger text-white'}, unreadCount);
        } else {
          countVnode = h('span', {class: 'count bg-danger text-white'}, '99+');
        }
      } else if (total) {
        if (total < 100) {
          countVnode = h('span', {class: 'total'}, total);
        } else {
          countVnode = h('span', {class: 'total'}, '99+');
        }
      } else {
        countVnode = null;
      }
      return h('div', [
        h('span', {class: 'name'}, data.name),
        countVnode
      ]);
    },
    handleNodeSelect(selectedNodeList, selectedNode) {
      selectedNode.selected = true;
      this.selectedNodeUuid = selectedNode.uuid;
      let messageTypePath = [];
      let currentNode = selectedNode;
      while (currentNode.uuid) {
        messageTypePath.unshift(currentNode.uuid);
        if (currentNode.parentNode) {
          currentNode = currentNode.parentNode;
        } else break;
      }
      this.getHistoryList({ messageTypePath });
    },
    handleNodeExpand(node) {
      if (node.expand) {
        this.expandNodeUuidSet.add(node.uuid);
      } else {
        this.expandNodeUuidSet.delete(node.uuid);
      }
    }
  },
  computed: {
    messagesOfDaysAgo() {
      const messagesOfDaysAgo = {};
      const msPerDay = 1000 * 60 * 60 * 24;
      for (let message of this.tableConfig.tbodyList) {
        const daysAgo = Math.floor((this.todayTimestamp - message.fcd) / msPerDay);
        if (!messagesOfDaysAgo.hasOwnProperty(daysAgo)) {
          messagesOfDaysAgo[daysAgo] = [];
        }
        messagesOfDaysAgo[daysAgo].push(message);
      }
      return messagesOfDaysAgo;
    }
  },
  watch: {
    timeParams() {
      this.getHistoryList();
      this.getTree('refresh');
    },
    triggerSearch(triggerSearch) {
      if (triggerSearch) {
        this.getHistoryList();
        this.getTree('refresh');
        this.$emit('update:triggerSearch', false);
      }
    },
    '$store.state.readMessage'() {
      this.getHistoryList({currentPage: this.searchParams.currentPage});
      this.getTree('refresh');
    }
  }
};
</script>

<style lang="less">
.history-message {
  // height: calc(100vh - 56px - 56px - 2px);
  .tree-container {
    // height: 100%;
    // border-right: 1px solid;
    .ivu-tree-arrow {
      vertical-align: unset;
      &.all {
        margin-left: -4px;
        visibility: hidden;
      }
    }
    .ivu-tree-children {
      padding-left: 12px;
    }
    .ivu-tree li {
      padding: unset !important;
    }
    .name {
      vertical-align: unset;
    }
    .red-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-left: 5px;
    }
    .count {
      display: inline-block;
      padding: 6px;
      height: 18px;
      line-height: 6px;
      text-align: center;
      border-radius: 9px;
      margin-left: 5px;
    }
    .total {
      padding-left: 6px;
      vertical-align: unset;
    }
  }
  .main {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .main-position {
    position: relative;
  }
  .top-container {
    padding: 0 16px;
    height: 52px;
    position: sticky;
    top: 0;
  }
  .message-container {
    max-height: calc(100% - 52px - 44px);
    padding: 0 16px;
    overflow: auto;
    &.all-read {
      max-height: calc(100% - 44px);
    }
    .message-group {
      margin-top: 10px;
    }
    .message {
      margin: 15px 0;
      padding: 15px 20px;
      cursor: pointer;
      .title-container {
        flex-shrink: 0;
        max-width: calc(100% - 140px - 10px - 50px);
      }
      .title {
        margin-left: 10px;
      }
      .time {
        flex: 0 0 140px;
        margin-left: 50px;
      }
      &-isread {
        .title, .time {
          font-weight: bolder;
        }
      }
      .expand {
        .content {
          margin: 10px 0 0 24px;
          img {
            max-width: 50%;
          }
        }
      }
      .fold {
        max-height: 21px;
        overflow: hidden;
        .title-container {
          margin-right: 50px;
        }
        .title {
          width: 300px;
        }
        .content {
          flex-grow: 1;
          figure::after {
            font-family: "tsfont" !important;
            content: "\e8c0";
          }
          img, figcaption {
            display: none;
          }
          p, figure, figcaption {
            display: inline;
          }
        }
        br {
          display: none;
        }
      }
    }
  }
  .page-container {
    padding: 10px;
    position: sticky;
    bottom: 0;
    .page {
      float: right;
    }
  }
}
</style>
