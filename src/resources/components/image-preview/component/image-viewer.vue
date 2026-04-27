<template>
  <transition name="viewer-fade">
    <div
      ref="image-preview-box-viewer-wrapper"
      tabindex="-1"
      class="image-preview-box-viewer-wrapper"
      :style="{ 'z-index': viewerZIndex }"
    >
      <div class="image-preview-box-viewer-mask" @click.self="handleMaskClick"></div>
      <span class="image-preview-box-viewer-btn image-preview-box-viewer-close" @click="hide">
        <i class="tsfont-close"></i>
      </span>
      <template v-if="!isSingle">
        <span
          class="image-preview-box-viewer-btn image-preview-box-viewer-prev"
          :class="{ 'is-disabled': !infinite && isFirst }"
          @click="prev"
        >
          <i class="tsfont-left" />
        </span>
        <span
          class="image-preview-box-viewer-btn image-preview-box-viewer-next"
          :class="{ 'is-disabled': !infinite && isLast }"
          @click="next"
        >
          <i class="tsfont-right" />
        </span>
      </template>
      <div class="image-preview-box-viewer-btn image-preview-box-viewer-actions">
        <div class="image-preview-box-viewer-actions-inner">
          <i class="tsfont-zoom-out" @click="handleActions('zoomOut')"></i>
          <i class="tsfont-zoom-in" @click="handleActions('zoomIn')"></i>
          <i :class="mode.icon" @click="toggleMode"></i>
          <i class="tsfont-rotate-left" @click="handleActions('anticlocelise')"></i>
          <i class="tsfont-rotate-right" @click="handleActions('clocelise')"></i>
        </div>
      </div>
      <div class="image-preview-box-viewer-canvas">
        <template v-for="(url, i) in urlList">
          <template v-if="isVideo(url)">
            <video
              v-if="i === index"
              ref="img"
              :key="url"
              class="image-preview-box-viewer__img"
              :src="currentImg"
              :style="imgStyle"
              controls="true"
              @loadeddata="handleImgLoad"
              @error="handleImgError"
              @mousedown="handleMouseDown"
            ></video>
          </template>
          <template v-else>
            <img
              v-if="i === index"
              ref="img"
              :key="url"
              class="image-preview-box-viewer__img"
              :src="currentImg"
              :style="imgStyle"
              @load="handleImgLoad"
              @error="handleImgError"
              @mousedown="handleMouseDown"
            >
          </template>
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import { rafThrottle, isFirefox, on, off } from './js/util';
import { PopupManager } from './js/popup';
const Mode = {
  CONTAIN: {
    name: 'contain',
    icon: 'tsfont-fullscreen'
  },
  ORIGINAL: {
    name: 'original',
    icon: 'tsfont-scale-to-original'
  }
};
const mousewheelEventName = isFirefox() ? 'DOMMouseScroll' : 'mousewheel';
export default {
  name: 'ImageViewer',
  props: {
    urlList: {
      type: Array,
      default: () => []
    },
    fileList: {
      // 附件列表
      type: Array,
      default: () => []
    },
    fileName: {
      // 附件名称字段名
      type: String,
      default: 'name'
    },
    idName: {
      // 附件id字段名
      type: String,
      default: 'id'
    },
    zIndex: {
      type: Number,
      default: 2000
    },
    onSwitch: {
      type: Function,
      default: () => {}
    },
    onClose: {
      type: Function,
      default: () => {}
    },
    initialIndex: {
      // 初始显示索引
      type: Number,
      default: 0
    },
    appendToBody: {
      // 是否将弹层插入至 body 元素上
      type: Boolean,
      default: true
    },
    maskClosable: {
      // 点击遮罩层是否关闭
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      index: this.initialIndex,
      isShow: false,
      infinite: true,
      loading: false,
      mode: Mode.CONTAIN,
      transform: {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false
      }
    };
  },
  mounted() {
    this.deviceSupportInstall();
    if (this.appendToBody) {
      document.body.appendChild(this.$el);
    }
    this.$refs['image-preview-box-viewer-wrapper'] && this.$refs['image-preview-box-viewer-wrapper'].focus();
  },
  destroyed() {
    this.deviceSupportUninstall();
    this.clearDragListeners();
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  },
  methods: {
    hide() {
      this.deviceSupportUninstall();
      this.onClose();
    },
    deviceSupportInstall() {
      this._keyDownHandler = e => {
        e.stopPropagation();
        const keyCode = e.keyCode;
        switch (keyCode) {
          // ESC
          case 27:
            this.hide();
            break;
          // SPACE
          case 32:
            this.toggleMode();
            break;
          // LEFT_ARROW
          case 37:
            this.prev();
            break;
          // UP_ARROW
          case 38:
            this.handleActions('zoomIn');
            break;
          // RIGHT_ARROW
          case 39:
            this.next();
            break;
          // DOWN_ARROW
          case 40:
            this.handleActions('zoomOut');
            break;
        }
      };
      this._mouseWheelHandler = rafThrottle(e => {
        const delta = e.wheelDelta ? e.wheelDelta : -e.detail;
        if (delta > 0) {
          this.handleActions('zoomIn', {
            zoomRate: 0.2,
            enableTransition: false
          });
        } else {
          this.handleActions('zoomOut', {
            zoomRate: 0.2,
            enableTransition: false
          });
        }
      });
      on(document, 'keydown', this._keyDownHandler);
      on(document, mousewheelEventName, this._mouseWheelHandler);
    },
    deviceSupportUninstall() {
      off(document, 'keydown', this._keyDownHandler);
      off(document, mousewheelEventName, this._mouseWheelHandler);
      this._keyDownHandler = null;
      this._mouseWheelHandler = null;
    },
    clearDragListeners() {
      off(document, 'mousemove', this._dragHandler);
      off(document, 'mouseup', this._dragEndHandler);
      this._dragHandler = null;
      this._dragEndHandler = null;
    },
    handleImgLoad(e) {
      this.loading = false;
    },
    handleImgError(e) {
      this.loading = false;
      e.target.alt = this.$t('page.loadingfailed');
    },
    handleMouseDown(e) {
      if (this.loading || e.button !== 0) return;
      const { offsetX, offsetY } = this.transform;
      const startX = e.pageX;
      const startY = e.pageY;
      this._dragHandler = rafThrottle(ev => {
        this.transform.offsetX = offsetX + ev.pageX - startX;
        this.transform.offsetY = offsetY + ev.pageY - startY;
      });
      this._dragEndHandler = () => {
        this.clearDragListeners();
      };
      on(document, 'mousemove', this._dragHandler);
      on(document, 'mouseup', this._dragEndHandler);
      e.preventDefault();
    },
    handleMaskClick() {
      if (this.maskClosable) {
        this.hide();
      }
    },
    reset() {
      this.transform = {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false
      };
    },
    toggleMode() {
      if (this.loading) return;
      const modeNames = Object.keys(Mode);
      const modeValues = Object.values(Mode);
      const index = modeValues.indexOf(this.mode);
      const nextIndex = (index + 1) % modeNames.length;
      this.mode = Mode[modeNames[nextIndex]];
      this.reset();
    },
    prev() {
      if (this.isFirst && !this.infinite) return;
      const len = this.urlList.length;
      this.index = (this.index - 1 + len) % len;
    },
    next() {
      if (this.isLast && !this.infinite) return;
      const len = this.urlList.length;
      this.index = (this.index + 1) % len;
    },
    handleActions(action, options = {}) {
      if (this.loading) return;
      const { zoomRate, rotateDeg, enableTransition } = {
        zoomRate: 0.2,
        rotateDeg: 90,
        enableTransition: true,
        ...options
      };
      const { transform } = this;
      switch (action) {
        case 'zoomOut':
          if (transform.scale > 0.2) {
            transform.scale = parseFloat((transform.scale - zoomRate).toFixed(3));
          }
          break;
        case 'zoomIn':
          transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3));
          break;
        case 'clocelise':
          transform.deg += rotateDeg;
          break;
        case 'anticlocelise':
          transform.deg -= rotateDeg;
          break;
      }
      transform.enableTransition = enableTransition;
    }
  },
  computed: {
    isSingle() {
      return this.urlList.length <= 1;
    },
    isFirst() {
      return this.index === 0;
    },
    isLast() {
      return this.index === this.urlList.length - 1;
    },
    currentImg() {
      return this.urlList[this.index];
    },
    imgStyle() {
      const { scale, deg, offsetX, offsetY, enableTransition } = this.transform;
      const style = {
        transform: `scale(${scale}) rotate(${deg}deg)`,
        transition: enableTransition ? 'transform .3s' : '',
        'margin-left': `${offsetX}px`,
        'margin-top': `${offsetY}px`
      };
      if (this.mode === Mode.CONTAIN) {
        style.maxWidth = style.maxHeight = '85%';
      }
      return style;
    },
    viewerZIndex() {
      const nextZIndex = PopupManager.nextZIndex();
      return this.zIndex > nextZIndex ? this.zIndex : nextZIndex;
    },
    isVideo() {
      return url => {
        if (!url) {
          return false;
        }
        const id = url.split('?id=')[1];
        let findItem = this.fileList && this.fileList.find(item => item[this.idName] == id);
        return (findItem && this.$utils.isVideo(findItem[this.fileName]));
      };
    }
  },
  watch: {
    index: {
      handler: function(val) {
        this.reset();
        this.onSwitch(val);
      }
    },
    currentImg(val) {
      this.$nextTick(_ => {
        const imgRef = this.$refs.img;
        const $img = Array.isArray(imgRef) ? imgRef[0] : imgRef;
        if (!$img) {
          return;
        }
        if ($img.tagName === 'VIDEO' && $img.readyState < 4) {
          this.loading = true;
        } else if ($img.tagName === 'IMG' && !$img.complete) {
          this.loading = true;
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
@import url('./image-preview.less');
</style>
