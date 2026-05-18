<template>
  <div class="attachment-box">
    <div class="file-content-box">
      <div>
        <span class="text-grey tsfont-attachment icon-right">文档附件：</span>
        <span v-if="!readonly" class="border-primary text-href tsfont-plus add-tag" @click.stop="openUploadDialog"></span>
      </div>
      <div class="file-list-box">
        <div
          v-for="(item, index) in getFileList"
          :key="item.id"
          class="radius-sm bg-grey file-item"
          :class="{ 'is-image': isImageFile(item) && item.id }"
          @click.stop="previewImage(item)"
        >
          <div>
            <img
              v-if="isImageFile(item) && !item._imageLoadError"
              class="img-box"
              :src="getImageUrl(item)"
              :title="$t('page.preview')"
              alt=""
              @error="handleImageLoadError(item)"
            />
            <span v-else class="icon-box" :class="getFileType(item.ext)"></span>
          </div>
          <div class="file-info-box">
            <div>
              {{ ellipsisFileName(item.name) }}
            </div>
            <div class="text-grey" style="font-size: 12px;">{{ item.sizeText }}</div>
          </div>
          <div>
            <span v-if="!readonly" class="remove-item tsfont-close-o" @click.stop="removeFile({ index: index, fileId: item.id })"></span>
            <span
              v-if="downloadLoading[item.id]"
              class="action-item disable"
              :title="$t('page.downloadloadingtip')"
            >
              <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
            </span>
            <span
              v-else
              v-download="downloadFileById(item.id)"
              class="download-item tsfont-download"
              @click.stop
            ></span>
          </div>
        </div>
        <span v-if="fileList.length > 4" class="tsfont-option-horizontal text-href overflow" @click="handleViewAll">查看全部</span>
      </div>
    </div>
    <UploadDialog
      v-if="!readonly"
      ref="uploadDialog"
      v-bind="fileConfig"
      @on-success="uploadSuccess"
      @on-close="closeUploadDialog"
    />
    <ViewAttachmentDialog v-if="isShowViewAttachmentDialog" :fileList="fileList" @on-close="closeViewAttachmentDialog" />
    <ImagePreview
      v-if="isShowImagePreview"
      :isShow="isShowImagePreview"
      :fileList="previewImageList"
      :initialIndex="previewImageIndex"
      @close="closeImagePreview"
    />
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
import AttachmentMixins from '@/views/pages/knowledge/category/knowledgeeditor/components/attachment/attachment-mixin.js';
export default {
  name: '',
  components: {
    ImagePreview: () => import('@/resources/components/image-preview/index.vue'),
    UploadDialog: () => import('@/resources/components/UploadDialog/UploadDialog.vue'),
    ViewAttachmentDialog: () => import('@/views/pages/knowledge/category/knowledgeeditor/components/attachment/view-attachment-dialog.vue')
  },
  directives: { download },
  mixins: [AttachmentMixins],
  props: {
    list: { type: Array, default: () => [] },
    readonly: { type: Boolean, default: false }
  },
  data() {
    return {
      isShowViewAttachmentDialog: false,
      isShowImagePreview: false,
      previewImageIndex: 0,
      previewImageList: [],
      downloadLoading: {},
      fileList: [],
      fileConfig: {
        //上传附件配置
        actionUrl: BASEURLPREFIX + '/api/binary/file/upload',
        data: {
          param: 'file'
        },
        dataType: 'knowledge'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    openUploadDialog() {
      if (this.readonly) {
        return;
      }
      this.$refs.uploadDialog.showDialog();
    },
    uploadSuccess(data, file, fileList) {
      if (this.readonly) {
        return;
      }
      if (data.Status === 'OK') {
        this.fileList.push(data.Return);
        this.$emit('change', this.fileList);
      }
    },
    closeUploadDialog() {
      this.$emit('on-close', this.fileList);
    },
    handleViewAll() {
      this.isShowViewAttachmentDialog = true;
    },
    closeViewAttachmentDialog({needRefresh = false, fileList = []} = {}) {
      this.isShowViewAttachmentDialog = false;
      if (needRefresh) {
        this.fileList = fileList;
        this.$emit('change', this.fileList);
      }
    },
    previewImage(file) {
      if (!this.isImageFile(file) || !file.id) {
        return;
      }
      const imageList = this.getImagePreviewList();
      const index = imageList.findIndex(item => item.id == file.id);
      this.previewImageList = imageList;
      this.previewImageIndex = index > -1 ? index : 0;
      this.isShowImagePreview = true;
    },
    closeImagePreview() {
      this.isShowImagePreview = false;
      this.previewImageList = [];
    },
    getImagePreviewList() {
      return this.fileList.filter(item => this.isImageFile(item) && item.id);
    },
    removeFile({ index }) {
      if (this.readonly) {
        return;
      }
      this.fileList.splice(index, 1);
      this.$emit('change', this.fileList);
    },
    getFileIdList() {
      return this.fileList.map(item => item.id).filter(id => id !== null && id !== undefined);
    },
    getAttachmentList() {
      return this.fileList;
    }
  },
  filter: {},
  computed: {
    getFileList() {
      return this.fileList.slice(0, 4);
    }
  },
  watch: {
    list: {
      handler(val) {
        this.fileList = Array.isArray(val) ? this.$utils.deepClone(val) : [];
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.attachment-box {
  .file-content-box {
    display: flex;
    align-items: center;
    .file-list-box {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 12px;
      .img-box {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 5px;
        object-fit: cover;
      }
      .icon-box {
        font-size: 20px;
        color: skyblue;
      }
      .file-item {
        position: relative;
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        gap: 6px;
        width: 180px;
        padding: 8px 10px;
        cursor: default;
        .file-info-box {
          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
          width: 100%;
        }
        .remove-item,
        .download-item {
          position: absolute;
          right: 10px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: none;
        }
        .remove-item {
          top: -10px;
        }
        .download-item {
          top: 9px;
        }
        &.is-image {
          cursor: pointer;
        }
        &:hover {
          .remove-item,
          .download-item {
            display: block;
          }
        }
      }
    }
    .add-tag {
      border: 1px solid;
      border-radius: 2px;
      &:before {
        margin-right: 0px;
      }
    }
  }
}
</style>
