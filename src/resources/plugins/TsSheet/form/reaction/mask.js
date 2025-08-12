export default ({ overrideConfig, result, view }) => {
  if (!overrideConfig.isMask) {
    if (result) {
      view.$set(view.formItem.config, 'isMask', true);
      view.$set(view.currentItemReaction, 'currentItemMask', true);
    } else {
      view.$set(view.formItem.config, 'isMask', false);
      view.$set(view.currentItemReaction, 'currentItemMask', false);
    }
    view.addExecuteCount('mask');
  }
};
