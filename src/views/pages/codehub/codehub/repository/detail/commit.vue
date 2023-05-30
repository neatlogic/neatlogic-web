<template>
  <div v-if="!groupSeaching">
    <div
      v-if="hasBranch"
      ref="top"
      class="input-border"
      style="padding:0 16px;"
    >
      <Row :gutter="16">
        <Col span="18">
          <div class="clearfix">
            <div class="d_f">当前已加载 {{ allCount }} 条，找到满足条件的提交 {{ activeConfig.cardList.length || 0 }} 条</div>
            <div class="d_f_r" style="width:30%">
              <GroupSelect
                v-model.trim="queryName"
                v-bind="selectConfig"
                :dataList="searchGrouplist"
                @on-change="getSearch"
              ></GroupSelect>
            </div>
            <div class="d_f_r text-tip text-label">标签或分支</div>
          </div>
        </Col>
        <Col span="6">
          <FormInput
            v-model.trim="keyword"
            suffix="i-icon ts-search"
            placeholder="提交人或提交日志关键字"
            @keyup.enter.native="searchList()"
          ></FormInput>
        </Col>
      </Row>
    </div>
    <div v-if="hasBranch">
      <Loading v-if="isload" loadingShow style="height:100px"></Loading>
      <TsCard v-else-if="activeConfig && activeConfig.cardList && activeConfig.cardList.length>0" ref="body" v-bind="activeConfig">
        <template slot-scope="{ row }">
          <div>
            <table class="table" style="table-layout:fixed;">
              <colgroup>
                <col />
                <col width="120" />
              </colgroup>
              <tbody>
                <tr>
                  <td>
                    <h6>{{ row.comment }}</h6>
                    <div><span>{{ row.committer }}</span><span class="text-tip ml-10">{{ row.committerDateStamp | formatDate }}</span></div>
                  </td>
                  <td class="text-right">
                    <span class="text-href" @click="showCommentDiff(row)">{{ row.shortId }}</span><span v-if="row.issueNo" class="text-action ml-10" @click="showIssue(row)">需求</span>
                  </td>
                </tr>
                <tr v-show="row.showcommitdiffInfo">
                  <td colspan="2">
                    <CommitDiff
                      v-if="row.commitdiffInfo"
                      :uuid="uuid"
                      :queryName="queryName"
                      :queryType="queryType"
                      :subsystemUuid="reposData.subsystemUuid"
                      :diffInfo="row.commitdiffInfo"
                      :leftCommitId="row.commitdiffInfo.leftCommitId"
                      :rightCommitId="row.commitdiffInfo.rightCommitId"
                    ></CommitDiff>
                    <div
                      v-if="row.commitdiffInfo"
                      class="text-action text-center ts-angle-double-up"
                      style="display: block;"
                      @click="row.showcommitdiffInfo =false"
                    >收起对比内容</div>
                    <Loading v-else loadingShow><span></span></Loading>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </TsCard>
      <div v-if="!isAllloaded">
        <div v-if="!isload" class="text-center text-href" @click="getNextpage">{{ ((!activeConfig.cardList || !activeConfig.cardList.length) ? '继续查找' : '加载更多') }}</div>
      </div>
      <NoData v-else-if="(!activeConfig.cardList || !activeConfig.cardList.length)"></NoData>
    </div>
    <NoData v-else text="没有数据"></NoData>
    <TsDialog
      v-bind="dialogConfig"
      :isShow.sync="isshowIssue"
      :hasFooter="false"
      :maskClose="true"
      @on-close="closeIssue"
    >
      <table v-if="issueData && issueData.uuid" class="table">
        <tbody>
          <tr v-for="(issue,iindex ) in issueList" :key="iindex+'_'+issueData.issueNo">
            <td class="text-right text-tip" width="120">{{ issue.title }}</td>
            <td><template v-if="issue.key =='issueUpdateTime'">{{ issueData[issue.key] |formatDate }}</template><template v-else>{{ setIssue(issue.key,issueData[issue.key]) ||'-' }}</template></td>
          </tr>
        </tbody>
      </table>
      <NoData v-else></NoData>
    </TsDialog>
  </div>
  <Loading v-else loadingShow></Loading>
</template>

