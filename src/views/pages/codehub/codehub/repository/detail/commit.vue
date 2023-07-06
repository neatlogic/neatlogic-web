<template>
  <div v-if="!groupSeaching">
    <div
      v-if="hasBranch"
      class="pl-nm pr-nm"
    >
      <Row>
        <Col span="12">
          <div>{{ $t('term.codehub.commitcountinfo',{allcount:allCount,currentcount:activeConfig.cardList.length || 0}) }}</div>
        </Col>
        <Col span="12">
          <Row :gutter="8">
            <Col span="12">
              <TsFormSelect
                v-model="queryName"
                :dataList="searchGrouplist"
                childrenName="dataList"
                transfer
                mode="group"
                search
                border="border"
                :placeholder="$t('term.codehub.choosebranchortag')"
                :validateList="validateList"
                @on-change="getSearch"
              ></TsFormSelect>
            </Col>
            <Col span="12">
              <InputSearcher
                v-model="keyword"
                :placeholder="$t('term.codehub.commituserorlogkeyword')"
                @change="() => searchList()"
              ></InputSearcher>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
    <div
      v-if="hasBranch"
      ref="mainBody"
      style="overflow-y: auto;"
      :style="'max-height:'+ remainHeight +'px;'"
    >
      <Loading v-if="isload" loadingShow style="height:100px"></Loading>
      <TsCard
        v-else-if="activeConfig && activeConfig.cardList && activeConfig.cardList.length > 0"
        v-bind="activeConfig"
      >
        <template slot-scope="{ row }">
          <div>
            <table class="table" style="table-layout:fixed;width: 100%;">
              <colgroup>
                <col />
                <col width="120" />
              </colgroup>
              <tbody>
                <tr>
                  <td>
                    <div>{{ row.comment }}</div>
                    <div class="mt-md">
                      <span class="ml">{{ row.committer }}</span>
                      <span class="text-tip ml-md">{{ row.committerDateStamp | formatDate }}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <span class="text-href" @click="showCommentDiff(row)">{{ row.shortId }}</span>
                    <span v-if="row.issueNo" class="text-action ml-md" @click="openIssuesDialog(row)">
                      {{ $t('term.rdm.request') }}
                    </span>
                  </td>
                </tr>
                <tr v-show="row.showcommitdiffInfo">
                  <td colspan="2">
                    <CommitDiff
                      v-if="row.commitdiffInfo"
                      :id="id"
                      :queryName="queryName"
                      :queryType="queryType"
                      :appModuleId="reposData.appModuleId"
                      :diffInfo="row.commitdiffInfo"
                      :leftCommitId="row.commitdiffInfo.leftCommitId"
                      :rightCommitId="row.commitdiffInfo.rightCommitId"
                    ></CommitDiff>
                    <div
                      v-if="row.commitdiffInfo"
                      class="text-action text-center ts-angle-double-up"
                      @click="row.showcommitdiffInfo = false"
                    >{{ $t('term.codehub.packupcontent') }}</div>
                    <Loading v-else loadingShow></Loading>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </TsCard>
      <div v-if="!isAllloaded">
        <div v-if="!isload" class="text-center text-href" @click="getNextpage">
          {{ ((!activeConfig.cardList || !activeConfig.cardList.length) ? $t('term.codehub.continuesearch') : (activeConfig.cardList && activeConfig.cardList.length < pageSize) ? $t('term.codehub.continuesearch') : $t('term.codehub.loadmore')) }}</div>
      </div>
      <NoData v-else-if="(!activeConfig.cardList || !activeConfig.cardList.length)"></NoData>
    </div>
    <NoData v-else></NoData>
    <IssuesDetailDialog v-if="isshowIssue" :issueNo="issueNo" @close="closeIssue"></IssuesDetailDialog>
  </div>
  <Loading v-else loadingShow></Loading>
</template>

