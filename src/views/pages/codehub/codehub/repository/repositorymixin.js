export default {
  methods: {
    copyWorkingPath(item) {
      let param = {
        id: item.id
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
        this.copyok();
      } catch (err) {
        console.log(err);
      }
      //复制完移除标签
      document.body.removeChild(textarea);
    },
    updateNode(item) {
      let param = {
        id: item.id,
        pull: true
      };
      this.$createDialog({
        title: this.$t('page.tip'),
        content: this.$t('dialog.content.executeaction'),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.codehub.repository.updateNode(param).then(res => {
            if (res && res.Status == 'OK') {
              item.runnerId = res.Return.oldRunnerId;
              item.runnerName = res.Return.oldRunnerName;
              this.$Message.success(this.$t('message.executesuccess'));
            }
          }).finally(e => {
            vnode.isShow = false;
          });
        }
      });
    }
  }

};
