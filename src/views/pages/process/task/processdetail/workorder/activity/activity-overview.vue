<template>
  <div class="activity-box">
    <div v-if="stepDataList && stepDataList.length > 1" class="flex-end pb-nm">
      <Tooltip trigger="hover" :content="$t('term.process.selectsteptimelinetip')">
        <span class="tsfont-info-o text-href"></span>
      </Tooltip>
      <TsFormSelect
        :value="selectedStepIdList"
        :placeholder="$t('page.all')"
        :dataList="stepDataList"
        :firstLi="true"
        :firstText="$t('page.all')"
        firstIcon="ivu-dropdown-item"
        textName="name"
        valueName="id"
        multiple
        transfer
        style="width:300px"
        @change="(val)=>$emit('updataActive', val)"
        @first="$emit('updataActive', [])"
      ></TsFormSelect>
    </div>
    <Loading
      v-if="loading"
      :loadingShow="true"
      :text="false"
      class="activity-local-loading"
    ></Loading>
    <div v-else-if="defaultActiveData && defaultActiveData.length > 0" class="activity-show-box bg-block">
      <Timeline>
        <TimelineItem v-for="item of defaultActiveData" :key="item.id">
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
              <span v-show="item.sourceName" class="text-grey">{{ $t('page.from') }} {{ item.sourceName }}</span>
            </div>
            <div class="title child-time text-grey fz10">{{ item.actionTime | formatDate }}</div>
            <div v-if="item.auditDetailList && item.auditDetailList.length > 0" class="content-list">
              <template v-for="(jitem, jindex) in item.auditDetailList">
                <component
                  :is="handlerType(jitem.type)"
                  :key="`${item.id}_${jitem.auditId}_${jindex}`"
                  :config="jitem"
                  :formSceneUuid="item.formSceneUuid"
                  :formConfig="frozenFormConfig"
                  :processTaskStepId="item.processTaskStepId"
                  :processTaskId="processTaskId"
                  class="mb-sm"
                ></component>
              </template>
            </div>
          </div>
        </TimelineItem>
      </Timeline>
      <Loading
        v-if="loadingMore"
        :loadingShow="true"
        :text="false"
        class="activity-local-loading"
      ></Loading>
      <div v-if="loadError" class="text-action" @click="$emit('retry')">{{ $t('page.retry') }}</div>
      <div v-if="hasMore" ref="renderSentinel" class="activity-render-sentinel"></div>
    </div>
    <div v-else class="order-content bg-block text-grey">
      <span v-if="loadError" class="text-action" @click="$emit('retry')">{{ $t('page.retry') }}</span>
      <span v-else>{{ $t('page.notarget',{target:$t('page.activitylist')}) }}</span>
    </div>
  </div>

