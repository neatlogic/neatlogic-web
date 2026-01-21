<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="closeDialog"
    @on-cancel="closeDialog"
    @on-ok="okDialog"
  >
    <template v-slot>
      <div class="view-attachment-box">
        <div v-for="(item, index) in attachmentList" :key="item.id" class="radius-sm bg-op file-item">
          <div>
            <img
              v-if="item.contentType && item.contentType.includes('image')"
              class="img-box"
              :src="item.url"
              alt=""
            />
            <span v-else class="icon-box text-primary" :class="getFileType(item.ext)"></span>
          </div>
          <div class="file-info-box">
            <div>
              {{ ellipsisFileName(item.name) }}
            </div>
            <div class="text-grey" style="font-size: 12px;">{{ item.sizeText }}</div>
          </div>
          <div>
            <span class="remove-item tsfont-close-o" @click.stop="removeFile(index)"></span>
            <span v-if="downloadLoading[item.id]" class="action-item disable" :title="$t('page.downloadloadingtip')">
              <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
            </span>
            <span v-else v-download="downloadFileById(item.id)" class="download-item tsfont-download"></span>
          </div>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import download from '@/resources/directives/download.js';
import AttachmentMixins from '@/resources/plugins/TsKnowledgeDocumentEditor/components/attachment/attachment-mixin.js';
export default {
  name: '',
  components: {},
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
        title: '查看所有附件',
        width: 'medium',
        isShow: true
      },
      attachmentList: [],
      deleteFileIdMap: new Set()
    };
  },
  beforeCreate() {},
  created() {
    this.initData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      this.attachmentList = this.$utils.deepClone(this.fileList || []);
    },
    closeDialog() {
      this.$emit('on-close');
    },
    okDialog() {
      this.$emit('on-close', {
        needRefresh: true,
        fileList: this.attachmentList
      });
    },
    removeFile(index) {
      this.attachmentList.splice(index, 1);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
  .view-attachment-box {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    padding: 10px 0;
    .img-box {
      display: inline-block;
      width: 25px;
      height: 25px;
      margin-right: 10px;
      border-radius: 5px;
      object-fit: cover;
    }
    .icon-box {
      font-size: 25px;
      margin-right: 10px;
    }
    .file-item {
      position: relative;
      display: flex;
      align-items: center;
      width: 180px;
      padding: 10px;
      cursor: pointer;
      &:nth-child(4n) {
        padding-right: 0;
      }
      .remove-item,
      .download-item {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: none;
      }
      .remove-item {
        top: -8px;
        right: 10px;
      }
      .download-item {
        top: 11px;
        right: 10px;
      }
      &:hover {
        .remove-item,
        .download-item {
          display: block;
        }
      }
    }
  }

</style>
