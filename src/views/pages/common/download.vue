<template>
  <div class="download-box">
    <ul class="download-ul text-center">
      <li class="download-bg-common" :class="downloadBg[downloadProcess]"></li>
      <li>{{ downloadText[downloadProcess] }}</li>
    </ul>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
  },
  mixins: [download],
  props: {},
  data() {
    return {
      downloadProcess: 'start',
      downloadText: {
        start: this.$t('page.downloading'),
        success: this.$t('page.download') + this.$t('page.complete'),
        error: this.$t('page.download') + this.$t('page.fail')
      },
      downloadBg: {
        start: 'downloading-bg',
        success: 'download-success-bg',
        error: 'download-fail-bg'
      }
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (query && !this.$utils.isEmptyObj(query)) {
      // 下载包地址
      this.copyDownloadPackUrl(query);
    }
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
    copyDownloadPackUrl(param) {
      const downloadParams = {
        url: '/api/binary/deploy/version/resource/file/download',
        params: param,
        changeStatus: status => {
          if (status == 'start') {
            this.downloadProcess = status;
          } else if (status == 'success' || status == 'error') {
            this.downloadProcess = status;
          }
        }
      };
      this.download(downloadParams);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.download-box {
  position: relative;
  .download-ul {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .download-bg-common {
    display: inline-block;
    width: 190px;
    height: 130px;
  }
  .download-success-bg {
    background: url('~img-module/img/common/download-success-default.png') no-repeat center center;
    background-size: 100%;
  }
  .download-fail-bg {
    background: url('~img-module/img/common/download-fail-default.png') no-repeat center center;
    background-size: 100%;
  }
  .downloading-bg {
    background: url('~img-module/img/common/downloading-default.png') no-repeat center center;
    background-size: 100%;
  }
  .theme-dark & {
      .download-success-bg {
        background: url('~img-module/img/common/download-success-dark.png') no-repeat center center;
        background-size: 100%;
    }
    .download-fail-bg {
      background: url('~img-module/img/common/download-fail-dark.png') no-repeat center center;
      background-size: 100%;
    }
    .downloading-bg {
      background: url('~img-module/img/common/downloading-dark.png') no-repeat center center;
      background-size: 100%;
    }
  }
}
</style>
