<template>
  <div v-if="isShow">
    <!-- modal -->
    <div v-if="type == 'modal'" v-transfer-dom :data-transfer="transfer">
      <div :style="(zindex ? 'z-index:' + zindex : '') + (';background-color:' + !hasMask ? 'transparent' : '')" :class="modalPrev + 'wrap'" @click.stop="maskClose ? onRemove() : ''">
        <div :class="setClass()" :style="setPosition(top, currentWidth)" @click.stop>
          <!-- 头部header内容设置 -->
          <div v-if="hasHeader == true" :class="isFull ? modalPrev + 'header isfull' : modalPrev + 'header'">
            <slot name="header">
              <div v-html="title"></div>
            </slot>
            <div v-if="titleDes" class="text-tip title-des overflow">{{ titleDes }}</div>
            <div class="btn-dialog-contain">
              <!-- 非全屏状态下面的按钮 -->
              <div v-if="isFull == false && fullscreen == true" class="ts-fullpage btn-dialog-header" @click="onFull()"></div>

              <!-- 全屏状态下面的按钮 -->
              <div v-else-if="isFull == true && fullscreen == true" class="ts-normalsize btn-dialog-header" @click="onFull()"></div>
              <div v-if="showCloseIcon" class="tsfont-close btn-dialog-header" @click="onRemove"></div>
            </div>
            <!-- <div class="tsfont-close btn-close" @click="onRemove" v-if="isFull == false"></div> -->
          </div>

          <!-- 中间body内容 -->
          <div :class="[modalPrev + 'body', { 'bg-block': bgOp }]" :style="setBody()">
            <div v-if="!hasHeader && showCloseIcon" class="tsfont-close btn-close" @click="onRemove"></div>
            <div ref="dialogContent" :class="modalPrev + 'content'" :style="setHeight(height, isFull == true && fullscreen == true)">
              <slot>
                <div v-html="content"></div>
              </slot>
            </div>
          </div>

          <!-- 底部footer按钮内容 -->
          <div v-if="hasFooter == true" :class="[modalPrev + 'footer', { 'bg-grey': bgOp }]">
            <slot name="footer">
              <!-- 通过参数来渲染btn -->
              <template v-if="btnList">
                <Button
                  v-for="(btn, index) in btnList"
                  :key="index"
                  :type="btn.type"
                  :ghost="btn.ghost || false"
                  :disabled="btn.disabled"
                  @click.native.stop="btnClick(btn)"
                  v-html="btn.text"
                ></Button>
              </template>
              <template v-else>
                <Button @click.native="onCancel" v-html="cancelText"></Button>
                <Button
                  v-if="loading"
                  :type="btnType"
                  :disabled="okBtnDisable"
                  :loading="loading"
                  @click.native.stop="onOk"
                  v-html="okText"
                ></Button>
                <Button
                  v-else
                  :type="btnType"
                  :disabled="okBtnDisable"
                  @click.native.stop="onOk"
                  v-html="okText"
                ></Button>
              </template>
            </slot>
          </div>
        </div>
      </div>
    </div>

    <!-- slider -->
    <div
      v-else
      v-transfer-dom
      :data-transfer="transfer"
      :class="{ isScrollbar: isScrollbar }"
    >
      <div :style="zindex ? 'z-index:' + zindex : ''" :class="hasMask == true ? modalPrev + 'wrap' : ''" @click.stop="maskClose ? onRemove() : ''">
        <div :class="setClass(position)" :style="setWidth()" @click.stop>
          <!-- 头部header内容设置 -->
          <div v-if="hasHeader == true" :class="modalPrev + 'header'">
            <slot name="header">
              <div v-html="title"></div>
            </slot>
            <div v-if="titleDes" class="text-tip title-des overflow">{{ titleDes }}</div>
            <div class="tsfont-close btn-close" @click="onRemove"></div>
          </div>

          <!-- 中间body内容 -->
          <div v-scrollHidden :class="[modalPrev + 'body', { 'bg-block': bgOp }]" :style="setStyle()">
            <div :class="modalPrev + 'content'" :style="getSliderContentStyle()">
              <slot></slot>
            </div>
          </div>

          <!-- 底部footer按钮内容 -->
          <div v-if="hasFooter == true" :class="modalPrev + 'footer'">
            <slot name="footer">
              <Button @click.native="onCancel" v-html="cancelText"></Button>
              <Button
                v-if="loading"
                type="primary"
                :loading="loading"
                :disabled="okBtnDisable"
                @click.native="onOk"
                v-html="okText"
              ></Button>
              <Button
                v-else
                type="primary"
                :disabled="okBtnDisable"
                @click.native="onOk"
                v-html="okText"
              ></Button>
            </slot>
          </div>
        </div>
      </div>
    </div>

    <!-- js初始化 -->
    <div v-if="type == 'confirm'" v-transfer-dom :data-transfer="transfer">
      <div :class="modalPrev + 'wrap'">
        <div :class="setClass()" :style="setPosition(top, currentWidth)" @click.stop>
          <!-- 中间body内容 -->
          <div :class="modalPrev + 'body'" :style="setBody()">
            <div :class="modalPrev + 'content'" :style="setHeight(height, isFull == true && fullscreen == true)">
              <slot>
                <div v-html="content"></div>
              </slot>
            </div>
          </div>
          <!-- 底部footer按钮内容 -->
          <div v-if="hasFooter == true" :class="modalPrev + 'footer'">
            <slot name="footer">
              <Button @click.native="onCancel" v-html="cancelText"></Button>
              <Button
                v-if="loading"
                type="primary"
                :disabled="okBtnDisable"
                :loading="loading"
                @click.native="onOk"
                v-html="okText"
              ></Button>
              <Button
                v-else
                type="primary"
                :disabled="okBtnDisable"
                @click.native="onOk"
                v-html="okText"
              ></Button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TransferDom from '../../directives/transfer-dom';
