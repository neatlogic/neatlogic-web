<template>
  <div style="padding:5px 5px 5px 20px">
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
            <div v-if="title.key=='message'" style="word-break:break-all;white-space: initial;">{{ tbody.message }}</div>
            <div v-else-if="title.key=='mergeStatus'" v-html="showText(tbody['mergeStatus']) "></div>
            <div v-else-if="title.key=='committerDate'">{{ tbody.committerDate | formatDate }}</div>
            <span v-else-if="title.key=='commitId'" class="tag-item">{{ tbody.commitId }}<i v-if="tbody.isNew" class="tag-new">new</i></span>
            <div v-else>{{ tbody[title.key] }}</div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td :colspan="titleList.length || 0" class="text-center">暂无数据</td>
        </tr>
      </tbody>
    </table>
    <div v-if="!isLoading && tbodyList && tbodyList.length>0 && rowNum > 1 && pageSize > 0" class="text-right" style="margin-top:10px;">
      <Page
        size="small"
        show-sizer
        show-total
        :total="rowNum"
        :current="currentPage"
        :page-size-opts="pageSizeOpts"
        :page-size="pageSize"
        :transfer="true"
        @on-change="getPage"
        @on-page-size-change="getPageSize"
      />
    </div> 
    <FileDetail
      v-if="isshowDetail"
      v-bind="fileConfig"
      :isShow="isshowDetail"
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
    mrUuid: String,
    issueNo: String,
    statusList: Array,
    mrData: Object,
    issueStatus: String
  },
  data() {
    return {
      titleList: [{
        key: 'commitId',
        title: '提交id'
      },
      {
        key: 'committer',
        title: '提交人'
      },
      {
        key: 'committerDate',
        title: '提交时间'
      },
      {
        key: 'mergeStatus',
        title: '合并状态'
      },
      {
        key: 'message',
        title: '提交信息'     
      }],
      tbodyList: [],
      rowNum: null,
      currentPage: null,
      pageSize: null,
      pageSizeOpts: [10, 20, 50],
      isshowDetail: false,
      fileConfig: {
        //查看文件需要的设置参数
        mrUuid: null,
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
    if (this.mrUuid && this.issueNo) {
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
        mrUuid: this.mrUuid,
        issueNo: this.issueNo
      };
      this.isLoading = true;
      //this.rowNum && Object.assign(param, {rowNum: this.rowNum});
      //this.currentPage && Object.assign(param, {currentPage: this.currentPage});
      //this.pageSize && Object.assign(param, {pageSize: this.pageSize});
      this.$api.codehub.merge.getCommit(param).then((res) => {
        this.isLoading = false;
        if (res && res.Status == 'OK') {
          this.tbodyList = res.Return.list || [];
          // this.rowNum = res.Return.rowNum || 1;
          // this.currentPage = res.Return.currentPage || 1;
          // this.pageSize = res.Return.pageSize || 1;
        } else {
          this.tbodyList = [];
        }
      }).catch((error) => {
        this.isLoading = false;
        this.tbodyList = [];
      });
    },
    getPage(page) {
      this.currentPage = page;
      this.getmrCommitlist();
    },
    getPageSize(size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getmrCommitlist();      
    },
    showDetail(item) {
      this.fileConfig = {
        mrUuid: this.mrUuid,
        commitId: item.commitId,
        targetBranch: this.mrData.targetBranch || '-'
      };
      this.isshowDetail = true;
    },
    close() {
      this.isshowDetail = false;
      this.fileConfig = {
        mrUuid: null,
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
