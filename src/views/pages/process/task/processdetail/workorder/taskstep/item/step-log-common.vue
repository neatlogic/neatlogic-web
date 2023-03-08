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
        start: '开始',
        accept: '',
        update: '修改',
        abortprocessTask: '取消',
        recoverprocessTask: '恢复',
        complete: '完成',
        retreat: '撤回',
        save: '暂存',
        transfer: '转交',
        comment: '回复',
        createsubtask: '创建子任务',
        back: this.$t('term.process.fallback'),
        pocesstaskview: '查看',
        urge: '催办',
        pause: '暂停',
        recover: '恢复工单步骤',
        tranferreport: '转报',
        copyprocesstask: '复制上报',
        redo: '评分之前回退',
        markrepeat: '标记重复事件',
        reapproval: '重审',
        createtask: '创建任务（新的子任务）',
        retreatcurrentstep: '撤回',
        startprocess: '上报'
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
