import template from '../shape/rect.vue';
import ports from './base/port-config.js';
import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
import { assignValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/assign-valid.js';
import { isolationValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/isolation-valid.js';
import { nameValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/name-valid.js';
import { notifyValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/notify-valid.js';
export default {
  name: '变更创建',
  handler: 'changecreate',
  type: 'process',
  isVue: true, //需要声明是vue组件
  config: {
    component: template,
    ports: ports,
    size: { width: 68, height: 40 }
  },
  event: {},
  setting: {
    resizable: false,
    deleteable: true,
    draggable: true,
    selectable: true,
    linkin: true,
    linkout: true,
    assignable: true, //是否需要分配用户
    needformscene: true //是否需要表单场景
  },
  oldSetting: {
    shape: 'L-rectangle:R-rectangle',
    icon: '#tsfont-addchange'
  },
  validateEdge({ edge, editor, sourceCell, targetCell }) {
    const allNextNodeIdList = editor.getAllNextNodeId(targetCell, 'forward');
    if (allNextNodeIdList.includes(sourceCell.id)) {
      //
      if (sourceCell.getProp('type') === 'converge') {
        return false;
      }
      edge.prop('type', 'backward');
      edge.setAttrByPath('line/strokeDasharray', 5);
    }
    return true;
  },
  //流程保存时校验数据
  valid({ node, graph, view }) {
    let validList = [];
    //校验孤岛节点
    validList.push(...isolationValid.valid({ node, graph, view }));
    //校验节点名称
    validList.push(...nameValid.valid({ node, graph, view }));
    //检查是否开始节点
    let isStartNode = false;
    const prevNodes = view.getPrevNodes(node);
    if (prevNodes.length > 0) {
      for (let i = 0; i < prevNodes.length; i++) {
        const sourceNode = prevNodes[i];
        if (sourceNode.getProp('handler') === 'start') {
          isStartNode = true;
          break;
        }
      }
    }

    if (!isStartNode) {
      //校验分配设置
      validList.push(...assignValid.valid({ node, graph, view }));
    }
    //校验通知设置
    validList.push(...notifyValid.valid({ node, graph, view }));

    //校验changecreate组件
    const allNextNodes = view.getAllNextNodes(node);
    const changeHandlerList = allNextNodes.filter(p => p.getData() && p.getData().handler === 'changehandle');
    if (changeHandlerList.length === 0) {
      validList.push({
        type: 'error',
        msg: $t('term.process.changeexistinpairsvalid')
      });
    } else {
      let selectChangeList = changeHandlerList.filter(c => {
        return c.getData() && c.getData()['stepConfig'] && c.getData()['stepConfig'].linkedChange && c.getData()['stepConfig'].linkedChange === node.id;
      });
      if (selectChangeList.length === 0) {
        validList.push({
          type: 'error',
          msg: $t('term.process.changecreatewithouthandler')
        });
      } else if (selectChangeList.length > 1) {
        validList.push({
          msg: $t('term.process.changeonlyonerelvalid')
        });
      }
    }

    return validList;
  }
};
