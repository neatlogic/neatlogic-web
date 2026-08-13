export const PROCESS_TASK_SEARCH_HANDLER = 'process.processTaskSearch';
export const PROCESS_TASK_THEAD_HANDLER = 'process.processTaskTheadList';
export const PROCESS_TASK_CONDITION_HANDLER = 'process.processTaskSearchCondition';
export const PROCESS_TASK_WIDGET_NAME = 'processTaskSearch';
export const PROCESSING_OF_MINE_PROCESS_TASK_HANDLER = 'process.processingOfMineProcessTask';
export const PROCESSING_OF_MINE_PROCESS_TASK_WIDGET_NAME = 'processingOfMineProcessTask';
export const DRAFT_PROCESS_TASK_HANDLER = 'process.draftProcessTask';
export const DRAFT_PROCESS_TASK_WIDGET_NAME = 'draftProcessTask';
export const PROCESS_FAVORITE_SERVICE_HANDLER = 'process.favoritedServiceList';
export const PROCESS_FAVORITE_SERVICE_WIDGET_NAME = 'processFavoriteService';
export const PERSONAL_PROCESS_TASK_OVERVIEW_HANDLER = 'process.personalProcessTaskOverview';
export const PERSONAL_PROCESS_TASK_OVERVIEW_WIDGET_NAME = 'personalProcessTaskOverview';

const PROCESS_TASK_LIST_CONTRACT_MAP = Object.freeze({
  [PROCESSING_OF_MINE_PROCESS_TASK_WIDGET_NAME]: Object.freeze({
    handler: PROCESSING_OF_MINE_PROCESS_TASK_HANDLER,
    portalWidgetName: PROCESSING_OF_MINE_PROCESS_TASK_WIDGET_NAME
  }),
  [DRAFT_PROCESS_TASK_WIDGET_NAME]: Object.freeze({
    handler: DRAFT_PROCESS_TASK_HANDLER,
    portalWidgetName: DRAFT_PROCESS_TASK_WIDGET_NAME
  })
});

export function getProcessTaskListContract(widgetName) {
  return PROCESS_TASK_LIST_CONTRACT_MAP[widgetName] || null;
}
