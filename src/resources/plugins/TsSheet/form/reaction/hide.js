export default ({ overrideConfig, result, view}) => {
  if (!overrideConfig.isHide) {
    if (result) {
      view.hideFormItem();
    } else {
      view.showFormItem();
    }
    view.addExecuteCount('hide');
  }
};
