<template>
  <div ref="contain" :class="[getContainClass]" class="bg-grey">
    <div v-if="!hideHeader" :class="[{ 'pl-nm': true, 'pr-nm': true }, { 'tscontain-header': isBackgroung == true, 'tscontain-headerBg padding-lr': isBackgroung == false }, { 'input-border': border == 'border' }, { 'tsForm-border-none': border == 'none' }, { 'tscontain-headerbottom': navHeaderBottom == 'none' }]">
      <div :style="getCollapseStyle" style="display:grid">
        <div v-if="hasNavigation" style="white-space:nowrap">
          <slot name="navigation"></slot>
          <Divider v-if="(enableCollapse && $slots.sider) || $slots.topLeft" type="vertical" />
        </div>
        <div v-if="hasCollapse" style="white-space:nowrap">
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
            <div :style="getTopStyle" style="white-space:nowrap;display:grid">
              <div><slot name="topLeft"></slot></div>
              <div><slot name="topCenter"></slot></div>
              <div style="text-align:right"><slot name="topRight"></slot></div>
            </div>
          </slot>
        </div>
      </div>
    </div>
    <div
      ref="body"
      v-scrollHidden
      :class="{ 'pl-nm': hasContentPadding, 'pr-nm': hasContentPadding }"
      class="tscontain-body bg-grey"
      :style="mode == 'dialog' ? 'height:100%;' : ''"
      @scroll.stop="scroll"
    >
      <slot v-if="!$slots.sider && !$slots.left && !$slots.right" name="content"></slot>
      <Layout v-else-if="!isDrag" :style="{ height: '100%' }">
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
          <!--?????????????????????????????????:class="{ 'bg-op': border == 'none' && siderPosition === 'right' && !clearStyle }"-->
          <div :style="border == 'none' ? 'height: 100%;overflow: auto;' : 'height: 100%;'">
            <slot name="sider"></slot>
          </div>
        </Sider>
        <Sider
          v-if="$slots.left"
          v-model="leftSiderHide"
          :width="$slots.left && leftWidth ? leftWidth : 200"
          collapsible
          :collapsed-width="0"
          hide-trigger
        >
          <div class="tscontain-left" style="height: 100%;overflow: auto;">
            <slot name="left"></slot>
          </div>
        </Sider>
        <Content>
          <slot name="content"></slot>
        </Content>
        <Sider
          v-if="$slots.right"
          v-model="rightSiderHide"
          :width="$slots.right && rightWidth ? rightWidth : 200"
          collapsible
          :collapsed-width="0"
          hide-trigger
        >
          <div class="radius-lg tscontain-right" style="height: 100%;overflow: auto;">
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
      <Split
        v-else-if="isDrag"
        ref="split"
        v-model="dragWidth"
        class="tscontain-split"
        :class="siderPosition"
        @on-moving="move"
        @on-move-end="moveEnd"
      >
        <template slot="left">
          <slot v-if="siderPosition == 'left' && $slots.left" name="left"></slot>
          <Layout v-else-if="siderPosition == 'right' && $slots.left" :style="{ height: '100%' }">
            <Sider :width="$slots.left && leftWidth ? leftWidth : 200">
              <div class="radius-lg tscontain-left" style="height: 100%;overflow: auto;">
                <slot name="left"></slot>
              </div>
            </Sider>
            <Content>
              <slot name="content"></slot>
            </Content>
          </Layout>
          <slot v-else :name="siderPosition == 'left' ? 'sider' : 'content'"></slot>
        </template>
        <template slot="right">
          <slot v-if="siderPosition == 'right' && $slots.right" name="right"></slot>
          <Layout v-else-if="siderPosition == 'left' && $slots.right" :style="{ height: '100%' }">
            <Content>
              <slot name="content"></slot>
            </Content>
            <Sider :width="$slots.right && rightWidth ? rightWidth : 200">
              <div class="radius-lg tscontain-left" style="height: 100%;overflow: auto;">
                <slot name="right"></slot>
              </div>
            </Sider>
          </Layout>
          <slot v-else :name="siderPosition == 'left' ? 'content' : 'sider'"></slot>
        </template>
      </Split>
    </div>
  </div>
