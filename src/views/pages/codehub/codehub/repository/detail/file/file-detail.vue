<template>
  <div :style="'max-height:' + height + 'px;'" class="filedetail-main border-color">
    <table class="table table-hover">
      <tbody v-if="fileConfig && fileConfig.binary && !loading">
        <tr class="line-tr">
          <td style="line-height:3;" class="text-center">
            <span class="text-tip">{{ $t('term.codehub.binaryfilecannotviewcontent') }}</span>
            <span v-download="downPath(fileConfig)" v-download:success="downloadok" class="text-href">{{ $t('term.codehub.clickheretodownloadthefile') }}</span>
          </td>           
        </tr>
      </tbody>
      <tbody v-else-if="fileList && !fileList.length && !loading">
        <tr class="line-tr">
          <td style="line-height:4;" class="text-center">{{ $t('term.codehub.thefileisempty') }}</td>
        </tr>
      </tbody>
      <tbody v-else-if="fileList && fileList.length">
        <tr v-for="li in fileList" :key="li.line" class="line-tr">
          <td class="code-lineno border-color">{{ li.line }}</td>
          <td class="code-content">
            <div style="word-break: break-all;overflow: auto;">
              <code>{{ li.content }}</code>
            </div>
          </td>
        </tr>
        <tr v-if="!isEnd && !loading" class="cursor-pointer line-tr" @click="searchFile()">
          <td class="code-lineno border-color">
            <div class="ts-option-horizontal text-action"></div>
          </td>
          <td class="code-content">
            <div class="text-center h4 text-href">{{ $t('page.loadmore') }}</div>
          </td>          
        </tr>
        <tr v-else-if="!isEnd && loading" class="line-tr">
          <td class="code-lineno border-color">
          </td>
          <td class="code-content">
            <Loading loadingShow></Loading>
          </td>          
        </tr>
      </tbody>
    </table>
    <Loading v-if="loading && startLine == 1" loadingShow style="height:60px"></Loading>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {},
  filters: {},
  directives: { download},
  props: {
    fileConfig: Object
  },
  data() {
    return {
      maxCount: 200,
      loading: false,
      isEnd: false, //是否已结束
      startLine: 1,
      fileList: [], //文件内容列表
      height: 500
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$el && (this.height = window.innerHeight - this.$el.getBoundingClientRect().top - 30);
  },
  beforeUpdate() {},
  updated() {},
  activated() {
    this.searchFile();
  },
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchFile() {
      //如果不传开始行就是从0开始
      let config = this.fileConfig;
      //如果不是二进制文件，并且没有结束，则加载
      if (!config.binary && !this.isEnd) {
        let start = this.startLine || 1;
        let param = {
          repositoryId: config.repositoryId,
          commitId: config.commitId,
          branchName: config.branchName,
          filePath: config.fullPath,
          lineStart: start,
          lineEnd: start + this.maxCount - 1
        };
        this.loading = true;
        this.$api.codehub.merge
          .getDiffLine(param)
          .then(res => {
            this.loading = false;
            if (res.Status == 'OK') {
              let fileList = res.Return.list || [];
              if (fileList.length < this.maxCount) {
                this.isEnd = true;
              }
              if (fileList.length) {
                this.fileList.push(
                  ...fileList.map((f, findex) => {
                    return {
                      line: findex + start,
                      content: f
                    };
                  })
                );
              }
              let newStartline = this.startLine + fileList.length;
              this.startLine = newStartline;
            }
          })
          .catch(res => {
            this.loading = false;
          });
      }
    },
    downloadok() {
      this.$Message.success('下载成功');
    }
  },
  computed: {
    downPath() {
      return function(config) {
        return {
          url: '/api/binary/codehub/repository/file/download',
          params: {
            repositoryId: config.repositoryId,
            commitId: config.commitId,
            branchName: config.branchName,
            filePath: config.fullPath
          }
        };     
      };
    }
  },
  watch: {
    fileConfig: {
      handler: function(val) {
        if (val) {
          this.searchFile(val);
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.filedetail-main {
  overflow: auto;
  border: 1px solid;
  > .table {
    background: @default-gray;
    table-layout: fixed;
    width: 100%;
  }
  .line-tr {
    td{
      padding: 2px 4px;
    }
    td.code-lineno {
      border-right: 1px solid @default-tip;
      background: @default-gray;
      white-space: nowrap;
      word-break: keep-all;
      text-align: center;
      font-size: 12px;
      width: 34px;
      user-select: none;
      padding: 2px 0;
    }
    td.code-content {
      background: fade(@default-warning-color,15%);
      white-space: pre-wrap;
    }
  }
}
</style>
