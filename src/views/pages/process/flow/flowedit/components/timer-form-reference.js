export function getTimerFormItemList(formConfig, allFormitemList, sceneUuid) {
  if (!formConfig || !formConfig.uuid) return [];
  const currentSceneUuid = sceneUuid || formConfig.defaultSceneUuid || formConfig.uuid;
  let formItemList = allFormitemList || [];
  if (currentSceneUuid !== formConfig.uuid) {
    const scene = (formConfig.sceneList || []).find(item => item.uuid === currentSceneUuid);
    if (!scene) return [];
    formItemList = [];
    (scene.tableList || []).forEach(item => {
      const sceneComponent = item.component;
      if (!sceneComponent) return;
      const component = sceneComponent.inherit
        ? (allFormitemList || []).find(formItem => formItem.uuid === sceneComponent.uuid)
        : sceneComponent;
      if (!component) return;
      if (component.hasValue || component.handler === 'formdate') {
        formItemList.push(component);
      } else if (Array.isArray(component.component)) {
        formItemList.push(...component.component);
      }
    });
    if (!formItemList.length) formItemList = allFormitemList || [];
  }
  return formItemList.filter(item => item.handler === 'formdate' && item.config && item.config.isRequired);
}
