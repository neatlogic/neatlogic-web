import * as d3 from 'd3';
import '@/resources/assets/font/tsfont/font/tsfont.js';
import '@/resources/assets/font/tsfonts/iconfont.js';
import '@/resources/plugins/TsTopoNew/js/topo.watcher.js'; //属性双向绑定执行逻辑
import '@/resources/plugins/TsTopoNew/js/topo.js'; //核心
import '@/resources/plugins/TsTopoNew/js/topo.event.base.js'; //事件基类
import '@/resources/plugins/TsTopoNew/js/topo.node.base.js'; //节点基类
import '@/resources/plugins/TsTopoNew/js/topo.ph.js'; //属性双向绑定执行逻辑
import '@/resources/plugins/TsTopoNew/js/topo.group.base.js'; //分组基类
import '@/resources/plugins/TsTopoNew/js/topo.link.base.js'; //连线基类
import '@/resources/plugins/TsTopoNew/js/topo.link.curve.js'; //连线拐弯实现
import '@/resources/plugins/TsTopoNew/js/topo.link.dragging.js'; //拖拽线
import '@/resources/plugins/TsTopoNew/js/topo.anchor.js'; //连线点
import '@/resources/plugins/TsTopoNew/js/topo.resizer.js'; //尺寸改变
import '@/resources/plugins/TsTopoNew/js/topo.shape.js'; //节点形状
import '@/resources/plugins/TsTopoNew/js/topo.animate.js'; //节点动画
import '@/resources/plugins/TsTopoNew/js/topo.node.factory.js'; //节点工厂
import '@/resources/plugins/TsTopoNew/js/topo.group.factory.js'; //分组工厂
import '@/resources/plugins/TsTopoNew/js/topo.link.factory.js'; //连线工厂

window.d3 = d3;
