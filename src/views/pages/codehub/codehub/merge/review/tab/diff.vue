<template>
  <div id="diff-container" class="padding">
    <div class="diff-container" :class="showTree ? '' : 'hideLeft' ">
      <div
        v-if="!loading"
        ref="diffTree"
        class="diff-left bg-op border-color"
        :style="{ width: leftWidth + 'px' }"
      >
        <TreeLi 
          v-if="fileList && fileList.length>0" 
          :diffList="nameList"
          :treeList="fileList" 
          :selectedFile="selectedFile"
          :supportTypeList="supportTypeList" 
          @onSelected="onSelected"
        ></TreeLi>
        <NoData v-else></NoData>
      </div>
      <!-- 拖拽的内容 -->
      <div
        id="resize"
        @mousedown="startDrag"
        @mousemove="dragThrottled"
        @mouseup="stopDrag"
      ></div>
      <div
        v-if="!loading"
        
        class="diff-main"
      >
        <div class="mb-xs">
          <div v-if="commitId" class="ml-sm" style="line-height: 2;">{{ commitInfo }}</div>
          <div class="ml-md" :class="[commitId ? 'pt-sm' : '', hasDiffList ? 'flex-between' : 'flex-end']">
            <div v-if="hasDiffList">
              <span>{{ $t('page.total') }}</span>
              <span class="text-primary count-text">{{ getFileCount(diffList) }}</span>
              <span>{{ $t('term.codehub.filechangenumber') }}</span>
              <span v-if="getFileCount(diffList,'addCount')" class="text-success count-text">，{{ getFileCount(diffList,'addCount') }}</span>
              <span v-if="getFileCount(diffList,'addCount')">{{ $t('term.codehub.rowadd') }}</span>
              <span v-if="getFileCount(diffList,'deleteCount')" class="text-error count-text">，{{ getFileCount(diffList,'deleteCount') }}</span>
              <span v-if="getFileCount(diffList,'deleteCount')">{{ $t('term.codehub.rowdelete') }}</span>
            </div>
            <div class="flex-start">
              <TsFormSelect
                v-if="!loading && commitList && commitList.length"
                v-model="selectedCommit"
                :dataList="commitList"
                v-bind="selectConfig"
                class="mr-sm"
                @change="() => getDiff()"
              ></TsFormSelect>
              <RadioGroup v-if="!loading" v-model="showType" type="button">
                <Radio v-for="(type,tindex) in typeList" :key="tindex" :label="type.name">{{ type.label }}</Radio>
              </RadioGroup>
            </div>
          </div>
        </div>
        <div ref="diffMain" class="code-diff-content" @scroll="scroll($event)">
          <DiffDetail
            v-if="hasDiffList"
            :showType="showType" 
            :diffList="diffList" 
            :supportTypeList="supportTypeList" 
            :selectedFile="selectedFile"
            :leftCommitId="leftCommitId"
            :rightCommitId="selectedCommit || rightCommitId"
            :mrId="id || versionId"
            :readOnly="readOnly"
            @endScroll="finishScroll = true"
            @hasFixtop="showFixtop"
            @affix="affix"
            @getMore="getMore"
          ></DiffDetail>
          <NoData v-else></NoData>
        </div>
       
      </div>
      <Loading v-else loadingShow style="height:100px"></Loading>
      <div 
        v-if="isFixtop && scrollTop && scrollTop > 100" 
        class="tsfont-arrow-up back-to-top bg-grey border-color cursor-pointer" 
        @click="scrolltoTop"
      ></div>
      <div 
        v-if="!loading"
        class="btn-toggle-left text-action border-color bg-op" 
        :class="showTree ?'ts-angle-left':'ts-bars'" 
        :style="{ left: (leftWidth - 28) + 'px' }"
        @click="toggleshowTree"
      ></div>
    </div>
  </div>
