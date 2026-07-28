<template>
  <div
    class="ts-markdown-editor"
    :class="{ 'is-readonly': readonly }"
    :style="editorStyle"
  >
    <div :id="editorId" ref="editor" class="ts-markdown-editor-content"></div>
  </div>
</template>

<script>
import Cherry from 'cherry-markdown';
import katex from 'katex';
import mermaid from 'mermaid';
import axios from '@/resources/api/http.js';
import 'cherry-markdown/dist/cherry-markdown.css';
import 'katex/dist/katex.min.css';

const fullToolbar = [
  'undo',
  'redo',
  '|',
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'sub',
  'sup',
  '|',
  'size',
  'color',
  'header',
  '|',
  'justify',
  'quote',
  '|',
  'ul',
  'ol',
  'checklist',
  '|',
  {
    insert: [
      'image',
      'audio',
      'video',
      'file',
      'word',
      'pdf',
      'link',
      'hr',
      'br',
      'code',
      'formula',
      'toc',
      'table'
    ]
  },
  'graph',
  '|',
  'codeTheme',
  'export',
  'copy',
  'search',
  'togglePreview'
  // 'settings',
  // 'detail',
  //  'ruby',
  //  'fullScreen',
  // 'switchModel',
  // 'panel',
  // 'drawIo',
  // 'publish',
  // 'shortcutKey',
  // 'wordCount',
  // 'mobilePreview',
];

