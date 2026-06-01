export default {
  data() {
    return {
      downloadLoading: {}
    };
  },
  methods: {
    getFileType(fileType) {
      const fileTypeMap = {
        video: 'tsfont-mm-mp4',
        pdf: 'tsfont-mm-pdf',
        bat: 'tsfont-mm-bat',
        bmp: 'tsfont-mm-bmp',
        cls: 'tsfont-mm-cls',
        cmd: 'tsfont-mm-cmd',
        cnf: 'tsfont-mm-cnf',
        css: 'tsfont-mm-css',
        dir: 'tsfont-mm-dir',
        doc: 'tsfont-mm-doc',
        docx: 'tsfont-mm-docx',
        exe: 'tsfont-mm-exe',
        gif: 'tsfont-mm-gif',
        gzip: 'tsfont-mm-gzip',
        html: 'tsfont-mm-html',
        java: 'tsfont-mm-java',
        jpeg: 'tsfont-mm-jpeg',
        jpg: 'tsfont-mm-jpg',
        js: 'tsfont-mm-js',
        misc: 'tsfont-mm-misc',
        mov: 'tsfont-mm-mov',
        mp4: 'tsfont-mm-mp4',
        png: 'tsfont-mm-png',
        ppt: 'tsfont-mm-ppt',
        py: 'tsfont-mm-py',
        rar: 'tsfont-mm-rar',
        rpm: 'tsfont-mm-rpm',
        rtf: 'tsfont-mm-rtf',
        sh: 'tsfont-mm-sh',
        sql: 'tsfont-mm-sql',
        svg: 'tsfont-mm-svg',
        tar: 'tsfont-mm-tar',
        txt: 'tsfont-mm-txt',
        vbs: 'tsfont-mm-vbs',
        xls: 'tsfont-mm-xls',
        xlsm: 'tsfont-mm-xlsm',
        xlsx: 'tsfont-mm-xlsx',
        xml: 'tsfont-mm-xml',
        zip: 'tsfont-mm-zip'
      };
      const tolowerFileType = fileType?.toLowerCase();
      return fileTypeMap[tolowerFileType] || 'tsfont-mm-unknown';
    },
    isImageFile(file) {
      const { contentType = '', ext = '', name = '' } = file || {};
      if (contentType && contentType.toLowerCase().includes('image')) {
        return true;
      }
      if (this.$utils.isImage(name || ext)) {
        return true;
      }
      return ['bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp'].includes(String(ext || '').toLowerCase());
    },
    getImageUrl(file) {
      const { id = '', url = '' } = file || {};
      const homePrefix = HOME && HOME !== '/' ? HOME : '';
      if (url) {
        if (/^(https?:)?\/\//.test(url) || (homePrefix && url.indexOf(homePrefix + '/') === 0)) {
          return url;
        }
        return url.indexOf('/') === 0 ? homePrefix + url : homePrefix + '/' + url;
      }
      if (!id) {
        return '';
      }
      return homePrefix + '/api/binary/file/download?id=' + encodeURIComponent(id);
    },
    handleImageLoadError(file) {
      if (file) {
        this.$set(file, '_imageLoadError', true);
      }
    },
    ellipsisFileName(fileName, maxLength = 20, front = 4, back = 7, ellipsis = '...') {
      if (!fileName || fileName.length <= maxLength) {
        return fileName;
      }

      if (front + back + ellipsis.length > maxLength) {
        front = Math.floor((maxLength - ellipsis.length) / 2);
        back = maxLength - ellipsis.length - front;
      }

      return fileName.slice(0, front) + ellipsis + fileName.slice(fileName.length - back);
    }
  },
  computed: {
    downloadFileById() {
      return id => {
        return {
          url: '/api/binary/file/download',
          params: { id },
          changeStatus: status => {
            if (status === 'start') {
              this.$set(this.downloadLoading, id, true);
            } else if (status === 'success' || status === 'error') {
              this.$set(this.downloadLoading, id, false);
            }
          }
        };
      };
    }
  }
};
