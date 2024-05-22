<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <TsUpLoad
            dataType="RDM_TESTCASE_IMPORT"
            className="upload_block"
            type="drag"
            rowSpan="24"
            :multiple="ismutiple"
            :silent="true"
            :format="formatList"
            :params="{ projectId: projectId, appId: appId }"
            @getFileList="success"
          >
            <div class="drag-area bg-block">
              <div class="upload-icon"><img src="@/resources/components/UploadDialog/upload-icon.png" :alt="$t('page.icon')" /></div>
              <div v-download="downloadUrl" class="tsfont-download text-href" @click.stop>{{ $t('term.rdm.downloadtemplate') }}</div>
              <div class="upload-tip text-default">{{ $t('page.uploadtips') }}</div>
              <div class="upload-limit text-tip">
                {{ uploadFilelimitTips }}
              </div>
            </div>
          </TsUpLoad>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';

export default {
  name: '',
  components: {
    TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
  directives: { download },
  props: {
    projectId: { type: Number },
    appId: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.rdm.importtestcase'),
        type: 'modal',
        maskClose: true,
        isShow: true,
        width: 'small'
      },
      ismutiple: false,
      formatList: ['xls', 'xlsx']
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
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    success() {
      this.$Message.success(this.$t('message.importsuccess'));
      this.close(true);
    }
  },
  filter: {},
  computed: {
    downloadUrl() {
      return {
        url: 'api/binary/rdm/testcase/template/get',
        params: { projectId: this.projectId, appId: this.appId }
      };
    },
    uploadFilelimitTips() {
      if (this.$utils.isEmpty(this.formatList)) {
        if (this.ismutiple) {
          return this.$t('message.multiplefilescanbeuploaded');
        } else {
          return this.$t('message.singlefilescanbeuploaded');
        }
      } else {
        if (this.ismutiple) {
          return this.$t('message.supportuploadingmultiplefileswithsuffixtarget', { target: this.formatList.join('、.') });
        } else {
          return this.$t('message.supportuploadingsinglefileswithsuffixtarget', { target: this.formatList.join('、.') });
        }
      }
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
