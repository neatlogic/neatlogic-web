export default ({ result, view}) => {
  if (result && !view.isFirstLoad && !view.$utils.isEmpty(view.formData[view.formItem.uuid])) {
    //清空当前组件数据
    view.setValue(null);
  }
  view.addExecuteCount('clearValue');
};
