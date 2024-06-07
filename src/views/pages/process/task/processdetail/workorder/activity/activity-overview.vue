<template>
  <div class="activity-box">
    <div v-if="activeData && activeData.length > 0" class="activity-show-box bg-block">
      <Timeline>
        <TimelineItem v-for="item of activeData" :key="item.id">
          <template slot="dot">
            <template v-if="item.userVo.uuid == 'system' && item.action != 'restfulaction'">
              <span v-if="item.stepStatus && item.stepStatus == 'succeed'" class="tsfont-check-s text-success text-icon-font-size"></span>
              <span
                v-else-if="item.stepStatus && item.stepStatus == 'failed'"
                class="tsfont-info-s text-error text-icon-font-size"
              ></span>
              <span v-else class="tsfont-layer text-primary text-icon-font-size"></span>
            </template>
            <span v-else-if="item.action == 'restfulaction'" class="tsfont-action text-primary text-icon-font-size"></span>
            <UserCard
              v-else
              :uuid="item.userVo.uuid"
              :initType="item.userVo.initType"
              :iconSize="24"
              hideName
            ></UserCard>
          </template>
          <div class="content-box dividing-color ml-xs">
            <div class="title parent mb-md">
              <UserCard
                v-if="item.userVo && item.action != 'restfulaction' && item.userVo.uuid != 'system'"
                class="user-name"
                v-bind="item.userVo"
                :hideAvatar="true"
                style="display: inline-block;"
              ></UserCard>
              <span v-if="item.originalUserVo">
                <span style="vertical-align: bottom;">（{{ $t('term.process.act') }}</span>
                <UserCard v-bind="item.originalUserVo" hideAvatar style="vertical-align: middle;"></UserCard>
                <span style="vertical-align: bottom;">）</span>
              </span>
              <span class="pl-sm pr-sm text-success" v-html="item.description"></span>
              <span v-show="item.sourceName" class="text-grey">{{ $t('page.from') }}{{ item.sourceName }}</span>
            </div>
            <div class="title child-time">·{{ item.actionTime | formatDate }}</div>
            <div v-if="item.auditDetailList && item.auditDetailList.length > 0" class="content-list">
              <template v-for="(jitem, jindex) in item.auditDetailList">
                <component
                  :is="handlerType(jitem.type)"
                  :key="jindex"
                  :config="jitem"
                  :formSceneUuid="item.formSceneUuid"
                  :formConfig="$utils.deepClone(formConfig)"
                  :processTaskStepId="item.processTaskStepId"
                  class="mb-sm"
                ></component>
              </template>
            </div>
          </div>
        </TimelineItem>
      </Timeline>
    </div>
    <div v-else class="order-content bg-block text-grey">{{ $t('page.notarget',{target:$t('page.activitylist')}) }}</div>
  </div>

</template>
<script>
import Item from './item';
import imgViewer from '@/resources/directives/img-viewer.js';
export default {
  name: 'ActivityOverview',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    ...Item
  },
  directives: {imgViewer},
  props: {
    defaultActiveData: {
      type: Array,
      default: () => []
    },
    formConfig: Object
  },
  data() {
    return {
      activeData: []
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
  methods: {},
  filter: {},
  computed: {
    handlerType() {
      return function(handler) {
        let type = handler + 'Handler';
        if (!Item[type]) {
          type = 'defaultHandler';
        }
        return type;
      };
    }
  },
  watch: {
    defaultActiveData: {
      handler(val) {
        if (val && val.length > 0) {
          this.activeData = val;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.activity-show-box {
  margin-left: 145px;
  /deep/ .image > img {
    max-width: 100%;
  }
}
.parent{
  position: relative;
}
.child-time{
  position: absolute;
  top: 2px;
  left: -149px;
}
.text-icon-font-size {
  display: inline-block;
  margin-left: -6px;
  font-size: 22px;
}
.activity-box {
  /deep/ .left-label-text {
    display: inline-block;
    width: 72px;
    margin-right: 15px;
    text-align: right;
  }
  /deep/ .ivu-timeline-item-tail {
    left: 3px; // 解决时间线不对齐问题
  }
}
</style>
