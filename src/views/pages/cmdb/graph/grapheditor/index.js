import '@/resources/plugins/TsTopoNew/index.js'; //基础类导入

import './topo.group.js';
import './topo.node.cientity.js';
import './topo.node.graph.js';
import './topo.link.js';
import './topo.less';

var topo = {};
topo.install = function(Vue, options) {
  Vue.$Topo = topo;
};
const groupFactory = new GroupFactory();
groupFactory.addClass(GraphGroup, 'GraphGroup');
//注册节点类进节点工厂
const nodeFactory = new NodeFactory();
nodeFactory.addClass(Graph, 'Graph');
nodeFactory.addClass(Cientity, 'Cientity');
//注册线类型进连线工厂
const linkFactory = new LinkFactory();
linkFactory.addClass(Link, 'Link');
linkFactory.addClass(Dragging, 'Dragging');
