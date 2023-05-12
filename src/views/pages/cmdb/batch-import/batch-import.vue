<template>
  <div class="batch-import">
    <TsContain
      :isSiderHide="isHelpHide"
      siderPosition="right"
      navBorderBottom="none"
      :class="{helps:!isHelpHide}"
    >
      
      <template v-slot:topLeft>
        <span class="text-action" :class="tabName == 'upload'?'text-primary':''" @click="tabName='upload'">{{ $t('page.importaudit') }}</span>
        <Divider type="vertical" />
        <span class="text-action" :class="tabName == 'download'?'text-primary':''" @click="tabName='download'">{{ $t('term.process.downloadtemp') }}</span>
      </template>

      <ul slot="topRight" class="action-group" :style="{'text-align': 'right'}">
        <li v-auth="['ADMIN']" class="action-item">
          <AuditConfig auditName="CIENTITY-IMPORT-AUDIT"></AuditConfig>
        </li>
        <li v-show="tabName==='upload'" class="tsfont-import text-action action-item" @click.self="openUploadDialog">{{ $t('page.uploadimportfile') }}</li>
        <li
          v-show="tabName==='download'"
          v-download="downloadUrl"
          v-download:prevent="preventDownload"
          class="tsfont-download text-action action-item"
        >{{ $t('term.process.downloadtemp') }}</li>
        <li class="tsfont-question-o text-action action-item" @click="isHelpHide = !isHelpHide">{{ $t('page.help') }}</li>
      </ul>

      <template slot="content">
        <div class="">
          <ImportAudit v-show="tabName==='upload'" ref="audit" />
          <ImportTemplate v-show="tabName==='download'" ref="template" @on-template-change="getDownloadParams" />
        </div>
      </template>

      <div slot="sider" class="help-container">
        <h3 class="help-title text-title">{{ $t('page.help') }}</h3>
        <ul class="help-list">
          <li class="help-item">{{ $t('message.cmdb.importhelp1') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp2') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp3') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp4') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp5') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp6') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp7') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp8') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp9') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp10') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp11') }}</li>
          <li class="help-item">{{ $t('message.cmdb.importhelp12') }}</li>
        </ul>
      </div>

    </TsContain>

    <!-- 上传对话框 -->
    <UploadDialog 
      ref="uploadDialog"
      :actionUrl="actionUrl"
      :data="{param: 'file', type: 'cmdb'}"
      :formatList="['xls', 'xlsx']"
      immediatelyUpload
      :showSuccessNotice="false"
      :defaultFileList.sync="defaultFileList" 
      @on-remove-file="removeFile"
      @on-success="fileUploaded"
    >
      <div slot="footer" class="flex-between" :style="{margin: '0 8px'}">
        <div class="flex-start">
          <Checkbox v-model="importParams.editMode" :true-value="'global'" :false-value="'partial'">{{ $t('page.globalupdate') }}</Checkbox>
        </div>
        <div class="flex-end">
          <Button :disabled="fileList.length === 0" @click="confirmImport('append')">{{ $t('page.onlyadd') }}</Button>
          <Button :disabled="fileList.length === 0" @click="confirmImport('update')">{{ $t('page.onlyupdate') }}</Button>
          <Button :disabled="fileList.length === 0" @click="confirmImport('all')">{{ $t('page.addupdate') }}</Button>
        </div>
      </div>
    </UploadDialog>
    
  </div>
</template>

<script>
import download from '@/resources/directives/download.js';

