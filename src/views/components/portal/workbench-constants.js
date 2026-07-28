export const WORKBENCH_TYPE_GLOBAL = 'global';
export const WORKBENCH_TYPE_PERSONAL = 'personal';

export function isWorkbenchMockModeEnabled() {
  return process.env.NODE_ENV !== 'production' ||
    process.env.VUE_APP_WORKBENCH_MOCK === 'true';
}
