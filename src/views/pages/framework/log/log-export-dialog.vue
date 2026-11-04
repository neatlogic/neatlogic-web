<template>
  <TsDialog
    v-bind="dialogConfig"
    :loading="isDownloading"
    :okBtnDisable="isDownloading"
    @on-close="close"
    @on-ok="exportLog"
  >
    <template v-slot>
      <TsForm ref="form" :item-list="formConfig" :disabled="isDownloading"></TsForm>
    </template>
  </TsDialog>
</template>
<script>
import download from '@/resources/mixins/download.js';

export default {
  name: 'LogExportDialog',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue')
  },
  mixins: [download],
  props: {
    serverId: { type: Number, required: true },
    fileName: { type: String, required: true }
  },
  data() {
    return {
      isDownloading: false,
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        title: this.$t('page.export'),
        okText: this.$t('page.export'),
        width: 'mini'
      },
      formConfig: {
        type: {
          type: 'radio',
          label: this.$t('page.type'),
          value: 'groupAndDeduplicate',
          disabled: false,
          validateList: ['required'],
          dataList: [
            { value: 'groupAndDeduplicate', text: this.$t('page.logexport.groupanddeduplicate') },
            { value: 'originalData', text: this.$t('page.logexport.originaldata') }
          ],
          // 仅分组模式显示日期；切回原始模式时提交逻辑会排除残留时间。
          onChange: value => {
            this.formConfig.startTime.isHidden = value !== 'groupAndDeduplicate';
          }
        },
        startTime: {
          type: 'datetime',
          label: this.$t('page.starttime'),
          value: null,
          disabled: false,
          isHidden: false,
          format: 'yyyy-MM-dd HH:mm:ss',
          valueType: 'timestamp',
          transfer: true,
          desc: this.$t('page.logexport.alltimedesc')
        }
      }
    };
  },
  methods: {
    exportLog() {
      // 下载 mixin 不返回 Promise，通过既有状态回调控制重入、关闭和失败重试。
      if (this.isDownloading || !this.$refs.form.valid()) {
        return;
      }
      const values = this.$refs.form.getFormValue();
      const params = {
        serverId: this.serverId,
        fileName: this.fileName,
        type: values.type
      };
      if (values.type === 'groupAndDeduplicate' && values.startTime != null) {
        params.startTime = values.startTime;
      }
      this.setDownloading(true);
      this.download({
        url: 'api/binary/log/file/export',
        params,
        changeStatus: status => {
          if (status === 'success') {
            this.setDownloading(false);
            this.close();
          } else if (status === 'error') {
            this.setDownloading(false);
          }
        }
      });
    },
    setDownloading(value) {
      // TsForm 会回写控件的 disabled，完成后显式复位，确保下载失败后仍可修改并重试。
      this.isDownloading = value;
      this.formConfig.type.disabled = value;
      this.formConfig.startTime.disabled = value;
    },
    close() {
      // 取消和关闭只通知父页面销毁弹窗，不发起下载请求。
      this.$emit('close');
    }
  }
};
</script>
