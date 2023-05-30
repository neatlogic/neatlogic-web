export default {
  methods: {
    copyWorkingPath(item) {
      let param = {
        uuid: item.uuid
      };
      let _this = this;
      // if (item.workingCopyPath) {
      //   _this.clipboardTxt(item.workingCopyPath);
      // } else {
      this.$api.codehub.repository.getWorkingcopypath(param).then(res => {
        if (res && res.Status == 'OK') {
          _this.$set(item, 'workingCopyPath', res.Return.workingCopyPath);
          _this.clipboardTxt(res.Return.workingCopyPath);
        }
      });
      //}
    },
    clipboardTxt(value) {
      let copytxt = '';
      let _this = this;
      if (typeof value !== 'string') {
        try {
          copytxt = JSON.stringify(value);
        } catch (e) {
          console.error('粘贴内容不合法！');
          return;
        }
      } else {
        copytxt = value.trim();
      }
      const textarea = document.createElement('textarea');
      textarea.setAttribute('readOnly', 'true');
      textarea.style = 'position:fixed;pointer-events:none;z-index:-100;opacity:0;';
      document.body.appendChild(textarea);
      textarea.value = copytxt;
      textarea.select();
      try {
        document.execCommand('copy');
        _this.copyok();
      } catch (err) {
        console.log(err);
      }
      //复制完移除标签
      document.body.removeChild(textarea);
    },
    updateNode(item) {
      let param = {
        uuid: item.uuid,
        pull: true
      };
      let _this = this;
      _this.$createDialog({
        title: '确认切换节点',
        content: '是否确认切换？',
        btnType: 'error',
        'on-ok': function(vnode) {
          _this.$api.codehub.repository.updateNode(param).then(res => {
            if (res && res.Status == 'OK') {
              item.agentId = res.Return.newAgentId;
              item.agentName = res.Return.newAgentName;
              _this.$Message.success('节点切换成功');
            } else {
              _this.$Message.error(res.Message);
            }
          }).finally(e => {
            vnode.isShow = false;
          });
        }
      });
    }
  }

};
