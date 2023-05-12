const clipboard = {
  bind(el, binding) {
    if (!binding.arg && binding.value) {
      el.cliptext = binding.value;
    }
    const clipboardTxt = function(value) {
      let copytxt = '';
      //处理获取的数据，确保粘贴内容有效且可读
      if (typeof value !== 'string') {
        //不是字符串的先转成字符串
        try {
          copytxt = JSON.stringify(value);
        } catch (e) {
          console.error('粘贴内容不合法！');
          return;
        }
      } else {
        copytxt = value.trim();//粘贴时自动去掉首尾空格符
      }
    
      //创建textarea标签（input的value兼容性较差）
      const textarea = document.createElement('textarea');
      textarea.setAttribute('readOnly', 'true');
      
      textarea.style = 'position:fixed;pointer-events:none;z-index:-100;opacity:0;';
      document.body.appendChild(textarea);
      //处理选中事件
      textarea.value = copytxt;
      textarea.select();
      //复制
      try {
        document.execCommand('copy');
        el._tsClipboardsuccess_ && el._tsClipboardsuccess_(copytxt);
      } catch (err) {
        el._tsClipboarderror_ && el._tsClipboarderror_(copytxt);
        console.log(err);
      }
      //复制完移除标签
      document.body.removeChild(textarea);
    };
    const clickClipboard = function(e) {
      if (!binding.arg) {
        if (el.cliptext) {
          clipboardTxt(el.cliptext);
        } else {
          console.error('无可供粘贴的内容！');
        }
      }
    };
    if (binding.arg) {
      if (typeof binding.value === 'function') {
        if (binding.arg == 'error') {
          el._tsClipboarderror_ = binding.value;
        } else if (binding.arg == 'success') {
          el._tsClipboardsuccess_ = binding.value;
        }
      }
    }
    el._tsClipboardtext_ = clickClipboard;
    el.addEventListener('click', clickClipboard);
  },
  update(el, binding) {
    //如果数据更新了需要对应更新
    if (!binding.arg && JSON.stringify(binding.oldValue) != JSON.stringify(binding.value)) {
      el.cliptext = binding.value;
    }
  },
  unbind(el, binding) {
    el._tsClipboarderror_ && delete el._tsClipboarderror_;
    el._tsClipboardsuccess_ && delete el._tsClipboardsuccess_;
    if (el._tsClipboardtext_) {
      el.removeEventListener('click', el._tsClipboardtext_);
      delete el._tsClipboardtext_;
    }
  }
};
export default clipboard;

