<template>
  <div :class="hasBg ? 'bg-op radius-sm padding' : ''">
    <div class="header-box pb-nm">
      <div :class="[hasAllAuth ? 'left-box' : 'left-content-box']">
        <Breadcrumb separator=">">
          <BreadcrumbItem v-for="(item, index) in pathList" :key="index">
            <Icon v-if="item.name == 'HOME'" type="ios-home-outline"></Icon>
            <span class="text-action" @click="breadCrumbsClick(index)">{{ item.name }}</span>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div class="action-group" :class="[hasAllAuth ? 'right-box' : 'right-content-box']">
        <div v-if="!isPackDownload" v-download="packDownloadFile" class="action-item tsfont-download">{{ $t('term.deploy.packagedownload') }}</div>
        <div v-if="isPackDownload" class="action-item disable" :title="$t('page.downloadloadingtip')">
          <Icon type="ios-loading" size="18" class="loading"></Icon>{{ $t('page.downloading') }}
        </div>
        <template v-if="hasAllAuth">
          <div class="action-item tsfont-plus" @click="openRenameDialog">{{ $t('term.deploy.newfolder') }}</div>
          <div class="action-item tsfont-upload" @click="openUploadFile">{{ $t('page.uploadfile') }}</div>
          <div class="action-item tsfont-upload" @click="openUploadDialogDecompress">{{ $t('term.deploy.uploadthefileandextractit') }}</div>
        </template>
        <div v-clipboard="copyDownloadUrl" class="action-item tsfont-copy" @click="copyDownloadPackUrl">{{ $t('term.deploy.copythedownloadpackageaddress') }}</div>
      </div>
    </div>
    <TsTable
      v-bind="tableData"
      :theadList="theadList"
    >
      <template slot="name" slot-scope="{row}">
        <span v-if="row.type == 'd'" class="tsfont-folder-o text-href" @click="openFolder(row)">{{ row.name }}</span>
        <template v-if="row.type == 'f'">
          <span
            v-if="!row.isDownloading"
            v-download="downloadFile(row, row.name)"
            class="tsfont-download text-action"
          ></span>
          <span v-if="row.isDownloading" class="action-item disable" :title="$t('page.downloadloadingtip')">
            <Icon type="ios-loading" size="18" class="loading"></Icon>{{ $t('page.downloading') }}
          </span>
          <span class="text-action pl-xs" @click="gotoPreview(row)">{{ row.name }}</span>
        </template>
      </template>
      <template slot="size" slot-scope="{row}">
        <span>{{ bytesToSize(row.size) }}</span>
      </template>
      <template slot="action" slot-scope="{row}">
        <div class="tstable-action">
          <ul v-show="hasAllAuth" class="tstable-action-ul">
            <li class="tsfont-edit" @click="editRename(row.name)">{{ $t('page.rename') }}</li>
            <li class="tsfont-yunweishenjishebei" @click="openAuthEditDialog(row)">{{ $t('page.auth') }}</li>
            <li class="tsfont-copy" @click="openCopyDialog(row, 'copy')">{{ $t('page.copy') }}</li>
            <li class="tsfont-arrow-right" @click="openCopyDialog(row, 'move')">{{ $t('page.move') }}</li>
            <li class="tsfont-trash-o" @click="delRow(row.name)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <RenameEditDialog
      v-if="isShowRenameEditDialog"
      :params="{...params, name: fileOrFolderName, path}"
      @close="closeRenameEdit"
    ></RenameEditDialog>
    <UploadDialog
      ref="uploadDialog"
      :actionUrl="actionUrl"
      :data="{...params, unpack: 0, path, fileParamName: 'file'}"
      :isValid="true"
      :maxSize="1024"
      :multiple="false"
      @on-success="uploadSuccess"
    />
    <UploadDialog
      ref="uploadDialogDecompress"
      :actionUrl="actionUrl"
      :data="{...params, unpack: 1, path, fileParamName: 'file'}"
      :isValid="true"
      :maxSize="1024"
      :multiple="false"
      @on-success="uploadSuccessDecompress"
    />
    <AuthEditDialog v-if="isShowAuthEdit" :params="authEditParams" @close="closeAuthEdit"></AuthEditDialog>
    <CopyDialog
      v-if="isShowCopyDialog"
      :type="operationType"
      :params="{...params, src: path, name: fileOrFolderName}"
      @close="closeCopyDialog"
    ></CopyDialog>
  </div>
