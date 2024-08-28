import '@/resources/plugins/TsTopoNew/index.js'; //基础类导入

import './topo.group.js';
import './topo.node.attr.js';
import './topo.node.globalattr.js';
import './topo.node.rel.js';
import './topo.node.const.js';
import './topo.node.ci.js';
import './topo.link.join.js';
import './topo.link.leftjoin.js';
import './topo.link.rightjoin.js';
import './topo.link.nojoin.js';
import './topo.less';

var topo = {};
topo.install = function(Vue, options) {
  Vue.$Topo = topo;
};
const groupFactory = new GroupFactory();
groupFactory.addClass(Group, 'Group');
//注册节点类进节点工厂
const nodeFactory = new NodeFactory();
nodeFactory.addClass(Ci, 'Ci');
nodeFactory.addClass(Rel, 'Rel');
nodeFactory.addClass(Attr, 'Attr');
nodeFactory.addClass(GlobalAttr, 'GlobalAttr');
nodeFactory.addClass(ConstAttr, 'ConstAttr');
//注册线类型进连线工厂
const linkFactory = new LinkFactory();
linkFactory.addClass(Join, 'Join');
linkFactory.addClass(Leftjoin, 'Leftjoin');
linkFactory.addClass(Rightjoin, 'Rightjoin');
linkFactory.addClass(Nojoin, 'Nojoin');
linkFactory.addClass(Dragging, 'Dragging');
