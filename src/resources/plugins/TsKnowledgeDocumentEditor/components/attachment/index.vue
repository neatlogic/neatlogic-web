<template>
  <div class="attachment-box">
    <div class="file-content-box">
      <div>
        <span class="text-grey tsfont-attachment icon-right">文档附件：</span>
        <span class="border-primary text-href tsfont-plus add-tag" @click.stop="openUploadDialog"></span>
      </div>
      <div class="file-list-box">
        <div v-for="(item, index) in getFileList" :key="item.id" class="mr-xs ml-xs radius-sm bg-grey file-item">
          <div>
            <img
              v-if="item.contentType && item.contentType.includes('image')"
              class="img-box"
              :src="item.url"
              alt=""
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
            <span class="remove-item tsfont-close-o" @click.stop="removeFile({ index: index, fileId: item.id })"></span>
            <span
              v-if="downloadLoading[item.id]"
              class="action-item disable"
              :title="$t('page.downloadloadingtip')"
            >
              <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
            </span>
            <span v-else v-download="downloadFileById(item.id)" class="download-item tsfont-download"></span>
          </div>
        </div>
        <span v-if="fileList.length > 4" class="tsfont-option-horizontal text-href overflow" @click="handleViewAll">查看全部</span>
      </div>
    </div>
    <UploadDialog
      ref="uploadDialog"
      v-bind="fileConfig"
      @on-success="uploadSuccess"
      @on-close="closeUploadDialog"
    />
    <ViewAttachmentDialog v-if="isShowViewAttachmentDialog" :fileList="fileList" @on-close="closeViewAttachmentDialog" />
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
import AttachmentMixins from '@/resources/plugins/TsKnowledgeDocumentEditor/components/attachment/attachment-mixin.js';
export default {
  name: '',
  components: {
    UploadDialog: () => import('@/resources/components/UploadDialog/UploadDialog.vue'),
    ViewAttachmentDialog: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/components/attachment/view-attachment-dialog.vue')
  },
  directives: { download },
  mixins: [AttachmentMixins],
  props: {},
  data() {
    return {
      isShowViewAttachmentDialog: false,
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
      this.$refs.uploadDialog.showDialog();
    },
    uploadSuccess(data, file, fileList) {
      if (data.Status === 'OK') {
        this.fileList.push(data.Return);
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
      }
    },
    removeFile(index) {
      this.fileList.splice(index, 1);
    }
  },
  filter: {},
  computed: {
    getFileList() {
      return this.fileList.slice(0, 4);
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.attachment-box {
  .file-content-box {
    display: grid;
    grid-template-columns: 102px 1fr;
    align-items: center;
    grid-gap: 10px;
    .file-list-box {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
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
        cursor: pointer;
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
