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
  <div class="installation-package-wrap">
    <TsContain>
      <div slot="top" class="top">
        <div class="bar-top">
          <div class="bar-top-left wrapper">
            <div class="action-group">
              <template>
                <span class="text-action ts-angle-left" @click="goBack()">tagent列表</span>
              </template>
            </div>
          </div>
          <div class="bar-top-right">
            <span class="text-action tsfont-version" @click="isOpenDialog(true)">创建版本</span>
          </div>
        </div>
      </div>
      <template v-slot:content>
        <TsTable
          v-if="tableConfig.tbodyList"
          v-bind="tableConfig"
          class="inner-table"
          @changeCurrent="getTableList"
          @changePageSize="getTableList(1, ...arguments)"
        >
          <template slot="fileName" slot-scope="{row, index}">
            <span class="action-group">
              <span
                class="text-href action-item"
                :class="[isDownloading == index ? 'disable' : '']"
                :title="isDownloading == index ? '正在导出数据，请耐心等候' : ''"
                @click="downloadPackage(row, index)"
              >
                <Icon
                  v-if="isDownloading == index ? true : false"
                  type="ios-loading"
                  size="16"
                  class="loading"
                ></Icon>
                {{ row.fileName }}
              </span>
            </span>
            
          </template>
          <template slot="size" slot-scope="{row}">
            <span>{{ $utils.formatFileSize(row.size) }}</span>
          </template>
          <template slot="action" slot-scope="{ row , index}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="ts-trash" @click="delRow(row, index)">删除</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <!-- 创建版本 -->
    <TsDialog
      v-bind="dialogSetting"
      @on-cancel="isOpenDialog(false)"
      @on-close="isOpenDialog(false)"
      @on-ok="saveDialog"
    >
      <template v-slot>
        <TsForm ref="form" :itemList="itemList">
          <template v-slot:packageContent>
            <template v-if="hasFile">
              <TsFormSelect v-bind="itemList.pkgFileId" :validateList="hasFile ? ['required'] : []"></TsFormSelect>
            </template>
            <template v-else>
              <TsUpLoad
                class="upload"
                data-type="TAGENT"
                styleType="button"
                className="smallUpload"
                @getFileList="getFileList(...arguments)"
                @remove="getFileList(...arguments)"
              ></TsUpLoad>
              <span v-if="isShowErrorTips" class="red tips padding-l">请上传文件</span>
            </template>
          </template>
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsTable from '@/resources/components/TsTable/TsTable.vue';
import TsForm from '@/resources/plugins/TsForm/TsForm.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
import TsUpLoad from '@/resources/components/UpLoad/UpLoad.vue';
export default {
  name: 'InstallationPackage', // 安装包管理
  components: {
    TsTable,
    TsForm,
    TsFormSelect,
    TsUpLoad
  },
  filters: {
  },
  props: {
  },
  data() {
    let _this = this;
    return {
      isDownloading: -1, // 是否正在加载中
      dialogSetting: {
        type: 'modal',
        isShow: false,
        title: '创建版本'
      },
      hasFile: true, // 选择已有安装包true,上传文件false
      isShowErrorTips: false, // 显示错误提示
      tableConfig: {
        hideAction: false,
        theadList: [
          {
            title: '名称',
            key: 'fileName',
            type: 'linktext'
          },
          {
            title: '大小',
            key: 'size'
          },
          {
            title: '版本号',
            key: 'version'
          },
          {
            title: 'OS/OS版本',
            key: 'osType'
          },
          {
            title: 'CPU架构',
            key: 'osbit'
          },
          {
            title: '上传用户',
            key: 'fcuVo',
            type: 'user'
          },
          {
            title: '上传时间',
            key: 'fcd',
            type: 'time'
          },
          {
            key: 'action',
            title: ''
          }
        ],
        tbodyList: [],
        pageSize: 10,
        currentPage: 1,
        rowNum: null // 总条数
      },
      itemList: {
        version: {
          type: 'text', 
          label: '版本号',
          value: '',
          maxlength: 50,
          width: '100%',
          clearable: true,
          validateList: ['required']
        },
        osType: {
          type: 'select',
          label: 'OS类型',
          value: '',
          defaultValueIsFirst: true,
          width: '100%',
          textName: 'name',
          valueName: 'name',
          url: '/api/rest/tagent/ostype/list',
          dataList: [{text: 'name', value: 'name'}],
          validateList: ['required'],
          transfer: true

        },
        osbit: {
          type: 'select',
          label: 'CPU架构',
          value: '',
          defaultValueIsFirst: true,
          width: '100%',
          textName: 'value',
          valueName: 'value',
          url: '/api/rest/tagent/osbit/list',
          dataList: [{text: 'value', value: 'value'}],
          validateList: ['required'],
          transfer: true
        },
        installPackage: {
          type: 'radio',
          label: '安装包',
          value: 1,
          dataList: [{text: '选择已有安装包', value: 1}, {text: '上传文件', value: 2}],
          tooltip: '安装包用于agent升级，升级时，将根据目标主机的OS类型、CPU架构，找到匹配的安装包。下列选项中的【CPU架构】可选择‘default’，被标识为‘default’的安装包，可适配所有的CPU架构。',
          onChange: function(val) {
            _this.hasFile = val == 1;
            if (val == 2) {
              _this.$set(_this.itemList.pkgFileId, 'value', '');
            } else {
              _this.$set(_this.itemList.fileId, 'value', '');
            }
          }
        },
        packageContent: {
          type: 'slot',
          label: '',
          width: '100%'
        },
        fileId: {
          // 附件id
          type: 'text',
          label: '',
          isHidden: true
        },
        pkgFileId: {
          // 安装包id
          type: 'select',
          label: '',
          value: '',
          labelWidth: 1,
          width: '96%',
          dataList: [],
          isHidden: true,
          transfer: true,
          validateList: _this.hasFile ? ['required'] : [],
          onChange: function(val) {
            if (val) {
              _this.$set(_this.itemList.pkgFileId, 'value', val);
            }
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getTableList();
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
    downloadPackage(row, index) {
      // 下载安装包
      if (this.isDownloading >= 0) {
        // 不允许重复点击
        return false;
      }
      let data = {
        id: row.fileId
      };
      // this.$utils.download(this, '/api/binary/file/download', data, 'post');
      this.isDownloading = index;
      let url = '/api/binary/file/download';
      this.$https.post(url, data, {responseType: 'blob'}).then(res => {
        if (res.status == '200') {
          const aLink = document.createElement('a');
          let blob = new Blob([res.data], {
            type: 'application/x-msdownload'
          });
          aLink.href = URL.createObjectURL(blob);
          let contentDisposition = decodeURI(res.headers['content-disposition']);
          let fileName = contentDisposition.substring(22, contentDisposition.length - 1);
          aLink.download = fileName;
          aLink.click();
          document.body.appendChild(aLink);
          this.isDownloading = -1;
        } else {
          this.isDownloading = -1;
        }
      }).catch(() => {
        this.isDownloading = -1;
      });
    },
    goBack() {
      this.$router.push({
        path: '/tagent-manage'
      });
    },
    isOpenDialog(isBool) {
      // 上传安装包
      this.$set(this.dialogSetting, 'isShow', !!isBool);
      this.$set(this.itemList.version, 'value', ''); // 置空
      if (isBool) {
        this.tableConfig.tbodyList instanceof Array && this.tableConfig.tbodyList.forEach((val, index) => {
          if (val.fileId) {
            this.itemList.pkgFileId.dataList.push({
              text: `${val.fileName}_${val.osType}_${val.osbit}_${val.version}`,
              value: `${val.fileId}_${index + 1}`
            });
          }
        });
      } else {
        this.itemList.pkgFileId.dataList = [];
      }
    },
    getTableList(currentPage, pageSize) {
      // 获取列表数据
      let params = {
        currentPage: currentPage || this.tableConfig.currentPage,
        pageSize: pageSize || this.tableConfig.pageSize
      };
      this.tableConfig.pageSize = pageSize || this.tableConfig.pageSize;
      this.tableConfig.currentPage = currentPage || this.tableConfig.currentPage;
      this.$api.framework.tagent.getInstallPackageList(params).then((res) => {
        if (res.Status == 'OK') {
          Object.assign(this.tableConfig, res.Return);
        }
      });
    },
    delRow(row, index) {
      if (row && !row.fileId) {
        return false;
      }
      this.$api.framework.tagent.delInstallPackage({fileId: row.fileId, pkgVersionId: row.id}).then((res) => {
        if (res.Status == 'OK') {
          this.tableConfig.tbodyList.splice(index, 1);
          this.$Message.success(this.$t('message.content.deletesuccess'));
        }
      });
    },
    beforeUploadFormValid() {
      // 上传之前验证必填
      let form = this.$refs.form.valid();
      if (!form) {
        return false;
      } else {
        this.isShowBtn = false;
      }
    },
    getFileList(fileList) {
      if (!this.$utils.isEmpty(fileList)) {
        this.$set(this.itemList.fileId, 'value', fileList[0].id);
        this.isShowErrorTips = false;
        this.getTableList();
      } else {
        this.$set(this.itemList.fileId, 'value', null);
      }
    },
    validUpload() {
      let form = this.$refs.form.getFormValue();
      if (form && this.$utils.isEmpty(form.fileId) && !this.hasFile) {
        // 安装包错误提示
        this.isShowErrorTips = true;
        return false;
      } else {
        this.isShowErrorTips = false;
        return true;
      }
    },
    saveDialog() {
      // 保存安装包
      let form = this.$refs.form;
      let formValue = form.getFormValue();
      if (!form.valid() || !this.validUpload()) {
        // 必填
        return false;
      } 
      let params = {
        version: formValue.version, // tagent版本
        osType: formValue.osType, // os类型
        osbit: formValue.osbit, // cpu架构
        fileId: formValue.fileId || (formValue.pkgFileId && formValue.pkgFileId.split('_')[0]), // 文件id
        isOverWrite: 0 // 是否覆盖
      };
      this.$api.framework.tagent.saveInstallPackage(params).then((res) => {
        if (res.Status == 'OK' && res.Return == 1) {
          params.isOverWrite = res.Return;
          this.$createDialog({
            title: '警告',
            content: `版本号【${formValue.version}】，OS类型【${formValue.osType}】，CPU架构【${formValue.osbit}】的安装包已存在，是否替换`,
            btnType: 'error',
            btnList: [   
              {
                text: '取消',
                fn: vnode => {
                  vnode.isShow = false;
                }
              },
              {
                text: '替换',
                type: 'error', 
                ghost: true,
                fn: vnode => {
                  vnode.isShow = false;
                  this.$api.framework.tagent.saveInstallPackage(params).then((innerRes) => {
                    if (innerRes.Status == 'OK') {
                      this.$set(this.dialogSetting, 'isShow', false);
                      this.$set(this.itemList.fileId, 'value', null);
                      this.getTableList();
                      this.$Message.success('替换成功');
                    }
                  });
                }
              }
            ]
          });
        } else {
          this.$set(this.dialogSetting, 'isShow', false);
          this.$set(this.itemList.fileId, 'value', null);
          this.getTableList();
          this.$Message.success(this.$t('message.content.savesuccess'));
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="css">
.border-error-tips {
  border: 1px solid red;
  border-radius: 6px;
}
</style>
