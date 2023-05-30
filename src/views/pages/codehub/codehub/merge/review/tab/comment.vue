<template>
  <div class="comment-container">
    <div class="top">
      <div style="padding:0 16px;">
        <TsCkeditor 
          ref="editor"
          v-model.trim="commitText"
          width="100%" 
        ></TsCkeditor>
      </div>
      <div class="padding-md text-right"><Button type="primary" :disabled="!commitText || submiting" @click="submitCommit">发布评论</Button></div>
    </div>
    <div class="main border-color" style="height: calc(100vh - 370px);overflow:auto;">
      <Loading v-if="loading" loadingShow style="height:100px"></Loading>
      <CommentList
        v-else
        :list="commitList"
        @reload="getList"
        @selectFile="selectFile"
      ></CommentList>
    </div>
  </div>
</template>
<script>
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
import CommentList from './comment/comment-list.vue';
import mixins from './tabmixins.js';
export default {
  name: '',
  components: {
    TsCkeditor,
    CommentList
  },
  filters: {},
  mixins: [mixins],
  props: [''],
  data() {
    return {
      commitText: '',
      submiting: false, //是否正在提交评论
      loading: false, //评论列表加载中
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
          uuid: '',
          mrUuid: this.uuid,
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
      let _this = this;
      urlList.push(_this.getLineList());
      urlList.push(_this.getMrList());
      _this.loading = true;
      _this.$axios.all(urlList).then(
        _this.$axios.spread(function(...arr) {
          _this.loading = false;
          let list = [];
          if (arr && arr.length > 0) {
            arr.forEach((a) => {
              if (a.Status == 'OK' && a.Return && a.Return.list && a.Return.list.length > 0) {
                list.push(...a.Return.list);
              }
            });
          }
          _this.commitList = _this.initList(list);
        })
      ).catch((e) => {
        _this.loading = false;
      });
    },
    getLineList() {
      let param = {
        needPage: false,
        mrUuid: this.uuid
      };
      return this.$api.codehub.merge.getCommentOfLine(param);
    },
    getMrList() {
      let param = {
        needPage: false,
        mrUuid: this.uuid
      };
      return this.$api.codehub.merge.getComment(param);
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