export default {
  name: 'BatchImport',
  components: {
    ImportAudit: resolve => require(['./batch-import-audit.vue'], resolve),
    ImportTemplate: resolve => require(['./batch-import-template.vue'], resolve),
    UploadDialog: resolve => require(['components/UploadDialog/UploadDialog'], resolve),
    AuditConfig: resolve => require(['@/views/components/auditconfig/auditconfig.vue'], resolve)
  },
  directives: { download },
  data() {
    this.actionUrl = BASEURLPREFIX + '/api/binary/cmdb/import/file/upload';
    this.importNotice = {
      append: this.$t('message.cmdb.importaddconfirm'),
      update: this.$t('message.cmdb.importupdateconfirm'),
      all: this.$t('message.cmdb.importaddupdateconfirm')
    };
    return {
      auditConfig: null,
      timeSelectConfig: {//时间选择器的数据
        border: 'border',
        placement: 'bottom-start',
        clearable: false,
        transfer: true,
        width: '100%',
        isMore: false,
        type: 'datetimerange',
        format: 'yyyy-MM-dd HH:mm:ss'
      },
      tabName: 'upload',
      isHelpHide: true,
      importParams: {
        editMode: 'partial',
        action: null
      },
      downloadParams: {
        ciId: null, 
        attrIdList: null, 
        relIdList: null
      },
      defaultFileList: [],
      fileList: []
    };
  },
  mounted() {
    //this.getDefaultFile(); //获取导入文件：可以多次导入（暂时不需要）
  },
  methods: {
    async openUploadDialog() {
      await this.getDefaultFile();
      this.$refs.uploadDialog.showDialog();
    },
    async getDefaultFile() {
      const res = await this.$api.cmdb.batchImport.getFile();
      this.fileList = this.defaultFileList = res.Return.list.map(file => {
        const {id: uuid, name, size} = file;
        return {uuid, status: 'OK', file: {name, size}, removable: true};
      });
    },
    fileUploaded(res, file, fileList) {
      file.uuid = res.Return.id;
      file.removable = true;
      this.fileList = fileList;
    },
    async removeFile(file, fileList) {
      const params = {fileId: file.uuid};
      const res = await this.$api.cmdb.batchImport.deleteFile(params);
      this.fileList = fileList;
    },
    confirmImport(action) {
      this.importParams.action = action;
      this.$createDialog({
        title: this.$t('page.tip'),
        content: this.importNotice[action],
        'on-ok': async vnode => { 
          const res = await this.$api.cmdb.batchImport.startImport(this.importParams);
          this.$Message.success(this.$t('message.executesuccess'));
          vnode.isShow = false;
          this.$refs.uploadDialog.hideDialog();
          this.$refs.audit.search();
        }
      });
    },
    getDownloadParams(ciId, selectedList = []) {
      this.downloadParams.ciId = ciId;
      this.downloadParams.attrIdList = selectedList
        .filter(item => item.rowType === 'attr')
        .map(item => item.id);
      this.downloadParams.relIdList = selectedList
        .filter(item => item.rowType === 'rel')
        .map(item => item.id);
    }
  },
  computed: {
    downloadUrl() {
      return {
        url: 'api/binary/cmdb/import/template/get',
        params: this.downloadParams
      };
    },
    preventDownload() {
      const {ciId, attrIdList, relIdList} = this.downloadParams;
      if (!ciId) return true;
      const hasAttr = attrIdList && attrIdList.length > 0;
      const hasRel = relIdList && relIdList.length > 0;
      if (!hasAttr && !hasRel) return true;
      return false;
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.batch-import {
  // /deep/.ivu-layout-sider,/deep/.ivu-layout-content{
  //   background-color: @default-op;
  // }
  .helps{
    /deep/ .tscontain-sider{
      margin-left: 16px;
    }
  }
  
  /deep/.ivu-tabs-bar{
    margin-bottom: 1px;
  }
  .border8{
    border-radius: 0px 8px 8px 8px;
  }
  .action-item {
    user-select: none;
    margin-right: 0px!important;
    &::before {
      padding-right: 0;
    }
  }

  .help-container {
    padding: 10px 14px;
		.help-title {
      font-weight: normal;
      margin-bottom: 5px;
    }
    .help-list {
      list-style: unset;
      .help-item {
        list-style: unset;
        list-style-position: outside;
        margin-bottom: 10px;
        margin-left: 10px;
      }
    }
	}
}
</style>
