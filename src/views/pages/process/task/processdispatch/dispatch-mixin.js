export default {
  computed: {
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
