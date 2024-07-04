import template from '../shape/ellipse.vue';
import ports from './base/port-config.js';
import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
import { assignValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/assign-valid.js';
export default {
  name: '自动处理',
  handler: 'automatic',
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
  validateEdge({ edge, editor, sourceCell, targetCell }) {
    const allNextNodeIdList = editor.getAllNextNodeId(targetCell, 'forward');
    if (allNextNodeIdList.has(sourceCell.id)) {
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
  valid({ node, graph }) {
    let validList = [];
    const edges = graph.getConnectedEdges(node);
    if (!edges || edges.length <= 0) {
      validList.push({ msg: $t('message.process.nodeorphaned') });
    } else {
      const outgoingEdges = graph.getOutgoingEdges(node);
      if (!outgoingEdges || outgoingEdges.length <= 0) {
        validList.push({ msg: $t('message.process.nodenopostnode') });
      }
      const incomingEdges = graph.getIncomingEdges(node);
      if (!incomingEdges || incomingEdges.length <= 0) {
        validList.push({ msg: $t('message.process.nodenofrontnode') });
      }
    }
    //校验分配设置
    validList.push(...assignValid.valid({ node, graph }));

    const nodeConfig = node.getData();
    if (!nodeConfig.name) {
      validList.push({
        msg: $t('form.validate.required', { target: $t('term.process.nodename') }),
        href: '#nodeName'
      });
    }
    if (!utils.nameRegularValid(nodeConfig.name)) {
      validList.push({
        msg: $t('term.process.noderultvalid'),
        href: '#nodeName'
      });
    }
    if (nodeConfig?.stepConfig?.notifyPolicyConfig?.isCustom && nodeConfig?.stepConfig?.notifyPolicyConfig?.policyId) {
      // 【通知策略】为自定义通知策略，必填
      validList.push({
        msg: $t('form.validate.required', { target: $t('page.notificationstrategy') }),
        href: '#NoticeSetting'
      });
    }

    return validList;
  }
};
