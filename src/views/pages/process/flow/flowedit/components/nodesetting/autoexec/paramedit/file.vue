/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="form-li">
    <div class="file-main">
      <div v-if="!readonly && !disabled">
        <Upload
          ref="upload"
          type="select"
          :format="formatList"
          :multiple="multiple"
          :data="filedata"
          :action="action"
          :show-upload-list="false"
          :max-size="maxsize"
          :default-file-list="defaultFileList"
          :headers="headerConfig"
          :disabled="disabled"
          :on-exceeded-size="exceeded"
          :on-format-error="FormatError"
          :on-progress="progress"
          :before-upload="before"
          :on-success="success"
          :on-error="error"
        >
          <Button type="primary" ghost :disabled="disabled">{{ title }}</Button>
        </Upload>
      </div>
      <div v-if="uploadList.length > 0" class="file-item overflow">
        <TsRow :gutter="8">
          <Col v-for="(item, index) in getShowList(uploadList)" :key="item.id ||index" :span="fileSpan">
            <div class="file-detail overflow" :title="item.name">
              <span class="tsfont-attachment file-name">{{ item.name }}</span>
              <i
                v-if="!disabled"
                class="tsfont-close file-del text-action"
                title="$t('page.delete')"
                @click="handleRemove(item)"
              ></i>
            </div>
          </Col>
        </TsRow>
      </div>
      <template v-if="uploadList.length > showNumber">
        <div class="file-more text-tip-active" @click="lookFileList">
          {{ $t('page.viewall') }}
        </div>
      </template>
      <TsDialog :isShow.sync="showDialog" @on-close="close">
        <template v-slot:header>
          {{ $t('page.viewall') }}
        </template>
        <template v-slot>
          <div class="all-file input-border">
            <div class="search">
              <div style="width:240px">
                <TsFormInput
                  v-model="keyword"
                  search
                  @on-search="searchKeyWord"
                ></TsFormInput>
              </div>
              <div class="file-content">
                <TsRow v-if="searchList && searchList.length > 0">
                  <Col
                    v-for="(item, index) in searchList"
                    :key="index"
                    span="12"
                    :class="item.isHide?'hide':''"
                  >
                    <div class="file-detail overflow">
                      <span class="tsfont-attachment overflow file-name">{{ item.name }}</span>
                      <i
                        v-if="!disabled"
                        class="tsfont-close file-del text-action"
                        title="$t('page.delete')"
                        @click="dialogRemove(item)"
                      ></i>
                    </div>
                  </Col>
                </TsRow>
                <NoData v-else-if="!searchList || !searchList.length"></NoData>
              </div>
            </div>
          </div></template>
        <template v-slot:footer>
          <div class="footer-btn-contain">
            <Button @click="close">{{ $t('page.cancel') }}</Button>
            <Button
              v-if="!disabled"
              type="primary"
              ghost
              @click="clearAll"
            >{{ $t('page.clearall') }}</Button>
          </div>
        </template>
      </TsDialog>
    </div>
    <transition name="fade">
      <slot name="validMessage">
        <span
          v-if="validMesage != '' && uploadList.length == 0"
          class="form-error-tip"
          :title="validMesage"
          v-html="validMesage"
        ></span>
      </slot>
    </transition>
  </div>
</template>
<script>
import comMixin from './editmixin.js';

