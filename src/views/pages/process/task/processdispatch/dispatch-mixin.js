export default {
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