</template>
<script>
import Item from './item';
import imgViewer from '@/resources/directives/img-viewer.js';
import Loading from '@/resources/components/loading/Loading.vue';
export default {
  name: 'ActivityOverview',
  components: {
    Loading,
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    ...Item
  },
  directives: {imgViewer},
  props: {
    defaultActiveData: {
      type: Array,
      default: () => []
    },
    formConfig: Object,
    stepDataList: { //步骤日志列表
      type: Array,
      default: () => []
    },
    selectedStepIdList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingMore: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: false
    },
    loadError: {
      type: Boolean,
      default: false
    },
    processTaskId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      frozenFormConfig: null
    };
  },
  beforeCreate() {},
  created() {
    this.frozenFormConfig = Object.freeze(this.$utils.deepClone(this.formConfig));
    this.renderObserver = null;
    this.loadMoreRequested = false;
    this.pendingScrollAnchor = null;
  },
  beforeMount() {},
  mounted() {
    this.observeRenderSentinel();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.renderObserver) {
      this.renderObserver.disconnect();
    }
  },
  destroyed() {},
  methods: {
    observeRenderSentinel() {
      if (this._isDestroyed) {
        return;
      }
      if (this.renderObserver) {
        this.renderObserver.disconnect();
      }
      const sentinel = this.$refs.renderSentinel;
      if (!sentinel || this.loading || this.loadingMore || this.loadError) {
        return;
      }
      const root = this.$el.closest('.CenterDetail');
      this.renderObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          this.requestMore();
        }
      }, { root, rootMargin: '500px 0px' });
      this.renderObserver.observe(sentinel);
    },
    getScrollAnchor() {
      const scrollContainer = this.$el && this.$el.closest('.CenterDetail');
      if (!scrollContainer) {
        return null;
      }
      const timelineRect = this.$el.getBoundingClientRect();
      const containerRect = scrollContainer.getBoundingClientRect();
      if (timelineRect.bottom > containerRect.top) {
        return null;
      }
      const anchor = document.elementFromPoint(
        containerRect.left + containerRect.width / 2,
        containerRect.top + Math.min(32, containerRect.height / 2)
      );
      if (!anchor || !scrollContainer.contains(anchor) || this.$el.contains(anchor)) {
        return null;
      }
      return { scrollContainer, anchor, top: anchor.getBoundingClientRect().top };
    },
    requestMore() {
      if (this.loading || this.loadingMore || this.loadError || !this.hasMore || this.loadMoreRequested) return;
      this.loadMoreRequested = true;
      this.pendingScrollAnchor = this.getScrollAnchor();
      this.$emit('loadMore');
    }
  },
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
    defaultActiveData() {
      const scrollAnchor = this.pendingScrollAnchor;
      this.pendingScrollAnchor = null;
      if (scrollAnchor) {
        this.$nextTick(() => {
          if (scrollAnchor.scrollContainer.contains(scrollAnchor.anchor)) {
            scrollAnchor.scrollContainer.scrollTop += scrollAnchor.anchor.getBoundingClientRect().top - scrollAnchor.top;
          }
        });
      }
    },
    loading(val) {
      if (val) this.pendingScrollAnchor = null;
      this.$nextTick(this.observeRenderSentinel);
    },
    loadingMore(val) {
      if (!val) this.loadMoreRequested = false;
      this.$nextTick(this.observeRenderSentinel);
    },
    hasMore() {
      this.$nextTick(this.observeRenderSentinel);
    },
    loadError() {
      this.$nextTick(this.observeRenderSentinel);
    }
  }
};
</script>
<style lang="less" scoped>
.activity-show-box {
  margin-left: 145px;
  ::v-deep .image > img {
    max-width: 100%;
  }
}
.activity-local-loading {
  min-height: 120px;
}
.activity-render-sentinel {
  height: 1px;
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
  ::v-deep .activity-compare-row > .left-label-text {
    flex: 0 0 72px;
  }
  ::v-deep .activity-compare-full {
    display: grid;
    grid-template-columns: 87px minmax(0, 1fr) 48px minmax(0, 1fr);
    min-width: 0;
    > * {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    > :nth-child(3) {
      align-self: start;
      text-align: center;
      padding: 0;
    }
    > :nth-child(4) {
      padding-left: 8px;
      overflow-wrap: anywhere;
    }
  }
  ::v-deep .activity-compare-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr);
    column-gap: 8px;
    flex: 1;
    min-width: 0;
    > div {
      min-width: 0;
    }
  }
  ::v-deep .activity-compare-grid.activity-compare-single {
    grid-template-columns: minmax(0, 1fr);
  }
  ::v-deep .activity-compare-value {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  ::v-deep .activity-compare-marker {
    text-align: center;
    padding: 0;
  }
  ::v-deep .left-label-text {
    display: inline-block;
    width: 72px;
    margin-right: 15px;
    text-align: right;
  }
  ::v-deep .ivu-timeline-item-tail {
    left: 3px; // 解决时间线不对齐问题
  }
}
@media (max-width: 800px) {
  .activity-box {
    ::v-deep .activity-compare-grid:not(.activity-compare-single) {
      grid-template-columns: minmax(0, 1fr);
      row-gap: 4px;
      .activity-compare-marker {
        text-align: left;
      }
    }
    ::v-deep .activity-compare-full {
      grid-template-columns: 87px minmax(0, 1fr);
      > :nth-child(3) {
        text-align: right;
        padding-right: 15px;
      }
      > :nth-child(4) {
        padding-left: 0;
      }
    }
  }
}
</style>
