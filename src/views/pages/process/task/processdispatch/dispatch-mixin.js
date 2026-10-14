export default {
  props: {
    processTaskId: {
      // 接收上报页已有或暂存后生成的 ID，兼容字符串形式以保留 LONG 精度。
      type: [Number, String],
      default: null
    }
  },
  data() {
    return { editorReady: false, contentRefsReady: false };
  },
  mounted() {
    this.syncContentRefs();
  },
  updated() {
    this.syncContentRefs();
  },
  methods: {
    syncContentRefs() {
      this.contentRefsReady = (!this.isNeedUploadFile || !!(this.$refs.dispatchFiles || this.$refs.changeFileList)) &&
        (!this.changeReport || (!!this.$refs.planStartEndTime && !!this.$refs.owner && !!this.$refs.changeStepList));
    }
  },
  computed: {
    attachmentUploadParams() {
      // 两类上报附件共用扩展参数，multipart 提交 JSON 字符串，无工单 ID 时省略。
      return this.processTaskId ? { extendParam: JSON.stringify({ processTaskId: this.processTaskId }) } : {};
    },
    contentReady() {
      return this.contentRefsReady && (!this.isNeedContent || this.editorReady);
    },
    getContentHelp() {
      return this.draftData?.startProcessTaskStep?.contentHelp || '';
    },
    descriptionTooltip() {
      return this.getContentHelp;
    },
    ckeditorPlaceholder() {
      return this.$utils.htmlToPlainText(this.getContentHelp);
    }
  }
};
