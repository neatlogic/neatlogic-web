import axios from '@/resources/api/http.js';
export default {
  methods: {
    upload(url, params, headers, successFn, failedFn, startFn, processingFn) {
      let _this = this;
      let method = 'post';
      const formData = new FormData();
      if (params && typeof params === 'object') {
        for (let k in params) {
          formData.append(k, params[k]);
        }
      }
      if (startFn && typeof startFn == 'function') {
        if (!startFn()) {
          return false;
        }
      }
      axios
        .post(url, formData, {
          headers: headers || {},
          responseType: 'blob',
          contentType: 'multipart/form-data',
          onDownloadProgress: (progressEvent) => {
            if (processingFn && typeof processingFn == 'function') {
              processingFn(progressEvent);
            }
          }
        })
        .then(async res => {
          if (res.status == '200') {
            if (res.data.type == 'application/json') {
              const text = await res.data.text();
              const jsonText = await JSON.parse(text);
              if (successFn && typeof successFn == 'function') {
                successFn(jsonText);
              }
            } else {
              //处理返回的文件流
              const aLink = document.createElement('a');
              let blob = new Blob([res.data], {
                type: 'application/octet-stream'
              });
              aLink.href = URL.createObjectURL(blob);
              let contentDisposition = decodeURI(res.headers['content-disposition']);
              let filePath = '';
              filePath = contentDisposition.indexOf('filename=') > -1 ? contentDisposition.split('filename=')[1] : contentDisposition.split('fileName=')[1];
              let fileName = filePath.substring(1, filePath.length - 1);
              aLink.download = fileName;
              document.body.appendChild(aLink);
              aLink.click();
              aLink.remove();
              if (successFn && typeof successFn == 'function') {
                successFn();
              }
            }
          }
        })
        .catch(async error => {
          if (error.data.type === 'application/json') {
            const text = await error.data.text();
            const jsonText = await JSON.parse(text);
            ViewUI.Notice.error({
              title: '',
              desc: jsonText.Message || '上传失败'
            });
            if (failedFn && typeof failedFn == 'function') {
              failedFn(jsonText);
            }
          } else {
            if (failedFn && typeof failedFn == 'function') {
              failedFn();
            }
          }
        });
    }
  }
};
