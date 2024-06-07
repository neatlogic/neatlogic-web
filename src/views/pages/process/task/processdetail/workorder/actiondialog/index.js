export default {
  RedoDialog: () => import('./redo.vue'), //评分之前回退
  RanferreportDialog: () => import('./tranferreport.vue'), //转报
  KnowledgeDialog: () => import('./knowledge.vue'), //工单转知识
  LookSitemapDialog: () => import('./lookSitemap.vue'), //查看流程图
  TransferDialog: () => import('./transfer.vue'), //转交
  CompleteDialog: () => import('./complete-dialog.vue'), //完成
  RetreatDialog: () => import('./retreat-dialog.vue')//回退
};
