<template>
  <div class="document-detail" style="width:100%">
    <!-- <loading :loadingShow="isLoadingShow" type="fix"></loading> -->
    <Alert v-if="newDataConfig" :type="!newDataConfig.rejectReason?'warning':'error'">
      <div class="alert-box">
        <span v-if="!newDataConfig.rejectReason">
          <span style="display: inline-block;">
            <UserCard v-bind="newDataConfig.lcuVo"></UserCard>
          </span>
          <span>{{ $t('term.knowledge.tooltip.editdocumentapprove',{target:newDataConfig.title}) }}</span>
          <span v-if="newDataConfig.reviewerVoList" class="user-group">
            <span v-for="(user, index) in newDataConfig.reviewerVoList.slice(0, 2)" :key="index" class="user-list">
              <UserCard v-bind="user"></UserCard>
            </span>
          </span>
          <span v-if="newDataConfig.reviewerVoList && newDataConfig.reviewerVoList.length > 2">
            <Poptip transfer placement="bottom-start">
              <span class="tsfont-option-horizontal text-tip-active" style="padding: 0 8px;"></span>
              <div slot="content">
                <ul>
                  <li
                    v-for="(muser, mindex) in newDataConfig.reviewerVoList.slice(2, newDataConfig.reviewerVoList.length)"
                    :key="mindex"
                    class="text-action"
                    style="padding-bottom: 8px"
                  >
                    <UserCard v-bind="muser"></UserCard>
                  </li>
                </ul>
              </div>
            </Poptip>
          </span>
          <span>{{ $t('term.knowledge.approve') }}</span>
        </span>
        <span v-else>
          <span style="display: inline-block;">
            <UserCard v-bind="newDataConfig.reviewerVo"></UserCard>
          </span>
          <span>{{ $t('term.knowledge.rejected') }}：</span>
          <span class="rejectReason overflow" :title="newDataConfig.rejectReason">{{ newDataConfig.rejectReason }}</span>
        </span>
        <div>
          <span v-for="(s, sindex) in statusList" :key="sindex" class="text-tip fz10 status-list">
            <span class="color-tip" :class="s.colorClass"></span>{{ s.text }}
          </span>
        </div>
      </div>
    </Alert>
    <TsRow>
      <Col span="12">
        <div v-if="oldDataConfig" class="comparison-box bg-op">
          <ComparisonDetail
            ref="oldData"
            :navWidth="navWidth"
            :config="oldDataConfig"
            @updateMouseover="oldMouseover"
            @updateScrollTop="oldScroll"
          >
            <template v-slot:top>
              <div class="top-content">{{ $t('page.beforeedit') }}</div>
            </template>
          </ComparisonDetail>
        </div>
      </Col>
      <Col span="12">
        <div v-if="newDataConfig" class="comparison-box bg-op">
          <ComparisonDetail
            ref="newData"
            :navWidth="navWidth"
            :config="newDataConfig"
            @updateMouseover="newMouseover"
            @updateScrollTop="newScroll"
          >
            <template v-slot:top>
              <div class="top-content">{{ $t('page.afteredit') }}</div>
            </template>
          </ComparisonDetail>
        </div>
      </Col>
    </TsRow>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ComparisonDetail: resolve => require(['@/views/pages/knowledge/detail/comparison/comparison-detail.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  filters: {},
  props: {
    config: Object
  },
  data() {
    return {
      oldDataConfig: null,
      newDataConfig: null,
      statusList: [
        {
          text: this.$t('page.update'),
          colorClass: 'bg-warning'
        },
        {
          text: this.$t('page.delete'),
          colorClass: 'bg-error'
        },
        {
          text: this.$t('page.build'),
          colorClass: 'bg-success'
        }
      ],
      flagscroll: 1 //判断滚动条的位置
      // isLoadingShow: true
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
    getVersionDocument() {
      if (this.config) {
        this.newDataConfig = this.config.newDocumentVo;
        this.oldDataConfig = this.config.oldDocumentVo;
      }
    },
    oldMouseover() {
      this.flagscroll = 1;
    },
    newMouseover() {
      this.flagscroll = 0;
    },
    oldScroll(scrollTop) {
      if (this.flagscroll == 1) {
        this.$refs.newData.setScroll(scrollTop);
      }
    },
    newScroll(scrollTop) {
      if (this.flagscroll == 0) {
        this.$refs.oldData.setScroll(scrollTop);
      }
    }
  },
  computed: {
    navWidth() {
      let width = '200px';
      let isNewNav = false;
      let isOldNav = false;
      if (this.newDataConfig.lineList && this.newDataConfig.lineList.length > 0) {
        let typeArr = ['h1', 'h2'];
        for (let i = 0; i < this.newDataConfig.lineList.length; i++) {
          if (typeArr.indexOf(this.newDataConfig.lineList[i].handler) > -1) {
            isNewNav = true;
            return;
          }
        }
      }
      if (this.newDataConfig.fileList && this.newDataConfig.fileList.length > 0) {
        isNewNav = true;
      }
      if (this.oldDataConfig.lineList && this.oldDataConfig.lineList.length > 0) {
        let typeArr = ['h1', 'h2'];
        for (let i = 0; i < this.oldDataConfig.lineList.length; i++) {
          if (typeArr.indexOf(this.oldDataConfig.lineList[i].handler) > -1) {
            isOldNav = true;
            return;
          }
        }
      }
      if (this.newDataConfig.fileList && this.newDataConfig.fileList.length > 0) {
        isNewNav = true;
      }
      if (isNewNav || isOldNav) {
        width = '200px';
      } else {
        width = '0px';
      }
      return width;
    }
  },
  watch: {
    config: {
      handler(val) {
        if (val) {
          this.getVersionDocument();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/theme.less';
.document-detail {
  width: 100%;
  overflow: hidden;
  .title {
    display: inline-block;
    max-width: 300px;
  }
  .rejectReason{
    display: inline-block;
    max-width: 600px;
  }
  .color-tip {
    width: 12px;
    height: 12px;
    display: inline-block;
    vertical-align: top;
    margin-left: 8px;
    margin-right: 4px;
  }
  .text-vertical {
    vertical-align: bottom;
  }

  .comparison-box {
    width: 100%;
    height: calc(100vh - 120px - 50px);
    border-radius: 10px;
    .top-content {
      width: 100%;
      height: 40px;
      line-height: 40px;
      text-align: center;
    }
    .badge {
      width: 26px;
      vertical-align: middle;
    }
  }
  .user-group{
    display: inline-block;
    .user-list {
      display: inline-block;
      &:not(:last-child) {
        &:after {
          content:'、'
        } 
      }
    }
  }
}
.alert-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .status-list {
    display: inline-flex;
    align-items: center;
  }
}

</style>
