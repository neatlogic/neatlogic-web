<template>
  <div v-if="item" class="step-log-common-box">
    <div v-if="item.commentList && item.commentList.length > 0" class="content-box" :class="isShowBorder ? 'padding block-border radius-lg' : '' ">
      <div v-for="(stepItem, stepIndex) in item.commentList" :key="stepIndex" class="pb-nm comment-list-box">
        <div class="pb-xs avatar-date-box">
          <div class="avatar-box pr-nm">
            <UserCard
              class="avatar"
              v-bind="stepItem.fcuVo"
              :iconSize="24"
              :hideName="true"
            ></UserCard>
            <UserCard
              v-bind="stepItem.fcuVo"
              class="text-tip"
              :iconSize="24"
              :hideAvatar="true"
              nameLength
            ></UserCard>
          </div>
          <div class="date-text-box">
            <span class="text-href action-text">{{ getActionText(item.customButtonList , stepItem.type) }}</span>
            <div>
              <span class="text-grey date-text">{{ stepItem.fcd | formatDate }}</span>
              <span v-show="stepItem.sourceName" class="text-grey pl-nm">来自{{ stepItem.sourceName }}</span>
            </div>
          </div>
        </div>
        <div class="bottom-content-box">
          <div class="content-text-padding" :class="stepItem.fileList && stepItem.fileList.length > 0 ? 'pb-xs' : ''" v-html="stepItem.content"></div>
          <div v-if="stepItem.fileList && stepItem.fileList.length > 0">
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
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
import UserCard from '@/resources/components/UserCard/UserCard.vue';
export default {
  name: '',
  components: {
    UserCard
  },
  directives: { download },
  props: {
    item: Object,
    isShowBorder: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
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
        back: this.$t('term.process.fallback'),
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
    width: 70px;
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
  .date-text-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 44px;
    overflow: hidden;
  }
  .date-text {
    height: 15px;
  }
  .bottom-content-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-left: 70px;
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
</style>
