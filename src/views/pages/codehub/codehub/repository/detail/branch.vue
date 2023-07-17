<template>
  <div>
    <div class="pl-nm pr-nm">
      <Row :gutter="16">
        <Col span="16">
          <span class="tsfont-plus text-action" @click="editBranch()">{{ $t('page.branch') }}</span>     
        </Col>
        <Col span="8">
          <InputSearcher
            v-model="keyword"
            @change="searchKeyword"
          ></InputSearcher>
        </Col>
      </Row>
    </div>
    <div
      ref="mainBody"
      style="overflow-y: auto;"
      :style="'max-height:'+ remainHeight +'px;'"
    >
      <Loading v-if="isload" loadingShow style="min-height:100px"></Loading>
      <TsCard
        v-else
        v-bind="activeConfig"
        headerPosition="right"
        @updatePage="updatePage"
        @updateSize="updateSize"
      >
        <template slot="header" slot-scope="{ row }">
          <div class="action-group">
            <div class="action-item tsfont-trash-o" @click="deleteBranch(row.name)">{{ $t('page.delete') }}</div>
          </div>
        </template>
        <template slot-scope="{ row }">
          <table style="table-layout:fixed;width:100%;">
            <colgroup>
              <col />
              <col width="200" />
              <col width="200" />
            </colgroup>
            <tbody>
              <tr>
                <td>
                  <div>{{ row.name }}</div>
                </td>
                <td rowspan="2">
                  <template v-if="showBranch(row.name).length>0">
                    <Tag
                      v-for="(branch,bindex) in showBranch(row.name)"
                      :key="bindex"
                      :color="typeList[branch].color"
                      class="ml-sm"
                    >{{ typeList[branch].name }}</Tag>
                  </template>
                </td>
                <td rowspan="2">{{ row.commit.shortId }}</td>
              </tr>
              <tr>
                <td>
                  <span>{{ row.commit.committer }}</span>
                  <span class="text-tip ml-sm">{{ row.commit.committerDate ?row.commit.committerDate.time:'' | formatDate }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </TsCard>
    </div>
    <BranchEdit
      v-if="isEdit"
      :repositoryId="id"
      @close="close"
    ></BranchEdit>
    <BranchDelete
      v-if="isShowBranchDelete"
      :branchName="branchName"
      :repositoryId="id"
      @close="close"
    ></BranchDelete>
  </div>
</template>

<script>
import editmixin from './edittabmixin.js';
export default {
  name: 'Branch',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    BranchEdit: resolve => require(['./edit/branch-edit.vue'], resolve),
    BranchDelete: resolve => require(['./edit/branch-delete.vue'], resolve)
  },
  mixins: [editmixin],
  props: {},
  data() {
    return {
      keyword: '',
      isload: false,
      isEdit: false,
      isShowBranchDelete: false,
      branchName: null,
      remainHeight: null,
      activeConfig: {
        //卡片的数据
        span: 24,
        sm: 24,
        md: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        currentPage: 1,
        pageSize: 10,
        cardList: [],
        boxShadow: false,
        hasHoverShadow: true
      },
      typeList: {
        defaultBranch: {
          name: this.$t('term.codehub.defaultbranch'), 
          color: 'success'
        },
        mainBranch: {
          name: this.$t('term.codehub.mainbranch'), 
          color: 'primary'
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchKeyword() {
      this.activeConfig.currentPage = 1;
      this.getList();
    },
    getList() {
      let param = {
        keyword: this.keyword,
        repositoryId: this.id,
        hasCommit: 1,
        currentPage: this.activeConfig.currentPage,
        pageSize: this.activeConfig.pageSize
      };
      this.isload = true;
      this.$api.codehub.repositorydetail.getBranch(param).then(res => {
        if (res && res.Status == 'OK') {
          Object.assign(this.activeConfig, {
            pageCount: res.Return.pageCount,
            rowNum: res.Return.rowNum,
            pageSize: res.Return.pageSize,
            currentPage: res.Return.currentPage,
            cardList: res.Return.list
          });
          this.$nextTick(() => {
            if (this.$refs.mainBody) {
              this.remainHeight = window.innerHeight - this.$refs.mainBody.getBoundingClientRect().top - 30; // 设置TsCard的高度
            }
          });
        } else {
          this.activeConfig = null;
        }
      }).finally(() => {
        this.isload = false;
      });
    },
    updateSize(size) {
      this.activeConfig.pageSize = size || 1;
      this.activeConfig.currentPage = 1;
      this.getList();
    },
    updatePage(page) {
      this.activeConfig.currentPage = page || 1;
      this.getList();
    },
    deleteBranch(name) {
      if (name) {
        this.branchName = name;
        this.isShowBranchDelete = true;
      }
    },
    editBranch() {
      this.isEdit = true;
    },
    close(isReload) {
      this.isEdit = false;
      this.isShowBranchDelete = false;
      this.branchName = null;
      if (isReload) {
        this.getList();
      }
    }
  },
  filter: {},
  computed: {
    showBranch() {
      return function(name) {
        let type = [];
        if (this.reposData.defaultBranch && this.reposData.defaultBranch == name) {
          type.push('defaultBranch');
        }
        if (this.reposData.mainBranch && this.reposData.mainBranch == name) {
          type.push('mainBranch');
        }
        return type;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
