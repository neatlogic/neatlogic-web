<template>
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
        <span class="pl-md pr-md">{{ getActionText(stepItem.type) }}</span>
        <span v-if="stepItem.targetList && stepItem.targetList.length > 0" class="pr-md">
          <UserCard
            v-for="(target, uindex) in stepItem.targetList"
            :key="uindex"
            v-bind="target"
            :iconSize="24"
            class="parent"
          ></UserCard>
        </span>
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
          <ImagePreview :fileList="stepItem.fileList"></ImagePreview>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import UserCard from '@/resources/components/UserCard/UserCard.vue';
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: '',
  components: {
    UserCard,
    ImagePreview: () => import('@/resources/components/image-preview/index.vue')
  },
  directives: { imgViewer },
  props: {
    stepItem: Object,
    customButtonTextList: Array
  },
  data() {
    return {
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
        transfercurrentstep: this.$t('page.transfer'),
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
    getActionText(type) {
      let actionText = '';
      if (!this.$utils.isEmpty(this.customButtonTextList)) {
        let item = this.customButtonTextList.find(item => item.name == type);
        if (!this.$utils.isEmpty(item)) {
          actionText = item.value || item.text;
        }
      }
      return actionText || this.actionText[type];
    }
  },
  filter: {

  },
  computed: {

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
