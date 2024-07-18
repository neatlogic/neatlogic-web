<template>
  <div>
    <div v-if="!$utils.isEmpty(fileList)">
      <div v-for="(file) in fileList" :key="file.id">
        <span v-if="file.name && isShowName" class="tsfont-attachment">
          {{ file.name }}
        </span>
        <template v-if="file.id">
          <span
            v-if="!downloadLoadingConfig[file.id]"
            v-download="downLoadUrl(file.id)"
            :title="$t('page.download')"
            :class="!isShowName ? 'inline-block pt-nm' : 'text-padding'"
            class="tsfont-download text-action"
          ></span>
          <span
            v-if="downloadLoadingConfig[file.id]"
            class="action-item disable"
            :class="!isShowName ? 'inline-block pt-nm' : ''"
            :title="$t('page.downloadloadingtip')"
          >
            <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
          </span>
          <span
            v-if="isImage(file.name)"
            class="tsfont-eye text-action"
            :class="!isShowName ? 'inline-block pt-nm' : ''"
            @click="handlePreview(file.id)"
          ></span>
        </template>
      </div>
    </div>
    <div class="image-preview-box">
      <template v-if="preview">
        <image-viewer
          v-if="showViewer"
          :z-index="zIndex"
          :initial-index="imageIndex"
          :on-close="closeViewer"
          :url-list="urlList"
        />
      </template>
    </div>
  </div>
</template>
<script>
import ImageViewer from './component/image-viewer.vue';
import download from '@/resources/directives/download.js';
const isSupportObjectFit = () => document.documentElement.style.objectFit !== undefined;
const ObjectFit = {
  NONE: 'none',
  CONTAIN: 'contain',
  COVER: 'cover',
  FILL: 'fill',
  SCALE_DOWN: 'scale-down'
};
let prevOverflow = '';
export default {
  name: '',
  components: {
    ImageViewer
  },
  directives: {download},
  inheritAttrs: false,
  props: {
    src: String,
    fit: String,
    scrollContainer: {},
    fileList: {
      type: Array,
      default: () => []
    },
    zIndex: {
      type: Number,
      default: 2000
    },
    initialIndex: Number,
    isShow: {
      type: Boolean,
      default: false
    },
    fileDownloadParam: {
      // 文件下载参数
      type: Object,
      default: () => ({})
    },
    fileDownloadUrl: {
      //文件下载路径
      type: String,
      default: '/api/binary/file/download'
    },
    fileName: {
      type: String,
      default: 'name'
    },
    idName: {
      type: String,
      default: 'id'
    },
    isShowName: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      downloadLoadingConfig: {},
      downloadLoading: false,
      imageWidth: 0,
      imageHeight: 0,
      showViewer: false,
      urlList: []
    };
  },
  mounted() {
    this.loadImage();
  },
  beforeDestroy() {},
  methods: {
    handlePreview(id) {
      let initSrcUrl = `${HOME}${this.fileDownloadUrl}?id=`;
      let srcList = this.fileList.filter((a) => a && a.id && a.id !== id && this.isImage(a.name)).map((v) =>
        `${initSrcUrl}${v.id}`
      );
      let url = `${initSrcUrl}${id}`;
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.showViewer = true;
      this.urlList = [url, ...srcList];
    },
    loadImage() {
      if (this.$isServer) return;
    },
    getImageStyle(fit) {
      const { imageWidth, imageHeight } = this;
      const {
        clientWidth: containerWidth,
        clientHeight: containerHeight
      } = this.$el;
      if (!imageWidth || !imageHeight || !containerWidth || !containerHeight) return {};
      const imageAspectRatio = imageWidth / imageHeight;
      const containerAspectRatio = containerWidth / containerHeight;
      if (fit === ObjectFit.SCALE_DOWN) {
        const isSmaller = imageWidth < containerWidth && imageHeight < containerHeight;
        fit = isSmaller ? ObjectFit.NONE : ObjectFit.CONTAIN;
      }
      switch (fit) {
        case ObjectFit.NONE:
          return { width: 'auto', height: 'auto' };
        case ObjectFit.CONTAIN:
          return (imageAspectRatio < containerAspectRatio) ? { width: 'auto' } : { height: 'auto' };
        case ObjectFit.COVER:
          return (imageAspectRatio < containerAspectRatio) ? { height: 'auto' } : { width: 'auto' };
        default:
          return {};
      }
    },
    clickHandler() {
      if (!this.preview) {
        return;
      }
      // prevent body scroll
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.showViewer = true;
    },
    closeViewer() {
      document.body.style.overflow = prevOverflow;
      this.showViewer = false;
      this.$emit('close');
    }
  },
  computed: {
    imageStyle() {
      const { fit } = this;
      if (!this.$isServer && fit) {
        return isSupportObjectFit()
          ? { 'object-fit': fit }
          : this.getImageStyle(fit);
      }
      return {};
    },
    alignCenter() {
      return !this.$isServer && !isSupportObjectFit() && this.fit !== ObjectFit.FILL;
    },
    preview() {
      const { fileList } = this;
      return Array.isArray(fileList) && fileList.length > 0;
    },
    imageIndex() {
      let previewIndex = 0;
      const initialIndex = this.initialIndex;
      if (initialIndex >= 0) {
        previewIndex = initialIndex;
        return previewIndex;
      }
      return previewIndex;
    },
    isImage() {
      return (fileName) => {
        // 使用split方法根据点（.）分割文件名，[-1]获取最后一个元素，即后缀
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'];
        return imageExtensions.includes(fileExtension);
      };
    },
    downLoadUrl() {
      return (id) => {
        let params = {
          id: id
        };
        if (!this.$utils.isEmpty(this.fileDownloadParam)) {
          params = this.fileDownloadParam;
        }
        return {
          url: this.fileDownloadUrl,
          params: params,
          changeStatus: status => {
            if (status == 'start') {
              this.downloadLoading = true;
              this.$set(this.downloadLoadingConfig, [id], true);
            } else if (status == 'success' || status == 'error') {
              this.downloadLoading = false;
              this.$set(this.downloadLoadingConfig, [id], false);
            }
          }
        };
      };
    }
  },
  watch: {
    isShow: {
      handler(val) {
        if (val) {
          prevOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
          this.showViewer = true;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import url('./component/image-preview.less');
</style>
