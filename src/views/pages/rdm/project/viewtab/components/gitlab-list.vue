<template>
  <div>
    <div v-if="canSearch" class="mb-md grid">
      <div></div>
      <div>
        <CombineSearcher
          v-model="searchValue"
          v-bind="searchConfig"
          @remove-label="searchWebhookData(1)"
          @confirm="searchWebhookData(1)"
        >
          <template v-slot:createTime="{ valueConfig, textConfig }">
            <TsFormDatePicker
              v-model="valueConfig.createTime"
              border="border"
              :transfer="true"
              type="daterange"
              format="yyyy-MM-dd"
              @change="
                val => {
                  if (val != null) {
                    $set(valueConfig, 'createTime', val);
                    $set(textConfig, 'createTime', val);
                  } else {
                    $delete(valueConfig, 'createTime');
                    $delete(textConfig, 'createTime');
                  }
                }
              "
            ></TsFormDatePicker>
          </template>
        </CombineSearcher>
      </div>
    </div>
    <TsCard
      v-bind="webhookData"
      :sm="24"
      :lg="24"
      :xl="24"
      :xxl="24"
      :padding="false"
      pageType="number"
      :showElevator="true"
      @updateSize="changePageSize"
      @updatePage="searchWebhookData"
    >
      <template v-if="!issueId" v-slot:header="{ row }">
        <div v-if="row.issueList && row.issueList.length > 0">
          <div v-for="(issue, iindex) in row.issueList" :key="iindex">
            <span><AppIcon :appType="issue.appType" :appColor="issue.appColor"></AppIcon></span>
            <span class="overflow">
              <a href="javascript:void(0)" @click="toIssueDetail(issue)">{{ issue.name }}</a>
            </span>
          </div>
          <Divider style="margin: 10px 0px 0px 0px" />
        </div>
      </template>
      <template slot-scope="{ row }">
        <div :dataId="row.id" :style="moreFlag[row.id.toString()] != -1 ? 'max-height:300px' : ''" class="container">
          <div v-if="row.event === 'Push Hook' && row.data.commits && row.data.commits.length > 0">
            <div v-for="(commit, cindex) in row.data.commits" :key="cindex">
              <div class="mb-sm">
                <a class="fz10" :href="commit.url" target="_blank">{{ commit.message }}</a>
              </div>
              <div class="mb-sm fz10">
                <span class="mr-xs text-grey">{{ $t('page.committime') }}</span>
                <span class="mr-sm">{{ commit.timestamp | formatDate }}</span>
                <span v-if="commit.author" class="mr-xs text-grey">{{ $t('page.presenter') }}</span>
                <span v-if="commit.author" class="mr-sm">{{ commit.author.name }}</span>
                <span v-if="row.data.repository && row.data.repository.git_http_url && row.data.repository.name" class="mr-xs text-grey">{{ $t('term.rdm.repository') }}</span>
                <span v-if="row.data.repository && row.data.repository.git_http_url && row.data.repository.name" class="mr-sm">
                  <a :href="row.data.repository.git_http_url" target="_blank">{{ row.data.repository.name }}</a>
                </span>
                <span class="mr-xs text-grey">{{ $t('term.framework.pkgversion') }}</span>
                <span class="mr-sm">{{ commit.id }}</span>
              </div>
              <div v-if="commit.added && commit.added.length > 0" class="mb-sm fz10">
                <div v-for="(added, aindex) in commit.added" :key="aindex">
                  <span class="tsfont-plus text-success mr-lg">A</span>
                  <span>{{ added }}</span>
                </div>
              </div>
              <div v-if="commit.modified && commit.modified.length > 0" class="mb-sm fz10">
                <div v-for="(modified, mindex) in commit.modified" :key="mindex">
                  <span class="tsfont-dot text-primary mr-lg">M</span>
                  <span>{{ modified }}</span>
                </div>
              </div>
              <div v-if="commit.removed && commit.removed.length > 0" class="fz10">
                <div v-for="(removed, rindex) in commit.removed" :key="rindex">
                  <span class="tsfont-minus text-error mr-lg">D</span>
                  <span>{{ removed }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-grey padding">不识别的提交信息，请联系厂商处理，id:{{ row.id }}</div>
          <div v-if="moreFlag[row.id.toString()] == 1" class="bg-op more">
            <span class="fz10 text-grey cursor tsfont-down" @click="more(row.id.toString())">{{ $t('page.viewmore') }}</span>
          </div>
        </div>
      </template>
    </TsCard>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    AppIcon: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-icon.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve)
  },
  props: {
    canSearch: { type: Boolean, default: false },
    issueId: { type: Number },
    appId: { type: Number }
  },
  data() {
    return {
      searchParam: {},
      webhookData: {},
      webhookDataList: [],
      currentPage: 1,
      pageSize: 10,
      searchConfig: {
        search: false,
        labelPosition: 'left',
        searchList: [
          {
            type: 'text',
            name: 'keyword',
            label: this.$t('page.keyword')
          },
          {
            type: 'slot',
            name: 'createTime',
            label: this.$t('page.commitdate')
          }
        ]
      },
      searchValue: {},
      moreFlag: {}
    };
  },
  beforeCreate() {},
  created() {
    this.searchWebhookData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {
    this.$nextTick(() => {
      this.checkContentHeight();
    });
  },
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    more(key) {
      this.$set(this.moreFlag, key, -1);
    },
    checkContentHeight() {
      const parentDivs = this.$el.querySelectorAll('.container');
      this.moreFlag = {};
      parentDivs.forEach(div => {
        if (div.scrollHeight > div.clientHeight) {
          this.$set(this.moreFlag, div.getAttribute('dataId').toString(), 1);
        }
      });
    },
    getContentLength(commit) {
      return (commit.added || 0) + (commit.modified || 0) + (commit.removed || 0);
    },
    restoreHistory(historyData) {
      if (historyData['pageSize']) {
        this.pageSize = historyData['pageSize'];
      }
      if (historyData['currentPage']) {
        this.currentPage = historyData['currentPage'];
      }
      if (historyData['searchValue']) {
        this.searchValue = historyData['searchValue'];
      }
    },
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.$addHistoryData('pageSize', pageSize);
      this.searchWebhookData(1);
    },
    toIssueDetail(issue) {
      this.$router.push({ path: '/' + issue.appType + '-detail/' + issue.projectId + '/' + issue.appId + '/' + issue.id });
    },
    searchWebhookData(currentPage) {
      if (currentPage) {
        this.currentPage = currentPage;
        this.$addHistoryData('currentPage', currentPage);
      }
      this.$addHistoryData('searchValue', this.searchValue);
      this.searchParam = { currentPage: this.currentPage, pageSize: this.pageSize, appId: this.appId, issueId: this.issueId };
      Object.assign(this.searchParam, this.searchValue);
      this.$api.rdm.webhook.searchWebhookData(this.searchParam).then(res => {
        this.webhookData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50% 50%;
}
.more {
  position: absolute;
  bottom: -8px;
  left: 0px;
  z-index: 99;
  width: 100%;
  height: 28px;
  line-height: 20px;
  text-align: center;
}
.container {
  position: relative;
}
</style>
