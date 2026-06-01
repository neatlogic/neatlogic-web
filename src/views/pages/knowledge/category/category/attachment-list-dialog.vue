<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="closeDialog"
    @on-cancel="closeDialog"
  >
    <template v-slot>
      <div class="attachment-list-dialog">
        <TsTable
          :theadList="theadList"
          :tbodyList="attachmentList"
          :fixedHeader="false"
          :showPager="false"
        >
          <template v-slot:name="{ row }">
            <span v-if="downloadLoading[row.id]" class="disable" :title="$t('page.downloadloadingtip')">
              <Icon type="ios-loading" size="16" class="loading icon-right"></Icon>
              {{ row.name }}
            </span>
            <span
              v-else-if="row.id"
              v-download="downloadFileById(row.id)"
              class="text-href attachment-name"
              :title="row.name"
            >{{ row.name }}</span>
            <span v-else :title="row.name">{{ row.name }}</span>
          </template>
          <template v-slot:userUuid="{ row }">
            <UserCard v-if="row.userUuid" :uuid="row.userUuid"></UserCard>
            <span v-else>-</span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="downloadLoading[row.id]" class="disable" :title="$t('page.downloadloadingtip')">
                  <Icon type="ios-loading" size="16" class="loading"></Icon>
                </li>
                <li
                  v-else-if="row.id"
                  v-download="downloadFileById(row.id)"
                  class="tsfont-download"
                >{{ $t('page.download') }}</li>
                <li
                  v-if="isImageFile(row) && row.id"
                  class="tsfont-eye"
                  @click="previewImage(row)"
                >{{ $t('page.view') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
        <ImagePreview
          v-if="isShowImagePreview"
          :isShow="isShowImagePreview"
          :fileList="previewImageList"
          :initialIndex="previewImageIndex"
          @close="closeImagePreview"
        />
      </div>
    </template>
  </TsDialog>
</template>
<script>
import download from '@/resources/directives/download.js';
import AttachmentMixins from '@/views/pages/knowledge/category/common/attachment-mixin.js';

export default {
  name: 'AttachmentListDialog',
  components: {
    ImagePreview: () => import('@/resources/components/image-preview/index.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  directives: { download },
  mixins: [AttachmentMixins],
  props: {
    fileList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogConfig: {
        title: '查看当前文档中所有附件列表',
        width: 'medium',
        isShow: true,
        hasFooter: false
      },
      attachmentList: [],
      isShowImagePreview: false,
      previewImageIndex: 0,
      previewImageList: [],
      theadList: [
        {
          key: 'name',
          title: this.$t('page.attachmentname')
        },
        {
          key: 'userUuid',
          title: this.$t('page.uploaduser')
        },
        {
          key: 'uploadTime',
          title: this.$t('page.uploadtime'),
          type: 'time'
        },
        {
          key: 'sizeText',
          title: this.$t('page.size')
        },
        {
          key: 'action',
          width: 80
        }
      ]
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.attachmentList = this.fileList || [];
    },
    closeDialog() {
      this.$emit('close');
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
      return this.attachmentList.filter(item => this.isImageFile(item) && item.id);
    }
  }
};
</script>
<style lang="less" scoped>
.attachment-list-dialog {
  .attachment-name {
    display: inline-block;
    max-width: 100%;
  }
}
</style>
