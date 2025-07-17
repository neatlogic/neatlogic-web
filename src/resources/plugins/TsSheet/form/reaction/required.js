export default ({ overrideConfig, result, view }) => {
  if (!overrideConfig.isRequired) {
    if (result) {
      view.$set(view.formItem.config, 'isRequired', true);
      view.$set(view.currentItemReaction, 'cunrrentRequire', true);
    } else {
      view.$set(view.formItem.config, 'isRequired', false);
      view.$set(view.currentItemReaction, 'cunrrentRequire', false);
    }
    view.addExecuteCount('required');
  }
};
