<template>
  <div>
    <TsContain v-bind="containConfig">
      <div slot="content" class="search-wrap-padding-top">
        <div>
          <div :class="isFirstLoad ? 'search-init-wrap' : ''">
            <div class="search-position" :class="isFirstLoad ? '' : 'search-bar-wrap'">
              <TsFormInput
                v-model="keyword"
                class="bg-op radius-sm"
                :placeholder="$t('page.keyword')"
                @on-enter="search()"
              ></TsFormInput>
              <Button type="primary" class="search-btn" @click="search()">{{ $t('page.search') }}</Button>
            </div>
          </div>
          <TsRow v-if="wordList && wordList.length > 0" :gutter="5" class="text-search-padding-top">
            <Col :span="12" style="text-align:left">
              <span class="text-grey">{{ $t('page.wordbreaklist') }}：</span>
              <span>
                <Tag v-for="(word, index) in wordList" :key="index">{{ word }}</Tag>
              </span>
            </Col>
            <Col :span="6"></Col>
          </TsRow>
          <div v-if="!isLoading">
            <div v-if="ciList && ciList.length > 0">
              <Tabs v-model="currentTab" class="hide-border-bottom-tabs">
                <TabPane
                  v-for="ci in ciList"
                  :key="ci.id"
                  :name="ci.name"
                  :label="ci.label + '(' + ci.ciEntityCount + ')'"
                ></TabPane>
              </Tabs>
            </div>
            <div v-else-if="ciList && ciList.length == 0 && !isFirstLoad">
              <TsRow :gutter="5">
                <Col :span="24">
                  <NoData :text="$t('message.cmdb.cientitynotexists')"></NoData>
                </Col>
              </TsRow>
            </div>
            <div v-if="currentCiId">
              <CiEntityList
                :needAction="false"
                :needCondition="false"
                :condition="{ keywordList: wordList }"
                :ciId="currentCiId"
              ></CiEntityList>
            </div>
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    CiEntityList: () => import('../cientity/cientity-list.vue')
  },
  props: {},
  data() {
    return {
      currentTab: '',
      currentCiId: null,
      ciList: [],
      isLoading: false,
      keyword: '',
      searchParam: { pageSize: 24 },
      wordList: [], //分词结果
      containConfig: {
        hideHeader: true // 隐藏头部
      },
      isFirstLoad: false // 是否是首次加载
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (this.$utils.isEmptyObj(query)) {
      // 解决首次进入页面时，显示居中的搜索框
      this.isFirstLoad = true;
    }
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
    search() {
      if (this.keyword) {
        this.isLoading = true;
        this.isFirstLoad = false;
        this.$api.cmdb.globalsearch.searchCiEntityCount(this.keyword).then(res => {
          this.currentCiId = null;
          this.ciList = res.Return.ciList;
          this.wordList = res.Return.wordList;
          if (this.ciList && this.ciList.length > 0) {
            this.ciList.forEach(element => {
              if (this.currentTab == element.name) {
                this.currentCiId = element.id;
                return false;
              }
            });
            if (!this.currentCiId) {
              this.currentTab = this.ciList[0].name;
              this.currentCiId = this.ciList[0].id;
            }
          }
          this.$addHistoryData('keyword', this.keyword);
          this.isLoading = false;
        });
      } else {
        this.$Message.info(this.$t('form.placeholder.pleaseinput', {'target': this.$t('page.keyword')}));
      }
    },
    restoreHistory(historyData) {
      const keyword = historyData.keyword;
      this.currentTab = historyData.currentTab || this.currentTab;
      if (keyword) {
        this.keyword = keyword;
        this.search();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    currentTab: {
      handler: function(val) {
        if (val && this.ciList && this.ciList.length > 0) {
          this.ciList.forEach(element => {
            if (element.name == val) {
              this.currentCiId = element.id;
              this.$addHistoryData('currentTab', val);
            }
          });
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.search-wrap-padding-top {
  padding-top: 24px;
  .search-text {
    font-size: 16px;
    //  font-weight: bold;
  }
  .text-search-padding-top {
    margin-top: 8px;
  }
  .search-btn {
    position: absolute;
    top: 2px;
    right: 3px;
    width: 100px;
    height: 28px;
    line-height: 25px;
  }
  .search-position {
    position: relative;
  }
  .search-bar-wrap {
    width: 75%;
  }
  .no-data-margin-top {
    margin-top: 98px;
  }
  .search-init-wrap {
    width: 50%;
    height: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .padding-bottom {
      padding-bottom: 16px;
    }
  }
  .hide-border-bottom-tabs {
    /deep/ .ivu-tabs-bar {
      border-bottom: none;
    }
  }
}
</style>
