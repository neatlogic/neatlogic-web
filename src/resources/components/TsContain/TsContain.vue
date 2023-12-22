<template>
  <div
    ref="contain"
    :class="[getContainClass]"
    class="bg-grey"
    :style="{height: containHeight}"
  >
    <div v-if="!hideHeader" :class="[{ 'pl-nm': true, 'pr-nm': true }, { 'tscontain-header': isBackgroung == true, 'tscontain-headerBg padding-lr': isBackgroung == false }, { 'input-border': border == 'border' }, { 'tsForm-border-none': border == 'none' }, { 'tscontain-headerbottom': navHeaderBottom == 'none' }]">
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
          <Divider v-if="siderHide && $slots.topLeft" type="vertical" />
        </div>
        <div>
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
          :width="siderWidth"
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
        <Sider
          v-if="$slots.right"
          v-model="rightSiderHide"
          :width="rightSiderHide ? 0 : $slots.right && rightWidth ? rightWidth : 0"
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
    siderPosition: { type: String, default: 'left' }, // left, right
    isBackgroung: { type: Boolean, default: true }, // 背景色默认为灰色，如果传的话就白色
    clearStyle: { type: Boolean, default: false }, //是否需要清除侧边栏的样式（背景色、圆角，不包含右侧固定高度）
    rightWidth: { type: Number, default: 200 },
    mode: { type: String, default: 'window' }, //显示模式，有window和dialog两种，如果是dialog模式，高度强制变成100%
    rightBtn: { type: Boolean, default: false } //右侧收起展开按钮
  },
  data() {
    return {
      dragWidth: null,
      siderHide: this.isSiderHide,
      rightSiderHide: this.isRightSiderHide ? this.isRightSiderHide : !!(this.isRightSiderHide && this.siderPosition == 'right'),
      containHeight: '100%'
    };
  },
  mounted() {
    // if (this.sessionName) { //如果有存储
    //   let value = localStorage.getItem(this.sessionName + '_tsContainSider');
    //   value === 'false' ? this.siderHide = false : value === 'true' ? this.siderHide = true : '';
    // }
    this.handleContainHeight();
  },
  beforeDestroy() {
    this.sessionName && localStorage.removeItem(this.sessionName + '_tsContainSider'); //删除缓存，之前遗留问题
    // this.sessionName && localStorage.setItem(this.sessionName + '_tsContainSider', this.siderHide);
    this.initSetTime && clearTimeout(this.initSetTime);
  },
  methods: {
    verticals() {
      this.$emit('verticals');
    },
    initConfig(event, value) {
      if (this.$refs.contain && this.$refs.contain.clientWidth !== undefined) {
        let width = this.dragWidth;
        value = parseFloat(value) || this.dragWidth;
        let clientWidth = this.$refs.contain.clientWidth;
        let siderWidth = this.$slots.sider ? this.siderWidth : this.siderPosition == 'left' ? this.siderWidth : this.rightWidth;
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
        let _this = this;
        this.initSetTime && clearTimeout(this.initSetTime);
        this.initSetTime = setTimeout(function() {
          this.initSetTime = null;
          let value = localStorage.getItem(_this.href);
          _this.initConfig('', value);
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
          this.containHeight = this.containHeight = this.mode == 'window' ? `calc(100vh - ${rect.top.toFixed(0)}px - 16px)` : '100%'; // 底部间隙16; // 减去底部的16
        }
      });
    }
  },
  computed: {
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
      if (this.$slots.topLeft && this.$slots.topCenter && this.$slots.topRight) {
        //左中右
        return { 'grid-template-columns': '33.33% 33.33% 33.33%' };
      } else if (this.$slots.topLeft && this.$slots.topCenter && !this.$slots.topRight) {
        //左中
        return { 'grid-template-columns': '33.33% 33.33% 33.33%' };
      } else if (this.$slots.topLeft && !this.$slots.topCenter && !this.$slots.topRight) {
        //左
        return { 'grid-template-columns': 'auto 0px 0px' };
      } else if (this.$slots.topLeft && !this.$slots.topCenter && this.$slots.topRight) {
        //左右
        return { 'grid-template-columns': 'auto 0px auto' };
      } else if (!this.$slots.topLeft && !this.$slots.topCenter && this.$slots.topRight) {
        //右
        return { 'grid-template-columns': '50% 0px 50%' };
      } else if (!this.$slots.topLeft && this.$slots.topCenter && this.$slots.topRight) {
        //中右
        return { 'grid-template-columns': '33.33% 33.33% 33.33%' };
      } else if (!this.$slots.topLeft && this.$slots.topCenter && !this.$slots.topRight) {
        //中
        return { 'grid-template-columns': '33.33% 33.33% 33.33%' };
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
        if (this.siderHide) {
          return { 'grid-template-columns': 'min-content min-content auto' };
        } else {
          return { 'grid-template-columns': 'min-content auto calc(100% - ' + this.siderWidth + 'px)' };
        }
      } else if (!this.hasNavigation && this.hasCollapse && this.hasTop) {
        //只有收起栏和内容
        if (this.siderHide) {
          return { 'grid-template-columns': 'min-content auto' };
        } else {
          return { 'grid-template-columns': 'auto calc(100% - ' + this.siderWidth + 'px)' };
        }
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

/deep/.ivu-split-trigger-con {
  display: none;
}
div {
  transition-property: all;
  transition-duration: 0.25s, 1s;
}
.divider {
  margin-right: 16px;
  border-right: 1px solid @border-color-base;
}
</style>
