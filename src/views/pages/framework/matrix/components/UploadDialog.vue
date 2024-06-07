<template>
  <div>
    <TsDialog
      type="modal"
      v-bind="dialogConfig"
      :isShow.sync="isModalShow"
      className="upload-dialog"
      :title="title"
      :hasFooter="fileList.length ? true : false"
      @on-close="hideDialog"
    >
      <template v-slot>
        <div class="dialog-content">
          <div class="left-container">
            <Upload
              ref="upload"
              :class="{ 'upload-fieldset-small': fileList.length }"
              class="upload-fieldset"
              type="drag"
              :data="{ ...filedata, ...data }"
              :name="name"
              :action="actionUrl"
              :headers="headerConfig"
              :multiple="multiple"
              :show-upload-list="false"
              :format="formatList"
              :accept="getAccept"
              :max-size="maxSize * 1024"
              :before-upload="handleBeforeUpload"
              :on-progress="handleProgress"
              :on-success="handleSuccess"
              :on-error="handleError"
            >
              <div class="drag-area bg-block">
                <div class="upload-icon"><img src="~@/resources/components/UploadDialog/upload-icon.png" :alt="$t('page.icon')" /></div>
                <div class="upload-tip text-default">{{ $t('page.uploadtips') }}</div>
                <div class="upload-limit text-tip">
                  {{ uploadFilelimitTips(multiple, formatList) }}
                  <br />
                  {{ $t('page.uploadfilelimit', {target: maxSize}) }}
                </div>
              </div>
            </Upload>
          </div>
          <div v-if="isValid && isImport && (validConfig.failureCount > 0 || validConfig.successCount > 0)" class="valid-class">
            <template v-if="validConfig.failureReasonList.length > 0">
              <div class="radius-sm ivu-alert-error valid-list">
                <div class="text-success pb-md"><span class="valid-icon tsfont-check-s"></span>{{ $t('message.successfullyimportitemstarget', {target: validConfig.successCount}) }}
                  <span v-if="successMassage">{{ successMassage }}</span>
                  <span v-if="btntext" class="text-href" @click="goto()">{{ btntext }}</span>
                </div>
                <div class="text-danger pb-md"><span class="valid-icon tsfont-close-s"></span>{{ $t('page.failedtoimportitemstarget', {target: validConfig.failureCount}) }}</div>
                <div>
                  <div v-for="(result, index) in validConfig.failureReasonList" :key="index">
                    <div class="pb-md">{{ result.item }}</div>
                    <div v-for="(s,sindex) in result.list" :key="sindex" class="text-tip pb-md">
                      {{ s }}
                    </div>
                  </div>
                  <div v-if=" getWarnList(validConfig.failureReasonList) && getWarnList(validConfig.failureReasonList).length > 0 && warnMassage">
                    {{ warnMassage }}
                    <div v-for="(result, index) in getWarnList(validConfig.failureReasonList)" :key="index">
                      <div class="pb-md">{{ result.warnItem }}</div>
                    </div>
                    <slot name="footer">
                      <div v-if="btnList" class="text-right">
                        <!-- 通过参数来渲染btn -->
                        <template v-if="btnList">
                          <Button
                            v-for="(btn,index) in btnList"
                            :key="index"
                            :size="btn.size"
                            :class="btn.class"
                            :disabled="btn.disabled"
                            class="ml-sm"
                            @click.native.stop="btnClick(btn, validConfig)"
                          >
                            {{ btn.text }}
                          </Button>
                        </template>
                      </div>
                    </slot>
                  </div>

                </div>
              </div>
            </template>
            <template v-else>
              <div class="bg-success-grey text-success padding-md radius-sm"><span class="valid-icon tsfont-check-s"></span>{{ $t('message.allimportedsuccessfullytotaltarget', {target: validConfig.successCount}) }}
                <span v-if="successMassage">{{ successMassage }}</span>
                <span v-if="btntext" class="text-href" @click="goto()">{{ btntext }}</span>
              </div>
            </template>
          </div>
          <ul v-else class="upload-file-list" :class="{ 'upload-file-list-show': fileList.length }">
            <li v-for="item in fileList" :key="item.uuid" class="upload-file-item">
              <h5 class="file-name text-default overflow" :title="item.file.name">{{ item.file.name }}</h5>
              <p class="file-size text-tip">{{ item.file.size | bytesSize }}</p>
              <div class="upload-status">
                <i-circle
                  v-if="item.Status == 'OK'"
                  stroke-color="#25b865"
                  :trail-color="isDarkMode ? '#4f515a' : '#eaeef2'"
                  :percent="100"
                  :size="26"
                >
                  <i class="tsfont-check"></i>
                </i-circle>
                <i-circle
                  v-else-if="item.Status == 'ERROR'"
                  stroke-color="#f71010"
                  :trail-color="isDarkMode ? '#4f515a' : '#eaeef2'"
                  :percent="100"
                  :size="26"
                >
                  <i class="tsfont-close"></i>
                </i-circle>
                <i-circle
                  v-else-if="item.Status == 0"
                  :trail-color="isDarkMode ? '#4f515a' : '#eaeef2'"
                  :percent="item.Status"
                  :size="26"
                >
                  <i class="tsfont-refresh"></i>
                </i-circle>
                <i-circle
                  v-else-if="!isNaN(item.Status)"
                  :trail-color="isDarkMode ? '#4f515a' : '#eaeef2'"
                  :percent="item.Status"
                  :size="26"
                  class="uploading"
                >
                  <span class="tips">{{ Math.round(item.Status) }}</span>
                </i-circle>
              </div>
              <span v-if="item.removable" class="remove-file">
                <i class="tsfont-close text-action" @click="removeFile(item)"></i>
              </span>
            </li>
          </ul>
        </div>
      </template>
      <template v-slot:footer>
        <slot name="footer">
          <template v-if="!isAllUploaded">
            <Button @click="hideDialog">{{ $t('page.cancel') }}</Button>
            <Button type="primary" @click="okImport">{{ $t('page.import') }}</Button>
          </template>
          <template v-else>
            <Button type="primary" @click="hideDialog">{{ $t('page.complete') }}</Button>
          </template>
        </slot>
      </template>
    </TsDialog>
    <TsDialog
      type="modal"
      :isShow.sync="showUploadConfirmDialog"
      @on-ok="okAction"
      @on-close="closeAction"
    >
      <template v-slot:header>
        <div>{{ $t('page.importconfirm') }}</div>
      </template>
      <div v-if="uuidDuplication == 1" class="text-center pb-nm">
        {{ $t('term.framework.matrix.isoverride') }}
      </div>
      <TsForm
        ref="uploadConfirmForm"
        v-model="uploadConfirmFormModel"
        :item-list="uploadConfirmFormItemList"
        type="type"
      >
      </TsForm>
    </TsDialog>
  </div>
