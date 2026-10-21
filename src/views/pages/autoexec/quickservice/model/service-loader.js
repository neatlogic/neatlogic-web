import utils from '@/resources/assets/js/util.js';

export function extractFormFields(config = {}) {
  return (config.tableList || []).filter(field => field.component && field.component.hasValue).map(field => field.component);
}

export async function loadTool(api, id) {
  if (!id) return {};
  const response = await api.autoexec.action.getActionDetail({ id });
  return response.Status === 'OK' ? utils.deepClone(response.Return) : null;
}

export async function loadForm(api, uuid) {
  if (!uuid) return { formConfig: null, formFields: [] };
  const response = await api.framework.form.getFormByVersionUuid({ uuid });
  if (response.Status !== 'OK') return null;
  const formConfig = utils.deepClone(response.Return.formConfig);
  return { formConfig, formFields: extractFormFields(formConfig) };
}

export async function loadServiceDependencies(api, service) {
  const [combop, form] = await Promise.all([loadTool(api, service.combopId), loadForm(api, service.formUuid)]);
  return combop && form ? { combop, ...form } : null;
}
