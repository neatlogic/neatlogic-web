<template>
  <div class="search-result knowledge-search">
    <p v-if="currentPath" class="result-count">
      <span v-if="currentPath" class="current-path text-title">{{ currentPath }}</span>
      <span class="text-grey">({{ $t('term.knowledge.searchresult',{target: result.rowNum}) }})</span>
    </p>
    <div v-if="result && result.rowNum > 0">
      <div ref="resultmain" class="result-main" :style="setHeight(resultheight)">
        <ul class="result-list">
          <li
            v-for="(knowledge, index) in result.dataList"
            :key="index"
            class="result-item bg-block containers"
            @click="toDetailPage(knowledge)"
          >
            <div class="flex-between result-top">
              <div>
                <span v-if="knowledge.sourceName" :title="knowledge.sourceName" class="status-name bg-warning-grey">{{ $t('term.process.transfer') }}</span>
                <span class="title" v-html="knowledge.title"></span>
                <span v-if="knowledgeType == 'share' || knowledgeType == 'waitingforreview'" class="h3">
                  <span v-if="knowledge.fromVersion">【{{ knowledge.fromVersionName }}】</span>
                  <span v-if="knowledge.fromVersion && knowledge.version" class="tsfont-arrow-right"></span>
                  <span v-if="knowledge.version">【{{ knowledge.versionName }}】</span>
                </span>
                <span class="path text-grey">{{ knowledge.path.join(' / ') }}</span>
              </div>
              <ul class="action-group">
                <li v-if="knowledge.isEditable" class="tsfont-edit action-item" @click.stop="toEditKnowledge(knowledge)">{{ $t('page.edit') }}</li>
                <li v-if="knowledge.isDeletable" class="tsfont-trash-s action-item" @click.stop="deleteKnowledge(knowledge)">{{ $t('page.delete') }}</li>
                <li v-if="knowledge.hasOwnProperty('viewCount')" class="action-item" style="cursor: default;">
                  <span class="tsfont-eye text-tip"></span>
                  <span class="text-grey">{{ knowledge.viewCount }}</span>
                </li>
                <li v-if="knowledge.hasOwnProperty('favorCount')" class="action-item" @click.stop="toggleFavor(knowledge)">
                  <span class="tsfont-hand" :class="knowledge.isFavor == 1 ? 'text-success' : 'text-tip'"></span>
                  <span class="text-grey">{{ knowledge.favorCount }}</span>
                </li>
                <li
                  v-if="knowledge.hasOwnProperty('collectCount')"
                  class="action-item"
                  :class="knowledge.isCollect == 1 ? 'text-warning' : 'text-tip'"
                  @click.stop="toggleCollect(knowledge)"
                >
                  <span class="tsfont-star" :class="knowledge.isCollect == 1 ? 'text-warning' : 'text-tip'"></span>
                  <span class="text-grey" :title="knowledge.isCollect == 1 ? $t('page.collected') : $t('page.collect')">{{ knowledge.collectCount }}</span>
                </li>
                <li v-if="knowledge.rejectReason" class="action-item" @click.stop>
                  <Poptip
                    word-wrap
                    width="200"
                    placement="bottom"
                  >
                    <span>{{ $t('page.viewtarget',{target:$t('page.reason')}) }}</span>
                    <div slot="content">
                      {{ knowledge.rejectReason }}
                    </div>
                  </Poptip>
                </li>
                <li v-if="knowledge.statusVo" class="action-item" :style="{ color: knowledge.statusVo.color }">{{ knowledge.statusVo.text }}</li>
              </ul>
            </div>
            <div v-if="knowledge.tagVoList && knowledge.tagVoList.length > 0" class="tag-list">
              <Tag v-for="tag in knowledge.tagVoList" :key="tag.id" class="tag">{{ tag.name }}</Tag>
            </div>
            <div class="user-lcu text-tip">
              <span class="lcu" @click.stop>
                <UserCard v-bind="knowledge.lcuVo"></UserCard>
              </span>
              <span class="lcd">{{ $t('page.in') }}{{ knowledge.lcd | formatDate }}</span>
              <span>{{ $t('page.update') }}</span>
            </div>
            <div class="content line-2 text-tip" v-html="knowledge.content"></div>
          </li>
        </ul>
      </div>
      <div v-if="result.rowNum > 0" ref="resultpage" class="page-container">
        <Page
          :total="result.rowNum"
          :page-size="result.pageSize"
          :current="result.currentPage"
          size="small"
          transfer
          show-total
          show-sizer
          @on-change="currentPage => search({ currentPage })"
          @on-page-size-change="pageSize => search({ pageSize })"
        />
      </div>
    </div>
    <NoData v-else :text="getText"></NoData>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: resolve => require(['components/UserCard/UserCard'], resolve)
  },
  filters: {},
  props: {
    circleListNum: Number, //知识圈的个数
    result: Object, //搜索结果
    currentPath: String, //路径
    knowledgeType: String
  },
  data() {
    return {
      resultheight: '1000px',
      searchPage: {}
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    let _this = this;
    this.$nextTick(() => {
      window.addEventListener('resize', _this.initData);
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {
    document.title = this.$t(this.knowledgeTypeName);
  },
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      let resultheight = window.innerHeight - (this.$refs.resultmain ? this.$refs.resultmain.getBoundingClientRect().top : 0);
      if (this.$refs.resultpage) {
        resultheight = resultheight - this.$refs.resultpage.clientHeight;
      }
      this.$set(this, 'resultheight', Math.max(resultheight - 10, 40) - 10 + 'px');
    },
    search(param) {
      param && Object.assign(this.searchPage, param);
      this.$emit('searchResult', this.searchPage);
    },
    toDetailPage({ knowledgeDocumentId, knowledgeDocumentTypeUuid, id: knowledgeDocumentVersionId, fromVersion, status }) {
      this.$router.push({
        name: status === 'rejected' || status === 'submitted' ? 'review-detail' : 'knowledge-detail',
        query: { knowledgeDocumentId, knowledgeDocumentTypeUuid, knowledgeDocumentVersionId, fromVersion, status }
      });
    },
    toEditKnowledge({ knowledgeDocumentId, knowledgeDocumentTypeUuid, id: knowledgeDocumentVersionId, title }) {
      this.$router.push({
        name: 'knowledge-edit',
        query: { knowledgeDocumentId, knowledgeDocumentTypeUuid, knowledgeDocumentVersionId, title }
      });
    },
    deleteKnowledge(row) {
      if (this.knowledgeType === 'draft' || this.knowledgeType === 'share') {
        this.deleteDraft(row);
      } else {
        this.deleteDocument(row);
      }
    },
    deleteDraft({ title, id: knowledgeDocumentVersionId }) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: title}),
        btnType: 'error',
        'on-ok': async vnode => {
          const params = { knowledgeDocumentVersionId };
          if (!vnode.isShow) {
            return;
          }
          try {
            await this.$api.knowledge.overview.deleteDraft(params);
            this.$Message.success(this.$t('message.deletesuccess'));
            this.search();
            this.$emit('addNewRule');
          } finally {
            vnode.isShow = false;
          }
        }
      });
    },
    deleteDocument({ title, knowledgeDocumentId }) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: title}),
        btnType: 'error',
        'on-ok': async vnode => {
          const params = { knowledgeDocumentId };
          if (!vnode.isShow) {
            return;
          }
          try {
            await this.$api.knowledge.overview.deleteDocument(params);
            this.$Message.success(this.$t('message.deletesuccess'));
            this.search();
            this.$emit('addNewRule');
          } finally {
            vnode.isShow = false;
          }
        }
      });
    },
    toggleFavor(row) {
      //点赞
      row.isFavor = row.isFavor === 1 ? 0 : 1;
      let data = {
        documentId: row.knowledgeDocumentId,
        isFavor: row.isFavor
      };
      this.$api.knowledge.knowledge.favorDocument(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.search();
        }
      });
    },
    async toggleCollect(row) {
      row.isCollect = row.isCollect === 1 ? 0 : 1;
      const params = {
        documentId: row.knowledgeDocumentId,
        isCollect: row.isCollect
      };
      try {
        await this.$api.knowledge.overview.toggleCollect(params);
        this.$Message.success(this.$t('message.executesuccess'));
        this.search();
        this.$emit('addNewRule');
      } catch {
        row.isCollect = row.isCollect === 1 ? 0 : 1;
      }
    }
  },
  computed: {
    knowledgeTypeName() {
      return this.$store.getters['leftMenu/getKnowLedgeTypeName'](this.knowledgeType);
    },
    getText() {
      return this.knowledgeType === 'all' && this.circleListNum <= 0 ? this.$t('message.knowledge.circleauth') : this.$t('page.nodata');
    },
    setHeight() {
      return function(resultheight) {
        return {maxHeight: typeof resultheight == 'number' ? resultheight + 'px' : resultheight};
      };
    }
  },
  watch: {
    result: {
      handler() {
        let _this = this;
        this.$nextTick(() => {
          _this.initData();
        });
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.containers{
  border-radius: 10px;
}
.search-result {
  margin: 0 16px;
  .result-main{
    overflow: auto;
    min-height: 40px;
  }
  .result-count {
    margin: 6px 0;
  }
  .result-list {
    .result-top {
      margin-bottom: 8px;
      .title{
        font-size: 16px;
      }
      .action-group {
        display: inline-flex;
        align-items: flex-end;
      }
    }
    .result-item {
      margin-bottom: 16px;
      padding: 10px 16px;
      cursor: pointer;
      .user-lcu {
        margin-bottom: 8px;
        .lcu,
        .lcd {
          display: inline-block;
        }
      }
      .path {
        margin-left: 15px;
      }
      .count {
        &::before {
          padding-right: 4px;
        }
      }
      .dividing {
        width: 1px;
        height: 14px;
        margin: 0 10px;
      }
      .tag-list {
        margin-bottom: 8px;
        .tag {
          margin-right: 10px;
        }
      }
      .content {
        word-break: break-all;
        overflow-wrap: break-word;
      }
    }
  }
  .action-group {
    > .action-item {
      padding: 0 8px;
      &:after {
        top: 0;
        bottom: 0;
      }
    }
  }
  .status-name {
    padding: 0 4px;
    margin-right: 4px;
    border-radius: 2px;
  }
}
.page-container {
  float: right;
  padding: 10px;
}
</style>
