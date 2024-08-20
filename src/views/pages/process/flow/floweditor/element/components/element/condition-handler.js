import template from '../shape/polygon.vue';
import ports from './base/port-config.js';
import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
import { assignValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/assign-valid.js';
import { isolationValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/isolation-valid.js';
import { nameValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/name-valid.js';
import { notifyValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/notify-valid.js';
export default {
  name: '条件',
  handler: 'condition',
  type: 'converge',
  isVue: true, //需要声明是vue组件
  config: {
    component: template,
    ports: ports,
    size: { width: 68, height: 68 }
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
    shape: 'L-triangle:R-triangle',
    icon: '#tsfont-question'
  },
  /*validateEdge({ edge, editor, sourceCell, targetCell }) {
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
  },*/
  //流程保存时校验数据
  valid({ node, graph, view }) {
    let validList = [];
    //校验孤岛节点
    validList.push(...isolationValid.valid({ node, graph, view }));
    //校验节点名称
    validList.push(...nameValid.valid({ node, graph, view }));

    const allNextNodes = view.getAllNextNodes(node);
    const nodeUuidList = allNextNodes.map(i => i.id);
    const nodeConfig = node.getData();
    const nodeData = nodeConfig.stepConfig || {};
    const moveonConfigList = nodeData.moveonConfigList || [];
    let isValid = true;
    if (!utils.isEmpty(moveonConfigList)) {
      for (let i = 0; i < moveonConfigList.length; i++) {
        let targetStepList = utils.intersectionArr(nodeUuidList, moveonConfigList[i].targetStepList);
        view.$set(moveonConfigList[i], 'targetStepList', targetStepList);
        if (utils.isEmpty(targetStepList)) {
          isValid = false;
        }
      }
    }

    if (!isValid) {
      validList.push({
        type: 'error',
        msg: $t('form.placeholder.pleaseselect', { target: $t('term.process.complatenode') }),
        href: '#moveonConfigList'
      });
    }

    return validList;
  }
};