export default {
  name: 'File',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  filters: {},
  mixins: [comMixin],
  props: {
    // value: [Object, String],
    title: {
      //上传标题
      type: String,
      default() {
        this.$t('page.uploadattachment');
      }
    },
    multiple: {
      //是否支持多文件上传，默认否
      type: Boolean,
      default: true
    },
    //支持的文件类型，默认为空
    formatList: {
      type: Array,
      default: () => []
    },
    //上传参数
    dataType: {
      type: String,
      default: 'autoexec'
    },
    dataParam: {
      type: String,
      default: 'file'
    },
    desc: String,
    //文件格式判断
    handleFormatError: {
      type: Function,
      default: function(file) {
        this.$Notice.warning({
          title: this.$t('form.validate.fileformaterror'),
          desc: this.$t('term.process.formaterror', {target: file.name})
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
    disabled: {
      type: Boolean,
      default: false      
    },
    readonly: {
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
        responseType: 'blob'
      },
      uploadList: [],
      defaultFileList: [],
      fileStatus: 'normal',
      headerConfig: {
        Authorization: sessionStorage.getItem('neatlogic_authorization') ? sessionStorage.getItem('neatlogic_authorization') : ''
      },
      showDialog: false,
      dataConfig: {},
      validMesage: '',
      keyword: '',
      searchList: [],
      showNumber: 1 //展示文件数
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { this.getDataConfig(); },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    FormatError(file) {
      this.handleFormatError(file);
    },
    before(file) {
      this.fileStatus = 'normal';
      this.beforeUpload(file);
    },
    //上传成功
    success(res, file, fileList) {
      if (res.Status == 'OK') {
        file.id = res.Return.id;
        this.$Message.success(this.$t('message.uploadsuccess'));
        this.$emit('getFileList', fileList);
        let fileIdList = fileList.map(item => {
          return item.id;
        });
        let data = {
          fileIdList: fileIdList,
          fileList: fileList
        };
        this.$emit('change', data);
        this.fileStatus = 'success';
      }
    },
    //上传失败
    error(res, file, fileList) {
      if (file.Status == 'ERROR') {
        this.$Notice.error({
          title: this.$t('message.uploadfailed'),
          desc: file.Message
        });
      }
    },
    //上传时的接口
    progress(event, file) {},
    //移除
    handleRemove(item) {
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(item), 1);
      this.$emit('remove', this.$refs.upload.fileList);
      let fileIdList = [];
      if (fileList && fileList.length > 0) {
        fileIdList = fileList.map(item => {
          return item.id;
        });
      }
      let data = {
        fileIdList: fileIdList,
        fileList: fileList
      };
      this.$emit('change', data);
      return false;
    },
    //下载请求
    fileDownload(item) {
      let data = {
        id: item.id
      };
      this.$api.common.downLoad(data).then(res => {
        this.download(res.data, item.name);
      });
    },
    //下载
    download(data, fileName) {
      if (!data) {
        return;
      }
      let url = window.URL.createObjectURL(new Blob([data]));
      let link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    },
    //文件大小限制
    exceeded: function() {
      this.$Message.warning(this.$t('form.validate.fileoverlimit'));
    },
    // 清除upload方法
    handleClearFiles() {
      this.$refs.upload.fileList.splice(0);
    },
    lookFileList() {
      this.searchList = this.uploadList;
      this.showDialog = true;
    },
    close() {
      this.keyword = '';
      this.showDialog = false;
    },
    clearAll() {
      let data = {
        fileIdList: [],
        fileList: []
      };
      this.uploadList = [];
      this.searchList = this.uploadList;
      this.$emit('change', data);
      this.close();
    },
    getDataConfig() {
      let setting = Object.assign({}, this.config);
      setting.validateList = setting.validateList || [];
      if (typeof this.isRequired == 'number' || this.isRequired) {
        //当从别的判断带过来的关于这个组件是否必填的选项时，进行原来required的覆盖
        if (this.isRequired && setting.validateList.indexOf('required') < 0) {
          setting.validateList.push('required');
        } else if (!this.isRequired && setting.validateList.indexOf('required') > -1) {
          setting.validateList = setting.validateList.filter(v => {
            return v != 'required';
          });
        }
      }
      this.dataConfig = setting;
      this.showNumber = this.dataConfig.showNumber || 1;
      this.$emit('change', this.value || {});
    },
    valid() {
      let isValid = true;
      if (this.dataConfig && this.dataConfig.validateList && this.dataConfig.validateList.includes('required') && this.uploadList.length == 0) {
        this.validMesage = this.$t('form.validate.uploadfile');
        isValid = false;
      }
      return isValid;
    },
    searchKeyWord() {
      this.searchList = [];
      if (this.keyword && this.keyword != '') {
        this.uploadList.forEach(i => {
          if (i.name.indexOf(this.keyword) > -1) {
            this.searchList.push(i);
          }
        });
      } else {
        this.searchList = this.uploadList;
      }
    },
    dialogRemove(item) {
      this.searchList = this.searchList.filter(i => i.id != item.id);
      this.handleRemove(item);
    }
  },
  computed: {
    getShowList() {
      return function(list) {
        let showList = list.slice(0, this.showNumber);
        return showList;
      };
    },
    fileSpan() {
      let span = 24 / this.showNumber;
      return span;
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal && newVal.fileList) {
          let config = this.$utils.deepClone(newVal);
          let list = [];
          config.fileList.length && config.fileList.forEach(item => {
            let data = {
              name: item.name,
              id: item.id
            };
            list.push(data);
          });
          this.defaultFileList = list;
          this.$nextTick(() => {
            if (this.$refs.upload) {
              this.uploadList = this.$refs.upload.fileList;
            } else {
              this.uploadList = config.fileList;
            }
          });
        } else if (newVal && (!Object.keys(newVal).length || !newVal.fileList)) {
          this.defaultFileList = [];
          this.$nextTick(() => {
            this.uploadList = this.$refs.upload ? this.$refs.upload.fileList : [];
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
.file-main {
  width: 100%;
  display: flex;
  justify-content: space-between;
  > div {
    white-space: nowrap;
    &:not(:first-child) {
      padding-left: 10px;
    }
  }
  .file-more {
    text-align: right;
    line-height: 32px;
  }
}
.file-item {
  flex-grow: 1;
  text-align: left;
  line-height: 32px;
}
.file-detail {
  position: relative;
  padding-right: 20px;
  &:hover {
    .file-del {
      display: inline-block;
    }
  }
  .file-name {
    max-width: 100%;
  }
  .file-del {
    display: none;
    // padding-left: 4px;
    position: absolute;
    right: 0;
    top: 0;
  }
}
.all-file {
  width: 100%;
  line-height: 32px;
  .search {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
  .file-content{
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    height: 300px;
  }
}
</style>

