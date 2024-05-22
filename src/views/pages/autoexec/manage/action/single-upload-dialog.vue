<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      :hasFooter="tbodyList.length ? true : false"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div v-if="!isShowResult">
          <Upload
            v-if="!isUpload"
            type="drag"
            :action="actionUrl"
            :multiple="false"
            :show-upload-list="false"
            :format="formatList"
            :before-upload=" file => {handleBeforeUpload(file)}"
            :on-success="handleSuccess"
            :on-error="handleError"
          >
            <div class="upload-tip bg-op">
              <div class="upload-icon"><img src="~@/resources/components/UploadDialog/upload-icon.png" alt="uploadicon" /></div>
              <p>{{ $t('page.uploadtips') }}</p>
              <div class="upload-limit text-tip">
                {{ $t('page.uploadtype', {target: '.pak'}) }}
                <br />
                {{ $t('page.uploadfilelimit', {target: '10'}) }}
              </div>
            </div>
          </Upload>
          <div v-else>
            <div v-if="uploadTooltip">
              <Alert show-icon>{{ uploadTooltip }}</Alert>
            </div>
            <TsFormCheckbox
              v-model="nameList"
              :dataList="tbodyList"
              vertical
            ></TsFormCheckbox>
          </div>
        </div>
        <div v-else-if="resultConfig.failureReasonList">
          <div v-for="(result,index) in resultConfig.failureReasonList" :key="index" class="reason-list overflow pb-md">
            <span class="name pr-nm overflow" :title="result.item">{{ result.item }}</span>
            <span v-if="result.isSucceed" class="result overflow">
              <Tooltip
                placement="bottom-start"
                max-width="380"
                theme="light"
                transfer
                :style="{width: '100%'}"
                :content="!$utils.isEmpty(result.warnList)?result.warnList.join('；'):''"
                :disabled="$utils.isEmpty(result.warnList)"
              >
                <div class="overflow result-text">
                  <span class="text-success">{{ $t('message.importsuccess') }}</span>
                  <span v-if="!$utils.isEmpty(result.warnList)" class="text-warning pl-sm">{{ result.warnList.join('；') }}</span>
                </div>
              </Tooltip>
            </span>
            <span v-else-if="!result.isSucceed && result.list && result.list.length" class="result text-danger overflow">
              <Tooltip
                placement="bottom-start"
                max-width="380"
                theme="light"
                transfer
                :style="{width: '100%'}"
              >
                <div class="overflow result-text">{{ $t('message.importfailed') }}：{{ result.list.join('；') }}</div>
                <div slot="content">
                  {{ $t('message.importfailed') }}：{{ result.list.join('；') }}
                </div>
              </Tooltip>
            </span>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <slot name="footer">
          <template v-if="!isImport">
            <Button @click="closeDialog">{{ $t('page.cancel') }}</Button>
            <Button type="primary" @click="okImport">{{ $t('page.import') }}</Button>
          </template>
          <template v-else>
            <Button type="primary" @click="closeDialog">{{ $t('page.complete') }}</Button>
          </template>
        </slot>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import upload from '@/resources/mixins/upload.js';
export default {
  name: '',
  components: {
    TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox')
  },
  mixins: [upload],
  props: {
    uploadTooltip: {
      type: String, //提示文本
      default: ''
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('page.uploadattachment'),
        type: 'modal',
        isShow: true,
        height: '300px'
      },
      formatList: ['pak'], //导入文件格式
      uploadParams: {},
      isUpload: false,
      isImport: false,
      tbodyList: [],
      nameList: [],
      actionUrl: BASEURLPREFIX + '/api/binary/autoexec/combop/import/list', //导入地址
      isShowResult: false, //是否展示导入结果
      resultConfig: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleBeforeUpload(file) {
      this.$set(this.uploadParams, 'file', file);
    },
    handleSuccess(response, file) {
      let desc = '';
      this.tbodyList = [];
      if (response.Status === 'OK') {
        let list = response.Return.tbodyList || [];
        this.nameList = this.$utils.deepClone(list);
        if (list && list.length) {
          this.isUpload = true;
          list.forEach(item => {
            this.tbodyList.push({
              text: item,
              value: item
            });
          });
        }
      } else if ((response.Status = 'ERROR')) {
        this.$Notice.error({
          title: this.$t('message.importfailed'),
          desc: response.Return.result || desc
        });
      }
    },
    handleError(error, response, file) {
      if ((file.Status = 'ERROR')) {
        this.$Notice.error({
          title: this.$t('message.importfailed'),
          desc: response.Message
        });
      }
    },
    okImport() {
      if (!this.nameList.length) {
        this.$Notice.error({
          title: this.$t('term.autoexec.chooseonecombinetooldesc')
        });
        return;
      }
      this.$set(this.uploadParams, 'nameList', this.nameList);
      this.upload(
        '/api/binary/autoexec/combop/import',
        this.uploadParams,
        {},
        res => {
          this.isImport = true;
          const resultConfig = res.Return;
          this.resultConfig = resultConfig;
          if (!resultConfig.failureCount) {
            let isShowResult = false;
            resultConfig.failureReasonList.forEach(item => {
              if (!this.$utils.isEmpty(item.warnList)) {
                isShowResult = true;
              }
            });
            if (!isShowResult) {
              this.$Message.success(this.$t('message.importsuccess'));
              this.closeDialog();
            } else {
              this.isShowResult = true;
            }
          } else {
            this.isShowResult = true;
          }
        },
        error => {
          this.$Notice.error({
            title: this.$t('message.importfailed'),
            desc: error.Message
          });
        }
      );
    },
    closeDialog() {
      this.$emit('close', this.isImport);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.upload-tip {
  padding: 60px 0;
}
.reason-list {
  display: flex;
  justify-content: flex-start;
  .name {
    width: 150px;
  }
  .result {
    flex: 1;
    width: 100%;
    .result-text {
      width: 100%;
    }
  }
}
</style>
