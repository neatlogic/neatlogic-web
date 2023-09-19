<template>
  <div v-if="diff" class="border-color file-li" :class="showType">
    <h4 class="bg-grey file-title border-color">
      <span class="btn-toggle text-action" :class="isShow ? 'tsfont-down' : 'tsfont-up'" @click="toggleShow()"></span>
      <span 
        class="ts-file cursor-pointer" 
        :class="type != 'file' ? (supportTypeList.includes(type) ? 'tsfont-mm-' + type : 'tsfont-mm-txt') : 'ts-folder'"
        :title="diff.modifiedType && diff.modifiedType =='R' ? $t('term.codehub.filenameadjustto', {fromfileName: diff.fromFileName}, {tofileName: diff.toFileName}) : getName(diff)"
        @dblclick.stop="goToTree(diff)"
      >
        <span v-if="diff.modifiedType && diff.modifiedType=='R'">
          {{ diff.fromFileName }}&nbsp;
          <span class="tsfont-arrow-right text-primary small"></span>{{ diff.toFileName }}</span>
        {{ diff.modifiedType && diff.modifiedType=='R'?'':getName(diff) }}
      </span>
      <span 
        v-clipboard="getName(diff)" 
        v-clipboard:success="clipboardSuc"
        class="tsfont-copy text-action ml-xs mr-xs" 
        :title="$t('term.codehub.copyfileurl')"
      ></span>
      <span 
        v-clipboard="getName(diff,true)" 
        v-clipboard:success="clipboardSuc"
        class="text-action"
        :class="type != 'file' ? (supportTypeList.includes(type) ? 'tsfont-mm-' + type : 'tsfont-mm-txt') : 'ts-folder'" 
        :title="$t('term.codehub.copyfilename')"
      ></span>
    </h4>
    <Loading v-if="diff.loadingMore" loadingShow style="height:100px"></Loading>
    <div v-else v-show="isShow">
      <div v-if="diff.hunks && diff.hunks.length > 0 && !diff.collapsed && !diff.binary" class="file-main">
        <div>
          <table class="table table-hover">
            <colgroup>
              <col width="34" />
              <col v-if="showType=='separate'" width="48%" />
              <col width="34" />
              <col :width="showType=='separate'?'48%':''" />
            </colgroup>            
            <tbody>
              <template v-for="(hunk, hindex) in diff.hunks">
                <template v-for="(line,i) in hunk.lines">
                  <!-- 第一行_start -->
                  <tr v-if="!hindex && !i && (hunk.fromFileRange.lineStart>1&&hunk.toFileRange.lineStart>1) && !diff.collapsed && canExpand" :key="'prev_'+hindex+'_'+i">
                    <td
                      class="from-lineno code-lineno cursor-pointer pre" 
                      :title="$t('term.codehub.clicktoexpandmore')" 
                      @click.stop="getMoreline('prev',hunk.fromFileRange.lineStart-1,hunk.toFileRange.lineStart-1,hunk)"
                    >
                      <div class="ts-option-horizontal text-action icon-more"></div>
                    </td>
                    <td v-if="showType == 'separate'" class="code-content"></td>
                    <td 
                      class="to-lineno code-lineno cursor-pointer" 
                      :title="$t('term.codehub.clicktoexpandmore')" 
                      @click.stop="getMoreline('prev',hunk.fromFileRange.lineStart-1,hunk.toFileRange.lineStart-1,hunk)"
                    >
                      <div class="ts-option-horizontal text-action icon-more"></div>
                    </td>
                    <td class="code-content"></td>
                  </tr>
                  <!-- 第一行_end -->
                  <tr :key="'main_'+hindex+'_'+i" :class="getType(line)">
                    <td class="from-lineno code-lineno" :class="showType=='separate'?'from':''">
                      <div class="text-tip">{{ setNumtext('from', hunk, i) }}</div>
                      <template v-if="!readOnly">
                        <div v-if="showType == 'separate' && line?.lineType != 'TO'" class="comment-line" @click.stop="toggleShowComment(line)">
                          <Badge 
                            v-if="getLineCommit('left',setNumtext('from', hunk, i),commentList).length" 
                            :count="getLineCommit('left',setNumtext('from', hunk, i),commentList).length"
                            style="transform: scale(0.7);"
                          ></Badge>
                          <span v-else class="comment-icon tsfont-message text-action text-primary" :title="$t('page.comment')"></span>                        
                        </div>
                        <div v-else-if="showType != 'separate'" class="comment-line" @click.stop="toggleShowComment(line)">
                          <Badge 
                            v-if="line?.lineType != 'TO' ? getLineCommit('left',setNumtext('from', hunk, i),commentList).length:getLineCommit('right',setNumtext('to', hunk, i),commentList).length" 
                            :count="line?.lineType != 'TO' ? getLineCommit('left',setNumtext('from', hunk, i),commentList).length:getLineCommit('right',setNumtext('to', hunk, i),commentList).length"
                            style="transform: scale(0.7);"
                          ></Badge>
                          <span v-else class="comment-icon tsfont-message text-action text-primary" :title="$t('page.comment')"></span>
                        </div>
                      </template>
                    </td>
                    <td v-if="showType=='separate'" class="code-content from">
                      <div v-if="line && line.lineType != 'TO'" style="word-break: break-all;overflow: auto;">
                        <code>{{ line.content }}</code>
                      </div>
                    </td>
                    <td class="to-lineno code-lineno" :class="showType == 'separate' ? 'to': '' ">
                      <div class="text-tip">{{ setNumtext('to', hunk, i) }}</div>
                      <div v-if="showType == 'separate'&& line?.lineType =='TO' && !readOnly" class="comment-line" @click.stop="toggleShowComment(line)">
                        <Badge 
                          v-if="getLineCommit('right',setNumtext('to', hunk, i),commentList).length" 
                          :count="getLineCommit('right',setNumtext('to', hunk, i),commentList).length"
                          style="transform: scale(0.7);"
                        ></Badge>
                        <span v-else class="comment-icon tsfont-message text-action text-primary" title="评论"></span>
                      </div>
                    </td>
                    <td class="code-content" :class="showType=='separate'?'to':''">
                      <div v-if="line &&( showType != 'separate' || (showType=='separate' && line?.lineType!='FROM'))" style="word-break: break-all;overflow: auto;">
                        <code>{{ line.content }}</code>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="line?.onComment && !readOnly" :key="'comment_'+hindex+'_'+i">
                    <td v-if="showType=='separate'" colspan="2">
                      <CommentLine 
                        v-if="line?.lineType!='TO'"
                        :commentList="getLineCommit('left',setNumtext('from', hunk, i),commentList)"
                        :line="setNumtext(line?.lineType.toLowerCase(), hunk, i)" 
                        :filePath="diff.modifiedType == 'A' ? diff.toFileName : diff.fromFileName" 
                        :lineType="line?.lineType" 
                        @close="toggleShowComment(line)"
                        @updateComment="updateComment"
                      ></CommentLine>                      
                    </td>
                    <td
                      v-if="showType=='separate'&& !readOnly"
                      colspan="2"
                      class="border-color"
                      style="border-left:1px solid;"
                    >
                      <CommentLine 
                        v-if="line?.lineType=='TO'"
                        :commentList="getLineCommit('right',setNumtext('to', hunk, i),commentList)"
                        :line="setNumtext(line?.lineType.toLowerCase(), hunk, i)" 
                        :filePath="diff.modifiedType == 'A' ? diff.toFileName : diff.fromFileName" 
                        :lineType="line?.lineType" 
                        @close="toggleShowComment(line)"
                        @updateComment="updateComment"
                      ></CommentLine> 
                    </td>
                    <td v-else-if="!readOnly" colspan="3">
                      <CommentLine 
                        :commentList="line?.lineType!='TO'?getLineCommit('left',setNumtext('from', hunk, i),commentList):getLineCommit('right',setNumtext('to', hunk, i),commentList)"
                        :line="setNumtext(line?.lineType.toLowerCase(), hunk, i)" 
                        :filePath="diff.modifiedType == 'A' ? diff.toFileName : diff.fromFileName" 
                        :lineType="line?.lineType" 
                        @close="toggleShowComment(line)"
                        @updateComment="updateComment"
                      ></CommentLine>
                    </td>
                  </tr>
                  <!-- 最后一行_start -->
                  <tr v-if="hasNext(hunk,diff,i,setNumtext('from', hunk,hunk.lines.length-1),diff.hunks[hindex+1]?diff.hunks[hindex+1].fromFileRange.lineStart:null) && canExpand" :key="'next_'+hindex+'_'+i">
                    <td v-if="hunk.getMoreLine" :colspan="showType=='separate'?4:3"><Spin size="small"></Spin></td>
                    <td 
                      v-if="!hunk.getMoreLine"
                      class="from-lineno code-lineno cursor-pointer next" 
                      :title="$t('term.codehub.clicktoexpandmore')" 
                      @click.stop="getMoreline('next',setNumtext('from', hunk,hunk.lines.length-1,true),setNumtext('to', hunk,hunk.lines.length-1),hunk,diff.hunks[hindex+1]?diff.hunks[hindex+1].fromFileRange.lineStart:null)"
                    ><div class="ts-option-horizontal text-action icon-more"></div>
                    </td>
                    <td v-if="!hunk.getMoreLine && showType=='separate'" class="code-content"></td>
                    <td 
                      v-if="!hunk.getMoreLine"
                      class="to-lineno code-lineno cursor-pointer" 
                      :title="$t('term.codehub.clicktoexpandmore')" 
                      @click.stop="getMoreline('next',setNumtext('from', hunk,hunk.lines.length-1,true),setNumtext('to', hunk,hunk.lines.length-1),hunk,diff.hunks[hindex+1]?diff.hunks[hindex+1].fromFileRange.lineStart:null)"
                    ><div class="ts-option-horizontal text-action icon-more"></div></td>
                    <td v-if="!hunk.getMoreLine" class="code-content"></td>
                  </tr>
                  <!-- 最后一行_end -->
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else-if="diff.collapsed" class="file-main">
        <div>
          <table class="table table-hover">
            <tbody>
              <tr>
                <td class="code-content text-center" :colspan="showType=='separate'?4:3" style="line-height:2.5;">
                  <span>{{ $t('term.codehub.thisdifferencehasbeenfolded') }} ，</span>
                  <span class="text-href" @click.stop="showMore()">{{ $t('term.codehub.clicktoexpandthedetails') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else-if="diff.binary" class="file-main">
        <div>
          <table class="table table-hover">
            <tbody>
              <tr>
                <td class="code-content text-center" :colspan="showType=='separate'?4:3" style="line-height:2.5;">
                  <div v-if="diff.modifiedType == 'D'" class="text-grey">
                    {{ $t('term.codehub.filedeleted') }}
                  </div>
                  <template v-else>
                    <template v-if="canDownloadBinaryFile">
                      <span>{{ $t('term.codehub.binaryfilecannotviewcontent') }}</span>
                      <span
                        v-if="!isDowning"
                        v-download="downPath(diff)"
                        v-download:success="downloadok"
                        class="text-href"
                      >{{ $t('term.codehub.clickheretodownloadthefile') }}</span>
                      <span v-else><Icon type="ios-loading" size="16" class="loading"></Icon>{{ $t('page.downloading') }}</span>
                    </template>
                    <template v-else>
                      {{ $t('term.codehub.binaryfilenosupportview') }}
                    </template>
                  
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="file-main">
        <div>
          <table class="table table-hover">
            <tbody>
              <tr>
                <td class="code-content text-center" :colspan="showType=='separate'?4:3" style="line-height:2.5;">
                  {{ diff.modifiedType && diff.modifiedType=='R'?$t('term.codehub.nochangesmade'):$t('term.codehub.thefileisempty') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    CommentLine: resolve => require(['pages/codehub/codehub/merge/review/tab/diff/comment-line.vue'], resolve)
  },
  filters: {},
  directives: {clipboard, download},
  inject: ['appModuleId', 'branchname', 'leftcommitid', 'rightcommitid', 'canDownloadBinaryFile', 'canExpand'],
  props: {
    diffList: [Array, Object],
    type: {
      type: String,
      default: 'html'
    },
    supportTypeList: {
      type: Array
    },
    showType: {
      type: String,
      default: 'combine'     
    },
    commentList: {//该文件的评论
      type: [Array, String]     
    },
    readOnly: {
      type: Boolean     
    },
    queryType: {
      type: String
    },
    queryName: {
      type: String
    }
  },
  data() {
    return {
      isShow: true,
      diff: null,
      moreLineCount: 10, //每次加载更多的默认取多少行
      isDowning: false//是否在下载中
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toggleShow() {
      this.isShow = !this.isShow;
    },
    showDetail() {
      this.isShow = true;
    },
    clipboardSuc() {
      this.$Message.success(this.$t('message.copysuccess'));
    },
    goToTree(diff) {
      this.$emit('affix', diff);
    },
    showMore() {
      //显示文件内容，文件处于折叠状态需要调用获取折叠的内容
      this.$emit('getMore');
    },
    getMoreline(type, fromNo, toNo, item, nextNo) {
      //显示更多行内容
      //type:['prev':加载前面的行；’next':加载后面的行];fromNo:左侧的行号；toNo：右侧的行号；item:这一行的数据；nextNo：下一个块的开始（最后一行不用考虑）
      let lineNo = Math.max(0, fromNo + 1);
      if (type == 'prev') {
        this.searchLine(Math.max(1, lineNo - this.moreLineCount - 2), lineNo - 1, item, type, Math.max(1, toNo - this.moreLineCount - 1));
      } else {
        this.searchLine(lineNo, nextNo ? Math.min(lineNo + this.moreLineCount - 1, nextNo - 1) : lineNo + this.moreLineCount - 1, item, type, toNo + 1);
      }
    },
    searchLine(startLine, endLine, hunk, type, toNo) {
    //调用获取行内容的接口
      let param = {
        appModuleId: this.appModuleId,
        filePath: this.diff && this.diff.modifiedType == 'R' ? this.diff.fromFileName : this.diff.toFileName,
        commitId: this.leftcommitid,
        lineStart: startLine,
        lineEnd: endLine,
        branchName: this.branchname
      };
      Object.assign(hunk, {
        getMoreLine: true
      });
      this.$api.codehub.merge.getDiffLine(param).then((res) => {
        Object.assign(hunk, {
          getMoreLine: false
        });
        if (res && res.Status == 'OK') {
          let moreList = res.Return && res.Return.list ? res.Return.list : [];
          if (!moreList.length) {
            Object.assign(hunk, {
              isEnd: true
            });
          }
          let newList = moreList.map((m) => {
            return {'lineType': 'NEUTRAL', 'content': m};
          });
          let lineCount = res.Return.list.length;
          let newHunk = {
            isEnd: res.Return.list.length < this.moreLineCount,
            toFileRange: {
              lineStart: toNo, 
              lineCount: lineCount
            }, 
            fromFileRange: {
              lineStart: startLine, 
              lineCount: lineCount
            }, 
            lines: newList           
          };
          let nIndex = 0;//获取对应的是第几个hunk
          this.diff.hunks.forEach((h, hindex) => {
            if (h.hUuid && h.hUuid == hunk.hUuid) {
              nIndex = hindex;
            }
          });
          if (type == 'prev') {
            this.diff.hunks.splice(0, 0, newHunk);
          } else {
            this.diff.hunks.splice(nIndex + 1, 0, newHunk);
          }
          this.$forceUpdate();
        }
      }).catch((e) => {
        Object.assign(hunk, {
          getMoreLine: false
        });        
      });
    },
    toggleShowComment(hunk) {
      Object.assign(hunk, {
        onComment: !hunk?.onComment
      });
      this.$forceUpdate();
    },
    updateComment() {
      this.$emit('updateComment');
    },
    initList(list) {
      let firstList = list.filter((l) => {
        //获取下一层
        let childrenList = list.filter((s) => {
          return s.parentUuid == l.uuid;
        });
        if (childrenList.length) {
          Object.assign(l, {
            children: childrenList
          });
        }
        //是否有上一层
        let parentLi = list.filter((s) => {
          return s.uuid == l.parentUuid;
        });
        if (parentLi.length) {
          Object.assign(l, {
            hasParent: true
          });          
        }
        return !l.hasParent;
      });
      return firstList;
    },
    downloadok() {
      this.$Message.success(this.$t('message.downloadsuccessful'));
    },
    changeDownStatus(type, event) { //下载进度和状态的监听
      if (type == 'start') {
        this.isDowning = true;
      } else if (type != 'progress') {
        this.isDowning = false;
      }
    }
  
  },
  computed: {
    getType() {
      return function(item) {
        let className = null;
        if (item?.lineType) {
          className = 'line-tr linetype-' + item.lineType.toLowerCase();
        }
        return className;
      };
    },
    setNumtext() {
      return function(type, hunk, ind, isKeep) {
        //如果那一行数据类型是NEUTRAL就都显示，如果是TO就不显示FROM,isKeep是用来获取那一行究竟是什么行号（点击加载更多需要，但是显示不需要）
        let list = hunk.lines;
        let index = (ind != null && ind != undefined) ? ind : hunk.lines.length;
        let startNum = (type == 'from') ? hunk.fromFileRange.lineStart : hunk.toFileRange.lineStart;
        let str = '';
        let data = list[index];
        let compared = (type && type == 'from') ? 'TO' : 'FROM'; //如果是显示新文件的判断类型是from的就不显示文字，同理老文件

        if (data && data.lineType && data.lineType.toUpperCase() == compared && data.lineType.toUpperCase() != 'NEUTRAL') {
          if (isKeep) {
            str = (type == 'from') ? startNum + hunk.fromFileRange.lineCount - 1 : startNum + hunk.toFileRange.lineCount - 1;
          } else {
            str = '';
          }
        } else {
          let num = 0;
          list.forEach((li, lindex) => {
            if (lindex < index && li.lineType != compared) {
              num++;
            }
          });
          str = startNum + num;
        }
        return str;
      };
    },
    getMax() {
      return function(type, from, to) {
        //根据返回from跟to的开始结束、最大最小行计算行数的长度跟开始结束
        let lineConfig = {
          startLine: 0,
          endLine: 0
        };
        return lineConfig;
      };
    },
    getPrevline() {
      return function(hindex, item, all) {
        //如果当前循环的开始是第一行，或者当前的开始不是上一次循环的结束
        let isMore = false;
        if (!hindex && item.fromFileRange.lineStart != 1) {
          isMore = true;
        }
        return isMore;
      };
    },
    getName() {
      return function(diff, isCurrent) {
        //如果是当前的，就把路径都过滤掉只保留文件名（含文件后缀）
        let name = '';
        let fullName = diff.modifiedType == 'A' ? diff.toFileName : diff.fromFileName;

        if (isCurrent) {
          name = fullName?.substr(fullName?.lastIndexOf('/') + 1);
        } else {
          name = fullName;
        }

        return name;
      };
    },
    hasNext() {
      return function(hunk, diff, i, nowEndline, nextStartline) {
        let isNext = false;
        //先判断外部条件（如果这一块不是结束的、如果文件是非折叠然后不是新增的）
        if (!hunk.isEnd && !diff.collapsed && diff.modifiedType == 'M') {
          //如果是那一块的最后一行
          //并且后面一块的开始行数比现在的结束行数要多的或者是最后一块
          //就是中间还有
          if ((i == hunk.lines.length - 1) && ((nextStartline && nextStartline > nowEndline + 1) || !nextStartline)) {
            isNext = true;
          }
        }
        return isNext;
      };
    },
    getLineCommit() {
      return function(type, lineNo, lists) {
        let finalList = [];
        let list = [];
        if (lists && lists.length > 0) {
          list = lists.filter(l => {
            return (l.lineType == type) && (l.line == lineNo);
          });
          if (list.length > 0) {
            finalList = this.initList(list);
          }
        }
        return finalList;
      };
    },
    downPath() {
      return function(diff) {
        let toFileName = diff.toFileName == '/dev/null' ? diff.fromFileName : diff.toFileName;
        if (this.queryType) {
          if (this.queryType == 'branch') {
            return {
              url: '/api/binary/codehub/repository/file/download',
              params: {
                appModuleId: this.appModuleId,
                branchName: this.queryName,
                commitId: this.rightcommitid,
                filePath: toFileName
              },
              changeStatus: this.changeDownStatus
            };
          } else {
            return {
              url: '/api/binary/codehub/repository/file/download',
              params: {
                appModuleId: this.appModuleId,
                tagName: this.queryName,
                commitId: this.rightcommitid,
                filePath: toFileName
              },
              changeStatus: this.changeDownStatus
            };            
          }
        } else {
          return {
            url: '/api/binary/codehub/repository/file/download',
            params: {
              appModuleId: this.appModuleId,
              branchName: this.branchname,
              commitId: this.rightcommitid,
              filePath: toFileName
            },
            changeStatus: this.changeDownStatus
          }; 
        }
      };
    }
  },
  watch: {
    diffList: {
      handler: function(val) {
        if (val) {
          let diff = val;
          if (diff.hunks && diff.hunks.length > 0) {
            diff.hunks.forEach((h) => {
              Object.assign(h, {
                hUuid: this.$utils.setUuid()
              });
            });
          }
          this.diff = diff;
        } else {
          this.diff = null;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/codehub/commit.less';
.file-title {
  position: relative;
  padding-right: 40px;
  white-space: nowrap;
  word-break: keep-all;
  text-overflow: ellipsis;
  overflow: hidden;
}
.comment-line{
  opacity: 0;
  position: absolute;
  top: 0;
  padding: 0 4px;
  left: 0;
  /deep/ .ivu-badge{
    cursor: pointer;
  }
}
.line-tr{
  &:hover{
    .comment-line{
      opacity: 1;
    }
  }
}
.code-lineno{
  position: relative;
}
.icon-more{
  font-size: 12px;
  opacity: .7;
  &:before{
    margin-right: 0;
  }
}
</style>
