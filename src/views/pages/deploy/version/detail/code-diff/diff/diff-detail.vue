<template>
  <div v-if="diffList && diffList.length > 0">
    <div 
      v-for="(diff, dindex) in diffList" 
      :id="'file_' + diff.filepathUuid" 
      :key="diff.filepathUuid"
      class="file-item pb-sm"
    >
      <CodeDetail 
        :ref="'file_' + diff.filepathUuid"
        :showType="showType"
        :diffList="diff" 
        :type="getType(diff)" 
        :supportTypeList="supportTypeList" 
        :queryName="queryName"
        :queryType="queryType" 
        :commentList="commentList.filter((c)=>{return c.filePath == (diff.modifiedType == 'A' ? diff.toFileName : diff.fromFileName)})"
        :class="selectedFile && selectedFile == diff.filepathUuid ? 'active block-container' : ''"
        :readOnly="readOnly"
        @affix="affix"
        @getMore="getMore(diff,dindex)"
        @updateComment="getLineComment"
      ></CodeDetail>
    </div>
  </div>
</template>
<script>
import CodeDetail from './code-detail.vue';
export default {
  name: '',
  components: {
    CodeDetail
  },
  provide() {
    return {
      leftcommitid: this.leftCommitId,
      rightcommitid: this.rightCommitId
    };
  },
  filters: {},
  props: {
    diffList: {
      type: Array
    },
    supportTypeList: {
      type: Array
    },
    selectedFile: {
      type: String
    },
    leftCommitId: {
      type: [String, Number]
    },
    rightCommitId: {
      type: [String, Number]
    },
    showType: {
      type: String,
      default: 'combine'     
    },
    mrId: {
      type: Number
    },
    readOnly: {
      type: Boolean,
      default: false
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
      scrollFn: null,
      commentList: []//此mr下的行评论
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.checkFixttop();
    if (!this.readOnly) {
      this.getLineComment();
    }
  },
  beforeUpdate() {},
  updated() {
    this.checkFixttop();
  },
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.scrollFn && clearTimeout(this.scrollFn);
  },
  destroyed() {},
  methods: {
    selectFile(path) {
      if (path) {
        if (!this.$el) {
          return;
        }
        let selectDom = this.$el.querySelector('#file_' + path);
        //元素定位
        if (selectDom) {
          try {
            selectDom.scrollIntoView(true);
          } catch (e) {
            console.error(e);
          }
        }
        //触发内容展开
        if (this.$refs['file_' + path] && this.$refs['file_' + path][0] && this.$refs['file_' + path][0].showDetail) {
          this.$refs['file_' + path][0].showDetail();
        }
        this.scrollFn && clearTimeout(this.scrollFn);
        this.scrollFn = setTimeout(() => {
          this.$emit('endScroll');
        }, 200);
      }
    },
    checkFixttop() {
      if (this.$el?.getBoundingClientRect().height > this.$el?.parentNode?.getBoundingClientRect().height) {
        this.$emit('hasFixtop', true);
      } else {
        this.$emit('hasFixtop', false);
      }
    },
    affix(diff) {
      this.$emit('affix', diff);
    },
    getMore(diff, index) {
      //获取当前文件的内容
      let path = diff.modifiedType == 'A' ? diff.toFileName : diff.fromFileName;
      this.$emit('getMore', path, index);
    },
    getLineComment() {
      //获取所有的行评论
      if (this.diffList && this.diffList.length > 0) {
        let param = {
          needPage: false,
          mrId: this.mrId
        };
        this.$api.common.getCommentOfLine(param).then((res) => {
          if (res.Status == 'OK') {
            this.commentList = res.Return.list || [];
          }
        }).catch(() => {
          this.commentList = [];
        });
      }
    }
  },
  computed: {
    getType() {
      return function(diff) {
        let name = diff.modifiedType === 'A' ? diff.toFileName : diff.fromFileName;
        let index = name ? name.lastIndexOf('.') : -1;
        return index !== -1 ? name.substring(index + 1) : '';
      };
    }
  },
  watch: {
    selectedFile: {
      handler: function(val) {
        if (val) {
          this.selectFile(val);
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.file-item {
  .active {
    /deep/ .file-name {
      font-weight: bold;
    }
  }
}
</style>