</template>
<script>
import mixins from 'pages/codehub/codehub/merge/review/tab/tabmixins.js';
import axios from '@/resources/api/http.js';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    DiffDetail: resolve => require(['pages/codehub/codehub/merge/review/tab/diff/diff-detail.vue'], resolve),
    TreeLi: resolve => require(['pages/codehub/codehub/merge/review/tab/diff/tree-li.vue'], resolve)
  },
  filters: {},
  mixins: [mixins],
  props: {},
  provide() {
    // provide 和inject 跨孙子组件使用
    return {
      appModuleId: (this.mrData?.appModuleVo && this.mrData.appModuleVo.id) || null,
      repositoryId: this.mrData?.appModuleId || null,
      branchname: this.mrData?.srcBranch || null,
      smrId: this.id || this.versionId || null,
      canDownloadBinaryFile: this.canBinaryFileDownload,
      canExpand: this.canExpandContent
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
      commitList: [],
      selectedFile: null, //选中树图文件
      finishScroll: true, //右侧定位是否完成
      isFixtop: false, //是否需要快速返回顶部
      scrollTop: 0, //滚动的位置
      commitInfo: null, //如果有commitid的需要获取commit的messsage
      showType: 'combine', //代码对比显示的模式
      showTree: true,
      selectedCommit: null, //选中哪个对比的commit
      selectConfig: {
        width: 160,
        border: 'border',
        clearable: false,
        textName: 'commitId',
        valueName: 'commitId',
        search: true,
        transfer: true
      },
      isDragging: false,
      startX: 0,
      startLeftWidth: 0,
      leftWidth: 200,
      typeList: [{
        name: 'combine',
        label: this.$t('term.codehub.linebylinecomparison')
      }, {
        name: 'separate',
        label: this.$t('term.codehub.leftandrightcomparison')        
      }],
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
    this.handleDiff();
  },
  beforeUpdate() {},
  updated() {},
  activated() {
    this.handleDiff();
  },
  beforeDestroy() {},
  deactivated() {},
  destroyed() {},
  methods: {
    handleDiff() {
      this.loading = true;
      this.selectedCommit = this.commitId || null;
      this.getDiff();
    },
    startDrag(event) {
      this.isDragging = true;
      this.startX = event.clientX;
      this.startLeftWidth = this.leftWidth;
      // 添加事件监听到document对象上
      document.addEventListener('mousemove', this.dragThrottled);
      document.addEventListener('mouseup', this.stopDrag);
    },
    dragThrottled(event) {
      if (!this.isDragging) return;

      const deltaX = event.clientX - this.startX;
      const newLeftWidth = this.startLeftWidth + deltaX;

      this.$nextTick(() => {
        this.leftWidth = newLeftWidth;
      });
    },
    stopDrag() {
      this.isDragging = false;
      // 移除事件监听
      document.removeEventListener('mousemove', this.dragThrottled);
      document.removeEventListener('mouseup', this.stopDrag);
    },
    getDiff(forceFlush) {
      if (!this.id && !this.versionId) {
        return;
      }
      const param = {
        ...(this.id && { mrId: this.id }),
        ...(this.versionId && { versionId: this.versionId }),
        ...(this.selectedCommit || this.commitId ? { [this.versionId ? 'commitId' : 'rightCommitId']: this.selectedCommit || this.commitId } : {}),
        ...(forceFlush ? { forceFlush: true } : {})
      };
      axios.post(this.url, param).then(res => {
        if (res.Status == 'OK') {
          this.diffList == [];
          const {fileDiffList = [], leftCommitId = '', rightCommitId = '', commitList = []} = res.Return || {};
          this.leftCommitId = leftCommitId;
          this.rightCommitId = rightCommitId;
          if (fileDiffList?.length > 0) {
            this.diffList = fileDiffList.filter(f => {
              Object.assign(f, {
                filepathUuid: this.$utils.setUuid(),
                loadingMore: false
              });
              return f.toFileName || f.fromFileName;
            });
          }
          this.fileList = this.initTree(this.diffList);

          this.nameList = this.diffList.map(({ modifiedType, toFileName, fromFileName, filepathUuid, insertedCount, deletedCount }) => {
            const name = modifiedType === 'A' ? toFileName : fromFileName;
            const substrIndex = name ? name.lastIndexOf('/') + 1 : 0;
            return {
              filepathUuid,
              name: name ? name.substr(substrIndex) : '',
              path: name || '',
              modifiedType,
              insertedCount,
              deletedCount
            };
          });
          this.commitList = commitList.map(c => ({
            ...c,
            titletxt: c.message
          }));
          const commitLi = this.commitList.filter(c => c.commitId == this.commitId);
          this.commitInfo = commitLi[0]?.message || null;
          
          //如果有从评论跳过来的在这里做定位
          if (this.selectFilepath) {
            this.$nextTick(() => {
              this.selectFile(this.selectFilepath);
            }, 200);
          }
        } else {
          this.initData();
        }
        this.$emit('clearItem', 'diff');
        this.loading = false;
      }).catch(res => {
        this.loading = false;
        this.initData();
        this.$emit('clearItem', 'diff');
      });
    },
    initData() {
      this.diffList = [];
      this.fileList = [];
      this.nameList = [];
      this.commitInfo = null;      
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
      if (!this.id) {
        return;
      }
      let param = {
        mrId: this.id,
        filePath: path,
        ...(this.selectedCommit || this.commitId ? { rightCommitId: this.selectedCommit || this.commitId } : {})
      };
      if (this.diffList?.[index]) {
        Object.assign(this.diffList[index], {
          loadingMore: true
        });
      }
      this.$api.codehub.merge.getDiff(param).then(res => {
        if (res.Status == 'OK') {
          if (this.diffList && this.diffList[index]) {
            let hunks = res.Return.fileDiffList[0];
            Object.assign(this.diffList[index], hunks);
          }
        }
      }).finally(() => {
        Object.assign(this.diffList[index], {
          loadingMore: false
        });
      });      
    },
    clearCommit() {
      this.$emit('clearCommit');
    },
    toggleshowTree() {
      this.showTree = !this.showTree;
      this.leftWidth = this.showTree ? 200 : '-40';
    },
    selectFile(path) {
      const selectedFile = this.fileList?.find(f => f.path === path);
      this.selectedFile = selectedFile?.filepathUuid || null;
    }
  },
  computed: {
    hasDiffList() {
      return this.diffList?.length > 0;
    },
    getFileCount() {
      return function(list, type) {
        const countProp = {
          deleteCount: 'deletedCount',
          addCount: 'insertedCount'
        };

        return list.reduce((accumulator, item) => {
          const prop = countProp[type];
          return accumulator + (prop && item[prop] ? item[prop] : 1);
        }, 0);
      };
    }
  },
  watch: {
    commitId: {
      handler: function(val) {
        this.loading = true; 
        this.getDiff();
      }
    },
    refreshItem: {
      handler: function(val) {
        if (val && val.length > 0 && val.includes('diff')) {
          this.getDiff(true);
        }
      },
      immediate: true,
      deep: true
    }
  }
};

</script>
<style lang='less' scoped>
#diff-container {
  // 左右拖动宽度时，会有选中文字的问题
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10+ and Edge */
  user-select: none; /* Standard syntax */ 
  #resize {
  width: 5px;
  height: 100%;
  cursor: w-resize;
}
.diff-container{
    display: flex;
    position: relative;
    height:calc(100vh - 180px); // 头部+导航栏+tab+文件描述信息+16间隙
    overflow: hidden;
    .diff-left{
      overflow: auto;
      border-right: 1px solid;
    }
    .diff-main{
      flex: 1;
      padding: 0 0 50px 10px;
      .code-diff-content {
        overflow: auto;
        height: calc(100vh - 180px - 32px - 50px);
      }
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
  .back-to-top{
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
    left: 170px;
    top: 50%;
    z-index: 9;
    width: 30px;
    height: 30px;
    line-height: 30px;
    border: 1px solid;
    text-align: center;
    transform: translate(15px, -38px);
    border-radius: 50%;
    &:before{
      margin-right: 0;
    }
  }
  .count-text{
    padding-left: 3px;
    padding-right: 3px;
    font-weight: bolder;
  }
}
</style>
