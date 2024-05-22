<template>
  <div class="ForwardingDetail">
    <div class="default-detail bg-op radius-lg padding">
      <div class="top-title" :class="{'pb-nm':isShowDetail}" @click="isShowDetail = !isShowDetail">
        转报提醒
        <span class="detail-icon text-action" :class="isShowDetail?'tsfont-down':'tsfont-up'"></span>
      </div>
      <div v-show="isShowDetail">
        <span v-if="index > 0" class="tsfont-tabforword left-btn bg-three text-action" @click="goLeft()"></span>
        <span v-if="index < total-1" class="tsfont-tabforword right-btn bg-three text-action" @click="goRight()"></span>
        <TsRow>
          <Col span="8">
            <div class="text-title pb-sm" v-html="processTaskVo.tranferReportDirection == 'from'?$t('term.process.origintasktitle'):$t('term.process.targettasktitle')"></div>
            <div class="overflow text-action" @click="toTaskdetail(processTaskVo.id)">
              {{ processTaskVo.title }}
            </div>
          </Col>
          <Col span="8">
            <div class="text-title pb-sm">
              {{ $t('page.workordernumber') }}
            </div>
            <div class="">
              <span class="text-action" style="padding-right:8px;" @click="toTaskdetail(processTaskVo.id)">{{ processTaskVo.serialNumber }}</span>
              <i v-clipboard="processTaskVo.serialNumber" v-clipboard:success="clipboardSuc" class="tsfont-copy text-action"></i>
            </div>
          </Col>
          <Col span="8">
            <div class="text-title pb-sm">
              {{ $t('page.status') }}
            </div>
            <div v-if="processTaskVo.statusVo" :style="{'color':processTaskVo.statusVo.color}">{{ processTaskVo.statusVo.text }}</div>
          </Col>
        </TsRow>
        <div v-if="processTaskVo.tranferReportDirection == 'from' && (processTaskVo.comment || processTaskVo.formConfig)" class="detail-show-btn dividing-color">
          <span class="text-href" @click="openDetail()">{{ $t('page.detail') }}<i :class="isShow?'tsfont-up':'tsfont-down'"></i></span>
        </div>
        <div v-if="processTaskVo.tranferReportDirection == 'from' && processTaskVo.comment && isShow" class="comment-detail dividing-color">
          <div class="text-title">{{ $t('page.description') }}</div>
          <div v-html="processTaskVo.comment.content"></div>
          <div v-if="processTaskVo.comment.fileList && processTaskVo.comment.fileList.length > 0">
            <div v-for="file in processTaskVo.comment.fileList" :key="file.id">
              <span v-download="downurl('/api/binary/file/download',file.id)" class="tsfont-attachment text-action">{{ file.name }}</span>
            </div>
          </div>
        </div>
        <div v-if="processTaskVo.tranferReportDirection == 'from' && processTaskVo.formConfig && isShow" class="form-detail dividing-color">
          <TsSheet
            v-if="processTaskVo.formConfig._type == 'new'"
            ref="formSheet"
            mode="read"
            :value="processTaskVo.formConfig"
            :data="processTaskVo.formAttributeDataMap"
            :disabled="true"
          ></TsSheet>
          <FormPreview
            v-else
            ref="FormPreview"
            :isReadonly="true"
            :content="formConfig(processTaskVo)"
          ></FormPreview>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import FormPreview from '@/resources/components/FormMaker/formview/form-view.vue';
import clipboard from '@/resources/directives/clipboard.js';
import download from '@/resources/directives/download.js';
export default {
  name: 'ForwardingDetail',
  components: {
    FormPreview,
    TsSheet: () => import('@/resources/plugins/TsSheet/TsSheet.vue')

  },
  directives: {clipboard, download},
  filters: {},
  props: {
    tranferReportProcessTaskList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      processTaskList: [],
      processTaskVo: null, //当前转报展示工单（原工单/目标工单）
      isShow: false,
      index: 0,
      total: 1,
      isShowDetail: true
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
    getProcessTaskVo() {
      this.isShow = false;
      let config = this.processTaskList[this.index];
      this.processTaskVo = config;
      let startProcessTaskStep = config.startProcessTaskStep;
      if (config.tranferReportDirection == 'from' && startProcessTaskStep.comment) {
        let comment = startProcessTaskStep.comment;
        if (comment && (comment.content || (comment.fileList && comment.fileList.length > 0))) {
          let taskComment = comment;
          this.$set(this.processTaskVo, 'comment', taskComment);
        }
      }
    },
    goLeft() {
      this.index -= 1;
      this.getProcessTaskVo();
    },
    goRight() {
      this.index += 1;
      this.getProcessTaskVo();
    },
    openDetail() {
      this.isShow = !this.isShow;
    },
    toTaskdetail(id) {
      window.open(HOME + '/process.html#/task-detail?processTaskId=' + id, '_blank');
    },
    clipboardSuc: function() {
      this.$Message.success(this.$t('message.executesuccess'));
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    },
    formConfig() {
      return function(config) {
        let formConfig = config.formConfig; //获取表单信息
        let formAttributeActionMap = config.formAttributeActionMap;
        formAttributeActionMap &&
            formConfig.controllerList.forEach(formItem => {
              if (formAttributeActionMap[formItem.uuid] && formAttributeActionMap[formItem.uuid] == 'read') {
                this.$set(formItem, 'isReadonly', true);
              }
              if (formAttributeActionMap[formItem.uuid] && formAttributeActionMap[formItem.uuid] == 'hide') {
                this.$set(formItem, 'isHide', true);
              }
            });
        if (config.formAttributeDataMap) {
          this.$nextTick(() => {
            if (this.$refs.FormPreview) {
              this.$refs.FormPreview.updateFormval(config.formAttributeDataMap);
            }
          });
        }
        return formConfig;
      };
    }
  },
  watch: {
    tranferReportProcessTaskList: {
      handler(val) {
        if (val && val.length > 0) {
          this.processTaskList = this.$utils.deepClone(val);
          this.total = Math.floor(this.processTaskList.length);
          this.getProcessTaskVo();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.ForwardingDetail {
  .top-title {
    position: relative;
    .detail-icon {
      position: absolute;
      right: 0;
      top: 0;
    }
  }
  .detail-show-btn {
    border-top: 1px dashed;
    text-align: center;
    margin-top: 10px;
    padding-top: 10px;
  }
  .default-detail {
    position: relative;
  }
  .form-detail,
  .comment-detail {
    border-top: 1px solid;
    padding-top: 10px;
    margin-top: 10px;
  }
  .left-btn{
    position: absolute;
    top: 18px;
    left: 0;
    width: 12px;
    height: 40px;
    line-height: 40px;
    transform: rotate(180deg);
  }
  .right-btn{
    position: absolute;
    top: 18px;
    right: 0;
    width: 12px;
    height: 40px;
    line-height: 40px;
  }
}
</style>
