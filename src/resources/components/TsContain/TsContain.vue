<template>
  <div
    ref="contain"
    :class="[getContainClass]"
    class="bg-grey"
    :style="{height: containHeight}"
  >
    <div v-if="!hideHeader" :class="getHeaderClassName">
      <div :style="getCollapseStyle" style="display: grid">
        <div v-if="hasNavigation" style="white-space: nowrap">
          <slot name="navigation"></slot>
          <Divider v-if="(enableCollapse && $slots.sider) || $slots.topLeft || enableDivider" type="vertical" />
        </div>
        <div v-if="hasCollapse" style="white-space: nowrap">
          <span
            class="tsfont-bar text-action"
            @click="
              siderHide = !siderHide;
              $nextTick(() => {
                $emit('toggleSiderHide', siderHide);
              });
            "
          ></span>
          <Divider v-if="$slots.topLeft" type="vertical" />
        </div>
        <div ref="containTopRight">
          <slot name="top">
            <div :style="getTopStyle" style="white-space: nowrap; display: grid">
              <div><slot name="topLeft"></slot></div>
              <div><slot name="topCenter"></slot></div>
              <div style="text-align: right"><slot name="topRight"></slot></div>
            </div>
          </slot>
        </div>
      </div>
    </div>
    <div
      ref="body"
      v-scrollHidden
      :class="{
        'pl-nm': hasContentPadding,
        'pr-nm': hasContentPadding,
        'tscontain-body-height-nopadding': !gutter
      }"
      class="tscontain-body bg-grey"
      :style="handleBodyHeight"
      @scroll.stop="scroll"
    >
      <slot v-if="!$slots.sider && !$slots.right" name="content"></slot>
      <Layout v-else style="height:100%">
        <Sider
          v-if="$slots.sider"
          v-model="siderHide"
          :width="resolvedSiderWidth"
          collapsible
          :collapsed-width="0"
          hide-trigger
          class="tscontain-sider"
          :class="{ 'tscontain-sider-right': siderPosition === 'right' }"
          @on-collapse="$emit('on-collapse', $event)"
        >
          <!--这段不知道做啥，先删掉:class="{ 'bg-op': border == 'none' && siderPosition === 'right' && !clearStyle }"-->
          <div :style="border == 'none' ? 'height: 100%;overflow: auto;' : 'height: 100%;'">
            <slot name="sider"></slot>
          </div>
        </Sider>
        <Content>
          <slot name="content"></slot>
        </Content>
        <div
          v-if="rightResizable && $slots.right && !rightSiderHide"
          class="right-resize-track"
          @pointerdown.prevent="startRightResize"
          @pointermove="moveRightResize"
          @pointerup="endRightResize"
          @lostpointercapture="endRightResize"
        ><TsResizeHandle class="right-resize-handle" /></div>
        <Sider
          v-if="$slots.right"
          v-model="rightSiderHide"
          :class="{ 'right-sider-resizing': rightDragStart }"
          :width="rightSiderHide ? 0 : resolvedRightWidth"
          collapsible
          :collapsed-width="0"
          hide-trigger
        >
          <div class="radius-lg tscontain-right" style="height: 100%; overflow: auto">
            <slot name="right"></slot>
            <div
              v-if="rightBtn"
              class="right-btn bg-right-btn-hover bg-grey shadow"
              :class="rightSiderHide ? 'tsfont-left' : 'tsfont-right'"
              @click="rightSiderToggle()"
            ></div>
          </div>
        </Sider>
      </Layout>
    </div>
  </div>
