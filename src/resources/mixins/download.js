import axios from '@/resources/api/http.js';
import qs from 'qs';
export default {
  methods: {
    download(params) {
      let _this = this;
      let url = '';
      let param = {};
      let method = 'post';
      //传过来的参数有可能是地址也可能是地址+参数，数据格式为：{url:地址, params:{参数}, method: 'get'|'post' }
      if (typeof params !== 'string') {
        url = params.url;
        param = params.params;
        method = params.method || 'post';
      } else {
        url = params;
        method = 'get';
      }
      if (method.toLocaleLowerCase() === 'get') {
        const aLink = document.createElement('a');
        aLink.download = true;
        aLink.href = url + '?' + qs.stringify(param, { skipNulls: true });
        document.body.appendChild(aLink);
        aLink.click();
        aLink.remove();
      } else {
        params.changeStatus && params.changeStatus('start', null);//开始导出时调用的 ,主要用来标志导出的状态，用来外部的操作
        axios
          .post(url, param, {
            responseType: 'blob',
            onDownloadProgress: function(progressEvent) { // `onDownloadProgress` 允许为下载处理进度事件
              params.changeStatus && params.changeStatus('progress', progressEvent);
            }
          })
          .then(res => {
            _this.downloadSuccess();
            if (res.status == '200') {
              const aLink = document.createElement('a');
              let blob = new Blob([res.data], {
                type: 'application/x-msdownload'
              });
              aLink.href = URL.createObjectURL(blob);
              //content-disposition的返回数据格式为: attachment; filename="名字“ ，通过截取filenamefileName）=后的字符串去掉首位引号获取名字
              let contentDisposition = decodeURI(res.headers['content-disposition']);
              let filePath = '';
              filePath = contentDisposition.indexOf('filename=') > -1 ? contentDisposition.split('filename=')[1] : contentDisposition.split('fileName=')[1];
              let fileName = filePath.substring(1, filePath.length - 1);
              aLink.download = fileName;
              document.body.appendChild(aLink);
              aLink.click();
              aLink.remove();
            }
            params.changeStatus && params.changeStatus('success', null);
          })
          .catch(async error => {
            _this.downloadError(error);
            if (error.data.type === 'application/json') {
              const text = await error.data.text();
              const jsonText = await JSON.parse(text);
              ViewUI.Notice.error({
                title: '',
                desc: jsonText.Message || '下载失败'
              });
            }
            params.changeStatus && params.changeStatus('error', null);
          });
      }
    },
    downloadSuccess() {
    },
    changeDownloaStatus(status, event) {
    },
    downloadError(error) {
    }
  }
};

