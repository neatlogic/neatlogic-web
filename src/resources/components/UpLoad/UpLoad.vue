<template>
  <div class="upload" :class="className">
    <Upload
      ref="upload"
      :type="type"
      :format="format"
      :accept="accept"
      :multiple="multiple"
      :data="filedata"
      :on-format-error="FormatError"
      :on-progress="progress"
      :before-upload="before"
      :onSuccess="success"
      :on-error="error"
      :action="action"
      :show-upload-list="false"
      :max-size="maxsize"
      :on-exceeded-size="exceeded"
      :default-file-list="defaultFileList"
      :headers="headerConfig"
    >
      <slot>
        <div v-if="!readonly && styleType === 'button'">
          <Button
            v-if="className === 'smallUpload'"
            :disabled="disabled"
            :title="disabledTitle"
            icon="tsfont tsfont-upload"
          >{{ $t('page.uploadfile') }}</Button>
        </div>
        <div v-else-if="!readonly && styleType === 'text'">
          <span v-if="className === 'smallUpload'" class="text text-grey text-btn text-left tsfont-plus">
            {{ $t('page.uploadattachment') }}
          </span>
        </div>
        <div v-else-if="!readonly" class="padding" :style="{ height: height ? height + 'px' : null }">
          <p class="title">{{ title }}</p>
          <div v-if="type == 'drag'" class="drag">
            <!-- <i class="icon-tip tsfont-plus"></i> -->
            <div class="upload-icon">
              <img src="../UploadDialog/upload-icon.png" :alt="$t('page.importicon')" />
              <p class="text-grey">{{ $t('page.clickanddragfile') }}</p>
            </div>
            <!-- <p>上传附件</p> -->
          </div>
          <Button v-else :disabled="disabled">{{ $t('page.clicktoupload') }}</Button>
        </div>
      </slot>
    </Upload>
    <slot name="tips"></slot>
    <div v-if="uploadList.length" class="upload_block">
      <TsRow :style="rowStyle">
        <Col v-for="(item, index) in uploadList" :key="index" :span="rowSpan">
          <div class="upload_item" :class="readonlyTextIsHighlight ? 'text-warning' : ''">
            <span class="tsfont-attachment"></span>
            <span class="file_name overflow">
              <Tooltip :transfer="true" :content="item.name">{{ item.name }}</Tooltip>
            </span>
            <span class="tsfont-eye text-action pl-xs pr-xs" @click.stop="handlePreview(item.id)"></span>
            <i
              v-if="!readonly && !disabled"
              class="tsfont-close file_del text-action"
              :title="$t('page.delete')"
              @click="handleRemove(item)"
            ></i>
            <Progress
              v-if="item.showProgress"
              class="progress"
              :percent="percent(item.percentage ? parseFloat(item.percentage.toFixed(2)) : 0)"
              :stroke-width="5"
              :status="fileStatus"
            ></Progress>
          </div>
        </Col>
      </TsRow>
    </div>
    <ImagePreview 
      v-if="srcList && srcList.length > 0"
      :isShow="srcList.length > 0 ? true : false"
      :fileList="srcList"
      @close="()=> {
        srcList = []
      }"
    >
    </ImagePreview>
  </div>
</template>

