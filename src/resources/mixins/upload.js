import axios from '@/resources/api/http.js';
import { $t } from '@/resources/init.js';
export default {
  methods: {
    upload(url, params, headers, successFn, failedFn, startFn, processingFn) {
      const formData = new FormData();
      if (params && typeof params === 'object') {
        for (let k in params) {
          if (params[k] instanceof Array) {
            if (params[k].length > 0) {
              if (params[k][0] instanceof File) {
                for (let i = 0; i < params[k].length; i++) {
                  formData.append(k, params[k][i]);
                }
              } else {
                formData.append(k, params[k]);
              }
            }
          } else {
            formData.append(k, params[k]);
          }
        }
      }
      if (startFn && typeof startFn == 'function') {
        if (!startFn()) {
          return false;
        }
      }
      axios
        .post(url, formData, {
          headers: {
            ...(headers || {}),
            'Content-Type': 'multipart/form-data' // 设置文件上传格式，在axios1.7.7版本中，不会自动设置请求头类型，需要手动设置，否则会导致文件上传失败
          },
          responseType: 'blob',
          contentType: 'multipart/form-data',
          onDownloadProgress: (progressEvent) => {
            if (processingFn && typeof processingFn == 'function') {
              processingFn(progressEvent);
            }
          }
        })
        .then(async res => {
          let {status = '', data = {}} = res || {};
          let {type = ''} = data || {};
          if (status == '200') {
            if (data && (type == 'application/json')) {
              const text = await data.text();
              const jsonText = await JSON.parse(text);
              if (successFn && typeof successFn == 'function') {
                successFn(jsonText);
              }
            } else {
              //处理返回的文件流
              const aLink = document.createElement('a');
              let blob = new Blob([data], {
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
          let {data = {}} = error || {};
          let {type = ''} = data || {};
          if (type === 'application/json') {
            const text = await data.text();
            const jsonText = await JSON.parse(text);
            ViewUI.Notice.error({
              title: '',
              desc: jsonText.Message || $t('message.uploadfailed')
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
