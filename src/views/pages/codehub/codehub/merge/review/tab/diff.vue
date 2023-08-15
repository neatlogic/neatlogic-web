<template>
  <div id="box" class="padding">
    <div class="diff-container" :class="showTree ?'':'hideLeft'">
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
        ref="diffMain"
        class="diff-main"
        @scroll="scroll($event)"
      >
        <div class="mb-xs">
          <div v-if="commitId" class="ml-sm" style="line-height: 2;">{{ commitInfo }}</div>
          <div class="flex-between ml-md" :class="commitId ? 'pt-sm' : ''">
            <div v-if="!loading && diffList && diffList.length">
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
                @on-change="getDiff()"
              ></TsFormSelect>
              <RadioGroup v-if="!loading" v-model="showType" type="button">
                <Radio v-for="(type,tindex) in typeList" :key="tindex" :label="type.name">{{ type.label }}</Radio>
              </RadioGroup>
            </div>
          </div>
        </div>
        <DiffDetail
          v-if="diffList && diffList.length>0"
          :showType="showType" 
          :diffList="diffList" 
          :supportTypeList="supportTypeList" 
          :selectedFile="selectedFile"
          :leftCommitId="leftCommitId"
          :rightCommitId="selectedCommit || rightCommitId"
          :mrId="id"
          :readOnly="readOnly"
          @endScroll="finishScroll =true"
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
        :style="leftWidth ? { left: (leftWidth - 28) + 'px' } : (showTree ? { left: '170px' } : { left: '-40px' })"
        @click="toggleshowTree"
      ></div>
      {{ leftWidth }}
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
      selectedFile: null, //选中树图文件
      finishScroll: true, //右侧定位是否完成
      isFixtop: false, //是否需要快速返回顶部
      scrollTop: 0, //滚动的位置
      cancelAxios: null, //取消接口调用用
      commitInfo: null, //如果有commitid的需要获取commit的messsage
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
      isDragging: false,
      startX: 0,
      startLeftWidth: 0,
      leftWidth: 200,
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
    this.loading = true;
    if (this.commitId) {
      this.selectedCommit = this.commitId;
    } else {
      this.selectedCommit = null;
    }
    this.getDiff();
  },
  beforeUpdate() {},
  updated() {},
  activated() {
    if (this.commitId) {
      this.selectedCommit = this.commitId;
    } else {
      this.selectedCommit = null;
    }
    this.getDiff();
  },
  deactivated() {
    //取消正在搜索的请求
    this.loading = true;  
    let cancel = this.cancelAxios;
    cancel && cancel.cancel(); 
  },
  beforeDestroy() {
    //取消正在搜索的请求
    let cancel = this.cancelAxios;
    cancel && cancel.cancel();   
    this.loading = true;  
  },
  destroyed() {},
  methods: {
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
      let param = {};
      if (!this.id && !this.versionId) {
        return;
      }
      if (this.id) {
        param.mrId = this.id;
      }
      if (this.versionId) {
        param.versionId = this.versionId;
      }
      if (this.selectedCommit || this.commitId) {
        Object.assign(param, {
          rightCommitId: this.selectedCommit || this.commitId
        });
      }
      if (forceFlush) {
        Object.assign(param, {
          forceFlush: true
        });        
      }
      this.loading = true;
      //取消正在搜索的请求
      let cancel = this.cancelAxios;
      cancel && cancel.cancel();
      const CancelToken = axios.CancelToken;
      this.cancelAxios = CancelToken.source();
      axios.post(this.url, param, { cancelToken: this.cancelAxios.token }).then(res => {
        if (res.Status == 'OK') {
          this.leftCommitId = res.Return.leftCommitId;
          this.rightCommitId = res.Return.rightCommitId;
          if (res.Return.fileDiffList && res.Return.fileDiffList.length > 0) {
            let fileDiffList = res.Return.fileDiffList.filter(f => {
              Object.assign(f, {
                filepathUuid: this.$utils.setUuid(),
                loadingMore: false
              });
              return f.toFileName || f.fromFileName;
            });
            this.diffList = fileDiffList;
          } else {
            this.diffList == [];
          }
          this.fileList = this.initTree(this.diffList);

          this.nameList = this.diffList.map(d => {
            let name = d.modifiedType == 'A' ? d.toFileName : d.fromFileName;
            return {
              filepathUuid: d.filepathUuid,
              name: name.substr(name.lastIndexOf('/') + 1),
              path: name,
              modifiedType: d.modifiedType,
              insertedCount: d.insertedCount,
              deletedCount: d.deletedCount
            };
          });
          if (res.Return.commitList && res.Return.commitList.length) {
            this.commitList = res.Return.commitList.map(c => {
              Object.assign(c, {
                titletxt: c.message
              });
              return c;
            });
            let commitLi = res.Return.commitList.filter(c => {
              return c.commitId == this.commitId;
            });
            try {
              this.commitInfo = commitLi[0].messsage || null;
            } catch (e) {
              //
            }
          } else {
            this.commitList = [];
            this.commitInfo = null;
          }
          
          //如果有从评论跳过来的在这里做定位
          if (this.selectFilepath) {
            this.$nextTick(() => {
              this.selectFile(this.selectFilepath);
            }, 200);
          }
        } else {
          this.clearSetting();
        }
        this.$emit('clearItem', 'diff');
        this.loading = false;
      }).catch(res => {
        this.loading = false;
        this.clearSetting();
        this.$emit('clearItem', 'diff');
      });
    },
    clearSetting() {
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
      let param = {
        mrId: this.id,
        filePath: path
      };
      if (!this.id) {
        return;
      }
      if (this.selectedCommit || this.commitId) {
        Object.assign(param, {
          rightCommitId: this.selectedCommit || this.commitId
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
    clearCommit() {
      this.$emit('clearCommit');
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
#box {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10+ and Edge */
  user-select: none; /* Standard syntax */
}
#resize {
  width: 5px;
  height: 100%;
  cursor: w-resize;
}
.diff-container{
  display: flex;
  position: relative;
  height:calc(100vh - 180px); // 头部+导航栏+tab+文件描述信息+16间隙
  .diff-left{
    min-width: 200px;
    overflow: auto;
    border-right: 1px solid;
  }
  .diff-main{
    flex: 1;
    padding: 10px 0 50px 10px;
    overflow: auto;
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
