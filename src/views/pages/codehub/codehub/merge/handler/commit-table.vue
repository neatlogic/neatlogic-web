<template>
  <div class="pt-xs pr-xs pb-xs pl-nm">
    <Loading v-if="isLoading" loadingShow></Loading>
    <table v-else class="table">
      <thead>
        <tr>
          <th v-for="(title,tindex) in titleList" :key="tindex">{{ title.title }}</th>
        </tr>
      </thead>
      <tbody v-if="tbodyList && tbodyList.length>0">
        <tr
          v-for="(tbody,bindex) in tbodyList"
          :key="bindex"
          class="cursor-pointer"
          @click.stop="showDetail(tbody)"
        >
          <td v-for="(title,tindex) in titleList" :key="bindex+tindex">
            <div v-if="title.key == 'message'" style="word-break:break-all;white-space: initial;">{{ tbody.message }}</div>
            <div v-else-if="title.key == 'mergeStatus'" v-html="showText(tbody['mergeStatus']) "></div>
            <div v-else-if="title.key == 'committerDate'">{{ tbody.committerDate | formatDate }}</div>
            <span v-else-if="title.key == 'commitId'" class="tag-item">
              {{ tbody.commitId }}
              <span v-if="tbody.isNew" class="tag-new">new</span>
            </span>
            <div v-else>{{ tbody[title.key] }}</div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td :colspan="titleList.length || 0" class="text-center">{{ $t('page.nodata') }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="!isLoading && tbodyList && tbodyList.length>0 && rowNum > 1 && pageSize > 0" class="text-right mt-sm">
      <Page
        size="small"
        show-sizer
        show-total
        :total="rowNum"
        :current="currentPage"
        :page-size-opts="pageSizeOpts"
        :page-size="pageSize"
        :transfer="true"
        @on-change="changeCurrentPage"
        @on-page-size-change="changePageSize"
      />
    </div> 
    <FileDetail
      v-if="isshowDetail"
      v-bind="fileConfig"
      @close="close"
    ></FileDetail>  
  </div>
</template>
<script>
import FileDetail from './file-table.vue';
export default {
  name: '',
  components: {
    FileDetail
  },
  props: {
    mrId: String,
    issueNo: String,
    statusList: Array,
    mrData: Object,
    issueStatus: String
  },
  data() {
    return {
      titleList: [{
        key: 'commitId',
        title: this.$t('term.deploy.commitid')
      },
      {
        key: 'committer',
        title: this.$t('page.presenter')
      },
      {
        key: 'committerDate',
        title: this.$t('page.committime')
      },
      {
        key: 'mergeStatus',
        title: this.$t('term.codehub.mergerequeststatus')
      },
      {
        key: 'message',
        title: this.$t('page.submitinformation')     
      }],
      tbodyList: [],
      rowNum: null,
      currentPage: null,
      pageSize: null,
      pageSizeOpts: [10, 20, 50],
      isshowDetail: false,
      fileConfig: {
        //查看文件需要的设置参数
        mrId: null,
        commitId: null,
        targetBranch: null
      },
      isLoading: false

    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.mrId && this.issueNo) {
      this.getmrCommitlist();
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getmrCommitlist() {
      let param = {
        mrId: this.mrId,
        issueNo: this.issueNo
      };
      this.isLoading = true;
      this.$api.codehub.merge.getCommit(param).then((res) => {
        this.isLoading = false;
        if (res && res.Status == 'OK') {
          this.tbodyList = res.Return.list || [];
        } else {
          this.tbodyList = [];
        }
      }).catch((error) => {
        this.isLoading = false;
        this.tbodyList = [];
      });
    },
    changeCurrentPage(currentPage) {
      this.currentPage = currentPage;
      this.getmrCommitlist();
    },
    changePageSize(pageSize) {
      this.currentPage = 1;
      this.pageSize = pageSize;
      this.getmrCommitlist();      
    },
    showDetail(item) {
      this.fileConfig = {
        mrId: this.mrId,
        commitId: item.commitId,
        targetBranch: this.mrData.targetBranch || '-'
      };
      this.isshowDetail = true;
    },
    close() {
      this.isshowDetail = false;
      this.fileConfig = {
        mrId: null,
        commitId: null,
        targetBranch: this.mrData.targetBranch || '-'
      };
    }
  },
  computed: {
    showText() {
      return function(val) {
        let str = ``;
        if (val && this.statusList && this.statusList.length > 0) {
          this.statusList.forEach((s) => {
            if (s.value == val) {
              str = `<div class="text-${s.color}">${s.text}</div>`;
            }
          });
        }
        return str;
      };
    }
  },
  watch: {
    issueStatus(val, oldval) {
      if (val != oldval) {
        this.getmrCommitlist();
      }
    }
  }
};
</script>
<style lang='less' scoped>
</style>
