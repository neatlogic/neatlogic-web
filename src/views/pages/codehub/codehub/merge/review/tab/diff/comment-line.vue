<template>
  <div class="padding-xs">
    <TsCkeditor 
      ref="editor"
      v-model.trim="commitText"
      width="100%" 
    ></TsCkeditor>
    <div class="text-right" style="margin-top:5px;">
      <Button
        type="primary"
        :disabled="!commitText || submiting"
        size="small"
        @click="submitCommit"
      >{{ $t('page.comment') }}</Button>
      <Button size="small" class="ml-sm" @click="close">{{ $t('page.cancel') }}</Button>
    </div>
    <div v-if="commentList && commentList.length>0" class="padding-md">
      <CommentList :commentList="commentList" tab="diff" @reload="getList"></CommentList>
    </div>
  </div>
</template>
<script>
import CommentList from '../comment/comment-list.vue';
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
export default {
  name: '',
  components: {
    TsCkeditor,
    CommentList
  },
  inject: ['smruuid', 'leftcommitid', 'rightcommitid'],
  filters: {},
  props: {
    line: Number, 
    filePath: String, 
    lineType: String,
    commentList: Array
  },
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
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    submitCommit() {
      if (this.commitText) {
        let param = {
          mrUuid: this.smruuid,
          leftCommitId: this.leftcommitid,
          rightCommitId: this.rightcommitid,
          line: this.line,
          filePath: this.filePath,
          lineType: this.lineType == 'TO' ? 'right' : 'left',
          comment: this.commitText
        };
        this.submiting = true;
        this.$api.codehub.merge.saveCommentByLine(param).then((res) => {
          this.submiting = false;
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.commentsucces'));
            this.$emit('updateComment');
            this.commitText = null;
          }
        }).catch((res) => {
          this.submiting = false;
        });
      }
    },
    close(status) {
      this.$emit('close');
      if (status) {
        this.$emit('updateComment');
      }
    },
    getList() {
      this.$emit('updateComment');
    }
  },
  computed: {},
  watch: {}
};

</script>
<style lang='less'>
</style>
