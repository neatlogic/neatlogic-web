export default {
  methods: {
    copyWorkingPath(item) {
      let param = {
        uuid: item.uuid
      };
      this.$api.codehub.repository.getWorkingcopypath(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(item, 'workingCopyPath', res.Return.workingCopyPath);
          this.clipboardTxt(res.Return.workingCopyPath);
        }
      });
    },
    clipboardTxt(value) {
      let copytxt = '';
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
      this.$createDialog({
        title: this.$t('page.tip'),
        content: this.$t('dialog.content.executeaction'),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.repository.updateNode(param).then(res => {
            if (res && res.Status == 'OK') {
              item.agentId = res.Return.newAgentId;
              item.agentName = res.Return.newAgentName;
              this.$Message.success($t('message.executesuccess'));
            } else {
              this.$Message.error(res.Message);
            }
          }).finally(e => {
            vnode.isShow = false;
          });
        }
      });
    }
  }

};
