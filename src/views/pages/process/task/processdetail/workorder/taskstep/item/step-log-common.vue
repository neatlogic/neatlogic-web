<template>
  <div v-if="item" class="step-log-common-box">
    <div v-if="commentAndActionList && commentAndActionList.length > 0" class="content-box" :class="isShowBorder ? 'padding radius-lg' : '' ">
      <Timeline>
        <TimelineItem v-for="(stepItem, stepIndex) in commentAndActionList" :key="stepIndex">
          <StepComment v-if="stepItem.commentAndActionType == 'comment'" :stepItem="stepItem" :customButtonTextList="item.customButtonTextList"></StepComment>
          <span v-if="stepItem.commentAndActionType == 'action'" slot="dot" class="tsfont-action text-primary text-icon-font-size"></span>
          <RestfulActionHandler v-if="stepItem.commentAndActionType == 'action'" :newContent="stepItem"></RestfulActionHandler>
        </TimelineItem>
      </Timeline>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    StepComment: () => import('@/views/pages/process/task/processdetail/workorder/taskstep/step-comment.vue'),
    RestfulActionHandler: () => import('@/views/pages/process/task/processdetail/workorder/activity/item/restfulaction-handler.vue')
  },
  props: {
    item: Object,
    isShowBorder: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      commentAndActionList: []
    };
  },
  beforeCreate() {},
  created() {
    this.item.commentList.forEach((comment) => {
      // console.log(comment);
      if (comment.content && comment.content.includes('<img')) {
        Object.assign(comment, {
          maxheight: '200px',
          showViewMore: true
        });
      } else {
        Object.assign(comment, {
          showViewMore: false
        });
      }
      let commentAndAction = Object.assign(comment, {commentAndActionType: 'comment', sortTime: comment.fcd});
      this.commentAndActionList.push(commentAndAction);
    });
    this.item.actionList.forEach((action) => {
      let commentAndAction = Object.assign(action, {commentAndActionType: 'action', sortTime: action.triggerTime});
      this.commentAndActionList.push(commentAndAction);
    });
    this.commentAndActionList.sort((e1, e2) => e2.sortTime - e1.sortTime);
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.step-log-common-box {
  position: relative;
  .content-box {
    .content-text-padding {
      word-break: break-word;
    }
  }
}
.overflow-y{
  overflow-y: hidden;
}
.text-icon-font-size {
  display: inline-block;
  margin-left: -6px;
  font-size: 22px;
}
</style>
