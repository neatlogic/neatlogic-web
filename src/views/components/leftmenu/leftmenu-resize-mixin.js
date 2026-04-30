const DEFAULT_MENU_WIDTH = 200; // 默认菜单宽度
const MIN_MENU_WIDTH = 200; // 最小菜单宽度
const MAX_MENU_WIDTH = 500; // 最大菜单宽度
const MENU_WIDTH_STORAGE_KEY = 'leftMenuWidthMap';

export default {
  data() {
    return {
      isResizing: false
    };
  },
  created() {
    this._menuWidth = this.getStoredMenuWidth();
    this._pendingMenuWidth = this._menuWidth;
    this._resizeFrame = null;
    this._widthStyleTarget = null;
  },
  mounted() {
    this._widthStyleTarget = this.getWidthStyleTarget();
    this.syncMenuWidth(this._menuWidth);
  },
  beforeDestroy() {
    this.cancelQueuedWidthSync();
    this.stopResize(false);
  },
  methods: {
    getWidthStyleTarget() {
      return (this.$el && this.$el.closest && this.$el.closest('.home')) || document.documentElement;
    },
    // 获取当前模块名
    getModuleKey() {
      return MODULEID || (this.currentModuleItem && this.currentModuleItem.moduleId) || 'default';
    },
    // 获取当前模块的菜单宽度
    getStoredMenuWidth() {
      const moduleKey = this.getModuleKey();
      try {
        const widthMap = JSON.parse(localStorage.getItem(MENU_WIDTH_STORAGE_KEY) || '{}');
        return this.clampMenuWidth(widthMap[moduleKey] || DEFAULT_MENU_WIDTH);
      } catch (e) {
        return DEFAULT_MENU_WIDTH;
      }
    },
    // 设置当前模块的菜单宽度
    setStoredMenuWidth(width) {
      const moduleKey = this.getModuleKey();
      try {
        const widthMap = JSON.parse(localStorage.getItem(MENU_WIDTH_STORAGE_KEY) || '{}');
        widthMap[moduleKey] = this.clampMenuWidth(width);
        localStorage.setItem(MENU_WIDTH_STORAGE_KEY, JSON.stringify(widthMap));
      } catch (e) {
        localStorage.setItem(MENU_WIDTH_STORAGE_KEY, JSON.stringify({ [moduleKey]: this.clampMenuWidth(width) }));
      }
    },
    // 限制菜单宽度在最小和最大宽度之间
    clampMenuWidth(width) {
      const nextWidth = Number(width) || DEFAULT_MENU_WIDTH;
      return Math.min(MAX_MENU_WIDTH, Math.max(MIN_MENU_WIDTH, nextWidth));
    },
    // 开始调整菜单宽度
    startResize(event) {
      this.isResizing = true;
      this.isSlider = false;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', this.onResizing);
      document.addEventListener('mouseup', this.stopResize);
      this.onResizing(event);
    },
    // 调整菜单宽度
    onResizing(event) {
      if (!this.isResizing) {
        return;
      }
      this._menuWidth = this.clampMenuWidth(event.clientX);
      this.queueWidthSync(this._menuWidth);
    },
    // 停止调整菜单宽度
    stopResize(arg) {
      const shouldEmitResize = typeof arg === 'boolean' ? arg : true;
      document.removeEventListener('mousemove', this.onResizing);
      document.removeEventListener('mouseup', this.stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (!this.isResizing) {
        return;
      }
      this.isResizing = false;
      this.isSlider = true;
      this._menuWidth = this.clampMenuWidth(this._menuWidth);
      this.cancelQueuedWidthSync();
      this.syncMenuWidth(this._menuWidth);
      this.setStoredMenuWidth(this._menuWidth);
      if (shouldEmitResize) {
        this.emitResizeEvent();
      }
    },
    // 队列同步菜单宽度
    queueWidthSync(width = this._menuWidth) {
      this._pendingMenuWidth = this.clampMenuWidth(width);
      if (this._resizeFrame) {
        return;
      }
      this._resizeFrame = window.requestAnimationFrame(() => {
        this._resizeFrame = null;
        this.syncMenuWidth(this._pendingMenuWidth);
      });
    },
    // 取消队列同步菜单宽度
    cancelQueuedWidthSync() {
      if (this._resizeFrame) {
        window.cancelAnimationFrame(this._resizeFrame);
        this._resizeFrame = null;
      }
    },
    // 同步菜单宽度
    syncMenuWidth(width = this._menuWidth) {
      const widthStyleTarget = this._widthStyleTarget || this.getWidthStyleTarget();
      widthStyleTarget.style.setProperty('--left-menu-width', `${this.clampMenuWidth(width)}px`);
    },
    // 触发菜单宽度变化事件
    emitResizeEvent() {
      window.dispatchEvent(new CustomEvent('resize'));
    }
  }
};
