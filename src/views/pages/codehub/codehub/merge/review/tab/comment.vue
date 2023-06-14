<template>
  <div class="padding">
    <div class="mb-sm">
      <div class="pb-sm">
        <TsCkeditor 
          ref="editor"
          v-model.trim="commitText"
          width="100%" 
        ></TsCkeditor>
      </div>
      <div class="text-right">
        <Button type="primary" :disabled="!commitText || submiting" @click="submitCommit">
          {{ $t('term.codehub.postcomments') }}
        </Button>
      </div>
    </div>
    <div class="border-color">
      <Loading v-if="loading" loadingShow type="fix"></Loading>
      <CommentList
        v-if="!loading"
        :commitList="commitList"
        @reload="getList"
        @selectFile="selectFile"
      ></CommentList>
    </div>
  </div>
</template>
<script>
import mixins from './tabmixins.js';
export default {
  name: '',
  components: {
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve),
    CommentList: resolve => require(['./comment/comment-list.vue'], resolve)
  },
  filters: {},
  mixins: [mixins],
  props: [''],
  data() {
    return {
      commitText: '',
      submiting: false, //是否正在提交评论
      loading: true, //评论列表加载中
      commitList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {
    this.getList();
  },
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    submitCommit() {
      if (this.commitText) {
        let param = {
          id: '',
          mrId: this.id,
          comment: this.commitText
        };
        this.submiting = true;
        this.$api.codehub.merge.saveComment(param).then((res) => {
          this.submiting = false;
          if (res.Status == 'OK') {
            this.reload();
          }
        }).catch((e) => {
          this.submiting = false;
        });
      }
    },
    reload() {
      //刷新整个评论（含清空评论内容）
      this.commitText = '';
      this.getList();
    },
    getList() {
      let urlList = [];
      urlList.push(this.getLineList());
      urlList.push(this.getMrList());
      this.loading = true;
      this.$axios.all(urlList).then( // 执行多个并发请求
        this.$axios.spread((...arr) => {
          let list = [];
          if (arr && arr.length > 0) {
            arr.forEach((a) => {
              if (a.Status == 'OK' && a.Return && a.Return.tbodyList && a.Return.tbodyList.length > 0) {
                list.push(...a.Return.tbodyList);
              }
            });
          }
          this.commitList = this.initList(list);
          this.loading = false;
        })
      ).catch((e) => {
        this.loading = false;
      });
    },
    getLineList() {
      let param = {
        needPage: false,
        mrId: this.id
      };
      return this.$api.codehub.merge.getCommentOfLine(param);
    },
    getMrList() {
      let param = {
        needPage: false,
        mrId: this.id
      };
      return this.$api.codehub.merge.getComment(param);
    },
    initList(list) {
      let firstList = list.filter((l) => {
        //获取下一层
        let childrenList = list.filter((s) => {
          return s.parentId == l.id;
        });
        if (childrenList.length) {
          Object.assign(l, {
            children: childrenList
          });
        }
        //是否有上一层
        let parentLi = list.filter((s) => {
          return s.id == l.parentId;
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
    selectFile(path) {
      this.$emit('selectFile', path);
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less'>
</style>
