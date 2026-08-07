import axios from '@/resources/api/http.js';
import qs from 'qs';
import ViewUI from 'neatlogic-ui/iview/index.js';
import { $t } from '@/resources/init.js';
import { downloadBlobFile } from '@/resources/assets/js/downloadUtil.js';
const download = {
  bind(el, binding) {
    if (!binding.arg && binding.value) {
      el.downparam = binding.value;
    }
    const downloadUrl = params => {
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
        params.changeStatus && params.changeStatus('start', null); //开始导出时调用的 ,主要用来标志导出的状态，用来外部的操作
        axios
          .post(url, param, {
            responseType: 'blob',
            onDownloadProgress: progressEvent => {
              // `onDownloadProgress` 允许为下载处理进度事件
              params.changeStatus && params.changeStatus('progress', progressEvent); //数据正在导出
            }
          })
          .then(res => {
            el._tsDownloadsuccess_ && el._tsDownloadsuccess_();
            if (res.status == '200') {
              downloadBlobFile(res.data, {
                contentDisposition: res.headers['content-disposition']
              });
            } else if (res.status == '220') {
              ViewUI.Notice.success({
                duration: 0,
                title: '',
                render: h => {
                  return h('span', [$t('page.backgroundexportprefix'), h('a', {attrs: {href: HOME + '/framework.html#/user-export-file-manage', target: '_blank'}}, $t('page.exportmanage')), $t('page.backgroundexportsuffix')]);
                }
              });
            }
            params.changeStatus && params.changeStatus('success', null);
          })
          .catch(async error => {
            el._tsDownloaderror_ && el._tsDownloaderror_(error);
            if (error.data && error.data.type === 'application/json') {
              // 修复控制台报错问题
              const text = await error.data.text();
              const jsonText = await JSON.parse(text);
              ViewUI.Notice.error({
                title: '',
                desc: jsonText.Message || $t('page.downloadfailed')
              });
            } else {
              console.error($t('page.filedownloadfailed'), error);
            }
            params.changeStatus && params.changeStatus('error', null);
          });
      }
    };

    const clickDownload = e => {
      if (el._tsPreventDownload_ === true) return;
      //这里的先判断是否有拓展参数再根据拓展参数写死判断是成功还是失败事件（不然会有值错误或者方法返回错误导致的异常和脚本注入）
      if (!binding.arg) {
        if (el.downparam) {
          downloadUrl(el.downparam);
        } else {
          console.error($t('page.missingdownloadurl'));
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
