//api接口的出口
import role from './users/role'; //角色管理
import user from './users/user'; //用户管理、个人设置
import auth from './users/auth'; //权限
import group from './users/group'; //分组
import apiManage from './apiManage/apiManage'; //接口管理
import audit from './audit/audit'; //操作审计
import matrix from './matrix/matrix'; //矩阵数据源
import message from './message/message'; //消息中心
import notice from './message/notice'; //系统公告
import schedule from './schedule/schedule'; //定时作业
import team from './users/team'; //分组管理
import tag from './users/tag'; //标签
import integration from './integration/integration'; //集成管理
import mailserver from './mailserver/mailserver'; //邮件服务器管理
import tactics from './notify/tactics'; //通知策略管理
import form from './form/form'; //表单管理
import worktime from './worktime/worktime'; //工作时间窗口
import tagent from './tagent/tagent'; // tagent管理
import runner from './tagent/runner'; // runner组管理
import mq from './mq/mq';//消息队列
import fulltextindex from './fulltextindex/fulltextindex';//全局检索
import healthcheck from './healthcheck/healthcheck';//健康检查
import datawarehouse from './datawarehouse/datawarehouse';//数据仓库
import theme from './theme/theme';//主题定制
import auditconfig from './auditconfig/auditconfig';//审计配置
import file from './file/file';//附件管理
import module from './module/module';//模块管理
import license from './license/license';//许可管理
import globallock from './globallock/globallock';//全局锁
import databaseview from './databaseview/databaseview';//重建数据库视图
import tenantconfig from './tenantconfig/tenantconfig';//租户配置信息
import server from './server/server';// 服务器
import wechat from './wechat/wechat';// 企业微信
import extramenu from './extramenu/extramenu'; //附加菜单
import region from './region/region';//地域管理

export default {
  role,
  user,
  auth,
  apiManage,
  audit,
  matrix,
  message,
  notice,
  schedule,
  team,
  tag,
  integration,
  mailserver,
  tactics,
  form,
  worktime,
  mq,
  group,
  tagent,
  fulltextindex,
  theme,
  runner,
  healthcheck,
  datawarehouse,
  auditconfig,
  file,
  module,
  license,
  globallock,
  databaseview,
  tenantconfig,
  server,
  wechat,
  extramenu,
  region
};
