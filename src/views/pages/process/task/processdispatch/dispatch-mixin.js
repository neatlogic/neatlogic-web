export default {
  computed: {
    getContentHelp() {
      return this.draftData?.startProcessTaskStep?.contentHelp || '';
    },
    descriptionTooltip() {
      return this.getContentHelp;
    },
    ckeditorPlaceholder() {
      let contentHelp = this.getContentHelp;
      let textWithNewlines = contentHelp.replace(/>([^<]+)</g, (match, group) => `>${group}\n<`);
      return this.$utils.removeHTMLTag(textWithNewlines);
    }
  }
};
