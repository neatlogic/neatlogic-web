<template>
  <div class="comment-text">
    <div>
      <div v-if="li.filePath && tab !='diff' &&!isChildren" class="text-tip">
        <span>{{ $t('term.codehub.changestofiletarget', {target: li.filePath}) }}</span>
        <span class="text-href" @click="gotoFile(li)">
          <span>{{ li.leftCommitId |commitId }}</span>
          <span v-if="li.lineType=='left'">({{ li.line }})</span>
          <span>...</span>
          <span>{{ li.rightCommitId |commitId }}</span>
          <span v-if="li.lineType=='right'">({{ li.line }})</span>
        </span>
        <span>{{ $t('term.codehub.commentedonaline') }}</span>
      </div>
      <div v-if="li.filePath && tab !='diff'" class="mt-xs ml-nm mr-nm" v-html="li.comment"></div>
      <div v-else class="mt-xs ml-nm mr-nm" v-html="li.comment"></div>
    </div>
    <div :class="showReply ? 'mt-sm' : ''">
      <div v-if="!showReply" class="block-reply">
        <div class="action-group">
          <div
            v-if="li.canEdit"
            class="action-item tsfont-trash-o"
            :title="$t('page.delete')"
            @click="deleteComment(li)"
          ></div>
          <div class="action-item tsfont-reply" :title="$t('page.reply')" @click="replyLi"></div>
        </div>
      </div>
      <div v-else>
        <TsCkeditor 
          v-model.trim="commitText"
          width="100%" 
        ></TsCkeditor>
        <div class="text-right padding-md">
          <Button
            :disabled="!commitText ||replying"
            type="primary"
            size="small"
            class="mr-sm"
            @click="submitReply(li)"
          >{{ $t('page.reply') }}</Button>
          <Button size="small" @click="resetReply">{{ $t('page.cancel') }}</Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve)
  },
  filters: {
    commitId(value) {
      //处理接口返回的commitid(如果长度大于8，就截取前8位)
      let showtxt = value;
      try {
        showtxt = value.substring(0, 8);
      } catch (error) {
        console.log('处理commitId错误');
      }
      return showtxt;
    }
  },
  props: {
    li: Object,
    tab: String, //是从哪个tab切过来
    isChildren: Boolean
  },
  data() {
    return {
      commitText: '',
      showReply: false,
      replying: false
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
    replyLi() {
      this.showReply = true;
    },
    deleteComment(item) {
      let param = {
        id: item.id
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.comment')}),
        btnType: 'error',
        'on-ok': (vnode) => {
          if (item.filePath) {
            this.$api.codehub.merge.deleteCommentByLine(param).then((res) => {
              if (res && res.Status == 'OK') {
                vnode.isShow = false;
                this.$Message.success(this.$t('message.deletesuccess'));
                this.$emit('reload');
              } else {
                this.$Message.error(res.Message);
              }
            });
          } else {
            this.$api.codehub.merge.deleteCommentById(param).then((res) => {
              if (res && res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                vnode.isShow = false;
                this.$emit('reload');
              } else {
                this.$Message.error(res.Message);
              }
            });           
          }
        }
      });
    },
    submitReply(item) {
      if (item.filePath) {
        //如果是行评论的会有路径
        let param = {
          mrId: item.mrId,
          leftCommitId: item.leftCommitId,
          rightCommitId: item.rightCommitId,
          line: item.line,
          filePath: item.filePath,
          lineType: item.lineType,
          comment: this.commitText,
          parentId: item.id
        };
        this.replying = true;
        this.$api.codehub.merge.saveCommentByLine(param).then((res) => {
          this.replying = false;
          if (res.Status == 'OK') {
            this.showReply = false;
            this.commitText = '';
            this.$emit('reload');
          }
        }).catch((e) => {
          this.replying = false;
        });
      } else {
        let param = {
          mrId: item.mrId,
          parentId: item.id,
          comment: this.commitText
        };
        this.replying = true;
        this.$api.codehub.merge.saveComment(param).then((res) => {
          if (res.Status == 'OK') {
            this.showReply = false;
            this.commitText = '';
            this.$emit('reload');
          }
        }).finally(() => {
          this.replying = false;
        });
      }
    },
    resetReply() {
      this.showReply = false;
      this.commitText = '';
    },
    gotoFile(li) {
      this.$emit('selectFile', li.filePath);
    }
  },
  computed: {},
  watch: {}
};

</script>
<style lang='less' scoped>
.text-tip{
  min-height:20px;
}
.comment-text{
  position: relative;
  .block-reply{
    position: absolute;
    right: 127px;
    top: -28px;
    opacity: 0;
    .action-group{
      .action-item{
        padding-left: 6px;
        padding-right: 6px;
        &:before{
          padding-right: 0;
        }
      }
    }
  }
}
</style>
