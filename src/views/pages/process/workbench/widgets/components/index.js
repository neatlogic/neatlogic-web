import AnnouncementPanel from './AnnouncementPanel.vue';
import ApprovalTodoList from './ApprovalTodoList.vue';
import ChangeCalendar from './ChangeCalendar.vue';
import DoneMetric from './DoneMetric.vue';
import EfficiencyPanel from './EfficiencyPanel.vue';
import FaqList from './FaqList.vue';
import FavoriteMetric from './FavoriteMetric.vue';
import FavoritedServices from './FavoritedServices.vue';
import FocusTaskList from './FocusTaskList.vue';
import HealthRing from './HealthRing.vue';
import HeroBanner from './HeroBanner.vue';
import KnowledgeHelp from './KnowledgeHelp.vue';
import MyTodoEntry from './MyTodoEntry.vue';
import OverdueMetric from './OverdueMetric.vue';
import ProcessingOfMineProcessTask from './ProcessingOfMineProcessTask.vue';
import QuickActionGrid from './QuickActionGrid.vue';
import RecentOperationList from './RecentOperationList.vue';
import RecentTaskList from './RecentTaskList.vue';
import SatisfactionMetric from './SatisfactionMetric.vue';
import ServiceCatalogEntry from './ServiceCatalogEntry.vue';
import ServiceDistribution from './ServiceDistribution.vue';
import SlaRiskList from './SlaRiskList.vue';
import SupportPanel from './SupportPanel.vue';
import SystemNoticeList from './SystemNoticeList.vue';
import TaskTypeDistribution from './TaskTypeDistribution.vue';
import TeamLoad from './TeamLoad.vue';
import TodoMetric from './TodoMetric.vue';
import TrendPanel from './TrendPanel.vue';
import WorkbenchTable from './WorkbenchTable.vue';

export const WORKBENCH_WIDGET_COMPONENT_MAP = Object.freeze({
  processingOfMineProcessTask: ProcessingOfMineProcessTask,
  recentTaskList: RecentTaskList,
  approvalTodoList: ApprovalTodoList,
  focusTaskList: FocusTaskList,
  recentOperationList: RecentOperationList,
  quickMyTodo: MyTodoEntry,
  trendPanel: TrendPanel,
  workbenchTable: WorkbenchTable,
  taskTypeDistribution: TaskTypeDistribution,
  slaRiskList: SlaRiskList,
  efficiencyPanel: EfficiencyPanel,
  metricFavorite: FavoriteMetric,
  favoritedServices: FavoritedServices,
  serviceDistribution: ServiceDistribution,
  quickActionGrid: QuickActionGrid,
  serviceCatalogEntry: ServiceCatalogEntry,
  healthRing: HealthRing,
  teamLoad: TeamLoad,
  changeCalendar: ChangeCalendar,
  systemNoticeList: SystemNoticeList,
  knowledgeHelp: KnowledgeHelp,
  announcementPanel: AnnouncementPanel,
  supportPanel: SupportPanel,
  faqList: FaqList,
  heroBanner: HeroBanner,
  metricTodo: TodoMetric,
  metricOverdue: OverdueMetric,
  metricDone: DoneMetric,
  metricSatisfaction: SatisfactionMetric
});
