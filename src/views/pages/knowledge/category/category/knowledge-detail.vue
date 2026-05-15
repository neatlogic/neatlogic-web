<template>
  <div class="knowledge-detail-box">
    <Loading :loadingShow="knowledgeLoading" type="fix"></Loading>
    <TsContain v-if="knowledgeConfing">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div>
          <span class="detail-title">{{ knowledgeConfing.title }}</span>
          <span v-if="knowledgeConfing && knowledgeConfing.path" class="document-path text-tip overflow" :title="getpath(knowledgeConfing.path)">({{ getpath(knowledgeConfing.path) }})</span>
          <Poptip
            v-if="knowledgeConfing.isCurrentVersion == 1 && currentVersion && historicalVersionList.length > 0"
            trigger="hover"
            placement="bottom-start"
            width="400"
          >
            <span class="btn-green-op cursor-pointer">
              {{ currentVersion.versionName }}
              <span class="tsfont-down"></span>
            </span>
            <div slot="content" class="version-main">
              <div class="mb-nm">
                <div class="mb-sm">
                  {{ $t('page.curversions') }}
                </div>
                <div class="version-content m-border">
                  <p>
                    {{ currentVersion.versionName }}
                    <CommonStatus :statusName="$t('page.enable')" statusValue="current"></CommonStatus>
                  </p>
                  <div class="text-tip">
                    <span class="user overflow">
                      <UserCard v-bind="currentVersion.lcuVo" hideAvatar></UserCard>
                    </span>
                    <span class="time">{{ currentVersion.lcd | formatDate }}</span>
                  </div>
                </div>
              </div>
              <div v-if="historicalVersionList.length > 0" class="mb-nm">
                <div class="mb-sm">{{ $t('page.hisversions') }}</div>
                <div v-for="item in historicalVersionList" :key="item.id" class="version-content m-border">
                  <p>{{ item.versionName }}</p>
                  <div class="text-tip">
                    <span class="user overflow">
                      <UserCard v-bind="item.lcuVo" hideAvatar></UserCard>
                    </span>
                    <span class="time">{{ item.lcd | formatDate }}</span>
                  </div>
                  <div class="btn-list">
                    <div class="action-group">
                      <span v-if="item.isSwitchable == 1" class="action-item tsfont-arrow-right" @click="backVersion(item)">{{ $t('page.rollback') }}</span>
                      <span v-if="item.isDeletable == 1" class="action-item tsfont-trash-o" @click="delVersion(item)">{{ $t('page.delete') }}</span>
                      <span class="action-item tsfont-compare" @click="comparisonVer(item)">{{ $t('page.compare') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Poptip>
          <span v-else-if="currentVersion && historicalVersionList.length == 0" class="btn-green-op">{{ currentVersion.versionName }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <div v-if="knowledgeConfing" class="action-group">
          <span v-if="knowledgeConfing.isEditable" class="action-item tsfont-edit" @click="goEdit">{{ $t('page.edit') }}</span>
          <span v-if="isDowning" class="action-item disable" :title="$t('page.downloadloadingtip')">
            <Icon type="ios-loading" size="18" class="loading"></Icon>
            {{ $t('page.export') }}
          </span>
          <span v-else class="action-item">
            <span class="tsfont-download" @click="exportPdf">{{ $t('page.export') }}pdf</span>
          </span>
          <span v-if="knowledgeConfing.isMember" class="action-item tsfont-history" @click="isActivityShow = !isActivityShow">{{ $t('page.activity') }}</span>
          <template v-if="knowledgeConfing.isCurrentVersion == 1">
            <span class="action-item" @click="toggleFavor">
              <span class="tsfont-hand" :class="isFavor == 1 ? 'text-success' : ''">点赞({{ favorCount }})</span>
            </span>
            <span class="action-item" @click="toggleCollect">
              <span class="tsfont-star" :class="isCollect == 1 ? 'text-href' : ''">{{ isCollect == 1 ? $t('page.collected') : $t('page.collect') }}</span>
            </span>
            <span>
              <span class="tsfont-eye text-grey">{{ $t('page.view') }}【{{ knowledgeConfing.viewCount }}】人</span>
            </span>
          </template>
        </div>
      </template>
      <template slot="content">
        <div v-if="knowledgeConfing && detailDocumentConfig">
          <KnowledgeEditor
            ref="knowledgeDocumentEditor"
            :document-config="detailDocumentConfig"
            :readonly="true"
            :can-edit-title="false"
            :can-edit-content="false"
            :can-edit-tag="false"
            :can-edit-attachment="false"
            :show-header="true"
            :show-debug-button="false"
          ></KnowledgeEditor>
        </div>
      </template>
    </TsContain>

    <ComparisonDialog
      v-if="currentVersion"
      :isShow.sync="isDialogShow"
      :newVersionId="currentVersion.id"
      :oldVersionId="historicalVersionId"
      :knowledgeDocumentId="knowledgeDocumentId"
    ></ComparisonDialog>
    <ActivityDetail :isShow.sync="isActivityShow" :knowledgeDocumentId="knowledgeDocumentId"></ActivityDetail>
  </div>
</template>
<script>
import html2canvas from 'html2canvas';
import { jsPDF as JsPDF } from 'jspdf';
import { legacyLineListToEditorData } from '@/views/pages/knowledge/category/knowledgeeditor/adapters/knowledge-data-adapter.js';
function isTiptapDocData(data) {
  return !!(data && data.type === 'doc' && Array.isArray(data.content));
}
export default {
  name: 'KnowledgeDetail',
  components: {
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    ComparisonDialog: () => import('../comparison/comparison-dialog.vue'),
    ActivityDetail: () => import('@/views/pages/knowledge/category/category/activity-detail-dialog.vue'),
    KnowledgeEditor: () => import('@/views/pages/knowledge/category/knowledgeeditor/index.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  filters: {},
  props: [''],
  data() {
    return {
      isDowning: false,
      knowledgeLoading: true,
      knowledgeDocumentId: null,
      knowledgeDocumentVersionId: null,
      isDialogShow: false,
      knowledgeConfing: {},
      currentVersion: null,
      historicalVersionList: [],
      historicalVersionId: null,
      isActivityShow: false,
      isCollect: 0,
      collectCount: 1,
      isFavor: 0,
      favorCount: 0,
      status: '' //文档状态
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.setRouteData();
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setRouteData() {
      this.knowledgeDocumentId = this.$route.query.knowledgeDocumentId || null;
      this.knowledgeDocumentVersionId = this.$route.query.knowledgeDocumentVersionId || null;
      this.status = this.$route.query.status || '';
    },
    reloadData() {
      this.knowledgeLoading = true;
      this.knowledgeConfing = {};
      this.currentVersion = null;
      this.historicalVersionList = [];
      this.historicalVersionId = null;
      this.syncActionStatus({});
      this.setRouteData();
      this.initData();
    },
    syncActionStatus(config) {
      config = config || {};
      this.isCollect = config.isCollect || 0;
      this.collectCount = config.collectCount || 0;
      this.isFavor = config.isFavor || 0;
      this.favorCount = config.favorCount || 0;
    },
    initData() {
      //文档信息
      let data = {
        knowledgeDocumentId: this.knowledgeDocumentId,
        knowledgeDocumentVersionId: this.knowledgeDocumentVersionId
      };
      if (this.status == 'passed') {
        //浏览记录：passed状态表示已发布的文档，浏览数需要加一
        data.isReadOnly = 1;
      }
      this.$api.knowledge.knowledge.getDocument(data).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return;
          this.knowledgeConfing = config;
          this.syncActionStatus(config);
          this.knowledgeLoading = false;
          if (config.isMember) {
            //isMember：判断是否是成员（活动和历史版本的查看权限）
            this.gethistoricalVersion();
          }
        }
      });
    },
    gethistoricalVersion() {
      //历史版本
      let data = {
        knowledgeDocumentId: this.knowledgeDocumentId
      };
      this.$api.knowledge.knowledge.historicalVersion(data).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return;
          this.currentVersion = config.currentVersion;
          this.historicalVersionList = config.historicalVersionList || [];
        }
      });
    },
    toggleCollect() {
      if (this.isCollect == 1) {
        this.isCollect = 0;
      } else {
        this.isCollect = 1;
      }
      let data = {
        documentId: this.knowledgeConfing.id,
        isCollect: this.isCollect
      };
      this.$api.knowledge.knowledge.collectDocument(data).then(res => {
        if (res.Status == 'OK') {
          this.collectCount = res.Return.count;
          this.$set(this.knowledgeConfing, 'isCollect', this.isCollect);
          this.$set(this.knowledgeConfing, 'collectCount', this.collectCount);
          this.$Message.success(this.$t('message.executesuccess'));
          this.refreshCatalogCount();
        }
      });
    },
    toggleFavor() {
      if (this.isFavor == 1) {
        this.isFavor = 0;
      } else {
        this.isFavor = 1;
      }
      let data = {
        documentId: this.knowledgeConfing.id,
        isFavor: this.isFavor
      };
      this.$api.knowledge.knowledge.favorDocument(data).then(res => {
        if (res.Status == 'OK') {
          this.favorCount = res.Return.count;
          this.$set(this.knowledgeConfing, 'isFavor', this.isFavor);
          this.$set(this.knowledgeConfing, 'favorCount', this.favorCount);
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    refreshCatalogCount() {
      this.$store.dispatch('leftMenu/getKnowledgeTypeMenu');
    },
    goEdit() {
      this.$router.push({
        path: '/knowledge-edit',
        query: {
          knowledgeDocumentId: this.knowledgeDocumentId,
          knowledgeDocumentVersionId: this.knowledgeDocumentVersionId
        }
      });
    },
    comparisonVer(item) {
      //对比版本
      this.historicalVersionId = item.id;
      this.isDialogShow = true;
    },
    delVersion(item) {
      // 删除版本
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: item.versionName }),
        btnType: 'error',
        'on-ok': vnode => {
          let data = {
            knowledgeDocumentVersionId: item.id
          };
          this.$api.knowledge.knowledge.deleteVersion(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.gethistoricalVersion();
            }
          });
        }
      });
    },
    backVersion(item) {
      //回退版本
      this.$createDialog({
        title: this.$t('dialog.title.rollbacktarget', { target: this.$t('page.versions') }),
        content: this.$t('dialog.content.rollbackconfirm', { target: item.versionName }),
        'on-ok': vnode => {
          let data = {
            knowledgeDocumentVersionId: item.id
          };
          this.knowledgeDocumentVersionId = item.id;
          this.$api.knowledge.knowledge.switchVersion(data).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              vnode.isShow = false;
              this.initData();
            }
          });
        }
      });
    },
    changeDownStatus(type, event) {
      //下载进度和状态的监听
      if (type == 'start') {
        this.isDowning = true;
      } else if (type != 'progress') {
        this.isDowning = false;
      }
    },
    async exportPdf() {
      if (this.isDowning) {
        return;
      }
      const contentEl = this.getPdfContentEl();
      if (!contentEl) {
        this.$Message.error(this.$t('page.exporterror'));
        return;
      }
      this.changeDownStatus('start');
      let exportEl = null;
      try {
        exportEl = this.createPdfElement(contentEl);
        document.body.appendChild(exportEl);
        await this.$nextTick();
        await this.waitForPdfLayout();
        await this.preparePdfVideos(contentEl, exportEl);
        await this.waitForPdfLayout();
        await this.waitForPdfImages(exportEl);
        const canvas = await html2canvas(exportEl, this.getCanvasOptions());
        this.saveCanvasToPdf(canvas, exportEl);
        this.changeDownStatus('success');
      } catch (error) {
        this.$Message.error(this.$t('page.exporterror'));
        this.changeDownStatus('error');
      } finally {
        if (exportEl && exportEl.parentNode) {
          exportEl.parentNode.removeChild(exportEl);
        }
      }
    },
    getPdfContentEl() {
      const editorComponent = this.$refs.knowledgeDocumentEditor;
      if (!editorComponent || !editorComponent.$el) {
        return null;
      }
      return editorComponent.$el.querySelector('.editor-wrapper');
    },
    createPdfElement(contentEl) {
      const exportEl = document.createElement('div');
      exportEl.className = 'knowledge-detail-pdf-export';
      exportEl.setAttribute('aria-hidden', 'true');
      Object.assign(exportEl.style, {
        position: 'fixed',
        left: '-10000px',
        top: '0',
        zIndex: '-1',
        width: '794px',
        maxWidth: '794px',
        padding: '32px',
        boxSizing: 'border-box',
        background: '#ffffff',
        color: '#333333',
        pointerEvents: 'none',
        overflow: 'visible'
      });
      const titleEl = document.createElement('div');
      titleEl.className = 'pdf-title';
      titleEl.innerText = (this.knowledgeConfing && this.knowledgeConfing.title) || '';
      Object.assign(titleEl.style, {
        marginBottom: '24px',
        fontSize: '24px',
        fontWeight: '600',
        lineHeight: '32px'
      });
      const contentClone = contentEl.cloneNode(true);
      contentClone.classList.add('knowledge-detail-pdf-content');
      Object.assign(contentClone.style, {
        background: '#ffffff',
        padding: '0',
        width: '100%',
        maxWidth: '100%',
        minHeight: 'auto',
        height: 'auto',
        overflow: 'visible'
      });
      contentClone.querySelectorAll('.editor-content-box, .editor-content-container, .ProseMirror, .tableWrapper').forEach(el => {
        Object.assign(el.style, {
          minHeight: 'auto',
          height: 'auto',
          overflow: 'visible'
        });
      });
      contentClone.querySelectorAll('img').forEach(img => {
        img.loading = 'eager';
      });
      contentClone.querySelectorAll('div[data-block-type="image"], .image-container, .image-wrapper, img, video, pre, table, tr, blockquote, .highlight-block').forEach(el => {
        Object.assign(el.style, {
          breakInside: 'avoid',
          pageBreakInside: 'avoid'
        });
      });
      exportEl.appendChild(titleEl);
      exportEl.appendChild(contentClone);
      return exportEl;
    },
    waitForPdfLayout() {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    },
    waitForPdfImages(exportEl) {
      const imageList = Array.from(exportEl.querySelectorAll('img')).filter(img => !img.complete);
      if (!imageList.length) {
        return Promise.resolve();
      }
      return Promise.all(
        imageList.map(img => {
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
    },
    async preparePdfVideos(sourceEl, exportEl) {
      const exportVideoList = Array.from(exportEl.querySelectorAll('video'));
      if (!exportVideoList.length) {
        return;
      }
      const sourceVideoList = Array.from(sourceEl.querySelectorAll('video'));
      await Promise.all(exportVideoList.map((video, index) => this.replacePdfVideo(video, sourceVideoList[index])));
    },
    async replacePdfVideo(video, sourceVideo) {
      const sourceRect = sourceVideo ? sourceVideo.getBoundingClientRect() : null;
      const cloneRect = video.getBoundingClientRect();
      const style = window.getComputedStyle(video);
      const width = Math.max(1, Math.round((sourceRect && sourceRect.width) || cloneRect.width || video.videoWidth || parseFloat(style.width) || 320));
      const height = Math.max(1, Math.round((sourceRect && sourceRect.height) || cloneRect.height || video.videoHeight || parseFloat(style.height) || 180));
      const previewSrc = await this.getVideoPreviewSrc(video, width, height);
      const previewEl = this.createVideoPreviewEl(previewSrc, width, height, style);
      if (video.parentNode) {
        video.parentNode.replaceChild(previewEl, video);
      }
    },
    async getVideoPreviewSrc(video, width, height) {
      const poster = video.getAttribute('poster');
      if (poster) {
        return poster;
      }
      await this.waitForPdfVideoReady(video);
      if (!video.videoWidth || !video.videoHeight) {
        return '';
      }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
        const drawWidth = video.videoWidth * scale;
        const drawHeight = video.videoHeight * scale;
        ctx.drawImage(video, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
        return canvas.toDataURL('image/png');
      } catch (error) {
        return '';
      }
    },
    waitForPdfVideoReady(video) {
      if (!video || video.readyState >= 2) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        let timer = null;
        const eventList = ['loadeddata', 'canplay', 'error', 'abort'];
        const cleanup = () => {
          eventList.forEach(eventName => video.removeEventListener(eventName, done));
          if (timer) {
            clearTimeout(timer);
          }
        };
        const done = () => {
          cleanup();
          resolve();
        };
        eventList.forEach(eventName => video.addEventListener(eventName, done, { once: true }));
        timer = setTimeout(done, 2000);
        try {
          video.preload = 'auto';
          video.load();
        } catch (error) {
          done();
        }
      });
    },
    createVideoPreviewEl(previewSrc, width, height, videoStyle) {
      const wrapper = document.createElement('div');
      wrapper.className = 'pdf-video-preview';
      Object.assign(wrapper.style, {
        position: 'relative',
        display: 'inline-block',
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100%',
        overflow: 'hidden',
        verticalAlign: 'top',
        borderRadius: videoStyle.borderRadius || '8px',
        background: '#202124',
        breakInside: 'avoid',
        pageBreakInside: 'avoid'
      });
      if (previewSrc) {
        const image = document.createElement('img');
        image.src = previewSrc;
        image.alt = '';
        Object.assign(image.style, {
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 'inherit'
        });
        wrapper.appendChild(image);
      }
      const playIcon = document.createElement('span');
      Object.assign(playIcon.style, {
        position: 'absolute',
        left: '16px',
        bottom: '16px',
        width: '0',
        height: '0',
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderLeft: '12px solid #ffffff',
        zIndex: '2'
      });
      const controlBar = document.createElement('span');
      Object.assign(controlBar.style, {
        position: 'absolute',
        left: '0',
        right: '0',
        bottom: '0',
        height: '46px',
        background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.72))',
        zIndex: '1'
      });
      const progressBar = document.createElement('span');
      Object.assign(progressBar.style, {
        position: 'absolute',
        left: '16px',
        right: '16px',
        bottom: '8px',
        height: '3px',
        borderRadius: '3px',
        background: 'rgba(255, 255, 255, 0.72)',
        zIndex: '2'
      });
      wrapper.appendChild(controlBar);
      wrapper.appendChild(playIcon);
      wrapper.appendChild(progressBar);
      return wrapper;
    },
    getPdfOptions() {
      return {
        filename: this.getExportFileName('pdf')
      };
    },
    getCanvasOptions() {
      return {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794
      };
    },
    saveCanvasToPdf(canvas, exportEl) {
      const { filename } = this.getPdfOptions();
      const pdf = new JsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      const pageCanvasWidth = canvas.width;
      const pageCanvasHeight = Math.floor((contentHeight / contentWidth) * pageCanvasWidth);
      const canvasScale = pageCanvasWidth / exportEl.offsetWidth;
      const avoidBreakRanges = this.getAvoidBreakRanges(exportEl, canvasScale, pageCanvasHeight);
      pageCanvas.width = pageCanvasWidth;
      pageCanvas.height = pageCanvasHeight;
      let renderedHeight = 0;
      let pageIndex = 0;
      while (renderedHeight < canvas.height) {
        const remainHeight = canvas.height - renderedHeight;
        const currentPageHeight = this.getCurrentPageHeight(renderedHeight, Math.min(pageCanvasHeight, remainHeight), avoidBreakRanges);
        pageCanvas.height = currentPageHeight;
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvasWidth, currentPageHeight);
        pageCtx.drawImage(canvas, 0, renderedHeight, pageCanvasWidth, currentPageHeight, 0, 0, pageCanvasWidth, currentPageHeight);
        const imgData = pageCanvas.toDataURL('image/png');
        if (pageIndex > 0) {
          pdf.addPage();
        }
        const pdfImageHeight = (currentPageHeight / pageCanvasWidth) * contentWidth;
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, pdfImageHeight);
        renderedHeight += currentPageHeight;
        pageIndex += 1;
      }
      pdf.save(filename);
    },
    getAvoidBreakRanges(exportEl, canvasScale, pageCanvasHeight) {
      const rootRect = exportEl.getBoundingClientRect();
      const minHeight = 8 * canvasScale;
      const blockMaxHeight = pageCanvasHeight * 0.96;
      const tableMaxHeight = pageCanvasHeight * 0.68;
      const rowMaxHeight = pageCanvasHeight * 0.96;
      const blockGap = 24 * canvasScale;
      const tableGap = 8 * canvasScale;
      const ranges = [];
      const addRange = (el, gap, maxHeight) => {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) {
          return;
        }
        const top = Math.max(0, Math.floor((rect.top - rootRect.top) * canvasScale - gap));
        const bottom = Math.max(0, Math.ceil((rect.bottom - rootRect.top) * canvasScale + gap));
        const height = bottom - top;
        if (height > minHeight && height < maxHeight) {
          ranges.push({ top, bottom });
        }
      };
      const blockSelector = ['div[data-block-type="image"]', '.image-container', '.image-wrapper', 'img', 'video', 'pre', 'blockquote', '.highlight-block', 'hr'].join(',');
      Array.from(exportEl.querySelectorAll(blockSelector)).forEach(el => addRange(el, blockGap, blockMaxHeight));
      Array.from(exportEl.querySelectorAll('table, thead, tbody')).forEach(el => addRange(el, tableGap, tableMaxHeight));
      Array.from(exportEl.querySelectorAll('tr')).forEach(el => addRange(el, tableGap, rowMaxHeight));
      return ranges
        .sort((a, b) => a.top - b.top);
    },
    getCurrentPageHeight(renderedHeight, defaultHeight, avoidBreakRanges) {
      const defaultEnd = renderedHeight + defaultHeight;
      const minPageHeight = 120;
      const pageBottomGap = 32;
      const tailReserve = 160;
      const splitRange = avoidBreakRanges.find(range => range.top < defaultEnd && range.bottom > defaultEnd);
      if (splitRange) {
        const pageHeight = splitRange.top - renderedHeight - pageBottomGap;
        if (pageHeight > minPageHeight) {
          return pageHeight;
        }
      }
      const tailRange = avoidBreakRanges.find(range => range.top > renderedHeight + minPageHeight && range.top < defaultEnd && defaultEnd - range.top < tailReserve);
      if (tailRange) {
        return Math.max(minPageHeight, tailRange.top - renderedHeight - pageBottomGap);
      }
      return defaultHeight;
    },
    getExportTitle() {
      return (this.knowledgeConfing && this.knowledgeConfing.title) || 'knowledge';
    },
    getExportFileName(extension) {
      return this.getExportTitle().replace(/[\\/:*?"<>|]/g, '_') + '.' + extension;
    }
  },
  computed: {
    getpath() {
      return function(path) {
        let text = path.join(' / ');
        return text;
      };
    },
    normalizedContent() {
      const content = this.knowledgeConfing && this.knowledgeConfing.content;
      if (typeof content !== 'string') {
        return content;
      }
      try {
        return JSON.parse(content);
      } catch (error) {
        return content;
      }
    },
    detailDocumentConfig() {
      if (!this.knowledgeConfing) {
        return null;
      }
      if (isTiptapDocData(this.knowledgeConfing)) {
        return {
          title: this.knowledgeConfing.title || '',
          content: this.knowledgeConfing,
          tagList: this.knowledgeConfing.tagList || [],
          fileList: this.knowledgeConfing.fileList || [],
          meta: {}
        };
      }
      const content = this.normalizedContent;
      if (isTiptapDocData(content)) {
        return {
          title: this.knowledgeConfing.title || '',
          content,
          tagList: this.knowledgeConfing.tagList || [],
          fileList: this.knowledgeConfing.fileList || [],
          meta: {
            knowledgeDocumentId: this.knowledgeConfing.knowledgeDocumentId || this.knowledgeConfing.id || null,
            knowledgeDocumentVersionId: this.knowledgeConfing.knowledgeDocumentVersionId || null,
            knowledgeDocumentTypeUuid: this.knowledgeConfing.knowledgeDocumentTypeUuid || null,
            source: this.knowledgeConfing.source || 'knowledge',
            invokeId: this.knowledgeConfing.invokeId || null
          }
        };
      }
      return {
        ...legacyLineListToEditorData(this.knowledgeConfing.lineList || [], this.knowledgeConfing),
        title: this.knowledgeConfing.title || ''
      };
    }
  },
  watch: {
    '$route.fullPath'(val, oldVal) {
      if (val !== oldVal) {
        this.reloadData();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.knowledge-detail-box {
  .detail-title {
    display: inline-block;
    max-width: 520px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
  .document-path {
    margin: 0 4px;
    font-size: 12px;
  }
  .version-main {
    max-height: 320px;
    padding: 0 16px;
  }
  .version-content {
    position: relative;
    padding-bottom: 10px;
    padding: 8px;
    margin-bottom: 6px;
    border-radius: 6px;
    &:hover {
      .btn-list {
        display: block;
      }
    }
    .btn-list {
      position: absolute;
      right: 8px;
      top: 8px;
      display: none;
    }
    .user {
      display: inline-block;
      width: 72px;
      margin-right: 4px;
    }
  }
}
</style>
