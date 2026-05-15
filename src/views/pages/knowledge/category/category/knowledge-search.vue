<template>
  <div class="knowledge-search">
    <Loading :loadingShow="isLoading" type="fix"></loading>
    <TsContain border="border">
      <template v-slot:topLeft>
        <a href="javascript:void(0);" class="back text-action tsfont-left" @click="$router.back()">{{ $t('page.back') }}</a>
      </template>
      <template v-slot:topRight>
        <TsFormInput
          v-model.trim="searchParams.keyword"
          search
          @on-search="keyword => search({keyword})"
        ></TsFormInput>
      </template>
      <template v-slot:content>
        <main v-if="result.rowNum > 0" class="search-result">
          <p class="result-count text-grey">{{ $t('term.knowledge.searchresult',{target: result.rowNum}) }}</p>
          <ul class="result-list">
            <li
              v-for="(knowledge, index) in result.dataList"
              :key="index"
              class="result-item bg-block block-container"
              @click="toDetailPage(knowledge)"
            >
              <div class="flex-between">
                <div>
                  <span class="title" v-html="knowledge.title"></span>
                  <span class="path text-grey">{{ knowledge.path.join(' / ') }}</span>
                </div>
                <ul class="flex-start">
                  <li class="count tsfont-eye">{{ knowledge.viewCount }}</li>
                  <li class="dividing dividing-bg-color"></li>
                  <li class="count tsfont-hand">{{ knowledge.favorCount }}</li>
                  <li class="dividing dividing-bg-color"></li>
                  <li class="count tsfont-star">{{ knowledge.collectCount }}</li>
                </ul>
              </div>
              <div class="tag-list">
                <Tag v-for="tag in knowledge.tagList" :key="tag" class="tag">{{ tag }}</Tag>
              </div>
              <div class="flex-start">
                <div class="lcu">
                  <span class="label text-grey">{{ $t('page.creator') }}</span>
                  <UserCard class="user-card" v-bind="knowledge.lcuVo" hideAvatar />
                </div>
                <div class="lcd">
                  <span class="label text-grey">{{ $t('page.createtime') }}</span>
                  <span class="lcd-time">{{ knowledge.lcd | formatDate }}</span>
                </div>
              </div>
              <div class="content" v-html="knowledge.content"></div>
            </li>
          </ul>
          <div v-if="result.rowNum > 0" class="page-container">
            <Page
              :total="result.rowNum"
              :page-size="result.pageSize"
              size="small"
              transfer
              show-total
              show-sizer
              @on-change="currentPage => search({currentPage})"
              @on-page-size-change="pageSize => search({pageSize})"
            />
          </div>
        </main>
        <NoData v-else-if="!isLoading"></NoData>
      </template>
    </TsContain>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeSearch',
  components: {
    UserCard: () => import('components/UserCard/UserCard'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: ['knowledgeType'],
  data() {
    return {
      isLoading: false,
      searchParams: {
        keyword: this.$route.query.keyword,
        type: this.knowledgeType,
        currentPage: 1,
        pageSize: 10
      },
      result: {
        dataList: [],
        rowNum: 0,
        pageSize: 10,
        currentPage: 1,
        pageCount: 1
      }
    };
  },
  created() {
    this.search();
  },
  activated() {
    document.title = this.$t(this.knowledgeTypeName);
  },
  methods: {
    async search(params = {}) {
      if (!this.searchParams.keyword) return;
      try {
        this.isLoading = true;
        this.searchParams = {...this.searchParams, currentPage: 1, ...params};
        const res = await this.$api.knowledge.overview.search(this.searchParams);
        this.result = res.Return;
      } finally {
        this.isLoading = false;
      }
    },
    toDetailPage({ id: knowledgeDocumentId, knowledgeDocumentTypeUuid, knowledgeDocumentVersionId, version, status }) {
      this.$router.push({
        name: this.knowledgeType === 'waitingforreview' ? 'review-detail' : 'knowledge-detail',
        query: { knowledgeDocumentId, knowledgeDocumentTypeUuid, knowledgeDocumentVersionId, version, status }
      });
    }
  },
  computed: {
    knowledgeTypeName() {
      return this.$store.getters['leftMenu/getKnowLedgeTypeName'](this.knowledgeType);
    }
  }
};
</script>

<style lang="less">
.knowledge-search {
  em {
    font-style: normal;
  }
}
</style>

<style lang="less" scoped>
.knowledge-search {
	.search-result {
		margin: 0 16px;
		.result-count {
			margin: 10px 0;
		}
		.result-list {
			.result-item {
				margin: 15px 0;
				padding: 10px 16px;
				cursor: pointer;
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
        .tag-list{
          margin: 5px 0;
          .tag {
            margin-right: 10px;
          }
        }
        .label {
          margin-right: 10px;
        }
        .lcu {
          margin-right: 60px;
          .user-card {
            vertical-align: bottom;
          }
        }
        .content {
          margin: 5px 0 0;
          word-break: break-all;
          overflow-wrap: break-word;
        }
      }
    }
  }
  .page-container {
    float: right;
    padding: 10px;
  }
}
</style>