import scrollHidden from '@/resources/directives/scroll-hidden.js';
export default {
  name: 'TsDialog',
  tagComponent: 'TsDialog',
  directives: { TransferDom, scrollHidden },
  components: {},
  props: {
    zindex: { type: Number },
    type: {
      //弹窗类型，默认modal中间弹窗；slider侧滑窗
      type: String,
      default: 'modal'
    },
    fullscreen: {
      //modal 是否可以全屏
      type: Boolean,
      default: false
    },
    top: String,
    hasHeader: {
      //是否有顶部栏
      type: Boolean,
      default: true
    },
    isScrollbar: {
      //是否去掉滚动条 type 为 slider 的条件下
      type: Boolean,
      default: false
    },
    hasFooter: {
      //是否有底部栏
      type: Boolean,
      default: true
    },
    position: {
      //弹窗位置
      type: String,
      default: 'right'
    },
    hasMask: {
      //是否有遮罩层
      type: Boolean,
      default: true
    },
    loading: {
      //是否有加载中状态
      type: Boolean,
      default: false
    },
    width: {
      //宽度设置
      type: String,
      default: 'small'
    },
    height: String,
    maskClose: {
      //是否允许点击关闭空白处关闭遮罩层
      type: Boolean,
      default: false
    },
    className: String, //额外添加class
    isShow: {
      //是否关闭弹窗
      type: Boolean,
      default: false
    },
    okText: {
      //确定按钮的文案
      type: String,
      default() {
        return this.$t('page.confirm');
      }
    },
    okBtnDisable: {
      //禁用确定按钮，一般用于调用接口时使用
      type: Boolean,
      default: false
    },
    cancelText: {
      //取消按钮的文案
      type: String,
      default() {
        return this.$t('page.cancel');
      }
    },
    title: {
      //header显示文案
      type: String
    },
    content: {
      //内容显示文案
      type: String
    },
    showCloseIcon: {
      //是否显示关闭按钮
      type: Boolean,
      default: true
    },
    btnType: {
      //确定按钮的颜色  error  primary
      type: String,
      default: 'primary'
    },
    bgOp: {
      //弹出框的背景颜色是否是白底
      type: Boolean,
      default: false
    },
    defaultFull: {
      //modal情况下面是否满屏设置
      type: Boolean,
      default: false
    },
    btnList: {
      //底部操作区域的按钮数组
      type: Array
    },
    transfer: {
      type: Boolean,
      default: true
    },
    theme: Object, //主题
    titleDes: String, //标题详情
    hasContentPadding: {
      type: Boolean,
      default: true
    }
  },
  data() {
    let _this = this;
    return {
      modalPrev: _this.type == 'modal' ? 'tsmodal-' : 'tsslider-',
      placement: _this.type == 'modal' ? 'middle' : 'right',
      canBlur: _this.maskClose, //slider，失去焦点的数据
      isFull: false, //modal情况下面是否满屏 ,
      currentWidth: getWidth(_this.width)
    };
  },
  created() {},
  mounted() {
    var _this = this;
    if (_this.type == 'slider' && _this.canBlur && !_this.hasMask) {
      //当遮罩层不存在，允许点击其他地方关闭
      document.addEventListener('click', function() {
        // _this.cancel();点击之后关闭弹出框
      });
    }
  },
  destroyed() {
    this.onRemove();
  },
  methods: {
    onOk: function() {
      //确定时
      this.$emit('on-ok');
      this['on-ok'] && typeof this['on-ok'] == 'function' && this['on-ok'](this);
    },
    onCancel: function() {
      this.$emit('on-cancel');
      this['on-cancel'] && typeof this['on-cancel'] == 'function' && this['on-cancel'](this); //利用js来初始化数据取消按钮
      this.onRemove();
    },
    onRemove: function() {
      this.isfull = false;
      this['on-close'] && typeof this['on-close'] == 'function' && this['on-close'](this); //利用js来初始化数据 关闭按钮
      this.closeDailog && typeof this.closeDailog == 'function' && this.closeDailog(); //利用js来关闭数据
      this.$emit('update:isShow', false);
      this.$emit('on-close');
    },

    //针对modal全屏的方法
    onFull: function() {
      if (this.isFull) {
        this.isFull = false;
        this.currentWidth = getWidth(this.width);
      } else {
        this.isFull = true;
        this.currentWidth = '100%';
      }
      // 点击全屏的方法
      this.$emit('onFull');
    },
    styleFn(style) {
      if (this.theme) {
        if (this.theme.common || this.theme.TsDialog) {
          // 自定义主题颜色
          let themeConfig = this.$utils.mergeObj(this.theme.common, this.theme.TsDialog);
          let temConfig = this.$utils.mergeObj(style, themeConfig);
          return temConfig;
        } else {
          return style;
        }
      } else {
        return style;
      }
    },
    btnClick(config) {
      config.fn && config.fn(this);
    }
  },
  computed: {
    //slider数据
    setClass() {
      var _this = this;
      return function(position) {
        var classLi = _this.modalPrev + 'container';
        if (position) {
          classLi = classLi + ' ' + position;
        }
        if (_this.className) {
          classLi = classLi + ' ' + _this.className;
        }
        if (this.isFull) {
          classLi = classLi + ' no-radius';
        }
        return classLi;
      };
    },
    setStyle() {
      var _this = this;
      return function() {
        var remainHeight = 0;
        if (_this.top) {
          var top = Math.floor(_this.top.split('_')[0]);
          remainHeight = remainHeight + top;
        }
        if (_this.hasHeader) {
          remainHeight = remainHeight + 51;
        }
        if (_this.hasFooter) {
          remainHeight = remainHeight + 57;
        }
        return {
          height: `calc(100% - ${remainHeight}px - 16px)`
        };
      };
    },
    setWidth() {
      return function() {
        let style = {
          width: `${this.currentWidth}`,
          top: `${this.top}`
        };
        let temConfig = this.styleFn(style);
        return temConfig;
      };
    },

    setPosition() {
      //modal,当全屏数据发生变化时改变模态框的宽度和高度
      return function(top, width) {
        var style = { width: `${width}` };
        if (top) {
          style.top = `${top}`;
        }
        if (this.isFull) {
          style.top = `0px`;
          style.width = `100%`;
          style.transform = 'translate(0, 0)';
        }
        let temConfig = this.styleFn(style);
        return temConfig;
      };
    },
    setHeight() {
      let _this = this;
      return function(height, isFull) {
        let style = { overflow: 'auto' };
        !_this.hasHeader && (style['padding-top'] = '20px');
        !_this.hasFooter && (style['padding-top'] = '20px');
        !_this.hasHeader && _this.showCloseIcon && (style['padding-top'] = '35px');
        _this.hasHeader && (style['padding-top'] = '0px');
        if (height) {
          if (this.isFull) {
            style.height = '100%';
          } else {
            style.height = height;
          }
        } else {
          let remainHeight = 150; //top的值，之后改成动态
          this.isFull && (remainHeight = 10);
          //let top = '150px';
          this.hasHeader && (remainHeight = remainHeight + 47);
          this.hasFooter && (remainHeight = remainHeight + 57);
          //!this.top &&  (top = this.top);
          style['max-height'] = `calc(100vh - ${remainHeight}px - 24px)`;
        }
        isFull &&
          Object.assign(style, {
            width: `${this.currentWidth}`
          });
        return style;
      };
    },
    setBody() {
      //modal,当全屏数据发生变化时改变内容的高度
      return function() {
        if (this.isFull) {
          var remainHeight = 0;
          if (this.hasHeader) {
            remainHeight = remainHeight + 57;
          }
          if (this.hasFooter) {
            remainHeight = remainHeight + 57;
          }
          return {
            height: `calc(100vh - ${remainHeight}px)`
          };
        }
      };
    },
    getSliderContentStyle() {
      return () => {
        let padding = '0px';
        if (this.hasContentPadding) {
          padding = '12px';
        }
        return {
          width: '100%',
          padding: padding + ' !important'
        };
      };
    }
  },
  watch: {
    isShow(newVal, oldVal) {
      if (newVal == false && oldVal == true) {
        this.$emit('on-close'); //关闭弹出框时条用的方法
      }
    },
    width(newVal) {
      this.currentWidth = getWidth(newVal);
    },
    defaultFull: {
      handler(newVal) {
        this.isFull = newVal;
      },
      immediate: true
    }
  }
};

function getWidth(width) {
  //四个指定尺寸的设置
  let widthType = ['huge', 'large', 'medium', 'small', 'mini'];
  let widthList = { huge: '80%', large: 1000, medium: 800, small: 600, mini: 500 };
  if (widthType.indexOf(width) >= 0) {
    return typeof widthList[width] === 'number' ? widthList[width] + 'px' : widthList[width];
  } else if (typeof width == 'number') {
    return width + 'px';
  } else {
    return width;
  }
}
</script>
<style lang="less">
@import './dialog.less';
</style>
<style lang="less" scoped>
/deep/.ivu-btn-icon-only {
  padding: 0 15px;
  width: initial;
}
.isScrollbar {
  .tsslider-body {
    overflow: hidden !important;
  }
}
</style>