const toolbarIconMap = [
  { selector: '.cherry-toolbar-insert', iconName: 'insert' },
  { selector: '.cherry-toolbar-export', iconName: 'export' },
  { selector: '.cherry-toolbar-insertChart', iconName: 'insertChart' },
  { selector: '', nameList: ['draw.io', 'drawIo'], titleList: ['画图', 'draw.io', 'Draw.io'], iconName: 'insertGraph' }
];
const videoResizeDirections = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const videoMinResizeWidth = 80;
let isMermaidInitialized = false;
const getFullToolbar = () => fullToolbar.map(item => {
  if (item && typeof item === 'object') {
    return Object.keys(item).reduce((toolbarConfig, key) => {
      toolbarConfig[key] = item[key].slice();
      return toolbarConfig;
    }, {});
  }
  return item;
});
const getMermaidInstance = () => {
  return mermaid && mermaid.default ? mermaid.default : mermaid;
};
const ensureMermaidExternal = () => {
  const root = typeof globalThis === 'undefined' ? null : globalThis;
  const mermaidInstance = getMermaidInstance();
  if (root && mermaidInstance) {
    root.mermaid = mermaidInstance;
  }
  if (!isMermaidInitialized && mermaidInstance && typeof mermaidInstance.initialize === 'function') {
    mermaidInstance.initialize({
      startOnLoad: false
    });
    isMermaidInitialized = true;
  }
  return mermaidInstance;
};
export default {
  name: 'TsMarkdownEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    height: {
      type: [Number, String],
      default: 400
    },
    width: {
      type: [Number, String],
      default: '100%'
    },
    model: {
      type: String,
      default: 'edit&preview'
    },
    readonly: {
      type: Boolean,
      default: false
    },
    toolbar: {
      type: [Array, Boolean],
      default() {
        return getFullToolbar();
      }
    },
    uploadConfig: {
      type: Object,
      default() {
        return {
          param: 'file'
        };
      }
    },
    videoDefaultWidth: {
      type: [Number, String],
      default: '60%'
    }
  },
  data() {
    return {
      cherry: null,
      editorId: `ts-markdown-editor-${this.$utils.setUuid()}`,
      lastEmittedMarkdown: null,
      selectedVideo: null,
      videoResizeMask: null,
      videoResizeEventsBound: false,
      videoResizeState: null,
      toolbarResizeObserver: null,
      toolbarResizeHandler: null,
      bubbleToolbar: ['bold', 'italic', 'underline', 'strikethrough', 'sub', 'sup', 'quote', '|', 'size', 'color'],
      floatToolbar: ['h1', 'h2', 'h3', '|', 'checklist', 'quote', 'quickTable', 'code']
    };
  },
  mounted() {
    this.initEditor();
  },
  beforeDestroy() {
    this.destroyEditor();
  },
  methods: {
    initEditor(initialValue = this.value || '') {
      const mermaidInstance = ensureMermaidExternal();
      const mermaidConfig = {
        showSourceToolbar: true
      };
      if (mermaidInstance) {
        mermaidConfig.mermaid = mermaidInstance;
        if (mermaidInstance.mermaidAPI) {
          mermaidConfig.mermaidAPI = mermaidInstance.mermaidAPI;
        }
      }
      const editorConfig = {
        id: this.editorId,
        value: initialValue || '',
        locale: this.getCherryLocale(),
        externals: {
          katex,
          mermaid: mermaidInstance
        },
        engine: {
          syntax: {
            table: {
              enableChart: false
            },
            mathBlock: {
              engine: 'katex'
            },
            inlineMath: {
              engine: 'katex'
            },
            codeBlock: {
              mermaid: mermaidConfig
            }
          }
        },
        fileUpload: this.handleFileUpload,
        editor: {
          defaultModel: this.model
        },
        toolbars: this.getDefaultToolbars(),
        callback: {
          fileUpload: this.handleFileUpload,
          fileUploadMulti: this.handleFileUploadMulti,
          afterChange: (markdown, html) => {
            this.lastEmittedMarkdown = markdown;
            this.$emit('input', markdown);
            this.$emit('change', markdown, html);
            this.$nextTick(() => {
              this.removeVideoResizeMask();
            });
          },
          afterInit: (markdown, html) => {
            this.$nextTick(() => {
              this.normalizeToolbarIcons();
              this.bindToolbarResizeObserver();
              this.bindVideoResizeEvents();
              this.$emit('ready', this.cherry, markdown, html);
            });
          }
        }
      };

      this.cherry = new Cherry(editorConfig);
      this.applyRuntimeConfig();
      this.$nextTick(() => {
        this.normalizeToolbarIcons();
        this.bindToolbarResizeObserver();
        this.bindVideoResizeEvents();
      });
    },
    destroyEditor() {
      this.unbindToolbarResizeObserver();
      this.unbindVideoResizeEvents();
      this.removeVideoResizeMask();
      if (this.cherry && typeof this.cherry.destroy === 'function') {
        this.cherry.destroy();
      }
      this.cherry = null;
    },
    rebuildEditor() {
      const markdown = this.getMarkdown() || this.value || '';
      this.destroyEditor();
      this.$nextTick(() => {
        this.initEditor(markdown);
      });
    },
    applyRuntimeConfig() {
      this.switchModel();
      this.applyReadonlyConfig();
      this.$nextTick(() => {
        this.normalizeToolbarIcons();
        this.bindToolbarResizeObserver();
      });
    },
    applyReadonlyConfig() {
      const codeMirror = this.cherry && typeof this.cherry.getCodeMirror === 'function' ? this.cherry.getCodeMirror() : null;
      if (codeMirror && typeof codeMirror.setOption === 'function') {
        codeMirror.setOption('readOnly', this.readonly);
        codeMirror.setOption('disableInput', this.readonly);
      }
    },
    getCherryLocale(locale) {
      const currentLocale = locale || (this.$i18n && this.$i18n.locale) || (typeof BASELANGUAGES !== 'undefined' ? BASELANGUAGES : 'zh');
      const normalizedLocale = String(currentLocale).replace('-', '_');
      const localeMap = {
        zh: 'zh_CN',
        zh_CN: 'zh_CN',
        en: 'en_US',
        en_US: 'en_US'
      };
      return localeMap[normalizedLocale] || normalizedLocale;
    },
    updateCherryLocale(locale) {
      if (!this.cherry || typeof this.cherry.setLocale !== 'function') {
        return;
      }
      this.cherry.setLocale(this.getCherryLocale(locale));
      this.$nextTick(() => {
        this.normalizeToolbarIcons();
      });
    },
    normalizeToolbarIcons() {
      const editorDom = this.$refs.editor;
      if (!editorDom) {
        return;
      }
      toolbarIconMap.forEach(config => {
        const button = this.getToolbarButton(config, editorDom);
        if (!button || button.querySelector('.ch-icon')) {
          return;
        }
        const title = button.getAttribute('title') || button.textContent.trim();
        button.innerHTML = '<i class="ch-icon ch-icon-' + config.iconName + '"></i>';
        if (title) {
          button.setAttribute('title', title);
          button.setAttribute('aria-label', title);
        }
        button.classList.add('ts-md-icon-toolbar-button');
      });
    },
    bindToolbarResizeObserver() {
      const editorDom = this.$refs.editor;
      const toolbar = editorDom && editorDom.querySelector('.cherry-toolbar');
      if (!toolbar) {
        return;
      }
      this.unbindToolbarResizeObserver();
      this.toolbarResizeHandler = () => {
        this.updateToolbarHeight(toolbar);
      };
      if (typeof ResizeObserver !== 'undefined') {
        this.toolbarResizeObserver = new ResizeObserver(this.toolbarResizeHandler);
        this.toolbarResizeObserver.observe(toolbar);
      }
      window.addEventListener('resize', this.toolbarResizeHandler);
      this.updateToolbarHeight(toolbar);
    },
    unbindToolbarResizeObserver() {
      if (this.toolbarResizeObserver) {
        this.toolbarResizeObserver.disconnect();
      }
      if (this.toolbarResizeHandler) {
        window.removeEventListener('resize', this.toolbarResizeHandler);
      }
      this.toolbarResizeObserver = null;
      this.toolbarResizeHandler = null;
    },
    updateToolbarHeight(toolbar) {
      const editorDom = this.$refs.editor;
      const cherryDom = editorDom && editorDom.querySelector('.cherry');
      if (!toolbar || !cherryDom) {
        return;
      }
      const height = Math.max(48, Math.ceil(toolbar.getBoundingClientRect().height));
      cherryDom.style.setProperty('--height-toolbar', `${height}px`);
    },
    getToolbarButton(config, editorDom) {
      if (config.selector) {
        const button = editorDom.querySelector('.cherry-toolbar .toolbar-left > ' + config.selector);
        if (button) {
          return button;
        }
      }
      const buttonList = editorDom.querySelectorAll('.cherry-toolbar .toolbar-left > .cherry-toolbar-button');
      return Array.prototype.find.call(buttonList, button => {
        const name = button.getAttribute('name') || '';
        const title = button.getAttribute('title') || '';
        const text = button.textContent.trim();
        return (config.nameList && config.nameList.indexOf(name) > -1) || (config.titleList && (config.titleList.indexOf(title) > -1 || config.titleList.indexOf(text) > -1));
      }) || null;
    },
    handleFileUpload(file, callback) {
      this.uploadFileToBackend(file)
        .then(({ url, params }) => {
          callback(url, Object.assign({ name: file.name }, params));
        })
        .catch(error => {
          this.$emit('upload-error', error, file);
          this.$Notice.error({ title: this.$t('message.uploadfailed') });
        });
    },
    handleFileUploadMulti(files, callback) {
      Promise.all(files.map(file => this.uploadFileToBackend(file)))
        .then(resultList => {
          resultList.forEach(({ url, params }, index) => {
            callback(url, Object.assign({ name: files[index].name }, params));
          });
        })
        .catch(error => {
          this.$emit('upload-error', error, files);
          this.$Notice.error({ title: this.$t('message.uploadfailed') });
        });
    },
    uploadFileToBackend(file) {
      const uploadConfig = this.getUploadConfig();
      const formData = new FormData();
      formData.append(this.getUploadFieldName(uploadConfig), file);
      this.appendFormData(formData, uploadConfig);
      return axios.post('/api/binary/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        contentType: 'multipart/form-data'
      }).then(res => {
        const { url, name } = res.Return || {};
        const result = {
          url: url,
          params: this.getUploadFileParams(file, {
            name: name || file.name
          })
        };
        this.$emit('upload-success', res, file, result);
        return result;
      });
    },
    getUploadConfig() {
      return Object.assign({
        param: 'file'
      }, this.uploadConfig || {});
    },
    getUploadFieldName(uploadConfig) {
      return uploadConfig.param || 'file';
    },
    appendFormData(formData, params) {
      if (!params || typeof params !== 'object') {
        return;
      }
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value === undefined || value === null) {
          return;
        }
        formData.append(key, value);
      });
    },
    getUploadFileParams(file, params) {
      const result = Object.assign({}, params);
      if (this.isVideoFile(file) && this.videoDefaultWidth && !result.width) {
        result.width = this.formatSize(this.videoDefaultWidth);
      }
      return result;
    },
    isVideoFile(file) {
      return !!(file && file.type && /video/i.test(file.type));
    },
    bindVideoResizeEvents() {
      const editorDom = this.$refs.editor;
      if (!editorDom || this.videoResizeEventsBound) {
        return;
      }
      editorDom.addEventListener('mousedown', this.handleVideoResizeMouseDown, true);
      editorDom.addEventListener('scroll', this.updateVideoResizeMask, true);
      document.addEventListener('mousedown', this.handleDocumentMouseDown, true);
      window.addEventListener('resize', this.updateVideoResizeMask);
      this.videoResizeEventsBound = true;
    },
    unbindVideoResizeEvents() {
      const editorDom = this.$refs.editor;
      if (!this.videoResizeEventsBound) {
        this.unbindVideoResizeDragEvents();
        this.videoResizeState = null;
        return;
      }
      if (editorDom) {
        editorDom.removeEventListener('mousedown', this.handleVideoResizeMouseDown, true);
        editorDom.removeEventListener('scroll', this.updateVideoResizeMask, true);
      }
      document.removeEventListener('mousedown', this.handleDocumentMouseDown, true);
      window.removeEventListener('resize', this.updateVideoResizeMask);
      this.unbindVideoResizeDragEvents();
      this.videoResizeState = null;
      this.videoResizeEventsBound = false;
    },
    unbindVideoResizeDragEvents() {
      document.removeEventListener('mousemove', this.resizeVideo);
      document.removeEventListener('mouseup', this.stopVideoResize);
    },
    handleVideoResizeMouseDown(event) {
      if (this.readonly || this.videoResizeState || this.isVideoResizePoint(event.target)) {
        return;
      }
      const video = this.getVideoByEvent(event);
      if (!video) {
        return;
      }
      this.selectVideoForResize(video);
    },
    getVideoByEvent(event) {
      const target = event.target;
      const video = this.getClosestPreviewVideo(target) || this.getPointPreviewVideo(event.clientX, event.clientY);
      if (!video || !this.$refs.editor || !this.$refs.editor.contains(video)) {
        return null;
      }
      return video;
    },
    getClosestPreviewVideo(target) {
      return target && target.closest ? target.closest('.cherry-previewer video') : null;
    },
    getPointPreviewVideo(clientX, clientY) {
      const target = document.elementFromPoint(clientX, clientY);
      if (target && target.tagName === 'VIDEO' && target.closest('.cherry-previewer')) {
        return target;
      }
      const previewer = this.$refs.editor && this.$refs.editor.querySelector('.cherry-previewer');
      if (!previewer) {
        return null;
      }
      const videoList = Array.prototype.slice.call(previewer.querySelectorAll('video'));
      return videoList.find(video => {
        const rect = video.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      }) || null;
    },
    isVideoResizePoint(target) {
      return !!(target && target.classList && target.classList.contains('ts-md-video-resize-point'));
    },
    handleDocumentMouseDown(event) {
      if (!this.selectedVideo || this.videoResizeState) {
        return;
      }
      const target = event.target;
      if ((this.videoResizeMask && this.videoResizeMask.contains(target)) || this.getVideoByEvent(event) === this.selectedVideo) {
        return;
      }
      this.removeVideoResizeMask();
    },
    selectVideoForResize(video) {
      this.selectedVideo = video;
      if (!this.videoResizeMask) {
        this.createVideoResizeMask();
      }
      this.updateVideoResizeMask();
    },
    createVideoResizeMask() {
      const mask = document.createElement('div');
      mask.className = 'ts-md-video-resize-mask';
      videoResizeDirections.forEach(direction => {
        const point = document.createElement('span');
        point.className = 'ts-md-video-resize-point ts-md-video-resize-point-' + direction;
        point.setAttribute('data-direction', direction);
        point.addEventListener('mousedown', this.startVideoResize);
        mask.appendChild(point);
      });
      this.$el.appendChild(mask);
      this.videoResizeMask = mask;
      this.$el.classList.add('ts-md-video-resize-active');
    },
    removeVideoResizeMask() {
      if (this.videoResizeMask && this.videoResizeMask.parentNode) {
        Array.prototype.forEach.call(this.videoResizeMask.querySelectorAll('.ts-md-video-resize-point'), point => {
          point.removeEventListener('mousedown', this.startVideoResize);
        });
        this.videoResizeMask.parentNode.removeChild(this.videoResizeMask);
      }
      if (this.$el) {
        this.$el.classList.remove('ts-md-video-resize-active');
      }
      this.selectedVideo = null;
      this.videoResizeMask = null;
    },
    updateVideoResizeMask() {
      if (!this.selectedVideo || !this.videoResizeMask || !this.selectedVideo.isConnected) {
        this.removeVideoResizeMask();
        return;
      }
      const editorRect = this.$el.getBoundingClientRect();
      const videoRect = this.selectedVideo.getBoundingClientRect();
      this.videoResizeMask.style.left = `${videoRect.left - editorRect.left}px`;
      this.videoResizeMask.style.top = `${videoRect.top - editorRect.top}px`;
      this.videoResizeMask.style.width = `${videoRect.width}px`;
      this.videoResizeMask.style.height = `${videoRect.height}px`;
    },
    startVideoResize(event) {
      if (!this.selectedVideo) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const rect = this.selectedVideo.getBoundingClientRect();
      this.videoResizeState = {
        direction: event.target.getAttribute('data-direction') || 'se',
        startX: event.clientX,
        startY: event.clientY,
        startWidth: rect.width,
        startHeight: rect.height || 1
      };
      this.unbindVideoResizeDragEvents();
      document.addEventListener('mousemove', this.resizeVideo);
      document.addEventListener('mouseup', this.stopVideoResize);
    },
    resizeVideo(event) {
      if (!this.selectedVideo || !this.videoResizeState) {
        return;
      }
      const state = this.videoResizeState;
      const direction = state.direction;
      const diffX = event.clientX - state.startX;
      const diffY = event.clientY - state.startY;
      let widthDiff = 0;
      if (direction.indexOf('e') > -1) {
        widthDiff = diffX;
      } else if (direction.indexOf('w') > -1) {
        widthDiff = -diffX;
      } else if (direction.indexOf('s') > -1) {
        widthDiff = diffY * state.startWidth / state.startHeight;
      } else if (direction.indexOf('n') > -1) {
        widthDiff = -diffY * state.startWidth / state.startHeight;
      }
      const maxWidth = this.getVideoMaxResizeWidth(this.selectedVideo);
      const width = Math.max(videoMinResizeWidth, Math.min(maxWidth, state.startWidth + widthDiff));
      this.selectedVideo.style.width = `${Math.round(width)}px`;
      this.selectedVideo.style.height = 'auto';
      this.updateVideoResizeMask();
    },
    stopVideoResize() {
      this.unbindVideoResizeDragEvents();
      if (this.selectedVideo && this.videoResizeState) {
        this.updateVideoMarkdownWidth(this.selectedVideo);
      }
      this.videoResizeState = null;
    },
    getVideoMaxResizeWidth(video) {
      const previewer = video.closest('.cherry-previewer');
      return previewer ? previewer.clientWidth : this.$el.clientWidth;
    },
    updateVideoMarkdownWidth(video) {
      const markdown = this.getMarkdown();
      const nextMarkdown = this.replaceVideoMarkdownWidth(markdown, video, this.getVideoMarkdownWidth(video));
      if (nextMarkdown && nextMarkdown !== markdown) {
        this.setMarkdown(nextMarkdown);
      }
    },
    getVideoMarkdownWidth(video) {
      const previewer = video.closest('.cherry-previewer');
      const width = Math.round(video.getBoundingClientRect().width);
      if (!previewer || !previewer.clientWidth) {
        return `${width}px`;
      }
      return `${Math.max(1, Math.min(100, Math.round(width / previewer.clientWidth * 100)))}%`;
    },
    replaceVideoMarkdownWidth(markdown, video, width) {
      const videoList = Array.prototype.slice.call(this.$refs.editor.querySelectorAll('.cherry-previewer video'));
      const targetIndex = videoList.indexOf(video);
      let currentIndex = -1;
      let isUpdated = false;
      const videoUrl = this.normalizeVideoUrl(video.currentSrc || video.src || video.getAttribute('src'));
      const nextMarkdown = markdown.replace(/!video\[([^\]]*)\]\(([^)]+)\)(\{poster=[^}]*\})?/g, (match, name, url, poster = '') => {
        currentIndex += 1;
        if (isUpdated) {
          return match;
        }
        const isSameUrl = videoUrl && this.normalizeVideoUrl(url) === videoUrl;
        if (!isSameUrl && currentIndex !== targetIndex) {
          return match;
        }
        isUpdated = true;
        return `!video[${this.setMarkdownMediaWidth(name, width)}](${url})${poster}`;
      });
      return isUpdated ? nextMarkdown : markdown;
    },
    setMarkdownMediaWidth(name, width) {
      const cleanName = (name || 'video')
        .replace(/#(?:auto|\d+(?:\.\d+)?(?:px|%)?)(?=\s|#|$)/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      return `${cleanName || 'video'}#${width}`;
    },
    normalizeVideoUrl(url) {
      if (!url) {
        return '';
      }
      const link = document.createElement('a');
      link.href = url;
      return link.href;
    },

    getDefaultToolbars() {
      return {
        toolbar: this.toolbar,
        bubble: this.readonly ? false : this.bubbleToolbar,
        float: this.readonly ? false : this.floatToolbar
      };
    },
    formatSize(value) {
      if (typeof value === 'number') {
        return `${value}px`;
      }
      return value;
    },
    syncMarkdownFromValue(value) {
      const nextValue = value || '';
      if (nextValue !== this.getMarkdown()) {
        this.setMarkdown(nextValue);
      }
    },
    getMarkdown() {
      if (!this.cherry) {
        return '';
      }
      if (typeof this.cherry.getMarkdown === 'function') {
        return this.cherry.getMarkdown();
      }
      if (typeof this.cherry.getValue === 'function') {
        return this.cherry.getValue();
      }
      return '';
    },
    getHtml() {
      return this.cherry && typeof this.cherry.getHtml === 'function' ? this.cherry.getHtml() : '';
    },
    getEditor() {
      return this.cherry;
    },
    setMarkdown(value) {
      if (!this.cherry) {
        return;
      }
      if (typeof this.cherry.setMarkdown === 'function') {
        this.cherry.setMarkdown(value || '', true);
      } else if (typeof this.cherry.setValue === 'function') {
        this.cherry.setValue(value || '', true);
      }
    },
    switchModel(model = this.model) {
      if (this.cherry && typeof this.cherry.switchModel === 'function') {
        this.cherry.switchModel(model);
      }
    },
    focus() {
      const codeMirror = this.cherry && typeof this.cherry.getCodeMirror === 'function' ? this.cherry.getCodeMirror() : null;
      if (codeMirror && typeof codeMirror.focus === 'function') {
        codeMirror.focus();
      }
    }
  },
  computed: {
    editorStyle() {
      return {
        width: this.formatSize(this.width),
        height: this.formatSize(this.height)
      };
    }
  },
  watch: {
    value(value) {
      const nextValue = value || '';
      if (nextValue === this.lastEmittedMarkdown && nextValue === this.getMarkdown()) {
        return;
      }
      this.lastEmittedMarkdown = null;
      this.syncMarkdownFromValue(nextValue);
    },
    model() {
      this.switchModel();
    },
    readonly() {
      this.rebuildEditor();
    },
    toolbar: {
      handler() {
        this.rebuildEditor();
      },
      deep: true
    },
    '$i18n.locale'(locale) {
      this.updateCherryLocale(locale);
    }
  }
};
</script>

<style lang="less">
@import './index.less';
</style>
<style lang="less" scoped>
@import './index.scoped.less';
</style>
