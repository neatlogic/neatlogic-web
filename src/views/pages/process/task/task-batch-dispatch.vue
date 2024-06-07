<template>
  <div class="batch-dispatch-manage">
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item tsfont-upload" @click="isUploadDialogVisiable = true">{{ $t('term.process.importjob') }}</span>
          <span class="action-item tsfont-download" @click="showDownloadDialog">{{ $t('term.process.downloadtemp') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="6"><TsformSelect v-model="searchParams.status" v-bind="selectConfig" @on-change="status => search({ status })" /></Col>
          <Col :span="18"><InputSearcher v-model="searchParams.keyword" :placeholder="$t('page.title')+ '/' + $t('page.workordernumber')" @change="search()"></InputSearcher></Col>
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
              <span v-if="row.status === 1" class="text-success">{{ $t('page.success') }}</span>
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
                    <span>{{ $t('page.fail') }}</span>
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
      :title="$t('term.process.importjob')"
      :hasFooter="false"
      :isShow.sync="isUploadDialogVisiable"
      className="task-upload-dialog"
    >
      <p class="text-primary">{{ $t('term.process.importjobtip') }}</p>
      <Upload class="upload" v-bind="uploadConfig">
        <p class="upload-icon"><img src="@/resources/components/UploadDialog/upload-icon.png" /></p>
        <p class="upload-tip text-default">{{ $t('page.uploadtips') }}</p>
        <p class="upload-limit text-tip">{{ $t('term.process.importjobrule', {target: '.xlsx'}) }}</p>
      </Upload>
    </TsDialog>

    <!-- 下载模板对话框 -->
    <TsDialog
      :isShow.sync="isDownloadDialogVisiable"
      :title="$t('term.process.downloadtemp')"
      width="460px"
      className="download-dialog"
    >
      <template v-slot:default>
        <TsForm :itemList="channelList"></TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="isDownloadDialogVisiable = false">{{ $t('page.cancel') }}</Button>
        <Button
          v-download="downloadParams"
          v-download:success="downloadSuccess"
          :disabled="!channelUuid"
          type="primary"
        >{{ $t('page.confirm') }}</Button>
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
    TsformSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },

  data() {
    return {
      isLoading: false,
      isUploadDialogVisiable: false,
      isDownloadDialogVisiable: false,
      channelUuid: '',
      selectConfig: {
        clearable: true,
        placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.reportstatus')}),
        border: 'border',
        dataList: [
          { value: '0', text: this.$t('page.fail') },
          { value: '1', text: this.$t('page.success') }
        ]
      },
      searchParams: {
        keyword: '',
        status: null,
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        { title: this.$t('term.process.recordid'), key: 'id' },
        { title: this.$t('page.workordernumber'), key: 'serialNumber' },
        { title: this.$t('page.title'), key: 'title' },
        { title: this.$t('term.process.servicechannel'), key: 'channelName' },
        { title: this.$t('term.process.reportstatus'), key: 'status' },
        { title: this.$t('page.informant'), key: 'ownerVo', type: 'user' },
        { title: this.$t('term.process.importtime'), key: 'importTime', type: 'time' }
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
          label: this.$t('term.process.catalog'),
          labelWidth: '80',
          width: '100%',
          transfer: true,
          validateList: ['required'],
          placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.catalog')}),
          search: true,
          dynamicUrl: 'api/rest/process/channel/search/forselect?isAuthenticate=1',
          rootName: 'list',
          valueName: 'value',
          textName: 'text',
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
      this.$Message.success(this.$t('message.executesuccess'));
      this.search();
    },
    uploadError(error, res) {
      this.isUploadDialogVisiable = false;
      this.$Notice.error({ title: this.$t('message.uploadfailed'), desc: res.Message });
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
