export default ({ overrideConfig, result, view }) => {
  if (!overrideConfig.isReadonly) {
    if (result) {
      view.$set(view.formItem.config, 'isReadOnly', true);
      view.$set(view.currentItemReaction, 'currentItemReadonly', true);
    } else {
      view.$set(view.formItem.config, 'isReadOnly', false);
      view.$set(view.currentItemReaction, 'currentItemReadonly', false);
    }
    view.addExecuteCount('readonly');
  }
};
