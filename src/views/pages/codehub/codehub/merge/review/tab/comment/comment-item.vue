<template>
  <div class="comment-text">
    <div>
      <div v-if="li.filePath && tab !='diff' &&!isChildren" class="text-tip">
        <span>对文件{{ li.filePath }}的变更</span>
        <span class="text-href" @click="gotoFile(li)">
          <span>{{ li.leftCommitId |commitId }}</span>
          <span v-if="li.lineType=='left'">({{ li.line }})</span>
          <span>...</span>
          <span>{{ li.rightCommitId |commitId }}</span>
          <span v-if="li.lineType=='right'">({{ li.line }})</span>
        </span>
        <span>发表了行评论</span>
      </div>
      <div v-if="li.filePath && tab !='diff'" class="text-tip ml-20" v-html="li.comment"></div>
      <div v-else class="text-tip ml-20" v-html="li.comment"></div>
    </div>
    <div style="showReply?'margin-top: 10px;':''">
      <div v-if="!showReply" class="block-reply">
        <div class="action-group">
          <div
            v-if="li.canEdit"
            class="action-item ts-trash"
            title="删除"
            @click="deleteLi(li)"
          ></div>
          <div class="action-item ts-chat-fill" title="回复" @click="replyLi"></div>
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
            class="mr-10"
            @click="submitReply(li)"
          >回复</Button>
          <Button size="small" @click="resetReply">取消</Button>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
export default {
  name: '',
  components: {
    TsCkeditor
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
    deleteLi(item) {
      let _this = this;
      
      let param = {
        uuid: item.uuid
      };
      _this.$createDialog({
        title: '删除确认',
        content: '是否确认删除该评论',
        btnType: 'error',
        'on-ok': function(vnode) {
          if (item.filePath) {
            _this.$api.codehub.merge.deleteCommentByLine(param).then((res) => {
              if (res && res.Status == 'OK') {
                _this.$Message.success('删除成功');
                vnode.isShow = false;
                _this.$emit('reload');
              } else {
                _this.$Message.error(res.Message);
              }
            });
          } else {
            _this.$api.codehub.merge.deleteCommentById(param).then((res) => {
              if (res && res.Status == 'OK') {
                _this.$Message.success('删除成功');
                vnode.isShow = false;
                _this.$emit('reload');
              } else {
                _this.$Message.error(res.Message);
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
          mrUuid: item.mrUuid,
          leftCommitId: item.leftCommitId,
          rightCommitId: item.rightCommitId,
          line: item.line,
          filePath: item.filePath,
          lineType: item.lineType,
          comment: this.commitText,
          parentUuid: item.uuid
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
          mrUuid: item.mrUuid,
          parentUuid: item.uuid,
          comment: this.commitText
        };
        this.replying = true;
        this.$api.codehub.merge.saveComment(param).then((res) => {
          this.replying = false;
          if (res.Status == 'OK') {
            this.showReply = false;
            this.commitText = '';
            this.$emit('reload');
          }
        }).catch((e) => {
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
    right: 0;
    top: 0;
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