</template>
<script>
import scrollHidden from '@/resources/directives/scroll-hidden.js';
export default {
  name: 'TsContain',
  directives: { scrollHidden },
  props: {
    hasContentPadding: { type: Boolean, default: true }, //???????????????????????????????????????
    enableCollapse: { type: Boolean, default: false }, //??????????????????slider??????
    enableCollapseDivider: { type: Boolean, default: true },
    sessionName: String, //localStorage ??????siderHide??????????????????????????????????????????????????????????????????sider
    isSiderHide: { type: Boolean, default: false }, //????????????sider??????
    gutter: { type: Number, default: 16 }, //?????????????????????
    border: { type: String, default: 'none' }, //???????????????????????????????????????
    navHeaderBottom: { type: String, default: 'none' }, //?????????????????????????????????????????????
    hideHeader: { type: Boolean, default: false }, //??????????????????
    siderWidth: { type: Number, default: 200 }, //slider?????????
    siderPosition: { type: String, default: 'left' }, // left, right
    isDrag: { type: Boolean, default: false }, //slider??????????????????
    isBackgroung: { type: Boolean, default: true }, // ???????????????????????????????????????????????????
    clearStyle: { type: Boolean, default: false }, //??????????????????????????????????????????????????????????????????????????????????????????
    rightWidth: { type: Number, default: 200 },
    leftWidth: { type: Number, default: 200 },
    mode: { type: String, default: 'window' }, //??????????????????window???dialog??????????????????dialog???????????????????????????100%
    rightBtn: { type: Boolean, default: false } //????????????????????????
  },
  data() {
    let _this = this;
    return {
      dragWidth: null,
      siderHide: _this.isSiderHide,
      leftSiderHide: !!(_this.isSiderHide && _this.siderPosition == 'left'),
      rightSiderHide: !!(_this.isSiderHide && _this.siderPosition == 'right')
    };
  },
  mounted() {
    if (this.isDrag) {
      //????????????????????????????????????????????????
      let that = this;
      this.$nextTick(() => {
        this.href = window.location.href.replace(/\?[\s\S]*$/, '');
        let value = ''; //????????????
        // let value = localStorage.getItem(this.href);
        this.initConfig('', value);
        const offset = -6; //??????handler????????????
        if (this.$refs.split && this.$refs.split.$el) {
          let rightPane = document.getElementsByClassName('tscontain-split')[0];
          // let rightPane = document.getElementsByClassName('right-pane')[0];
          let newDiv = document.createElement('div');
          newDiv.id = 'verticalAfter';
          rightPane.appendChild(newDiv);

          let rightIcons = document.getElementById('verticalAfter');
          let newIcon = document.createElement('div');
          newIcon.id = 'rightIcons';
          rightIcons.appendChild(newIcon);

          let leftIcons = document.getElementById('verticalAfter');
          let newIconleft = document.createElement('div');
          newIconleft.id = 'leftIcons';
          rightIcons.style.left = this.siderWidth - offset + 'px';
          leftIcons.appendChild(newIconleft);

          newIconleft.style.display = 'none';
          leftIcons.addEventListener('click', () => {
            that.verticals();
            // document.getElementsByClassName('ivu-split-trigger-con')[0].classList.add('isBlock');
            // istrigger.style = 'display:block';

            if (!this.siderHide) {
              newIcon.style.display = 'none';
              newIconleft.style.display = 'block';
              rightIcons.style.left = -offset + 'px';
            } else {
              newIconleft.style.display = 'none';
              newIcon.style.display = 'block';
              rightIcons.style.left = this.siderWidth - offset + 'px';
            }
          });
        }
      });
      window.addEventListener('resize', this.initConfig);
    }
    // if (this.sessionName) { //???????????????
    //   let value = localStorage.getItem(this.sessionName + '_tsContainSider');
    //   value === 'false' ? this.siderHide = false : value === 'true' ? this.siderHide = true : '';
    // }
  },
  beforeDestroy() {
    this.sessionName && localStorage.removeItem(this.sessionName + '_tsContainSider'); //?????????????????????????????????
    // this.sessionName && localStorage.setItem(this.sessionName + '_tsContainSider', this.siderHide);
    this.initSetTime && clearTimeout(this.initSetTime);
    if (this.isDrag) {
      //????????????????????????????????????????????????
      window.removeEventListener('resize', this.initConfig);
    }
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
        let siderWidth = this.$slots.sider ? this.siderWidth : this.siderPosition == 'left' ? this.leftWidth : this.rightWidth;
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
        this.oldWidth = width; //??????????????????isSiderHide?????????????????????
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
      //?????????
      this.dragWidth > this.maxSplit ? (this.dragWidth = this.maxSplit) : '';
      this.dragWidth < this.minSplit ? (this.dragWidth = this.minSplit) : '';
    },
    moveEnd() {
      //????????????
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
      //??????????????????
      this.$emit('rightSiderToggle');
    }
  },
  computed: {
    getTopStyle() {
      if (this.$slots.topLeft && this.$slots.topCenter && this.$slots.topRight) {
        //?????????
        return { 'grid-template-columns': '33.33% 33.33% 33.33%' };
      } else if (this.$slots.topLeft && this.$slots.topCenter && !this.$slots.topRight) {
        //??????
        return { 'grid-template-columns': '33.33% 33.33% 33.33%' };
      } else if (this.$slots.topLeft && !this.$slots.topCenter && !this.$slots.topRight) {
        //???
        return { 'grid-template-columns': 'auto 0px 0px' };
      } else if (this.$slots.topLeft && !this.$slots.topCenter && this.$slots.topRight) {
        //??????
        return { 'grid-template-columns': '50% 0px 50%' };
      } else if (!this.$slots.topLeft && !this.$slots.topCenter && this.$slots.topRight) {
        //???
        return { 'grid-template-columns': '50% 0px 50%' };
      } else if (!this.$slots.topLeft && this.$slots.topCenter && this.$slots.topRight) {
        //??????
        return { 'grid-template-columns': '33.33% 33.33% 33.33%' };
      } else if (!this.$slots.topLeft && this.$slots.topCenter && !this.$slots.topRight) {
        //???
        return { 'grid-template-columns': '33.33% 33.33% 33.33%' };
      }
      return {};
    },
    getCollapseStyle() {
      if (this.hasNavigation && !this.hasCollapse && !this.hasTop) {
        //???????????????
        return { 'grid-template-columns': 'auto' };
      } else if (this.hasNavigation && this.hasCollapse && !this.hasTop) {
        //???????????????????????????
        return { 'grid-template-columns': 'min-content auto' };
      } else if (this.hasNavigation && this.hasCollapse && this.hasTop) {
        //????????????
        if (this.siderHide) {
          return { 'grid-template-columns': 'min-content min-content auto' };
        } else {
          return { 'grid-template-columns': 'min-content auto calc(100% - ' + this.siderWidth + 'px)' };
        }
      } else if (!this.hasNavigation && this.hasCollapse && this.hasTop) {
        //????????????????????????
        if (this.siderHide) {
          return { 'grid-template-columns': 'min-content auto' };
        } else {
          return { 'grid-template-columns': 'auto calc(100% - ' + this.siderWidth + 'px)' };
        }
      } else if (!this.hasNavigation && !this.hasCollapse && this.hasTop) {
        //????????????
        return { 'grid-template-columns': 'auto' };
      } else if (this.hasNavigation && !this.hasCollapse && this.hasTop) {
        //????????????????????????
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
        if (this.siderPosition == 'left') {
          this.leftSiderHide = val;
        }
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
