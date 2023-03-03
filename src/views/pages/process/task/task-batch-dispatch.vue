<template>
  <div class="batch-dispatch-manage">
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-upload" @click="isUploadDialogVisiable = true">导入工单</span>
          <span class="action-item tsfont-download" @click="showDownloadDialog">下载模板</span>
        </div>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="6"><TsformSelect v-model="searchParams.status" v-bind="selectConfig" @on-change="status => search({ status })" /></Col>
          <Col :span="18"><InputSearcher v-model="searchParams.keyword" placeholder="标题/工单号" @change="search()"></InputSearcher></Col>
        </TsRow>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div>
          <TsTable
            v-if="!isLoading"
            :theadList="theadList"
            v-bind="tableConfig"
            @changeCurrent="currentPage => search({ currentPage })"
            @changePageSize="pageSize => search({ pageSize })"
          >
            <template v-slot:status="{ row }">
              <span v-if="row.status === 1" class="text-success">成功</span>
              <Tooltip
                v-else
                transfer
                theme="light"
                placement="bottom-start"
                :max-width="320"
                :offset="110"
              >
                <template v-slot:default>
                  <div class="text-danger overflow" style="max-width:160px;">
                    <span>失败</span>
                    <span>({{ row.errorReason }})</span>
                  </div>
                </template>
                <template v-slot:content>
                  {{ row.errorReason }}
                </template>
              </Tooltip>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>

    <!-- 导入工单对话框 -->
    <TsDialog
      title="导入工单"
      :hasFooter="false"
      :isShow.sync="isUploadDialogVisiable"
      className="task-upload-dialog"
    >
      <p class="text-primary">为避免导入失败，请使用本页面下载的模板</p>
      <Upload class="upload" v-bind="uploadConfig">
        <p class="upload-icon"><img src="@/resources/components/UploadDialog/upload-icon.png" /></p>
        <p class="upload-tip text-default">拖拽文件到此处或点击上传</p>
        <p class="upload-limit text-tip">支持导入10MB以内的.xlsx文件</p>
      </Upload>
    </TsDialog>

    <!-- 下载模板对话框 -->
    <TsDialog
      :isShow.sync="isDownloadDialogVisiable"
      title="下载模板"
      width="460px"
      className="download-dialog"
    >
      <template v-slot:default>
        <TsForm :itemList="channelList"></TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="isDownloadDialogVisiable = false">{{ $t('button.cancel') }}</Button>
        <Button
          v-download="downloadParams"
          v-download:success="downloadSuccess"
          :disabled="!channelUuid"
          type="primary"
        >{{ $t('button.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: 'BatchDispatchManage',
  directives: { download },
  components: {
    TsformSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },

  data() {
    return {
      isLoading: false,
      isUploadDialogVisiable: false,
      isDownloadDialogVisiable: false,
      channelUuid: '',
      selectConfig: {
        clearable: true,
        placeholder: '请选择上报状态',
        border: 'border',
        dataList: [
          { value: '0', text: '失败' },
          { value: '1', text: '成功' }
        ]
      },
      searchParams: {
        keyword: '',
        status: null,
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        { title: '记录ID', key: 'id' },
        { title: '工单号', key: 'serialNumber' },
        { title: '标题', key: 'title' },
        { title: '服务通道', key: 'channelName' },
        { title: '上报状态', key: 'status' },
        { title: '上报人', key: 'ownerVo', type: 'user' },
        { title: '导入时间', key: 'importTime', type: 'time' }
      ],
      tableConfig: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      channelList: [
        {
          name: 'channel',
          type: 'select',
          label: '服务',
          labelWidth: '80',
          width: '100%',
          transfer: true,
          validateList: ['required'],
          placeholder: '请选择服务',
          search: true,
          dynamicUrl: 'api/rest/process/channel/search',
          rootName: 'channelList',
          valueName: 'uuid',
          textName: 'name',
          value: '',
          dropdownMenuMaxWidth: '316px',
          onChange: value => {
            this.channelUuid = value;
          }
        }
      ],
      uploadConfig: {
        action: BASEURLPREFIX + '/api/binary/processtask/import/fromexcel',
        showUploadList: false,
        type: 'drag',
        format: ['xlsx'],
        accept: '.xlsx',
        maxSize: 1024 * 10,
        onSuccess: (...args) => {
          this.uploadSuccess(...args);
        },
        onError: (...args) => {
          this.uploadError(...args);
        }
      }
    };
  },
  created() {
    this.search();
  },
  methods: {
    search(params = {}) {
      this.isLoading = true;
      this.searchParams = { ...this.searchParams, currentPage: 1, ...params };
      if (this.searchParams.status === '') this.searchParams.status = null;
      this.$api.process.processtask.searchBatchDispatch(this.searchParams).then(res => {
        if (res.Status === 'OK') {
          const { auditList: tbodyList, rowNum, pageSize, currentPage } = res.Return;
          this.tableConfig = { tbodyList, rowNum, pageSize, currentPage };
          this.isLoading = false;
        }
      });
    },
    uploadSuccess(res) {
      this.isUploadDialogVisiable = false;
      this.$Message.success(this.$t('message.content.executesuccess'));
      this.search();
    },
    uploadError(error, res) {
      this.isUploadDialogVisiable = false;
      this.$Notice.error({ title: '上传失败', desc: res.Message });
      this.search();
    },
    showDownloadDialog() {
      this.isDownloadDialogVisiable = true;
      this.channelUuid = '';
      this.channelList[0].value = '';
    },
    downloadSuccess() {
      this.isDownloadDialogVisiable = false;
    }
  },
  computed: {
    downloadParams() {
      return {
        url: 'api/binary/processtask/template/export',
        params: {
          channelUuid: this.channelUuid
        }
      };
    }
  }
};
</script>

<style lang="less" scoped>
.task-upload-dialog {
  .upload {
    width: 100%;
    height: 271px;
    margin-top: 20px;
    margin-bottom: 8px;
    .upload-icon {
      width: 96px;
      height: 74px;
      margin-top: 59px;
      margin-left: 50%;
      transform: translateX(-50%);
    }
    .upload-tip {
      margin-top: 20px;
    }
    .upload-limit {
      margin-top: 4px;
      margin-bottom: 75px;
    }
  }
}
</style>
