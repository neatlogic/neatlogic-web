<template>
  <div class="padding">
    <div class="diff-container" :class="showTree ? '' : 'hideLeft'">
      <div class="clearfix mb-xs">
        <div class="ml-md" :class="[!$utils.isEmpty(diffList) ? 'flex-between' : 'flex-end']">
          <div v-if="!$utils.isEmpty(diffList)">
            <span>{{ $t('page.total') }}</span>
            <span class="text-primary count-text">{{ getFileCount(diffList) }}</span>
            <span>{{ $t('term.codehub.filechangenumber') }}，</span>
            <span v-if="getFileCount(diffList,'addCount')" class="text-success count-text">{{ getFileCount(diffList,'addCount') }}</span>
            <span v-if="getFileCount(diffList,'addCount')">{{ $t('term.codehub.rowadd') }}，</span>
            <span v-if="getFileCount(diffList,'deleteCount')" class="text-error count-text">{{ getFileCount(diffList,'deleteCount') }}</span>
            <span v-if="getFileCount(diffList,'deleteCount')">{{ $t('term.codehub.rowdelete') }}</span>
          </div>
          <div class="flex-start">
            <!-- 暂时注释，先阶段不做commitId过滤的功能
              <TsFormSelect
              v-if="!loading && !$utils.isEmpty(commitList)"
              v-model="selectedCommit"
              :dataList="commitList"
              v-bind="selectConfig"
              class="mr-sm"
              @on-change="getDiff()"
            ></TsFormSelect> -->
            <RadioGroup v-model="showType" type="button">
              <Radio v-for="(type,tindex) in typeList" :key="tindex" :label="type.name">{{ type.label }}</Radio>
            </RadioGroup>
          </div>
        </div>
      </div>
      <div v-if="!loading" ref="diffTree" class="diff-left bg-op border-color">
        <TreeLi 
          v-if="fileList && fileList.length > 0" 
          :diffList="nameList"
          :treeList="fileList" 
          :selectedFile="selectedFile"
          :supportTypeList="supportTypeList" 
          @onSelected="onSelected"
        ></TreeLi>
        <NoData v-else></NoData>
      </div>
      <div
        v-if="!loading"
        ref="diffMain"
        class="diff-main"
        @scroll="scroll($event)"
      >
        <DiffDetail
          v-if="diffList && diffList.length > 0"
          :showType="showType" 
          :diffList="diffList" 
          :supportTypeList="supportTypeList" 
          :selectedFile="selectedFile"
          :leftCommitId="leftCommitId"
          :rightCommitId="selectedCommit || rightCommitId"
          :mrId="versionId"
          :readOnly="true"
          @endScroll="finishScroll = true"
          @hasFixtop="showFixtop"
          @affix="affix"
          @getMore="getMore"
        ></DiffDetail>
        <NoData v-else></NoData>
      </div>
      <Loading v-else loadingShow style="height:100px"></Loading>
      <div 
        v-if="isFixtop && scrollTop && scrollTop > 100" 
        class="tsfont-arrow-up btn-gotop bg-grey border-color cursor-pointer" 
        @click="scrolltoTop"
      ></div>
      <div 
        v-if="!loading"
        class="btn-toggle-left text-action border-color bg-op" 
        :class="showTree ?'ts-angle-left':'ts-bars'" 
        :style="showTree ?'left:170px':'left:-40px'"
        @click="toggleshowTree"
      ></div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    // TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    DiffDetail: resolve => require(['@/views/pages/codehub/codehub/merge/review/tab/diff/diff-detail.vue'], resolve),
    TreeLi: resolve => require(['@/views/pages/codehub/codehub/merge/review/tab/diff/tree-li.vue'], resolve)
  },
  filters: {},
  props: {
    versionId: {
      type: Number,
      default: null
    }
  },
  provide() {
    return {
      appModuleId: (this.mrData && this.mrData.appModuleVo && this.mrData.appModuleVo.id) || null,
      repositoryId: this.mrData && this.mrData.appModuleId || null,
      branchname: this.mrData && this.mrData.srcBranch || null,
      smrId: this.versionId || null
    };
  },
  data() {
    return {
      leftCommitId: null,
      rightCommitId: null,
      loading: false,
      fileList: null, //文件列表
      nameList: [], //文件名列表
      diffList: [], //完整的数据
      selectedFile: null, //选中树图文件
      finishScroll: true, //右侧定位是否完成
      isFixtop: false, //是否需要快速返回顶部
      scrollTop: 0, //滚动的位置
      showType: 'combine', //代码对比显示的模式
      typeList: [{
        name: 'combine',
        label: this.$t('term.codehub.linebylinecomparison')
      }, {
        name: 'separate',
        label: this.$t('term.codehub.leftandrightcomparison')        
      }],
      showTree: true,
      selectedCommit: null, //选中哪个对比的commit
      selectConfig: {
        width: 160,
        border: 'border',
        clearable: false,
        textName: 'commitId',
        valueName: 'commitId',
        showTitle: true,
        search: true,
        transfer: true
      },
      commitList: [],
      supportTypeList: [//支持哪些文件类型的展示
        'css',
        'bat',
        'cls',
        'cnf',
        'bmp',
        'cmd',
        'gzip',
        'doc',
        'exe',
        'gif',
        'mov',
        'html',
        'mp4',
        'java',
        'jpg',
        'png',
        'pdf',
        'py',
        'pptx',
        'ppt',
        'js',
        'rar',
        'rtf',
        'docx',
        'rpm',
        'txt',
        'jpeg',
        'sql',
        'sh',
        'zip',
        'tar',
        'vbs',
        'xls',
        'xlsm',
        'xml',
        'xlsx',
        'svg']
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getCodeDiffData();
  },
  beforeUpdate() {},
  updated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getCodeDiffData() {
      if (!this.versionId) {
        return;
      }
      let param = {
        versionId: this.versionId,
        rightCommitId: this.selectedCommit
      };
      this.loading = true;
      this.$api.deploy.version.getVersionCommitDiff(param).then(res => {
        if (res.Status == 'OK') {
          const { leftCommitId, rightCommitId, fileDiffList = [], commitList = [] } = res.Return || {};
          this.leftCommitId = leftCommitId;
          this.rightCommitId = rightCommitId;
          this.diffList = fileDiffList.map(f => {
            const { modifiedType, toFileName, fromFileName } = f;
            const name = modifiedType == 'A' ? toFileName : fromFileName;
            return {
              filepathUuid: this.$utils.setUuid(),
              loadingMore: false,
              name: name.substr(name.lastIndexOf('/') + 1),
              path: name,
              modifiedType,
              insertedCount: f.insertedCount,
              deletedCount: f.deletedCount
            };
          }).filter(({ name, path }) => name || path);
          this.fileList = this.initTree(this.diffList);
          this.nameList = this.diffList.map(({ filepathUuid, modifiedType, toFileName, fromFileName, insertedCount, deletedCount }) => ({
            filepathUuid,
            name: (modifiedType == 'A' ? toFileName : fromFileName).substr(((modifiedType == 'A' ? toFileName : fromFileName).lastIndexOf('/') + 1)),
            path: (modifiedType == 'A' ? toFileName : fromFileName),
            modifiedType,
            insertedCount,
            deletedCount
          }));
          this.commitList = commitList.map(c => ({ ...c, titletxt: c.message }));
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    initTree(list) {
      var output = [];
      list.forEach((d, dindex) => {
        let name = d.modifiedType == 'A' ? d.toFileName : d.fromFileName;
        let chain = name.split('/');
        let currentNode = output;
        for (var j = 0; j < chain.length; j++) {
          //如果是空的路径直接不再拼路径树
          if (chain[j] === '') {
            break;
          }
          var wantedNode = chain[j];
          var lastNode = currentNode;
          for (var k = 0; k < currentNode.length; k++) {
            if (currentNode[k].name == wantedNode) {
              currentNode = currentNode[k].children;
              break;
            }
          }
          if (lastNode == currentNode) {
            var newNode = (currentNode[k] = {
              name: wantedNode,
              children: [],
              showChild: true,
              path: name,
              filepathUuid: d.filepathUuid,
              deletedCount: d.deletedCount,
              insertedCount: d.insertedCount,
              modifiedType: d.modifiedType,
              type: (wantedNode.indexOf('.') == -1) ? j == chain.length - 1 ? 'txt' : 'file' : wantedNode.split('.')[1]
            });
            currentNode = newNode.children;
          } else {
            delete currentNode.children;
          }
        }
      });
      return output;
    },
    onSelected(item) {
      this.selectedFile = item.filepathUuid;
      this.finishScroll = false;
    },
    scroll(e) {
      this.scrollTop = e.target.scrollTop || 0;
      if (this.finishScroll) {
        this.selectedFile = null;
      }
    },
    showFixtop(status) {
      this.isFixtop = status;
    },
    scrolltoTop() {
      if (this.$refs.diffMain) {
        this.$refs.diffMain.scrollTo(0, 0);
      }
      if (this.$refs.diffTree) {
        this.$refs.diffTree.scrollTo(0, 0);
      }
    },
    affix(diff) {
      this.selectedFile = diff.filepathUuid;
      if (this.$refs.diffTree) {
        let selectDom = this.$el.querySelector('#tree_' + diff.filepathUuid);
        //元素定位
        if (selectDom) {
          try {
            selectDom.scrollIntoView(true);
          } catch (e) {
            console.error(e);
          }
        }
      }
    },
    getMore(path, index) {
      let param = {
        versionId: this.versionId,
        filePath: path
      };
      if (!this.versionId) {
        return;
      }
      if (this.selectedCommit) {
        Object.assign(param, {
          rightCommitId: this.selectedCommit
        });
      }
      if (this.diffList && this.diffList[index]) {
        Object.assign(this.diffList[index], {
          loadingMore: true
        });
      }
      this.$api.codehub.merge.getDiff(param).then(res => {
        Object.assign(this.diffList[index], {
          loadingMore: false
        });
        if (res.Status == 'OK') {
          if (this.diffList && this.diffList[index]) {
            let hunks = res.Return.fileDiffList[0];
            Object.assign(this.diffList[index], hunks);
          }
        }
      }).catch((res) => {
        Object.assign(this.diffList[index], {
          loadingMore: false
        });
      });      
    },
    toggleshowTree() {
      this.showTree = !this.showTree;
    },
    selectFile(path) {
      if (this.fileList && this.fileList.length > 0) {
        this.fileList.forEach(f => {
          if (f.path == path) {
            this.selectedFile = f.filepathUuid;
          }
        });
      }
    }
  },
  computed: {
    getFileCount() {
      return function(list, type) {
        let count = 0;
        switch (type) {
          case 'deleteCount':
            if (list.length > 0) {
              list.forEach(l => {
                if (l.deletedCount) {
                  count = count + l.deletedCount;
                }
              });
            }
            break;
          case 'addCount':
            if (list.length > 0) {
              list.forEach(l => {
                if (l.insertedCount) {
                  count = count + l.insertedCount;
                }
              });
            }
            break;
          default:
            count = list.length;
        }
        return count;
      };
    }
  },
  watch: {}
};

</script>
<style lang='less' scoped>
.diff-container{
  position: relative;
  padding-left: 200px;
  height:calc(100vh - 180px); // 头部+导航栏+tab+文件描述信息+16间隙
  .diff-left{
    position: absolute;
    top: 0;
    left: 0;
    width: 200px;
    bottom: 0;
    border-right: 1px solid;
    overflow: auto;
  }
  .diff-main{
    padding: 10px 0 50px 10px;
    overflow: auto;
    max-height: calc(100vh - 218px);
  }
  &.hideLeft{
    padding-left: 0px;
    .diff-left{
      width: 0;
      overflow: hidden;
      border-right: 0 none;
    }
    .btn-toggle-left{
      font-size: 12px;
    }
  }
}
.btn-gotop{
    position: absolute;
    bottom: 0px;
    right: 15px;
    width: 40px;
    height: 40px;
    line-height: 40px;
    border: 1px solid;
    font-size: 16px;
    text-align: center;
}
.btn-toggle-left{
  position: absolute;
    top: 50%;
    border: 1px solid;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    z-index: 9;
    transform: translate(15px, -38px);
    border-radius: 50%;
    left: 170px;
    &:before{
      margin-right: 0;
    }
}
.count-text{
  padding-left: 3px;
  padding-right: 3px;
  font-weight: bolder;
}
</style>