</template>

<script>
import upload from '@/resources/mixins/upload.js';
export default {
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  filters: {
    bytesSize: function(num) {
      if (typeof num !== 'number' || isNaN(num)) {
        throw new TypeError('Expected a number');
      }
      var exponent;
      var unit;
      var neg = num < 0;
      var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      if (neg) {
        num = -num;
      }
      if (num < 1) {
        return (neg ? '-' : '') + num + ' B';
      }
      exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
      num = (num / Math.pow(1000, exponent)).toFixed(2) * 1;
      unit = units[exponent];
      return (neg ? '-' : '') + num + ' ' + unit;
    }
  },
  mixins: [upload],
  props: {
    title: { type: String, default() { return this.$t('page.uploadattachment'); } },
    actionUrl: { type: String, required: true },
    name: { type: String, default: 'file' }, //上传的文件字段名
    data: { type: Object, default: () => {} }, //上传时附带的额外参数
    dataType: { type: String, default: 'file' },
    formatList: { type: Array, default: () => [] },
    maxSize: { type: Number, default: 10 }, //文件大小限制，单位为MB
    multiple: { type: Boolean, default: true },
    beforeUpload: { type: Function, default: null }, //自定义的上传前处理函数
    immediatelyUpload: { type: Boolean, default: false },
    showSuccessNotice: { type: Boolean, default: true },
    defaultFileList: { type: Array, default: () => [] },
    isValid: { type: Boolean, default: false }, //是否需要展示校验信息
    successMassage: { type: String }, //成功显示信息
    warnMassage: { type: String }, //成功失败信息
    btnList: { type: Array }, //底部按钮数组
    btntext: { type: String } //按钮文案
  },
  data() {
    return {
      isModalShow: false,
      dialogConfig: {
        width: '654px',
        height: '367px'
      },
      fileList: [],
      headerConfig: {
        Authorization: sessionStorage.getItem('neatlogic_authorization')
      },
      filedata: {
        type: this.dataType,
        responseType: 'blob'
      },
      validConfig: {
        failureCount: 0,
        successCount: 0,
        failureReasonList: []
      },
      isImport: false,
      showUploadConfirmDialog: false,
      uploadConfirmFormItemList: {},
      allUploadConfirmFormItemList: {
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: 'api/rest/matrix/save',
              message: this.$t('message.targetisexists', {'target': this.$t('page.matrixname')}),
              key: 'name'
            }
          ]
        },
        label: {
          type: 'text',
          name: 'label',
          value: '',
          maxlength: 50,
          label: this.$t('page.uniquekey'),
          validateList: [
            'required',
            'char',
            {
              name: 'searchUrl',
              url: 'api/rest/matrix/save',
              message: this.$t('message.targetisexists', {'target': this.$t('term.framework.matrixuniquekey')}),
              key: 'label'
            }
          ]
        }
      },
      uploadConfirmFormModel: {},
      uuidDuplication: 0,
      uploadParams: {
        type: 'file',
        responseType: 'blob'
      }
    };
  },
  methods: {
    async showDialog() {
      this.fileList = [...this.fileList, ...this.defaultFileList];
      if (!this.beforeUpload) {
        this.isModalShow = true;
        return;
      }
      const result = await this.beforeUpload();
      this.isModalShow = !!result;
    },
    hideDialog() {
      this.isModalShow = false;
      this.fileList = [];
      this.validConfig = {
        failureCount: 0,
        successCount: 0,
        failureReasonList: []
      };
    },
    handleBeforeUpload(file) {
      if (this.isValid && this.isImport) {
        this.isImport = false;
        this.fileList = [];
      }

      if (!this.multiple && this.fileList.length !== 0) {
        this.$Notice.warning({
          title: this.$t('page.tip'),
          desc: this.$t('message.onlyasinglefilecanbeimported')
        });
        return false;
      }
      if (this.fileList.some(item => item.file.name === file.name && item.file.size === file.size)) {
        this.$Notice.warning({
          title: this.$t('page.tip'),
          desc: this.$t('message.cannotrepeat', {target: this.$t('page.file')})
        });
        return false;
      }
      if (this.formatList.length) {
        if (!this.formatList.includes(file.name.split('.').pop())) {
          this.$Notice.warning({
            title: this.$t('page.tip'),
            desc: this.$t('message.thefilesuffixmustbe') + `${'.' + this.formatList.join(this.$t('page.or') + '.')}`
          });
          return false;
        }
      }
      this.fileList.push({
        file,
        Status: 0,
        uuid: this.$utils.setUuid(),
        get removable() {
          return this._removable || this.Status !== 'OK';
        },
        set removable(val) {
          this._removable = val;
        }
      });
      this.$set(this.uploadParams, 'file', file);
      return this.immediatelyUpload;
    },
    handleProgress(event, file, fileList) {
      this.fileList.find(item => item.file.name === file.name).Status = event.percent;
    },
    handleSuccess(response, file) {
      let desc = '';
      if (response.Return && Array.isArray(response.Return)) {
        desc = response.Return.join('<br/>');
      } else if (response.Return && typeof response.Return == 'string') {
        desc = response.Return;
      } else if (response.Return && typeof response.Return == 'object') {
        let flag = false;
        if (response.Return.uuidDuplication == 1) {
          this.uuidDuplication = 1;
          flag = true;
        }
        if (response.Return.name && response.Return.nameDuplication == 1) {
          this.$set(this.uploadConfirmFormModel, 'name', response.Return.name + '_' + this.$t('page.rename'));
          this.$set(this.uploadConfirmFormItemList, 'name', this.allUploadConfirmFormItemList.name);
          flag = true;
        }
        if (response.Return.label && response.Return.labelDuplication == 1) {
          this.$set(this.uploadConfirmFormModel, 'label', response.Return.label + '_' + this.$t('page.rename'));
          this.$set(this.uploadConfirmFormItemList, 'label', this.allUploadConfirmFormItemList.label);
          flag = true;
        }
        if (flag) {
          this.showUploadConfirmDialog = true;
          return;
        }
      }
      if (response.Status === 'OK') {
        let OkData = {
          title: this.$t('message.importsuccess')
        };
        if (desc != '') {
          this.$set(OkData, 'desc', desc);
        }
        this.showSuccessNotice && this.$Notice.success(OkData);
        if (this.isValid) {
          let config = response.Return;
          config && Object.keys(config).forEach(key => {
            if (key == 'failureReasonList') {
              this.validConfig[key].push(...config[key]);
            } else {
              this.validConfig[key] += config[key];
            }
          });
        }
      } else if ((response.Status = 'ERROR')) {
        this.$Notice.error({
          title: this.$t('message.importfailed'),
          desc: response.Return.result || desc
        });
      }
      let uploadFile = this.fileList.find(item => {
        let name = response.Return && response.Return.name ? response.Return.name : file.name;
        if (item.file.name === name) {
          item.Status = response.Status;
          return true;
        }
        return false;
      });
      this.$emit('update:defaultFileList', this.fileList);
      this.$emit('on-success', response, uploadFile, this.fileList);
    },
    handleError(error, response, file) {
      if ((file.Status = 'ERROR')) {
        this.$Notice.error({
          title: this.$t('message.importfailed'),
          desc: response.Message
        });
        this.fileList.find(item => item.file.name === file.name).Status = response.Status;
      }
    },
    removeFile(file) {
      this.fileList.splice(this.fileList.indexOf(file), 1);
      this.$emit('update:defaultFileList', this.fileList);
      this.$emit('on-remove-file', file, this.fileList);
    },
    okImport(fileList) {
      if (this.isValid) {
        this.validConfig = {
          failureCount: 0,
          successCount: 0,
          failureReasonList: []
        };
      }
      if (fileList.length > 0) {
        this.fileList = fileList;
      }
      this.fileList
        .filter(item => item.Status !== 'OK' && item.Status !== 'ERROR')
        .map(item => {
          this.$refs.upload.post(item.file);
        });
      this.$nextTick(() => {
        this.isImport = true;
      });
    },
    getWarnList(failList) {
      let list = failList.filter(item => item.isWarn == 1);
      return list;
    },
    btnClick(config, data) {
      config.fn && config.fn(data, this.fileList);
    },
    goto() {
      this.$emit('goto');
    },
    okAction() {
      if (!this.$refs.uploadConfirmForm.valid()) {
        return;
      }
      const uploadConfirmFormData = this.$refs.uploadConfirmForm.getFormValue();
      if (uploadConfirmFormData.name) {
        this.$set(this.uploadParams, 'name', uploadConfirmFormData.name);
      }
      if (uploadConfirmFormData.label) {
        this.$set(this.uploadParams, 'label', uploadConfirmFormData.label);
      }
      if (this.uuidDuplication == 1) {
        this.$set(this.uploadParams, 'isOverride', 1);
      }
      this.upload(
        '/api/binary/matrix/import',
        this.uploadParams,
        {},
        response => {
          this.$Message.success(this.$t('message.importsuccess'));
          this.$emit('on-all-upload');
          this.showUploadConfirmDialog = false;
        },
        error => {
          this.$Notice.error({
            title: this.$t('message.importfailed'),
            desc: error.Message
          });
        }
      );
    },
    closeAction() {
      this.showUploadConfirmDialog = false;
      this.hideDialog();
    }
  },
  computed: {
    isAllUploaded() {
      return this.fileList.length && this.fileList.every(item => item.Status === 'OK' || item.Status === 'ERROR');
    },
    isDarkMode() {
      return this.$store.getters.themeType === 'dark';
    },
    getAccept() {
      if (this.formatList && this.formatList.length == 0) {
        return null;
      }
      return '.' + this.formatList.join(',.');
    },
    uploadFilelimitTips() {
      // 上传文件格式限制多语言
      return (ismutiple, formatList) => {
        if (this.$utils.isEmpty(formatList)) {
          if (ismutiple) {
            return this.$t('message.multiplefilescanbeuploaded');
          } else {
            return this.$t('message.singlefilescanbeuploaded');
          }
        } else {
          if (ismutiple) {
            return this.$t('message.supportuploadingmultiplefileswithsuffixtarget', {target: formatList.join('、.')});
          } else {
            return this.$t('message.supportuploadingsinglefileswithsuffixtarget', {target: formatList.join('、.')});
          }
        }
      };
    }
  },
  watch: {
    isAllUploaded(newValue) {
      if (newValue === true) {
        this.$refs.upload.clearFiles();
        this.$emit('on-all-upload');
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/theme.less';

/deep/ .tsmodal-wrap .tsmodal-content {
  padding: 10px 24px;
}
.upload-dialog {
  position: relative;
  .dialog-content {
    position: relative;
    height: 100%;
    .left-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      user-select: none;
      z-index: 1;
      .upload-fieldset {
        width: 100%;
        height: 100%;
        transition: width 0.3s ease-in-out;
        &-small {
          width: 270px;
          height: 100%;
        }
        /deep/ .ivu-upload-drag{
          height: 100%;
        }
        .drag-area {
          height: 100%;
          padding: 0 46px;
          display: flex;
          flex-direction: column;
          align-items: center;
          .upload-icon {
            width: 96px;
            height: 95px;
            margin-top: 59px;
          }
          .upload-tip {
            margin-top: 20px;
          }
          .upload-limit {
            margin-top: 4px;
          }
        }
      }
      .upload-success {
        width: 271px;
        height: 320px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        &-icon {
          font-size: 60px;
          color: @default-primary-color;
        }
      }
    }
    .upload-file-list {
      margin-left: 280px;
      width: 310px;
      height: 100%;
      overflow-y: auto;
      opacity: 0;
      transition: opacity 0.5s 0.3s ease-out;
      &-show {
        position: relative;
        z-index: 10;
        opacity: 1;
      }
      .upload-file-item {
        position: relative;
        & + .upload-file-item {
          margin-top: 24px;
        }
        .file-name {
          margin-left: 38px;
          font-size: 13px;
          font-weight: normal;
          line-height: 18px;
          width: 190px;
          cursor: default;
        }
        .file-size {
          margin-left: 38px;
          margin-top: 2px;
        }
        .upload-status {
          position: absolute;
          top: 4px;
          left: 0;
          .tsfont-check {
            color: @success-color;
          }
          .tsfont-close {
            color: @error-color;
          }
          .tsfont-refresh {
            color: @default-primary-color;
          }
        }
        .remove-file {
          display: none;
          position: absolute;
          right: 0;
          top: 5px;
        }
        &:hover .remove-file {
          display: inline-block;
        }
      }
    }
  }
  .valid-class {
    position: relative;
    z-index: 9;
    margin-left: 280px;
    width: 310px;
    height: 100%;
    .valid-icon{
      display: inline-block;
      padding-right: 10px;
    }
    .valid-list {
      height: 100%;
      overflow-y: auto;
      padding: 8px 16px;
    }
  }
}
</style>
