<template>
  <div class="activity-box">
    <div v-if="activeData && activeData.length > 0" class="activity-show-box bg-block">
      <div v-for="item of activeData" :key="item.id" class="activity-show-list">
        <div class="user-img">
          <div v-if="item.userVo.uuid == 'system' && item.action != 'restfulaction'">
            <img
              v-if="item.stepStatus && item.stepStatus == 'succeed'"
              class="Avatar"
              src="~@/resources/assets/images/status/success-icon.png"
              alt=""
            />
            <img
              v-else-if="item.stepStatus && item.stepStatus == 'failed'"
              class="Avatar"
              src="~@/resources/assets/images/status/failed-icon.png"
              alt=""
            />
            <div v-else class="tsfont-layer text-primary" style="font-size:22px"></div>
          </div>
          <div v-else-if="item.action == 'restfulaction'" class="tsfont-action text-primary" style="font-size:22px"></div>
          <UserCard
            v-else
            :uuid="item.userVo.uuid"
            :initType="item.userVo.initType"
            :iconSize="24"
            hideName
          ></UserCard>
        </div>
        <div class="content-box dividing-color">
          <div class="title">
            <UserCard
              v-if="item.userVo && item.action != 'restfulaction' && item.userVo.uuid != 'system'"
              class="user-name"
              v-bind="item.userVo"
              :hideAvatar="true"
              style="display: inline-block;"
            ></UserCard>
            <span v-if="item.originalUserVo">
              <span style="vertical-align: bottom;">（{{ $t('term.process.act') }}</span>
              <UserCard v-bind="item.originalUserVo" hideAvatar style="vertical-align: bottom;"></UserCard>
              <span style="vertical-align: bottom;">）</span>
            </span>
            <span v-html="item.description"></span>
            <span class="text-grey">·{{ item.actionTime | formatDate }}</span>
            <span v-show="item.sourceName" class="text-grey pl-nm">{{ $t('page.comefrom') }}{{ item.sourceName }}</span>
          </div>
          <div v-if="item.auditDetailList && item.auditDetailList.length > 0" class="content-list">
            <Timeline>
              <TimelineItem v-for="(jitem, jindex) in item.auditDetailList" :key="jindex" v-imgViewer>
                <span slot="dot" class="default-dot" :class="jitem.type == 'form' ? 'dot-bg' : ''"></span>
                <component :is="handlerType(jitem.type)" :config="jitem"></component>
              </TimelineItem>
            </Timeline>
          </div>
        </div>
      </div>
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
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    ...Item
  },
  directives: {imgViewer},
  props: {
    defaultActiveData: {
      type: Array,
      default: () => []
    }
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
  /deep/ .image > img {
    max-width: 100%;
  }
}
.content-list {
  /deep/ .ivu-timeline-item {
    &:last-child {
      padding: 0;
      margin-bottom: 12px !important;
    }
  }
  /deep/ .ivu-timeline-item-content {
    top: -5px;
  }
}
</style>