<script>
import editmixin from './edittabmixin.js';
export default {
  name: 'Commit',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve),
    CommitDiff: resolve => require(['./commit/commit-diff.vue'], resolve),
    IssuesDetailDialog: resolve => require(['./commit/issues-detail-dialog'], resolve) // 需求详情
  },
  mixins: [editmixin],
  props: {},
  data() {
    return {
      loadingShow: true,
      remainHeight: 200,
      activeList: null,
      activeValue: '',
      queryName: '',
      queryType: 'branch',
      keyword: '',
      isload: false,
      isResponsed: false,
      pageSize: 50,
      allCount: 0,
      validateList: ['required'],
      activeConfig: {
        //卡片的数据
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        keyName: 'id',
        classname: 'repository-list',
        cardList: [],
        boxShadow: false
      },
      issueNo: '',
      isshowIssue: false,
      startCommitId: null, //分页的时候需要记录上一次加载到哪一个提交的id
      isAllloaded: false,
      hasBranch: false //是否可以调用搜索的接口（根据是否有分支）
    };
  },
  beforeCreate() {},
  created() {
    if (this.id && this.reposData) {
      this.queryName = this.reposData.defaultBranch || this.reposData.mainBranch;
      this.queryType = 'branch';
      this.queryName = this.queryType + '###' + this.queryName;
    }
  },
  beforeMount() {},
  async mounted() {
    await this.initGroupsearch();
    if (this.checkHasBranch(this.searchGrouplist)) {
      this.startCommitId = null;
      this.hasBranch = true;
      this.getList();
    } else {
      this.hasBranch = false;
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getSearch(val, vallist, selectItem) {
      if (!this.$utils.isEmpty(selectItem)) {
        this.queryName = selectItem.value ? selectItem.value : '';
        this.queryType = selectItem.group ? selectItem.group : '';
        this.startCommitId = null;
        this.getList();
      }
    },
    searchList() {
      this.startCommitId = null;
      this.getList();
    },
    handleQueryName() {
      // 处理queryName
      let queryName = '';
      if (this.queryName && this.queryName.indexOf(this.queryType + '###') > -1) {
        queryName = this.queryName.split(this.queryType + '###')[1];
      } else {
        queryName = this.queryName;
      }
      return queryName;
    },
    getList() {
      if (!this.hasBranch) {
        return;
      }
      this.allCount = 0;
      this.isAllloaded = false;
      let param = {
        repositoryId: this.id,
        queryName: this.handleQueryName(),
        queryType: this.queryType,
        pageSize: this.pageSize,
        startCommitId: this.startCommitId
      };
      this.isload = true;
      this.isResponsed = false;
      this.$api.codehub.repositorydetail.getActive(param).then(res => {
        this.isload = false;
        this.isResponsed = true;
        // 每次执行搜索操作，都会清空页面已有的内容
        this.activeConfig.cardList = [];
        if (res && res.Status == 'OK') {
          this.filterResponseList(res.Return.list);
        }
        this.$nextTick(() => {
          if (this.$refs.mainBody) {
            this.remainHeight = window.innerHeight - this.$refs.mainBody.getBoundingClientRect().top - 30; // 设置TsCard的高度
          }
        });
      }).catch(error => {
        this.isResponsed = true;
        this.isload = false;
        this.$set(this.activeConfig, {
          cardList: []
        });
      });
    },
    openIssuesDialog(row) {
      this.issueNo = row.issueNo || '';
      this.isshowIssue = true;
    },
    closeIssue() {
      this.isshowIssue = false;
      this.issueVo = '';
    },
    // 加载更多时进入此逻辑
    getNextpage(page) {
      if (!this.isResponsed) {
        return;
      }
      if (!this.isAllloaded) {
        // 加载更多时，仅当页面没有 commit 列表，才显示“加载中”的提示
        this.isload = !this.activeConfig.cardList || !this.activeConfig.cardList.length;
        let param = {
          repositoryId: this.id,
          queryName: this.handleQueryName(),
          queryType: this.queryType,
          startCommitId: this.startCommitId,
          pageSize: this.pageSize
        };
        // 前端根据返回值过滤，不在后端过滤
        this.isResponsed = false;
        this.$api.codehub.repositorydetail.getActive(param).then((res) => {
          // “加载更多”会保留已有内容，点“搜索”不会保留已有内容
          if (res && res.Status == 'OK') {
            this.filterResponseList(res.Return.list);
          }
          this.isload = false;
          this.isResponsed = true;
        }).catch(error => {
          this.isload = false;
          this.isResponsed = true;
        });
      }
    },
    showCommentDiff(item) {
      if (!item.commitdiffInfo) {
        //没有就加载
        let param = {
          repositoryId: this.id,
          rightCommitId: item.commitId
        };
        this.$set(item, 'showcommitdiffInfo', true);
        this.$api.codehub.repositorydetail.getCommitDiff(param).then(res => {
          if (res.Status == 'OK') {
            this.$set(item, 'commitdiffInfo', res.Return);
          } else {
            this.$set(item, 'commitdiffInfo', {});
          }
        }).catch(e => {
          this.$set(item, 'commitdiffInfo', {});
        });
      } else {
        //有就收起展开
        this.$set(item, 'showcommitdiffInfo', !item.showcommitdiffInfo);
      }
    },
    filterResponseList(list) {
      let length = list && list.length || 0;
      this.allCount += length;

      // 已经没有更多
      if (length < this.pageSize) {
        this.isAllloaded = true;
      } else {
        this.startCommitId = list[length - 1].id || null;
      }

      if (length == 0) {
        return;
      }

      if (this.keyword && ('' + this.keyword).trim()) {
        let keyword = this.keyword.toLowerCase();
        for (let i = 0; i < length; i++) {
          let commit = list[i];
          if (commit.comment.toLowerCase().indexOf(keyword) >= 0 || commit.committer.toLowerCase().indexOf(keyword) >= 0) {
            this.activeConfig.cardList.push(commit);
          }
        }
      } else {
        this.activeConfig.cardList = this.activeConfig.cardList.concat(list);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    isload: {
      handler: function(val) {
        this.$emit('updateStatus', val);
      }
    }
  }
};
</script>
<style lang="less">
</style>