<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    ImagePreview: () => import('@/resources/components/image-preview/index.vue')
  },
  directives: { download },
  props: {
    title: {
      //上传标题
      type: String,
      default: ''
    },
    height: { type: Number },
    uniqueKey: {
      //如果不为空，代表附件名唯一，相同名称的附件只会保留最新的一个
      type: String,
      default: null
    },
    type: {
      //上传类型，默认拖拽
      type: String,
      default: 'drag' //drag or select
    },
    disabled: {
      //是否禁用
      type: Boolean,
      default: false
    },
    readonly: {
      //是否只读
      type: Boolean,
      default: false
    },
    multiple: {
      //是否支持多文件上传，默认否
      type: Boolean,
      default: false
    },
    //支持的文件类型，默认为空
    format: {
      type: Array,
      default: function() {
        return [];
      }
    },
    //上传参数
    dataType: {
      //用于后台文档管理，标识模块或者功能等
      type: String,
      default: ''
    },
    dataParam: {
      type: String,
      default: 'file'
    },
    //文件格式判断
    handleFormatError: {
      type: Function,
      default: function(file) {
        this.$Notice.warning({
          title: this.$t('form.validate.fileformaterror'),
          desc: this.$t('form.validate.fileformat', { target: file.name })
        });
      }
    },
    //上传前方法
    beforeUpload: {
      type: Function,
      default: function() {}
    },
    maxsize: {
      type: Number,
      default: 1000000
    },
    defaultList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    styleType: {
      type: String,
      default: '' // button text
    },
    className: {
      type: String,
      default: '' //smallUpload
    },
    rowSpan: {
      type: [String, Number],
      default: '12'
    },
    isSumbit: {
      //是否立即提交文件，设置为false后只会返回一堆文件内容
      type: Boolean,
      default: true
    },
    uploadCount: {
      //上传文件数量
      type: Number,
      default: 5
    },
    params: {
      //额外参数
      type: Object,
      default: function() {
        return {};
      }
    },
    silent: {
      //静默模式不提示任何信息
      type: Boolean,
      default: false
    },
    disabledTitle: {
      // 禁用时，鼠标上移显示title
      type: String,
      default: ''
    },
    rowStyle: {
      // TsRow 自定义行内样式
      type: Object,
      default: function() {
        return {};
      }
    },
    fileDownurl: {
      //文件下载路径
      type: String,
      default: '/api/binary/file/download'
    },
    fileDownParam: {
      //文件下载参数
      type: Object,
      default: null
    },
    isDeleteRemote: {
      //删除附件时是否同时删除远程文件
      type: Boolean,
      default: false
    },
    readonlyTextIsHighlight: {
      // 只读模式下，文件列表是否需要高亮显示
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      action: BASEURLPREFIX + `/api/binary/file/upload`,
      filedata: {
        param: this.dataParam,
        type: this.dataType,
        uniqueKey: this.uniqueKey,
        responseType: 'blob'
      },
      uploadList: [],
      defaultFileList: [],
      fileStatus: 'normal',
      headerConfig: {
        Authorization: sessionStorage.getItem('neatlogic_authorization') ? sessionStorage.getItem('neatlogic_authorization') : ''
      },
      srcList: [],
      url: ''
    };
  },
  beforeMount() {},
  mounted() {
    this.uploadList = this.$refs.upload.fileList;
    //融合自定义参数，有参数重名的风险，先这样吧
    Object.assign(this.filedata, this.params);
  },
  created() {},
  methods: {
    handlePreview() {
      this.srcList = this.uploadList;
    },
    FormatError: function(file) {
      this.handleFormatError(file);
    },
    before: function(file) {
      this.fileStatus = 'normal';
      if (this.uploadCount == this.uploadList.length) {
        this.$Notice.warning({
          title: this.$t('form.validate.filecount', { target: this.uploadCount })
        });

        return false;
      }
      return this.beforeUpload(file);
    },
    //上传成功
    success: function(res, file, fileList) {
      if (res.Status == 'OK') {
        file.id = res.Return.id;
        if (fileList.length) {
          let isFinish = true;
          fileList.forEach(f => {
            if (f.status != 'finished') {
              isFinish = false;
            }
          });
          if (this.uniqueKey) {
            for (let i = fileList.length - 1; i >= 0; i--) {
              const oldFile = fileList[i];
              if (oldFile.name == file.name) {
                fileList.splice(i, 1);
              }
            }
            fileList.push(file);
            //this.$refs.upload.fileList = fileList;
          }
          if (isFinish) {
            if (!this.silent) {
              this.$Message.success(this.$t('message.uploadsuccess'));
            }
            this.$emit('getFileList', fileList, file.id);
            this.fileStatus = 'success';
          }
        }
      }
    },
    //上传失败
    error: function(res, file, fileList) {
      //console.log('上传失败', res, file, fileList);
      if (file.Status == 'ERROR') {
        this.$Notice.error({
          title: this.$t('message.uploadfailed'),
          desc: file.Message
        });
      }
    },
    //上传时的接口
    progress: function(event, file) {},
    //移除
    handleRemove: function(item) {
      const fileList = this.$refs.upload.fileList;
      if (this.isDeleteRemote) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.accessory') }),
          btnType: 'error',
          'on-ok': vnode => {
            let p = {};
            if (this.params) {
              p = this.$utils.deepClone(this.params);
            }
            p['fileId'] = item.id;
            this.$api.framework.file.deleteFile(p).then(res => {
              if (res.Status == 'OK') {
                vnode.isShow = false;
                this.$refs.upload.fileList.splice(fileList.indexOf(item), 1);
                this.$emit('remove', this.$refs.upload.fileList, item.id);
              }
            });
          }
        });
      } else {
        this.$refs.upload.fileList.splice(fileList.indexOf(item), 1);
        this.$emit('remove', this.$refs.upload.fileList, item.id);
      }
      return false;
    },
    //下载请求
    fileDownload: function(item) {
      let data = {
        id: item.id
      };
      //默认下载的用get
      const aLink = document.createElement('a');
      aLink.download = item.name;
      aLink.href = BASEURLPREFIX + '/api/binary/file/download' + '?id=' + item.id;
      document.body.appendChild(aLink);
      aLink.click();
      aLink.remove();
      // this.$api.common.downLoad(data).then(res => {
      //   this.download(res.data, item.name);
      // });
    },
    //下载
    download(data, fileName) {
      if (!data) {
        return;
      }
      let url = URL.createObjectURL(
        new Blob([data], {
          type: 'application/octet-stream'
        })
      );
      let link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    //文件大小限制
    exceeded: function() {
      this.$Message.warning(this.$t('form.validate.fileoverlimit'));
    },
    // 清除upload方法
    handleClearFiles() {
      this.$refs.upload.fileList.splice(0);
    }
  },
  computed: {
    percent() {
      return function(val) {
        let num = val;
        if (num == '100') {
          num = num - 1;
        }
        return num;
      };
    },
    accept() {
      if (this.format && this.format.length == 0) {
        return null;
      }
      return '.' + this.format.join(',.');
    }
  },
  watch: {
    defaultList: {
      async handler(newVal) {
        if (newVal) {
          let list = [];
          const fileIdList = [];
          newVal.forEach(item => {
            if (typeof item === 'object') {
              let data = {
                name: item.name,
                id: item.id
              };
              list.push(data);
            } else if (typeof item === 'number') {
              fileIdList.push(item);
            }
          });
          if (fileIdList.length > 0) {
            await this.$api.framework.file.getFileByIdList(fileIdList).then(res => {
              const fileList = res.Return;
              for (let i = 0; i < fileList.length; i++) {
                const item = fileList[i];
                let data = {
                  name: item.name,
                  id: item.id
                };
                list.push(data);
              }
            });
          }
          this.defaultFileList = list;
          this.$nextTick(() => {
            let upload = this.$refs.upload;
            this.uploadList = upload ? upload.fileList : [];
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.upload {
  // /deep/ .ivu-upload {
  //   width: 125px;
  //   height: 125px;
  // }
  .title {
    color: @text-color;
    padding-top: 20px;
  }
  .upload-icon {
    //width: 96px;
    //height: 95px;
    margin: auto;
    //margin-top: 60px;
    //margin-bottom: 100px;
  }
  .text-btn {
    display: inline-block;
    width: auto;
    white-space: nowrap;
  }
  .drag {
    // padding: 20px 0;
    // color: @primary-color;
    .icon-tip {
      font-size: 24px;
      padding-bottom: 10px;
      display: block;
    }
  }
  .upload_block {
    position: relative;
    margin-top: 8px;
    /deep/ .ivu-upload {
      width: 100%;
      height: 100%;
    }
    .upload_item {
      width: 100%;
      display: flex;
      margin-bottom: 8px;
      .file_name {
        padding: 0 8px;
        position: relative;
        top: -2px;
        display: inline-block;
        max-width: 66%;
      }
      .file_down {
        cursor: pointer;
      }
      .file_del {
        // padding-left: 8%; // 距离左边间隙过大
        display: none;
        cursor: pointer;
      }
      .progress {
        width: 80%;
        display: block;
      }
      &:hover {
        .file_del {
          display: inline-block;
        }
      }
    }
  }
  &.smallUpload {
    /deep/ .ivu-upload {
      width: 125px;
      height: 125px;
    }
    /deep/ button {
      margin: 0 !important;
    }
    /deep/ .ivu-upload {
      width: auto;
      height: auto;
      text-align: left;
      border-radius: 4px;
    }
    /deep/ .ivu-upload-drag {
      border: none;
      background: transparent;
    }
  }
}
</style>
