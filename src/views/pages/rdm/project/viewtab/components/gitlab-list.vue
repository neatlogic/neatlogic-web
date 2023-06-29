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
      pageType="number"
      :padding="false"
      :showElevator="true"
      @updateSize="changePageSize"
      @updatePage="searchWebhookData"
    >
      <template v-if="!issueId" v-slot:header="{ row }">
        <div v-if="row.issueId">
          <span><AppIcon :appType="row.issueAppType" :appColor="row.issueAppColor"></AppIcon></span>
          <span class="overflow">
            <a href="javascript:void(0)" @click="toIssueDetail(row)">{{ row.issueName }}</a>
          </span>
          <Divider style="margin: 10px 0px 0px 0px" />
        </div>
      </template>
      <template slot-scope="{ row }">
        <div>
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
                <span class="mr-xs text-grey">{{ $t('term.framework.pkgversion') }}</span>
                <span class="mr-sm">{{ commit.id }}</span>
              </div>
              <div v-if="commit.added && commit.added.length > 0" class="mb-sm fz10">
                <div v-for="(added, aindex) in commit.added" :key="aindex">
                  <span class="tsfont-plus text-grey mr-lg">A</span>
                  <span>{{ added }}</span>
                </div>
              </div>
              <div v-if="commit.modified && commit.modified.length > 0" class="mb-sm fz10">
                <div v-for="(modified, mindex) in commit.modified" :key="mindex">
                  <span class="tsfont-edit text-grey mr-lg">M</span>
                  <span>{{ modified }}</span>
                </div>
              </div>
              <div v-if="commit.removed && commit.removed.length > 0" class="fz10">
                <div v-for="(removed, rindex) in commit.removed" :key="rindex">
                  <span class="tsfont-minus text-grey mr-lg">D</span>
                  <span>{{ removed }}</span>
                </div>
              </div>
            </div>
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
      pageSize: 10
    };
  },
  beforeCreate() {},
  created() {
    this.searchWebhookData();
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
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.searchWebhookData(1);
    },
    toIssueDetail(issue) {
      this.$router.push({ path: '/' + issue.issueAppType + '-detail/' + issue.projectId + '/' + issue.issueAppId + '/' + issue.issueId });
    },
    searchWebhookData(currentPage) {
      this.searchParam = { pageSize: this.pageSize, appId: this.appId, issueId: this.issueId };
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
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
</style>