</template>
<script>
import scrollHidden from '@/resources/directives/scroll-hidden.js';
export default {
  name: 'TsContain',
  components: {TsResizeHandle: () => import('@/resources/components/TsResizeHandle/TsResizeHandle.vue')},
  directives: { scrollHidden },
  props: {
    hasContentPadding: { type: Boolean, default: true }, //内容是否有左右间距，默认有
    enableCollapse: { type: Boolean, default: false }, //显示隐藏左边slider按钮
    enableDivider: { type: Boolean, default: false }, //slot为top时可选选择是否展示分隔线
    sessionName: String, //localStorage 记录siderHide转态，下次进来时使用存储的转态来判断是否展开sider
    isSiderHide: { type: Boolean, default: false }, //是否隐藏sider内容
    isRightSiderHide: {type: Boolean, default: false}, // 是否隐藏右侧sider内容
    gutter: { type: Number, default: 16 }, //栅格之间的距离
    border: { type: String, default: 'none' }, //左右布局之间是否有边框分割
    navHeaderBottom: { type: String, default: 'none' }, //头部布局下面是否有底部边框分割
    hideHeader: { type: Boolean, default: false }, //是否隐藏头部
    siderWidth: { type: Number, default: 200 }, //slider的宽度
    siderWidthRatio: { type: Number, default: null }, //slider宽度占容器宽度的比例
    siderMinWidth: { type: Number, default: null }, //slider最小宽度
    siderMaxWidth: { type: Number, default: null }, //slider最大宽度
    siderPosition: { type: String, default: 'left' }, // left, right
    isBackgroung: { type: Boolean, default: true }, // 背景色默认为灰色，如果传的话就白色
    clearStyle: { type: Boolean, default: false }, //是否需要清除侧边栏的样式（背景色、圆角，不包含右侧固定高度）
    rightResizable: Boolean, // 默认关闭；启用后，有 right 插槽且右栏展开时才显示拖拽手柄。
    rightWidth: { type: Number, default: 200 }, // 右栏的配置宽度（px），首次拖拽前用它计算实际宽度。
    mode: { type: String, default: 'window' }, //显示模式，有window和dialog两种，如果是dialog模式，高度强制变成100%
    rightBtn: { type: Boolean, default: false }, //右侧收起展开按钮
    topLeftWidth: { type: String, default: '' }, //左侧宽度
    topCenterWidth: { type: String, default: '' }, //中间宽度
    topRightWidth: { type: String, default: '' } //右侧宽度
  },
  data() {
    return {
      dragWidth: null,
      rightDragWidth: null, // 拖拽得到的右栏宽度（px），初始为 null，表示沿用配置宽度。
      rightDragStart: null, // 仅在本次拖拽期间保存起始指针横坐标和起始栏宽，用于计算宽度变化。
      siderHide: this.isSiderHide,
      rightSiderHide: !!this.isRightSiderHide,
      containHeight: '100%',
      containerWidth: 0,
      resizeObserver: null
    };
  },
  mounted() {
    // if (this.sessionName) { //如果有存储
    //   let value = localStorage.getItem(this.sessionName + '_tsContainSider');
    //   value === 'false' ? this.siderHide = false : value === 'true' ? this.siderHide = true : '';
    // }
    this.handleContainHeight();
    this.updateContainerWidth();
    if (window.ResizeObserver && this.$refs.contain) {
      this.resizeObserver = new ResizeObserver(this.updateContainerWidth);
      this.resizeObserver.observe(this.$refs.contain);
    }
    window.addEventListener('resize', this.updateContainerWidth);
  },
  beforeDestroy() {
    this.sessionName && localStorage.removeItem(this.sessionName + '_tsContainSider'); //删除缓存，之前遗留问题
    // this.sessionName && localStorage.setItem(this.sessionName + '_tsContainSider', this.siderHide);
    this.initSetTime && clearTimeout(this.initSetTime);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    window.removeEventListener('resize', this.updateContainerWidth);
  },
  methods: {
    // 只调整右栏布局尺寸，拖动期间不重建左右插槽中的表单。
    startRightResize(event) {
      if (event.button !== 0) return;
      this.rightDragStart = {x: event.clientX, width: this.resolvedRightWidth};
      // 手柄捕获指针后，即使指针移出手柄，也能继续接收移动和松开事件。
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    // 手柄位于右栏左边缘，指针向左移动多少，右栏就从起始宽度增加多少。
    moveRightResize(event) {
      if (this.rightDragStart) this.rightDragWidth = this.rightDragStart.width + this.rightDragStart.x - event.clientX;
    },
    // 松开或失去指针捕获时，保存经过限幅的实际栏宽，避免容器变宽后右栏跳到越界的拖拽值。
    endRightResize() {
      if (this.rightDragStart) this.rightDragWidth = this.resolvedRightWidth;
      this.rightDragStart = null;
    },
    updateContainerWidth() {
      this.$nextTick(() => {
        this.containerWidth = this.$refs.contain ? this.$refs.contain.clientWidth : 0;
      });
    },
    verticals() {
      this.$emit('verticals');
    },
    initConfig(event, value) {
      if (this.$refs.contain && this.$refs.contain.clientWidth !== undefined) {
        let width = this.dragWidth;
        value = parseFloat(value) || this.dragWidth;
        let clientWidth = this.$refs.contain.clientWidth;
        let siderWidth = this.$slots.sider ? this.resolvedSiderWidth : this.siderPosition == 'left' ? this.resolvedSiderWidth : this.rightWidth;
        this.maxSplit = (siderWidth * 2) / clientWidth;
        this.minSplit = siderWidth / clientWidth;
        !value && (width = this.minSplit);
        if (this.siderPosition == 'right') {
          let { maxSplit, minSplit } = this;
          this.maxSplit = 1 - minSplit;
          this.minSplit = 1 - maxSplit;
          !value && (width = this.maxSplit);
        }
        if (value) {
          width = value > this.maxSplit ? this.maxSplit : value;
          width = value < this.minSplit ? this.minSplit : value;
        }
        this.oldWidth = width; //记录宽度，在isSiderHide改变时赋值上去
        if (this.siderHide) {
          this.dragWidth = this.siderPosition == 'right' ? 1 : 0;
        } else {
          this.dragWidth = width;
        }
      } else {
        this.initSetTime && clearTimeout(this.initSetTime);
        this.initSetTime = setTimeout(() => {
          this.initSetTime = null;
          let value = localStorage.getItem(this.href);
          this.initConfig('', value);
        }, 200);
      }
    },
    move(event) {
      //拖动中
      this.dragWidth > this.maxSplit ? (this.dragWidth = this.maxSplit) : '';
      this.dragWidth < this.minSplit ? (this.dragWidth = this.minSplit) : '';
    },
    moveEnd() {
      //拖动结束
      this.dragWidth > this.maxSplit ? (this.dragWidth = this.maxSplit) : '';
      this.dragWidth < this.minSplit ? (this.dragWidth = this.minSplit) : '';
      // localStorage.setItem(this.href, this.dragWidth);
    },
    scroll(e) {
      this.$emit('scroll', e.target.scrollTop || 0, e);
    },
    scrollTop(top) {
      if (this.$refs.body) {
        this.$refs.body.scrollTop = top;
      }
    },
    rightSiderToggle() {
      //右侧展示隐藏
      this.rightSiderHide = !this.rightSiderHide;
      this.$emit('rightSiderToggle');
    },
    handleContainHeight() {
      this.$nextTick(() => {
        let contain = this.$refs.contain;
        let rect = contain?.getBoundingClientRect();
        if (rect && rect.top) {
          this.containHeight = this.containHeight = this.mode == 'window' ? `calc(100vh - ${rect.top.toFixed(0)}px - 16px)` : '100%'; // 减去底部间隙16
        }
      });
    },
    refreshContainHeight() {
      this.handleContainHeight();
    }
  },
  computed: {
    // 未启用拖拽或尚未测得容器宽度时，直接使用配置宽度。
    resolvedRightWidth() {
      if (!this.rightResizable || !this.containerWidth) return this.rightWidth;
      // 右栏最多占容器的 65%，并尽量为主区保留 320px。
      const max = Math.min(this.containerWidth * 0.65, Math.max(0, this.containerWidth - 320));
      // 空间充足时右栏至少为 220px；若上限不足 220px，则以上限为准。
      return Math.min(max, Math.max(220, this.rightDragWidth ?? this.rightWidth));
    },
    resolvedSiderWidth() {
      if (this.siderWidthRatio > 0 && this.containerWidth > 0) {
        let width = Math.floor(this.containerWidth * this.siderWidthRatio);
        if (this.siderMinWidth != null) {
          width = Math.max(width, this.siderMinWidth);
        }
        if (this.siderMaxWidth != null) {
          width = Math.min(width, this.siderMaxWidth);
        }
        return width;
      }
      return this.siderWidth;
    },
    handleBodyHeight() {
      if (this.mode === 'dialog') {
        if (this.hideHeader) {
          return {height: '100%'};
        } else {
          return {height: 'calc(100% - 50px)'}; // header的高度
        }
      } else if (this.containHeight) {
        if (this.hideHeader) {
          return {height: this.containHeight};
        } else {
          return {height: `calc(${this.containHeight} - 50px)`};
        }
      } else {
        return {height: 'calc(100vh - 116px)'}; // 顶部菜单50px，导航栏50px，底部间隙16px
      }
    },
    getTopStyle() {
      const hasLeft = !!this.$slots.topLeft;
      const hasCenter = !!this.$slots.topCenter;
      const hasRight = !!this.$slots.topRight;

      // 提取重复的宽度计算逻辑
      const getDefaultWidth = (width, defaultValue) => width || defaultValue;
      const threeEqualWidths = `${getDefaultWidth(this.topLeftWidth, '33.33%')} ${getDefaultWidth(this.topCenterWidth, '33.33%')} ${getDefaultWidth(this.topRightWidth, '33.33%')}`;
      const twoEqualWidths = `minmax(0, ${getDefaultWidth(this.topLeftWidth, '50%')}) 0px minmax(0, ${getDefaultWidth(this.topRightWidth, '50%')})`;

      if (hasLeft && hasCenter && hasRight) {
        //左中右
        return { 'grid-template-columns': threeEqualWidths };
      } else if (hasLeft && hasCenter && !hasRight) {
        //左中
        return { 'grid-template-columns': threeEqualWidths };
      } else if (hasLeft && !hasCenter && !hasRight) {
        //左
        return { 'grid-template-columns': `${getDefaultWidth(this.topLeftWidth, 'auto')} 0px 0px` };
      } else if (hasLeft && !hasCenter && hasRight) {
        //左右
        return { 'grid-template-columns': twoEqualWidths };
      } else if (!hasLeft && !hasCenter && hasRight) {
        //右
        return { 'grid-template-columns': twoEqualWidths };
      } else if (!hasLeft && hasCenter && hasRight) {
        //中右
        return { 'grid-template-columns': threeEqualWidths };
      } else if (!hasLeft && hasCenter && !hasRight) {
        //中
        return { 'grid-template-columns': threeEqualWidths };
      }
      return {};
    },
    getCollapseStyle() {
      if (this.hasNavigation && !this.hasCollapse && !this.hasTop) {
        //只有导航栏
        return { 'grid-template-columns': 'auto' };
      } else if (this.hasNavigation && this.hasCollapse && !this.hasTop) {
        //只有导航栏和收起栏
        return { 'grid-template-columns': 'min-content auto' };
      } else if (this.hasNavigation && this.hasCollapse && this.hasTop) {
        //全部都有
        return { 'grid-template-columns': 'min-content min-content auto' };
      } else if (!this.hasNavigation && this.hasCollapse && this.hasTop) {
        //只有收起栏和内容
        return { 'grid-template-columns': 'min-content auto' };
      } else if (!this.hasNavigation && !this.hasCollapse && this.hasTop) {
        //只有内容
        return { 'grid-template-columns': 'auto' };
      } else if (this.hasNavigation && !this.hasCollapse && this.hasTop) {
        //只有导航栏和内容
        return { 'grid-template-columns': 'min-content auto' };
      }
      return {};
    },
    getContainClass() {
      return {
        'tscontain-container': true,
        hideSider: this.siderHide
      };
    },
    hasTop() {
      return !!(this.$slots.top || this.$slots.topLeft || this.$slots.topCenter || this.$slots.topRight);
    },
    hasCollapse() {
      return !!(this.enableCollapse && this.$slots.sider);
    },
    hasNavigation() {
      return !!this.$slots.navigation;
    },
    getHeaderClassName() {
      return [
        { 'pl-nm': true, 'pr-nm': true },
        { 'tscontain-header': this.isBackgroung == true, 'tscontain-headerBg padding-lr': this.isBackgroung == false },
        { 'input-border': this.border == 'border' },
        { 'tsForm-border-none': this.border == 'none' },
        { 'tscontain-headerbottom': this.navHeaderBottom == 'none' }
      ];
    }
  },
  watch: {
    isSiderHide: {
      handler(val) {
        this.siderHide = val;
        if (this.siderPosition == 'right') {
          this.rightSiderHide = val;
        }

        if (val) {
          this.oldWidth = this.dragWidth;
          this.dragWidth = this.siderPosition == 'right' ? 1 : 0;
        } else {
          this.initConfig('', this.oldWidth);
        }
      }
    },
    isRightSiderHide: {
      handler(val) {
        this.rightSiderHide = val;
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
@import './contain.less';
</style>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';

::v-deep .ivu-split-trigger-con {
  display: none;
}
div {
  transition-property: all;
  transition-duration: 0.25s, 1s;
}
.right-resize-track {
  position: relative;
  flex: none;
  width: 0;
  cursor: col-resize;
  touch-action: none;
}
// 热区从右栏左边缘向内展开，避开主区滚动条。
.right-resize-track > .right-resize-handle {
  right: auto;
  width: 16px;
}
// 拖动时宽度直接跟随指针，松手后恢复侧栏的展开和收起动画。
.right-sider-resizing {
  transition: none;
}
.divider {
  margin-right: 16px;
  border-right: 1px solid @border-color-base;
}
</style>
