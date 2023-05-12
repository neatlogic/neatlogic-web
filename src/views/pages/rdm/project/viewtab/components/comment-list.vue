<template>
  <div>
    <Loading
      :loadingShow="isLoading"
    ></Loading>
    <TsCard
      v-if="!isLoading"
      v-bind="commentData"
      :sm="24"
      :lg="24"
      :xl="24"
      :xxl="24"
      :gutter="0"
      :boxShadow="false"
      :padding="false"
      @updatePage="searchComment"
    >
      <template slot-scope="{ row }">
        <div :class="parentId ? 'bg-grey radius-md padding' : ''">
          <div class="comment-grid">
            <div>
              <UserCard alignMode="vertical" :iconSize="32" :uuid="row.fcu"></UserCard>
            </div>
            <div>
              <div class="comment-content" v-html="row.content"></div>
              <div v-if="commentReady['c_' + row.id] && row.childCount > 0" class="mt-md">
                <CommentList
                  :issueData="issueData"
                  :issueId="issueId"
                  :parentId="row.id"
                  @reload="reloadComment"
                ></CommentList>
              </div>
              <div class="text-grey mt-md fz10">
                <div style="float:left">{{ (row.lcd || row.fcd) | formatDate }}</div>
                <div class="action-group" style="text-align:right" :style="!parentId ? 'margin-right:22px' : ''">
                  <div class="action-item text-grey tsfont-message-o" @click="replayComment(row)">{{ $t('page.reply') }}</div>
                  <div class="action-item text-grey tsfont-edit" @click="editComment(row)">{{ $t('page.edit') }}</div>
                  <div class="action-item text-grey tsfont-trash-o" @click="deleteComment(row)">{{ $t('page.delete') }}</div>
                </div>
              </div>
              <div v-if="replayTo['c_' + row.id]" class="mt-md">
                <TsCkeditor v-model="replayTo['c_' + row.id].content" :width="'99%'"></TsCkeditor>
                <div class="mt-sm">
                  <Button
                    size="small"
                    class="mr-sm"
                    type="info"
                    @click="saveComment(row)"
                  >{{ $t('page.save') }}</Button>
                  <Button size="small" type="default" @click="cancelComment(row.id)">{{ $t('page.cancel') }}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </TsCard>
    <EditCommentDialog v-if="isEditCommentShow" :comment="currentComment" @close="closeEditComment"></EditCommentDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    TsCkeditor: resolve => require(['@/resources/plugins/TsCkeditor/TsCkeditor.vue'], resolve),
    CommentList: resolve => require(['./comment-list.vue'], resolve),
    EditCommentDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-comment-dialog.vue'], resolve)
  },
  props: {
    issueData: {type: Object},
    issueId: { type: Number },
    parentId: { type: Number }
  },
  data() {
    return {
      isEditCommentShow: false,
      isLoading: true,
      commentData: {},
      replayTo: {},
      commentReady: {},
      currentComment: null
    };
  },
  beforeCreate() {},
  created() {
    this.searchComment();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    replayComment(comment) {
      this.$set(this.replayTo, 'c_' + comment.id, {
        parentId: comment.id,
        issueId: this.issueId
      });
    },
    editComment(comment) {
      this.currentComment = comment;
      this.isEditCommentShow = true;
    },
    deleteComment(comment) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('term.rdm.comment')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.rdm.issue.deleteComment(comment.id).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              if (comment.parentId) {
                this.$emit('reload', comment.parentId);
              } else {
                const index = this.commentData.tbodyList.findIndex(d => d.id === comment.id);
                if (index > -1) {
                  this.commentData.tbodyList.splice(index, 1);
                  if (this.commentData.tbodyList.length == 0) {
                    this.$set(this.issueData, 'commentCount', 0);
                  }
                }
              }
            }
          });
        }
      });
    },
    saveComment(comment) {
      this.$api.rdm.issue.saveComment(this.replayTo['c_' + comment.id]).then(res => {
        const pid = res.Return;
        this.$Message.success(this.$t('message.commentsucces'));
        this.$set(this.replayTo, 'c_' + comment.id, null);
        if (comment.parentId) {
          this.$emit('reload', comment.parentId);
        } else {
          this.reloadComment(comment.id);
        }
      });
    },
    reloadComment(commentId) {
      //childCount只会=1或0，防止数据一样不刷新，需要重置一下commentReady
      this.$set(this.commentReady, 'c_' + commentId, false);
      const index = this.commentData.tbodyList.findIndex(d => d.id === commentId);
      this.$api.rdm.issue.getCommentById(commentId).then(res => {
        this.$set(this.commentReady, 'c_' + commentId, true);
        this.$set(this.commentData.tbodyList, index, res.Return);
      });
    },
    cancelComment(commentId) {
      this.$set(this.replayTo, 'c_' + commentId, null);
    },
    searchComment(currentPage) {
      const param = { issueId: this.issueId, parentId: this.parentId};
      if (currentPage) {
        param.currentPage = currentPage;
      } else {
        param.currentPage = 1;
      }
      this.$api.rdm.issue.searchComment(param).then(res => {
        this.isLoading = false;
        this.commentData = res.Return;
        this.commentData.tbodyList.forEach(comment => {
          this.$set(this.commentReady, 'c_' + comment.id, true);
        });
      });
    },
    closeEditComment(needRefresh) {
      if (needRefresh) {
        this.reloadComment(this.currentComment.id);
      }
      this.currentComment = null;
      this.isEditCommentShow = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.comment-grid {
  display: grid;
  grid-template-columns: 50px auto;
  grid-gap: 20px;
}
.comment-content {
  min-height: 25px;
}
</style>