<script>
import GroupSelect from '@/resources/components/GroupList/GroupList.vue';
import FormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
import editmixin from './edittabmixin.js';
export default {
  name: 'Commit',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    GroupSelect,
    FormInput,
    CommitDiff: resolve => require(['./commit/commit-diff.vue'], resolve)
  },
  mixins: [editmixin],
  props: {},
  data() {
    let _this = this;
    return {
      activeList: null,
      activeValue: '',
      queryName: '',
      queryType: 'branch',
      keyword: '',
      isload: false,
      isResponsed: false,
      pageSize: 50,
      allCount: 0,
      activeConfig: {
        //卡片的数据
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        keyName: 'id',
        classname: 'repository-list',
        cardList: []
      },
      selectConfig: {
        clearable: false,
        multiple: false
      },
      issueList: [{
        title: '需求编号',
        key: 'no'
      }, {
        title: '名称',
        key: 'name'
      }, {
        title: '处理人',
        key: 'lcu'
      }, {
        title: '状态',
        key: 'status'
      }, {
        title: '更新时间',
        key: 'issueUpdateTime'
      }, {
        title: '来源',
        key: 'sourceUuid'
      }],
      dialogConfig: {
        title: '需求详情'
      },
      issueData: null,
      isshowIssue: false,
      sourceList: [],
      startCommitId: null, //分页的时候需要记录上一次加载到哪一个提交的id
      isAllloaded: false,
      hasBranch: false //是否可以调用搜索的接口（根据是否有分支）
    };
  },
  beforeCreate() {},
  created() {
    if (this.uuid && this.reposData) {
      this.queryName = this.reposData.defaultBranch || this.reposData.mainBranch;
      this.queryType = 'branch';
    }

    this.getSouce();
  },
  beforeMount() {},
  async mounted() {
    await this.initGroupsearch();
    if (this.uuid && this.reposData) {
      if (this.queryName) {
        this.$set(this.selectConfig, 'valueList', [{value: this.queryName, group: this.queryType}]);
      } else if (this.checkHasBranch(this.searchGrouplist)) {
        this.initDefaultSelected();
      }
    }
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
  activated() {

  },
  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    getSearch(val, vallist) {
      // if(val){
      this.queryName = vallist.value ? vallist.value : '';
      this.queryType = vallist.group ? vallist.group : '';
      this.startCommitId = null;
      this.getList();
      //this.updatePage(1);
    },
    searchList() {
      this.startCommitId = null;
      this.getList();
    },
    // 首次进入页面和执行搜索操作，都会触发此方法
    getList() {
      if (!this.hasBranch) {
        return;
      }

      this.allCount = 0;
      this.isAllloaded = false;
      let param = {
        repositoryUuid: this.uuid,
        queryName: this.queryName,
        queryType: this.queryType,
        pageSize: this.pageSize
      };
      // 前端过滤
      //this.keyword && Object.assign(param, {keyword: this.keyword});
      this.activeConfig && this.activeConfig.currentPage && Object.assign(param, {currentPage: this.activeConfig.currentPage});
      this.startCommitId && Object.assign(param, {startCommitId: this.startCommitId});
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
      }).catch(error => {
        this.isResponsed = true;
        this.isload = false;

        Object.assign(this.activeConfig, {
          cardList: []
        });
      });
    },
    updatePage(page) {
      if (this.activeConfig) {
        this.activeConfig.currentPage = page || 1;
      }
      this.getList();
    },
    updateSize(size) {
      this.activeConfig.pageSize = size || 1;
      this.activeConfig.currentPage = 1;
      this.getList();
    },
    showIssue(row) {
      let id = row.issueNo;
      let _this = this;
      if (row.issueVo) {
        return;
      }
      _this.issueData = null;
      _this.isshowIssue = true;
      _this.$api.codehub.issue.getList({no: id}).then(res => {
        if (res && res.Status == 'OK') {
          _this.issueData = res.Return.list[0] || {};
        }
      });
    },
    closeIssue() {
      this.isshowIssue = false;
      this.issueData = null;
    },
    getSouce() {
      this.$api.codehub.issue.getSource({type: 'issue'}).then(res => {
        if (res && res.Status == 'OK') {
          this.sourceList = res.Return.syncSourceList;
        }
      });
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
          repositoryUuid: this.uuid,
          queryName: this.queryName,
          queryType: this.queryType,
          startCommitId: this.startCommitId,
          pageSize: this.pageSize
        };

        // 前端根据返回值过滤，不在后端过滤
        //this.keyword && Object.assign(param, {keyword: this.keyword});
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
          repositoryUuid: this.uuid,
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

  computed: {
    setIssue() {
      return function(key, value) {
        let text = '';
        if (key == 'sourceUuid') {
          let sourceLi = this.sourceList.filter(sync => {
            return sync.uuid == value;
          });
          text = sourceLi.length > 0 ? sourceLi[0].source : '';
        } else if (key == 'issueUpdateTime') {
          //console.log(this.filters);
        } else {
          text = value;
        }
        return text;
      };
    },
    getHeight() {
      let totalHeight = window.innerHeight || document.body.clientHeight || 0;
      let topHeight = this.$refs.top.getBoundingClientRect().bottom || 0;
      return Math.max(200, parseFloat(totalHeight - topHeight - 30));
    }
  },

  watch: {
    isAllloaded: {
      handler: function(val) {
        this.$refs.body && this.$refs.body.showEnding(val);
      }
    },
    isload: {
      handler: function(val) {
        this.$emit('updateStatus', val);
      }
    }
  }
};

</script>
<style lang="less">
// @import '~@/resources/assets/css/codehub/commit.less';
</style>
