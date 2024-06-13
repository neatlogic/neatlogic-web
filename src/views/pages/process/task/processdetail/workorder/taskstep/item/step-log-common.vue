<template>
  <div v-if="item" class="step-log-common-box">
    <div v-if="item.commentList && item.commentList.length > 0" class="content-box" :class="isShowBorder ? 'padding radius-lg' : '' ">
      <Timeline>
        <TimelineItem v-for="(stepItem, stepIndex) in item.commentList" :key="stepIndex">
          <div class="pb-nm comment-list-box">
            <div class="pb-xs avatar-date-box">
              <div class="ml-sm pr-nm">
                <UserCard
                  v-bind="stepItem.fcuVo"
                  class="parent"
                  :iconSize="24"
                  :hideAvatar="true"
                  :hideStatusIcon="true"
                  nameLength
                ></UserCard>
                <span v-if="stepItem.operatorRole">({{ stepItem.operatorRole }})</span>
                <span class="pl-md pr-md">{{ getActionText(item.customButtonList , stepItem.type) }}</span>
                <span class="text-grey date-text fz10">{{ stepItem.fcd | formatDate }}</span>
                <span v-show="stepItem.sourceName" class="text-grey pl-nm">{{ $t('page.from') }}{{ stepItem.sourceName }}</span>
              </div>
              <UserCard
                class="avatar child-avatar"
                v-bind="stepItem.fcuVo"
                :iconSize="24"
                :hideName="true"
              ></UserCard>
            </div>

            <div class="bottom-content-box">
              <div class="content-box">
                <div v-if="stepItem.content" class="text-grey mr-md ml-xs title">{{ $t('page.replycontent') }}</div>
                <div>
                  <div 
                    v-imgViewer
                    v-dompurify-html="stepItem.content"
                    class="content-text-padding overflow-y ml-xs"
                    :class="stepItem.fileList && stepItem.fileList.length > 0 ? 'pb-xs' : ''" 
                    :style="{'height':stepItem.showViewMore?stepItem.maxheight:'auto'}"
                  >
                  </div>
                  <div
                    v-if="stepItem.showViewMore"
                    class="content-text-padding text-href pt-xs ml-xs pr-md"
                    :class="stepItem.fileList && stepItem.fileList.length > 0 ? 'pb-xs' : ''"
                  >
                    <span style="cursor: pointer;" @click="viewMore(stepItem, stepIndex)">{{ stepItem.maxheight=='200px'?$t('page.viewmore'):$t('page.clickandputaway') }}</span>
                  </div>
                </div>
              </div>
              <div v-if="stepItem.fileList && stepItem.fileList.length > 0">
                <div class="content-box">
                  <div class="text-grey mr-md xl-xs title">{{ $t('page.accessory') }}</div>
                  <div v-for="(file, flindex) in stepItem.fileList" :key="flindex" class="pb-xs filelist-box">
                    <div v-download="downurl('/api/binary/file/download',file.id)" class="text-action">
                      <span class="tsfont-attachment">{{ file.name }}</span>
                      <i class="tsfont-download text-padding"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TimelineItem>
      </Timeline>
    </div>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
import download from '@/resources/directives/download.js';
import UserCard from '@/resources/components/UserCard/UserCard.vue';
export default {
  name: '',
  components: {
    UserCard
  },
  directives: { download, imgViewer },
  props: {
    item: Object,
    isShowBorder: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      maxheight: '200px',
      isShowPoptip: false,
      actionText: {
        // 动作文案
        start: this.$t('page.begin'),
        accept: '',
        update: this.$t('page.revise'),
        abortprocessTask: this.$t('page.cancel'),
        recoverprocessTask: this.$t('page.recover'),
        complete: this.$t('page.complete'),
        retreat: this.$t('page.retreat'),
        save: this.$t('page.staging'),
        transfer: this.$t('page.transfer'),
        comment: this.$t('page.reply'),
        createsubtask: this.$t('term.process.createsubtask'),
        back: this.$t('page.rollback'),
        pocesstaskview: this.$t('page.view'),
        urge: this.$t('page.urge'),
        pause: this.$t('page.pause'),
        recover: this.$t('term.process.recoverstep'),
        tranferreport: this.$t('page.tranferreport'),
        copyprocesstask: this.$t('term.process.copyreport'),
        redo: this.$t('term.process.redo'),
        markrepeat: this.$t('term.process.markrepeat'),
        reapproval: this.$t('page.reapproval'),
        createtask: this.$t('term.process.createtask'),
        retreatcurrentstep: this.$t('page.retreat'),
        startprocess: this.$t('term.process.report')
      }
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
    });
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
    viewMore(stepItem, stepIndex) {
      if (stepItem.maxheight == '200px') {
        this.$set(stepItem, 'maxheight', 'auto');
        this.$set(this.item.commentList, stepIndex, stepItem);
      } else {
        this.$set(stepItem, 'maxheight', '200px');
        this.$set(this.item.commentList, stepIndex, stepItem);
      }
    },
    getActionText(customButtonTextList, type) {
      let actionText = '';
      if (!this.$utils.isEmpty(customButtonTextList)) {
        let item = customButtonTextList.find(item => item.name == type);
        if (!this.$utils.isEmpty(item)) {
          actionText = item.value || item.text;
        }
      }
      return actionText || this.actionText[type];
    },
    openPoptip() {
      this.isShowPoptip = !this.isShowPoptip;
    }
  },
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
.content-box{
  display: flex;
  justify-content: flex-start;
  align-self: flex-start;
  .title{
    width:60px;
    text-align: right;
  }
}
.parent{
  position: relative;
  display: inline-block;
}
.child-avatar{
  position: absolute;
  top: -2px;
  left: -5px;
}
.step-log-common-box {
  position: relative;
  .avatar-date-box {
    display: flex;
    &:last-child {
      padding-bottom: 0;
    }
  }
  .avatar-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    .avatar {
      display: inline-block;
      margin-bottom: 4px;
      margin-right: 0px;
    }
  }
  .content-box {
    .content-text-padding {
      word-break: break-word;
    }
  }
  .filelist-box {
    &:last-of-type {
      padding-bottom: 0;
    }
  }
  .header-box {
    display: flex;
  }
  .date-text {
    height: 15px;
  }
  .bottom-content-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    // padding-left: 70px;
  }
  .comment-list-box {
    &:last-child {
      padding-bottom: 0;
    }
  }
  .action-text {
    display: inline-block;
    width: 100%;
    height: 26px;
    line-height: 26px;
  }
}
.overflow-y{
  overflow-y: hidden;
}
</style>
