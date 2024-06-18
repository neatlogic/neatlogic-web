
<template>
  <div v-if="list.length > 0 || processTaskVo" class="task-alert bg-info-grey radius-sm" :class="(list && list.length > 1) || (list && list.length > 0 && processTaskVo)?'align-start':'align-center'">
    <div class="tsfont-danger-o icon-tip text-primary"></div>
    <div class="alert-main">
      <template v-if="list && list.length > 0">
        <ul v-for="(item, index) in list" :key="index">
          <li class="border-color">
            <div class="li-item overflow">
              <span>{{ item.actionName }}：</span>
              <UserCard
                v-if="item.fcu != 'system'"
                class="user-name"
                v-bind="item.fcuVo"
                hideAvatar
              ></UserCard>
              <span v-if="item.title && item.title.length > 0">{{ item.title }}：</span>
              <span class="pl-md pr-md">
                <Tooltip
                  max-width="600"
                  transfer
                  theme="light"
                  placement="bottom-start"
                >
                  <span v-html="item.content"></span>
                  <span slot="content">
                    <span v-html="item.content"></span>
                  </span>
                </Tooltip>
              </span>
              <span v-if="item.detail" class="text-href detail-btn" @click="lookDetail(item)">{{ $t('page.viewdetails') }}</span>
            </div>
          </li>
        </ul>
      </template>
      <!-- 转报 -->
      <div v-if="processTaskVo" class="forwarding-detail" :class="list.length > 0?'forwarding-border border-color':''">
        <div class="tip-text bg-grey-select">{{ $t('term.process.originaltask') }}</div>
        <div class="default-detail">
          <div class="tranferReport-list">
            <div class="item-box">
              <div class="text-grey fz10">{{ $t('page.title') }}</div>
              <div class="overflow text-href" :title="processTaskVo.title" @click="toTaskdetail(processTaskVo.id)">
                {{ processTaskVo.title }}
              </div>
            </div>
            <div class="item-box">
              <div class="text-grey fz10">
                {{ $t('page.workordernumber') }}
              </div>
              <div class="overflow item-content">
                <div class="overflow text-href item-serialNumber" @click="toTaskdetail(processTaskVo.id)">
                  <span>{{ processTaskVo.serialNumber }}</span>
                  <i
                    v-clipboard="processTaskVo.serialNumber"
                    v-clipboard:success="clipboardSuc"
                    class="tsfont-copy text-action"
                    @click.stop
                  ></i>
                </div>
              </div>
            </div>
            <div class="item-box">
              <div class="text-grey fz10">
                {{ $t('page.relationtype') }}
              </div>
              <div class="overflow" :title="processTaskVo.channelTypeRelationName">{{ processTaskVo.channelTypeRelationName || '-' }}</div>
            </div>
            <div class="item-box">
              <div class="text-grey fz10">
                {{ $t('page.status') }}
              </div>
              <div v-if="processTaskVo.statusVo">{{ processTaskVo.statusVo.text }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TsDialog
      type="modal"
      :title="title"
      :isShow.sync="lookModel"
      :hasFooter="false"
      :bgOp="true"
      :maskClose="true"
    >
      <template>
        <div v-imgViewer class="detail-main">
          <div v-html="detailContent"></div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
import clipboard from '@/resources/directives/clipboard.js';
export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  directives: {imgViewer, clipboard},
  filters: {
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    tranferReportProcessTaskList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      title: this.$t('page.detail'),
      lookModel: false,
      detailContent: null,
      processTaskList: [],
      processTaskVo: null //当前转报展示工单（原工单/目标工单）
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      //使用nextTick为了保证dom元素都已经渲染完毕，确保父组件可以拿到子组件渲染后的高度
      // 工单中心有 【回退，转交，转报等】 时，需要减去提示的高度，确保剩余的内容可以正常显示
      this.$emit('getTaskAlertHeight', this.$el.offsetHeight + 16); // 16 margin-bottom 的高度
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    lookDetail(obj) {
      this.detailContent = obj.detail;
      this.lookModel = true;
    },
    getProcessTaskVo(val) {
      this.processTaskList = this.$utils.deepClone(val);
      this.processTaskVo = this.processTaskList.find(i => i.tranferReportDirection == 'from');
    },
    toTaskdetail(id) {
      window.open(HOME + '/process.html#/task-detail?processTaskId=' + id, '_blank');
    },
    clipboardSuc: function() {
      this.$Message.success(this.$t('message.executesuccess'));
    }
  },
  computed: {},
  watch: {
    tranferReportProcessTaskList: {
      handler(val) {
        if (val && val.length > 0) {
          this.getProcessTaskVo(val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.task-alert{
  display: flex;
  margin-bottom: 16px;
  max-height: 134px;
  overflow-y: auto;
  padding: 12px 16px;
  .icon-tip{
    padding-left: 10px;
    width: 64px;
    font-size: 27px;
    flex-shrink: 0;
    line-height: 1;
  }
  .alert-main{
    flex: 1;
    li {
      &:not(:last-of-type){
        padding-bottom: 10px;
        border-bottom: 1px solid;
        margin-bottom: 10px;
      }
    }
  }
}
.li-item {
  position: relative;
  display: inline-block;
  max-width: 100%;
  .detail-btn {
    position: absolute;
    right: 0;
    bottom: 0;
  }
  .user-style{
    display: inline-block;
    vertical-align: bottom;
  }
  /deep/ .usercard-container{
    .noCursor {
      line-height: initial;
    }
  }
}
.detail-main{
  /deep/ .image > img {
    max-width: 100%;
  }
}
.forwarding-detail {
  position: relative;
  padding-left: 64px;
  &.forwarding-border{
    padding-top: 10px;
    margin-top: 10px;
    border-top: 1px solid;
  }
  .tip-text{
    font-size: 12px;
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 1px 10px;
    border-radius: 2px;
  }
  .top-title {
    position: relative;
    padding-bottom: 16px;
  }
  .default-detail {
    position: relative;
  }
  .tranferReport-list{
    display: flex;
    align-items: center;
    .item-box{
      width: 33.33%;
      display: flex;
      align-items: center;
      padding-right: 10px;
      >.text-grey{
        padding-right: 10px;
        flex-shrink: 0;
      }
      .item-content{
        position: relative;
      }
      .item-serialNumber{
        position: relative;
        padding-right: 20px;
        i {
          position: absolute;
          right: -2px;
          top: 0;
        }
      }
    }
  }
}
</style>
