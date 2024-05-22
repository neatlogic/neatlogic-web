<template>
  <div v-if="showDialog">
    <TsDialog :isShow.sync="showDialog" v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div slot="content">
          <loading :loadingShow="knowledgeLoading" type="fix"></loading>
          <TsRow>
            <Col span="12">
              <div class="comparison-box bg-op">
                <ComparisonDetail
                  ref="oldData"
                  :config="oldDataConfig"
                  :navWidth="navWidth"
                  @updateMouseover="oldMouseover"
                  @updateScrollTop="oldScroll"
                >
                  <template v-slot:top>
                    <div class="top-content">
                      <CommonStatus
                        v-if="newVersionId == oldKnowledgeDocumentVersionId"
                        :statusName="$t('page.enable')"
                        statusValue="current"
                      ></CommonStatus>
                      <TsFormSelect
                        v-model="oldKnowledgeDocumentVersionId"
                        :dataList="editList"
                        :clearable="false"
                        border="none"
                        :search="false"
                        style="display: inline-block;"
                        @on-change="getVersionDocument"
                      ></TsFormSelect>
                    </div>
                  </template>
                </ComparisonDetail>
              </div>
            </Col>
            <Col span="12">
              <div class="comparison-box bg-op">
                <ComparisonDetail
                  ref="newData"
                  :config="newDataConfig"
                  :navWidth="navWidth"
                  @updateMouseover="newMouseover"
                  @updateScrollTop="newScroll"
                >
                  <template v-slot:top>
                    <div class="top-content">
                      <CommonStatus
                        v-if="newVersionId == newKnowledgeDocumentVersionId"
                        :statusName="$t('page.enable')"
                        statusValue="current"
                      ></CommonStatus>
                      <TsFormSelect
                        v-model="newKnowledgeDocumentVersionId"
                        :dataList="editList"
                        :clearable="false"
                        :search="false"
                        border="none"
                        style="display: inline-block;"
                        @on-change="getVersionDocument"
                      ></TsFormSelect>
                    </div>
                  </template>
                </ComparisonDetail>
              </div>
            </Col>
          </TsRow>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    ComparisonDetail: () => import('./comparison-detail.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    TsFormSelect
  },
  filters: {},
  props: {
    isShow: { type: Boolean, default: false },
    version: { type: [String, Number], default: null },
    newVersionId: { type: [String, Number], default: null },
    oldVersionId: { type: [String, Number], default: null },
    knowledgeDocumentId: { type: [String, Number], default: null }
  },
  data() {
    return {
      knowledgeLoading: false,
      showDialog: false,
      dialogConfig: {
        type: 'slider',
        title: this.$t('dialog.title.versioncomparison'),
        maskClose: true,
        isShow: true,
        width: '1400px',
        hasFooter: false
      },
      oldDataConfig: {},
      newDataConfig: {},
      editList: [],
      oldKnowledgeDocumentVersionId: null,
      newKnowledgeDocumentVersionId: null,
      flagscroll: 1 //滚动条的位置
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
    getVersionDocument() {
      this.knowledgeLoading = true;
      let data = {
        newVersionId: this.newKnowledgeDocumentVersionId,
        oldVersionId: this.oldKnowledgeDocumentVersionId
      };
      this.$api.knowledge.knowledge.versionDocument(data).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return;
          this.newDataConfig = config.newDocumentVo;
          this.oldDataConfig = config.oldDocumentVo;
          this.knowledgeLoading = false;
        }
      });
    },
    close() {
      this.showDialog = false;
      this.$emit('update:isShow', false);
    },
    oldMouseover() {
      this.flagscroll = 1;
    },
    newMouseover() {
      this.flagscroll = 0;
    },
    oldScroll(scrollTop) {
      if (this.flagscroll == 1) {
        this.$refs.newData.setScroll(scrollTop);
      }
    },
    newScroll(scrollTop) {
      if (this.flagscroll == 0) {
        this.$refs.oldData.setScroll(scrollTop);
      }
    },
    getHistoricalversionList() {
      let data = {
        knowledgeDocumentId: this.knowledgeDocumentId
      };
      this.$api.knowledge.knowledge.selectHistoricalversion(data).then(res => {
        if (res.Status == 'OK') {
          this.editList = res.Return.list || [];
        }
      });
    }
  },
  computed: {
    navWidth() {
      let width = '200px';
      let isNewNav = false;
      let isOldNav = false;
      if (this.newDataConfig.lineList && this.newDataConfig.lineList.length > 0) {
        let typeArr = ['h1', 'h2'];
        for (let i = 0; i < this.newDataConfig.lineList.length; i++) {
          if (typeArr.indexOf(this.newDataConfig.lineList[i].handler) > -1) {
            isNewNav = true;
            return;
          }
        }
      }
      if (this.newDataConfig.fileList && this.newDataConfig.fileList.length > 0) {
        isNewNav = true;
      }
      if (this.oldDataConfig.lineList && this.oldDataConfig.lineList.length > 0) {
        let typeArr = ['h1', 'h2'];
        for (let i = 0; i < this.oldDataConfig.lineList.length; i++) {
          if (typeArr.indexOf(this.oldDataConfig.lineList[i].handler) > -1) {
            isOldNav = true;
            return;
          }
        }
      }
      if (this.newDataConfig.fileList && this.newDataConfig.fileList.length > 0) {
        isNewNav = true;
      }
      if (isNewNav || isOldNav) {
        width = '200px';
      } else {
        width = '0px';
      }
      return width;
    }
  },
  watch: {
    isShow(val) {
      this.showDialog = val;
      if (val) {
        this.newKnowledgeDocumentVersionId = this.newVersionId;
        this.oldKnowledgeDocumentVersionId = this.oldVersionId;
        this.getVersionDocument();
        this.getHistoricalversionList();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.comparison-box {
  width: 100%;
  height: calc(100vh - 52px - 48px - 24px);
  border-radius: 10px;
  .top-content {
    width: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
  }
}
</style>
