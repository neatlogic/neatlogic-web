<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div>
        <Upload
          type="drag"
          action=""
          :format="formatList"
          :before-upload="beforeUpload"
          :show-upload-list="false"
        >
          <div class="drag-area bg-block">
            <div class="upload-icon"><img src="@/resources/components/UploadDialog/upload-icon.png" :alt="$t('page.icon')" /></div>
            <div class="upload-tip text-default">{{ file ? file.name : $t('page.uploadtips') }}</div>
            <div class="upload-limit text-tip">{{ uploadFilelimitTips }}</div>
          </div>
        </Upload>
        <div v-if="importResult" class="mt-md">
          <TsTable
            v-if="importResult.rowList && importResult.rowList.length > 0"
            class="mt-sm"
            v-bind="tableConfig"
          >
            <template v-slot:actionText="{ row }">
              <span v-if="row.action === 'add'" class="text-success">{{ row.actionText }}</span>
              <span v-else-if="row.action === 'update'" class="text-primary">{{ row.actionText }}</span>
              <span v-else>{{ row.actionText }}</span>
            </template>
            <template v-slot:status="{ row }">
              <span v-if="row.status === 'success'" class="text-success">{{ resultType === 'preview' ? '校验通过' : '成功' }}</span>
              <span v-else class="text-danger">失败</span>
            </template>
            <template v-slot:error="{ row }">
              <ul v-if="row.errorList && row.errorList.length > 0" class="error-list">
                <li v-for="(error, index) in row.errorList" :key="index" class="text-danger">{{ error }}</li>
              </ul>
            </template>
          </TsTable>
          <Alert class="mt-sm" :type="resultAlertType" show-icon>{{ resultMessage }}</Alert>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close(hasSuccess)">{{ hasSuccess ? $t('page.close') : $t('page.cancel') }}</Button>
      <Button v-if="importResult" @click="resetImport">重新选择文件</Button>
      <Button
        v-if="!importResult"
        type="primary"
        :loading="isPreviewing"
        :disabled="!file"
        @click="previewImport"
      >校验</Button>
      <Button
        v-if="canImport"
        type="primary"
        :loading="isImporting"
        @click="importIssue"
      >导入</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    appId: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: '导入',
        type: 'modal',
        maskClose: true,
        isShow: true,
        width: 'large'
      },
      file: null,
      isPreviewing: false,
      isImporting: false,
      formatList: ['xlsx'],
      importResult: null,
      resultType: '',
      hasSuccess: false,
      theadList: [
        { title: '行号', key: 'rowNum', width: 80 },
        { title: 'id', key: 'id' },
        { title: '标题', key: 'name' },
        { title: '动作', key: 'actionText', width: 90 },
        { title: this.$t('page.status'), key: 'status', width: 100 },
        { title: this.$t('page.error'), key: 'error', width: 90 }
      ]
    };
  },
  methods: {
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    beforeUpload(file) {
      const fileName = file && file.name ? file.name.toLowerCase() : '';
      if (!fileName.endsWith('.xlsx')) {
        this.$Message.warning('只支持xlsx格式');
        return false;
      }
      this.file = file;
      this.importResult = null;
      this.resultType = '';
      this.hasSuccess = false;
      return false;
    },
    resetImport() {
      this.file = null;
      this.importResult = null;
      this.resultType = '';
      this.hasSuccess = false;
    },
    previewImport() {
      if (!this.file) {
        return;
      }
      this.isPreviewing = true;
      this.$api.rdm.issue
        .previewImportIssue(this.getFormData())
        .then(res => {
          if (res.Status === 'OK') {
            this.resultType = 'preview';
            this.importResult = res.Return || {};
          }
        })
        .finally(() => {
          this.isPreviewing = false;
        });
    },
    importIssue() {
      if (!this.file || !this.canImport) {
        return;
      }
      this.isImporting = true;
      this.$api.rdm.issue
        .importIssue(this.getFormData())
        .then(res => {
          if (res.Status === 'OK') {
            const result = res.Return || {};
            if (result.status === 'success') {
              this.hasSuccess = true;
              this.close(true);
            } else {
              this.resultType = 'import';
              this.importResult = result;
            }
          }
        })
        .finally(() => {
          this.isImporting = false;
        });
    },
    getFormData() {
      const formData = new FormData();
      formData.append('appId', this.appId);
      formData.append('fileList', this.file);
      return formData;
    }
  },
  computed: {
    tableConfig() {
      return {
        theadList: this.theadList,
        tbodyList: (this.importResult && this.importResult.rowList) || [],
        showPager: false
      };
    },
    canImport() {
      return this.resultType === 'preview' && this.importResult && this.importResult.status === 'success' && (this.importResult.totalCount || 0) > 0;
    },
    resultAlertType() {
      return this.importResult && this.importResult.status === 'success' ? 'success' : 'error';
    },
    resultMessage() {
      if (!this.importResult) {
        return '';
      }
      const unchangedCount = this.importResult.unchangedCount || 0;
      const unchangedText = unchangedCount > 0 ? `，已跳过${unchangedCount}条无变化数据` : '';
      if (this.resultType === 'preview') {
        if (this.importResult.status === 'failed') {
          return `校验失败，请修正异常后重新上传${unchangedText}。`;
        }
        if ((this.importResult.totalCount || 0) === 0) {
          return `校验通过，没有需要导入的变化数据${unchangedText}。`;
        }
        return `校验通过，待新增${this.importResult.insertCount || 0}条，待更新${this.importResult.updateCount || 0}条${unchangedText}。`;
      }
      return `导入失败，本批未保存任何数据。请重新选择文件后再导入${unchangedText}。`;
    },
    uploadFilelimitTips() {
      return this.$t('message.supportuploadingsinglefileswithsuffixtarget', { target: this.formatList.join('、.') });
    }
  }
};
</script>
<style lang="less" scoped>
.drag-area {
  padding: 32px 16px;
  text-align: center;
}
.upload-icon {
  margin-bottom: 12px;
}
.error-list {
  margin: 0;
  padding-left: 16px;
}
</style>
