import template from '../shape/ellipse.vue';
import ports from './base/port-config.js';
import utils from '@/resources/assets/js/util.js';
import { $t } from '@/resources/init.js';
import { assignValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/assign-valid.js';
import { isolationValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/isolation-valid.js';
import { nameValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/name-valid.js';
import { notifyValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/notify-valid.js';

export default {
  name: '创建作业',
  handler: 'createjob',
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
    icon: '#tsfont-zidonghua',
    shape: 'L-rectangle:R-rectangle'
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
    //校验分配设置
    validList.push(...assignValid.valid({ node, graph, view }));
    //校验通知设置
    validList.push(...notifyValid.valid({ node, graph, view }));

    const nodeConfig = node.getData();
    const nodeData = nodeConfig.stepConfig || {};
    const createJobConfig = nodeData.createJobConfig || {};
    if (!createJobConfig.failPolicy) {
      validList.push({
        type: 'error',
        msg: $t('form.validate.required', { target: $t('page.failurestrategy') }),
        href: '#createJobConfig'
      });
    }
    if (view.$utils.isEmpty(createJobConfig.configList)) {
      validList.push({
        type: 'error',
        msg: $t('form.validate.leastonetarget', { target: $t('term.autoexec.job') }),
        href: '#createJobConfig'
      });
    }
    return validList;
  }
};
