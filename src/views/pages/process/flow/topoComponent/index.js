
import '@/resources/plugins/TsTopoNew/index.js';//基础类导入
import './topo.node.condition.js';//条件路由
import './topo.node.process.js';//普通节点
import './topo.node.event.js';//事件节点
import './topo.node.end.js';//结束节点
import './topo.node.start.js';//开始节点
import './topo.node.timer.js';//定时节点
import './topo.node.converge.js';//汇聚分流
import './topo.link.forward.js';//前进线
import './topo.link.backward';//回退线
import './topo.less';
var topo = {};
topo.install = function(Vue, options) {
  Vue.$Topo = topo;
};
//注册节点类进节点工厂
const nodeFactory = new NodeFactory();
nodeFactory.addClass(Process, 'Process');//addClass第二个参数主要是为了兼容在打包时更改name的情况
nodeFactory.addClass(End, 'End');
nodeFactory.addClass(Start, 'Start');
nodeFactory.addClass(Condition, 'Condition');
nodeFactory.addClass(Converge, 'Converge');
nodeFactory.addClass(Event, 'Event');
nodeFactory.addClass(Timer, 'Timer');
//注册线类型进连线工厂
const linkFactory = new LinkFactory();
linkFactory.addClass(Forward, 'Forward');
linkFactory.addClass(Backward, 'Backward');
linkFactory.addClass(Dragging, 'Dragging');
