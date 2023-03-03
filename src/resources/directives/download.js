import axios from '@/resources/api/http.js';
import qs from 'qs';
import ViewUI from 'techsure-ui/iview/index.js';
const download = {
  bind(el, binding) {
    if (!binding.arg && binding.value) {
      el.downparam = binding.value;
    }
    const downloadUrl = function(params) {
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
              params.changeStatus && params.changeStatus('progress', progressEvent);//数据正在导出
            }})
          .then(res => {
            el._tsDownloadsuccess_ && el._tsDownloadsuccess_();
            if (res.status == '200') {
              const aLink = document.createElement('a');
              let blob = new Blob([res.data], {
                type: 'application/octet-stream'
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
              URL.revokeObjectURL(aLink);
            }
            params.changeStatus && params.changeStatus('success', null);
          })
          .catch(async error => {
            el._tsDownloaderror_ && el._tsDownloaderror_(error);
            if (error.data && error.data.type === 'application/json') { // 修复控制台报错问题
              const text = await error.data.text();
              const jsonText = await JSON.parse(text);
              ViewUI.Notice.error({
                title: '',
                desc: jsonText.Message || '下载失败'
              });
            } else {
              ViewUI.Notice.error({
                title: '',
                desc: '下载失败'
              });
            }
            params.changeStatus && params.changeStatus('error', null);
          }); 
      }
    };

    const clickDownload = function(e) {
      if (el._tsPreventDownload_ === true) return;
      //这里的先判断是否有拓展参数再根据拓展参数写死判断是成功还是失败事件（不然会有值错误或者方法返回错误导致的异常和脚本注入）
      if (!binding.arg) {
        if (el.downparam) {
          downloadUrl(el.downparam);
        } else {
          console.error('缺少下载地址');
        }
      } else {
        if (binding.arg) {
          if (typeof binding.value === 'function') {
            if (binding.arg == 'error') {
              el._tsDownloaderror_ = binding.value;
            } else if (binding.arg == 'success') {
              el._tsDownloadsuccess_ = binding.value;
            }
          }
        }
      }
    };
    el._tsDownloadresource_ = clickDownload;
    el.addEventListener('click', clickDownload);
  },
  update(el, binding) {
    //如果数据更新了需要对应更新
    if (!binding.arg && JSON.stringify(binding.oldValue) != JSON.stringify(binding.value)) {
      el.downparam = binding.value;
    }
    if (binding.arg == 'prevent' && binding.value != undefined) {
      el._tsPreventDownload_ = binding.value;
      if (el._tsPreventDownload_) {
        el.classList.add('text-disabled');
      } else {
        el.classList.remove('text-disabled');
      }
    }
  },
  unbind(el, binding) {
    el._tsDownloaderror_ && delete el._tsDownloaderror_;
    el._tsDownloadsuccess_ && delete el._tsDownloadsuccess_;
    el._tsPreventDownload_ && delete el._tsPreventDownload_;
    if (el._tsDownloadresource_) {
      el.removeEventListener('click', el._tsDownloadresource_);
      delete el._tsDownloadresource_;
      delete el.downparam;
    }
  }
};
export default download;
