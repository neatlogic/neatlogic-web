//api接口的出口
import ci from './ci/ci.js';
import validator from './ci/validator.js';
import group from './ci/group.js';
import citype from './citype/citype';
import transaction from './transaction/transaction';
import cientity from './cientity/cientity';
import batchImport from './batchImport/batchImport';
import customview from './customview/customview';
import tagManage from './resource/tagManage/tagManage';
import asset from './resource/asset.js';
import accountManage from './resource/accountmanage/accountmanage';
import sync from './sync/sync.js';
import discovery from './discovery/discovery.js';
import applicationManage from './resource/applicationManage/applicationManage';
import legalvalid from './legalvalid/legalvalid.js';
import dataInit from './dataInit/index.js'; // 资源中心/数据初始化
import globalsearch from './globalsearch/globalsearch.js';
import resourceentity from './resource/resourceentity/resourceentity.js';
import graph from './graph/graph.js';
export default {
  ci,
  validator,
  group,
  citype,
  transaction,
  cientity,
  batchImport,
  customview,
  accountManage,
  tagManage,
  asset,
  applicationManage,
  sync,
  discovery,
  legalvalid,
  dataInit,
  globalsearch,
  resourceentity,
  graph
};
