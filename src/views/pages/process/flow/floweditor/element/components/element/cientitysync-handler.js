import template from '@/views/pages/process/flow/floweditor/element/components/shape/ellipse.vue';
import ports from './base/port-config.js';
import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
import { assignValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/assign-valid.js';
import { isolationValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/isolation-valid.js';
import { nameValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/name-valid.js';
import { notifyValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/notify-valid.js';
export default {
  name: '配置项同步',
  handler: 'cientitysync',
  type: 'process',
  oldSetting: {//转换成旧数据时使用
    shape: 'L-rectangle-50%:R-rectangle-50%',
    icon: '#tsfont-ci'
  },
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
    const validList = [];
    //校验孤岛节点
    validList.push(...isolationValid.valid({ node, graph }));
    //校验节点名称
    validList.push(...nameValid.valid({ node, graph }));
    //校验分派
    validList.push(...assignValid.valid({ node, graph }));
    //校验通知设置
    validList.push(...notifyValid.valid({ node, graph }));

    const nodeConfig = node.getData();
    const nodeData = nodeConfig.stepConfig || {};
    //校验配置项同步的关联表单组件
    if (!nodeData || !nodeData.handlerList || nodeData.handlerList.length == 0) {
      validList.push({
        type: 'error',
        msg: $t('term.process.selectformitemvalid'),
        href: '#handlerList'
      });
    } else if (nodeData && nodeData.handlerList && nodeData.handlerList.length > 0) {
      for (let i = 0; i < nodeData.handlerList.length; i++) {
        let findFormitem = view.allFormitemList.find(f => f.uuid === nodeData.handlerList[i]);
        if (!findFormitem) {
          nodeData.handlerList = [];
          validList.push({
            type: 'error',
            msg: $t('term.process.selectformitemvalid'),
            href: '#handlerList'
          });
          break;
        }
      }
    }

    return validList;
  }
};
