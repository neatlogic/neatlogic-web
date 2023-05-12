<!--仪表板组件 -->
<template>
  <div class="dashboard-li ts-border" :style="!widget.name ? 'padding-top:0px' : ''" :class="{ selected: widget._selected, 'bg-op': !widget.isOpacity }">
    <div class="dashboard-title">
      <div v-if="widget.name" style="white-space:nowrap;font-size:15px" class="padding-sm overflow">
        <span>{{ widget.name }}</span>
      </div>
      <div v-if="mode === 'edit'">
        <div class="dashboard-action pt-xs">
          <span class="tsfont-close" style="cursor:pointer" @click.stop="removeWidget()"></span>
        </div>
      </div>
    </div>
    <div ref="container" style="width:100%;height:100%">
      <component
        :is="widgetComponent.type + 'widget'"
        v-if="isReady"
        ref="chart"
        :width="width - widget.padding * 2"
        :height="height - widget.padding * 2"
        :widgetComponent="widgetComponent"
        :widget="widget"
        :style="{
          overflow: 'auto',
          padding: widget.padding + 'px',
          width: width + 'px',
          height: height + 'px'
        }"
        @changeComponent="changeComponent"
      ></component>
      <Loading
        v-if="isLoading"
        :loading-show="isLoading"
        class="loadingclass"
        type="fix"
      ></Loading>
    </div>
  </div>
</template>

<script>
import * as components from './charts';

export default {
  name: 'DashboardWidget',
  components: {
    ...components,
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    widgetComponent: { type: Object },
    widget: { type: Object },
    mode: { type: String },
    isResizing: { type: Boolean }
  },
  data() {
    return {
      isLoading: false,
      isReady: false,
      width: 0,
      height: 0,
      resizeTimmer: null
    };
  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  },
  mounted() {
    this.resizeWidget();
  },
  methods: {
    editWidgetName() {
      this.isEditingName = true;
    },
    removeWidget() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.component')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$emit('remove', this.widget);
          vnode.isShow = false;
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    changeComponent() {},
    resizeWidget() {
      if (this.resizeTimmer) {
        clearTimeout(this.resizeTimmer);
        this.resizeTimmer = null;
      }
      this.isReady = false;
      this.resizeTimmer = setTimeout(() => {
        const container = this.$refs.container;
        if (container) {
          this.width = container.clientWidth;
          this.height = container.clientHeight;
          this.isReady = true;
        }
      }, 500);
    }
  },
  watch: {
    isResizing: {
      handler: function(val) {
        if (!val) {
          this.resizeWidget();
        } else {
          this.isReady = false;
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
.dashboard-title {
  height: 40px;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  display: grid;
  grid-template-columns: auto 20px;
}

.dashboard-li {
  height: 100%;
  width: 100%;
  position: relative;
  padding-top: 40px;
  .dashboard-action {
    display: none;
  }
  &:hover {
    .dashboard-action {
      display: block;
    }
  }
  .dashboard-action {
    position: absolute;
    right: 5px;
    top: 5px;
    z-index: 999;
    cursor: pointer;
    .action-item {
      &:after {
        top: 8px;
        bottom: 8px;
      }
    }
  }
}
.dashboard-li.selected {
  background-color: rgba(45, 132, 251, 0.2) !important;
}
</style>
