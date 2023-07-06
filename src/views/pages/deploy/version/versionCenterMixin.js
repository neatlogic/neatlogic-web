// 版本中心公用方法
export default {
  data() {
    return {
      projectDirectoryParams: {
        id: null
      },
      isShowProjectDirectoryDialog: false
    };
  },
  methods: {
    switchLockVersion(id, isFreeze) {
      // 开封版
      if (id) {
        this.$api.deploy.version.unLockVersion({ id, isFreeze }).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
          }
        });
      }
    },
    deleteVersion(id, name, isBack = false) {
      // isBack 删除成功后，是否是返回上一个
      if (id && name) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', { target: name }),
          btnType: 'error',
          'on-ok': vnode => {
            vnode.isShow = false;
            this.$api.deploy.version.deleteVersion({ id }).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                if (isBack == true) {
                  this.$back('/version-center-manage'); // 版本中心详情页面，删除成功后，返回到列表页面
                } else {
                  this.changeCurrent();
                }
              }
            });
          }
        });
      }
    },
    openProjectDirectoryDialog(id) {
      if (id) {
        this.projectDirectoryParams.id = id;
        this.isShowProjectDirectoryDialog = true;
      }
    }
  }
};