</template>
<script>
import qs from 'qs';
import download from '@/resources/directives/download.js';
import clipboard from '@/resources/directives/clipboard.js';
export default {
  name: '', // 版本制品
  components: {
    UploadDialog: () => import('@/resources/components/UploadDialog/UploadDialog.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    RenameEditDialog: () => import('./version-product/rename-edit-dialog'), // 重命名文件夹
    AuthEditDialog: () => import('./version-product/auth-edit-dialog'),
    CopyDialog: () => import('./version-product/copy-dialog')
  },
  directives: { download, clipboard },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    hasBg: {
      // 是否显示背景间隙和圆角
      type: Boolean,
      default: true
    },
    hasAllAuth: {
      // 是否拥有版本&制品管理&环境权限
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShowRenameEditDialog: false,
      isDownloading: false,
      isShowUploadFile: false,
      isShowAuthEdit: false,
      isShowCopyDialog: false,
      isPackDownload: false,
      operationType: '', // 操作类型
      actionUrl: BASEURLPREFIX + '/api/binary/deploy/version/resource/file/upload', // 上传文件地址
      downloadUrl: '/api/binary/deploy/version/resource/file/download',
      copyDownloadUrl: '',
      originPathList: [],
      fileOrFolderName: '', // 文件（文件夹）名称
      path: '/',
      authEditParams: {},
      pathList: [
        {
          name: 'HOME'
        }
      ],
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.size'),
          key: 'size'
        },
        {
          title: this.$t('page.authority'),
          key: 'permission'
        },
        {
          title: this.$t('term.deploy.lastrevisiontime'),
          key: 'fcdText'
        },
        {
          key: 'action'
        }
      ],
      tableData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.getDirectoryList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    gotoPreview(row) {
      let type = row && row.name ? (row.name.split('.') && row.name.split('.').length > 0 ? row.name.split('.')[(row.name.split('.').length) - 1] : 'txt') : 'txt';
      let params = {
        ...this.params,
        isPack: 0,
        path: `${this.path}/${row.name}`
      };
      window.open(HOME + '/deploy.html#/preview?url=' + this.downloadUrl + '&title=' + row.name + '&type=' + type + '&urlParams=' + JSON.stringify(params), '_blank');
    },
    openRenameDialog() {
      this.fileOrFolderName = '';
      this.isShowRenameEditDialog = true;
    },
    closeRenameEdit(needRefersh) {
      this.isShowRenameEditDialog = false;
      if (needRefersh) {
        this.getDirectoryList(this.path);
      }
    },
    openUploadFile() {
      let uploadDialog = this.$refs.uploadDialog;
      if (uploadDialog) {
        uploadDialog.showDialog();
      }
    },
    openUploadDialogDecompress() {
      let uploadDialog = this.$refs.uploadDialogDecompress;
      if (uploadDialog) {
        uploadDialog.showDialog();
      }
    },
    closeUploadFile() {
      this.isShowUploadFile = false;
    },
    getDirectoryList(path = '/') {
      let params = {
        path: path,
        ...this.params
      };
      this.$api.deploy.version.getDirectoryList(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.originPathList = [];
          this.$set(this.tableData, 'tbodyList', res.Return);
          res.Return && res.Return.forEach((item) => {
            if (item && item.name) {
              this.originPathList.push(item.name);
            }
          });
        }
      });
    },
    editRename(name) {
      this.fileOrFolderName = name;
      this.isShowRenameEditDialog = true;
    },
    closeAuthEdit(needRefersh) {
      this.fileOrFolderName = '';
      this.isShowAuthEdit = false;
      if (needRefersh) {
        this.getDirectoryList(this.path);
      }
    },
    openAuthEditDialog(row) {
      this.authEditParams = {
        ...this.params,
        name: row.name,
        path: this.path,
        permission: row.permission
      };
      this.isShowAuthEdit = true;
    },
    openCopyDialog(row, type) {
      this.fileOrFolderName = row.name;
      this.operationType = type;
      this.isShowCopyDialog = true;
    },
    closeCopyDialog(needRefersh) {
      this.fileOrFolderName = '';
      this.isShowCopyDialog = false;
      if (needRefersh) {
        this.getDirectoryList(this.path);
      }
    },
    delRow(name) {
      if (name) {
        let param = {
          ...this.params,
          path: this.path == '/' ? `/${name}` : this.path + `/${name}`
        };
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: name}),
          btnType: 'error',
          'on-ok': vnode => {
            vnode.isShow = false;
            this.$nextTick(() => {
              this.$api.deploy.version.delFile(param).then((res) => {
                if (res && res.Status == 'OK') {
                  this.$Message.success(this.$t('message.deletesuccess'));
                  this.getDirectoryList(this.path);
                }
              });
            });
          }
        });
      }
    },
    openFolder(row) {
      if (row.type == 'd') {
        let path = '';
        let hasFlag = false;
        for (let i = 0; i < this.pathList.length; i++) {
          if (this.pathList[i] && this.pathList[i].flag == true) {
            hasFlag = true;
          }
        }
        // 拼接路径
        if (this.pathList.length > 1 && this.originPathList.includes(this.pathList[this.pathList.length - 1]['name'])) {
          if (hasFlag) {
            this.pathList.push({
              name: row.name,
              flag: true
            });
          } else {
            this.pathList.pop();
            this.pathList.push({
              name: row.name,
              flag: false
            });
          }
        } else {
          this.pathList.push({
            name: row.name,
            flag: true
          });
        }
        this.pathList.forEach((item, index) => {
          path += item.name == 'HOME' ? '/' : item.name + (this.pathList.length != index + 1 ? '/' : '');
        });
        this.path = path;
        this.getDirectoryList(path);
      }
    },
    breadCrumbsClick(tIndex) {
      this.path = '';
      let path = '';
      this.pathList.splice(tIndex + 1, (this.pathList.length - (tIndex + 1))); // 删除点击后面数据
      if (this.pathList.length == 0) {
        this.pathList.push({
          parentId: 0,
          id: 0,
          name: 'HOME'
        });
      }
      this.pathList.forEach((item, index) => {
        if (index <= tIndex) {
          path += item.name == 'HOME' ? '/' : item.name + (this.pathList.length != index + 1 ? '/' : '');
        }
      });
      this.path = path;
      this.getDirectoryList(path);
    },
    uploadSuccess() {
      let uploadDialog = this.$refs.uploadDialog;
      if (uploadDialog) {
        uploadDialog.hideDialog();
        this.getDirectoryList(this.path);
      }
    },
    uploadSuccessDecompress() {
      let uploadDialogDecompress = this.$refs.uploadDialogDecompress;
      if (uploadDialogDecompress) {
        uploadDialogDecompress.hideDialog();
        this.getDirectoryList(this.path);
      }
    },
    bytesToSize(bytes) {
      if (bytes == 0) {
        return '0 B';
      }
      let k = 1024;
      let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      let i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    },
    copyDownloadPackUrl() {
      let params = {
        ...this.params,
        isPack: 1,
        path: '/'
      };
      if (location && location.origin) {
        this.copyDownloadUrl = location.origin + location.pathname + '#/download' + '?' + qs.stringify(params);
        this.$Message.success(this.$t('message.copysuccess'));
      }
    }
  },
  filter: {},
  computed: {
    downloadFile(row, fileName) {
      return (row, fileName) => {
        let data = {
          ...this.params,
          isPack: 0,
          path: `${this.path}/${fileName}`
        };
        return {url: this.downloadUrl, params: data, method: 'post', changeStatus: status => {
          if (status == 'start') {
            this.$set(row, 'isDownloading', true);
          } else if (status == 'success' || status == 'error') {
            this.$set(row, 'isDownloading', false);
          }
        }};
      };
    },
    packDownloadFile() {
      // 打包下载文件
      return {
        url: this.downloadUrl,
        method: 'post',
        params: {
          ...this.params,
          isPack: 1,
          path: '/'
        },
        changeStatus: status => {
          if (status == 'start') {
            this.isPackDownload = true;
          } else if (status == 'success' || status == 'error') {
            this.isPackDownload = false;
          }
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.header-box {
  display: flex;
  justify-content: space-between;
  .left-box,.right-box {
    width: 54%;
    overflow-x: scroll;
    white-space: nowrap;
  }
  .left-box {
    width: 46%;
  }
  .left-content-box {
    width: 100%;
    overflow-x: scroll;
    white-space: nowrap;
  }
  .right-content-box {
    width: 30%;
    overflow-x: scroll;
    white-space: nowrap;
  }
}
</style>
