export default ({ overrideConfig, result, view }) => {
  if (!overrideConfig.isHide) {
    if (result) {
      view.showFormItem();
    } else {
      view.hideFormItem();
    }
    view.addExecuteCount('display');
  }
};
