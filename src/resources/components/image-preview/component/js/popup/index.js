import Vue from 'vue';
import PopupManager from './popup-manager';
import { getStyle, addClass, removeClass, hasClass } from '../dom';
let idSeed = 1;
let scrollBarWidth;
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    openDelay: {},
    closeDelay: {},
    zIndex: {},
    modal: {
      type: Boolean,
      default: false
    },
    modalFade: {
      type: Boolean,
      default: true
    },
    modalClass: {},
    modalAppendToBody: {
      type: Boolean,
      default: false
    },
    lockScroll: {
      type: Boolean,
      default: true
    },
    closeOnPressEscape: {
      type: Boolean,
      default: false
    },
    closeOnClickModal: {
      type: Boolean,
      default: false
    }
  },
  beforeMount() {
    this._popupId = 'popup-' + idSeed++;
    PopupManager.register(this._popupId, this);
  },
  beforeDestroy() {
    PopupManager.deregister(this._popupId);
    PopupManager.closeModal(this._popupId);

    this.restoreBodyStyle();
  },
  data() {
    return {
      opened: false,
      bodyPaddingRight: null,
      computedBodyPaddingRight: 0,
      withoutHiddenClass: true,
      rendered: false
    };
  },
  watch: {
    visible(val) {
      if (val) {
        if (this._opening) return;
        if (!this.rendered) {
          this.rendered = true;
          Vue.nextTick(() => {
            this.open();
          });
        } else {
          this.open();
        }
      } else {
        this.close();
      }
    }
  },
  methods: {
    open(options) {
      if (!this.rendered) {
        this.rendered = true;
      }
      const props = merge({}, this.$props || this, options);
      if (this._closeTimer) {
        clearTimeout(this._closeTimer);
        this._closeTimer = null;
      }
      clearTimeout(this._openTimer);
      const openDelay = Number(props.openDelay);
      if (openDelay > 0) {
        this._openTimer = setTimeout(() => {
          this._openTimer = null;
          this.doOpen(props);
        }, openDelay);
      } else {
        this.doOpen(props);
      }
    },
    merge(target) {
      for (let i = 1, j = arguments.length; i < j; i++) {
        let source = arguments[i] || {};
        for (let prop in source) {
          if (source.hasOwnProperty(prop)) {
            let value = source[prop];
            if (value !== undefined) {
              target[prop] = value;
            }
          }
        }
      }
      return target;
    },
    doOpen(props) {
      if (this.$isServer) return;
      if (this.willOpen && !this.willOpen()) return;
      if (this.opened) return;
      this._opening = true;
      const dom = this.$el;
      const modal = props.modal;
      const zIndex = props.zIndex;
      if (zIndex) {
        PopupManager.zIndex = zIndex;
      }
      if (modal) {
        if (this._closing) {
          PopupManager.closeModal(this._popupId);
          this._closing = false;
        }
        PopupManager.openModal(this._popupId, PopupManager.nextZIndex(), this.modalAppendToBody ? undefined : dom, props.modalClass, props.modalFade);
        if (props.lockScroll) {
          this.withoutHiddenClass = !hasClass(document.body, 'el-popup-parent--hidden');
          if (this.withoutHiddenClass) {
            this.bodyPaddingRight = document.body.style.paddingRight;
            this.computedBodyPaddingRight = parseInt(getStyle(document.body, 'paddingRight'), 10);
          }
          scrollBarWidth = getScrollBarWidth();
          let bodyHasOverflow = document.documentElement.clientHeight < document.body.scrollHeight;
          let bodyOverflowY = getStyle(document.body, 'overflowY');
          if (scrollBarWidth > 0 && (bodyHasOverflow || bodyOverflowY === 'scroll') && this.withoutHiddenClass) {
            document.body.style.paddingRight = this.computedBodyPaddingRight + scrollBarWidth + 'px';
          }
          addClass(document.body, 'el-popup-parent--hidden');
        }
      }
      if (getComputedStyle(dom).position === 'static') {
        dom.style.position = 'absolute';
      }
      dom.style.zIndex = PopupManager.nextZIndex();
      this.opened = true;
      this.onOpen && this.onOpen();
      this.doAfterOpen();
    },
    getScrollBarWidth() {
      if (Vue.prototype.$isServer) return 0;
      if (scrollBarWidth !== undefined) return scrollBarWidth;

      const outer = document.createElement('div');
      outer.className = 'el-scrollbar__wrap';
      outer.style.visibility = 'hidden';
      outer.style.width = '100px';
      outer.style.position = 'absolute';
      outer.style.top = '-9999px';
      document.body.appendChild(outer);

      const widthNoScroll = outer.offsetWidth;
      outer.style.overflow = 'scroll';

      const inner = document.createElement('div');
      inner.style.width = '100%';
      outer.appendChild(inner);

      const widthWithScroll = inner.offsetWidth;
      outer.parentNode.removeChild(outer);
      scrollBarWidth = widthNoScroll - widthWithScroll;
      return scrollBarWidth;
    },
    doAfterOpen() {
      this._opening = false;
    },
    close() {
      if (this.willClose && !this.willClose()) return;
      if (this._openTimer !== null) {
        clearTimeout(this._openTimer);
        this._openTimer = null;
      }
      clearTimeout(this._closeTimer);
      const closeDelay = Number(this.closeDelay);
      if (closeDelay > 0) {
        this._closeTimer = setTimeout(() => {
          this._closeTimer = null;
          this.doClose();
        }, closeDelay);
      } else {
        this.doClose();
      }
    },
    doClose() {
      this._closing = true;
      this.onClose && this.onClose();
      if (this.lockScroll) {
        setTimeout(this.restoreBodyStyle, 200);
      }
      this.opened = false;
      this.doAfterClose();
    },
    doAfterClose() {
      PopupManager.closeModal(this._popupId);
      this._closing = false;
    },
    restoreBodyStyle() {
      if (this.modal && this.withoutHiddenClass) {
        document.body.style.paddingRight = this.bodyPaddingRight;
        removeClass(document.body, 'el-popup-parent--hidden');
      }
      this.withoutHiddenClass = true;
    }
  }
};
export { PopupManager };
