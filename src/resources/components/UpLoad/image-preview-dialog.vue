<template>
  <div>
    <ul v-if="!$utils.isEmpty(fileList)">
      <li v-for="(file) in fileList" :key="file.id">
        <span v-if="file.name" class="tsfont-attachment">
          {{ file.name }}
        </span>
        <template v-if="file.id">
          <span
            v-if="!downloadLoadingConfig[file.id]"
            v-download="downLoadUrl(file.id)"
            :title="$t('page.download')"
            class="tsfont-download text-action text-padding"
          ></span>
          <span v-if="downloadLoadingConfig[file.id]" class="action-item disable" :title="$t('page.downloadloadingtip')">
            <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
          </span>
          <span v-if="isImage(file.name)" class="tsfont-eye text-action" @click="handlePreview(file.id)"></span>
        </template>
      </li>
    </ul>
    <div v-if="!$utils.isEmpty(fileData)">
      <span
        v-if="!downloadLoading"
        v-download="downLoadUrl(fileData.id)"
        :title="$t('page.download')"
        class="icon tsfont-download text-action text-padding"
      >{{ isShowText ? $t('page.download') :'' }}</span>
      <span v-if="downloadLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
        <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
      </span>
      <span
        v-if="isImage(fileData.name)"
        class="tsfont-eye text-action icon-right"
        :title="$t('page.preview')+$t('page.image')"
        @click="handlePreview(fileData.id)"
      >{{ isShowText? $t('page.preview'):'' }}</span>
    </div>
    <TsDialog
      :title="$t('page.preview')"
      type="modal"
      :hasFooter="false"
      width="80%"
      height="80%"
      :fullscreen="true"
      :isShow="isShowPreview"
      @on-close="()=>{
        isShowPreview = false
        imgId = ''
      }"
    >
      <template v-slot>
        <div class="text-center" style="max-height: calc(100vh - 150px);max-width:100%;">
          <img
            v-if="imgId"
            :src="imgId"
            :style="{textAlign: 'center'}"
          >
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
  },
  directives: {download},
  props: {
    fileList: {
      // 文件列表
      type: Array,
      default: () => ([])
    },
    fileData: {
      // 单个文件数据 fileData: {name: 'xxx', id: 'xxx}
      type: Object,
      default: () => ({})
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
    isShowText: {
      // 是否显示下载文案
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      downloadLoadingConfig: {},
      downloadLoading: false,
      isShowPreview: false,
      imgId: ''
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
    handlePreview(id) {
      this.imgId = id ? `${HOME}/api/binary/file/download?id=${id}` : '';
      this.isShowPreview = true;
    }
  },
  filter: {},
  computed: {
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
    },
    isImage() {
      return (fileName) => {
        // 使用split方法根据点（.）分割文件名，[-1]获取最后一个元素，即后缀
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'];
        return imageExtensions.includes(fileExtension);
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
