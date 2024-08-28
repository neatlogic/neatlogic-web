import template from '../shape/ellipse.vue';
import ports from './base/port-config.js';
import ViewUI from 'neatlogic-ui/iview/index.js';
import { $t } from '@/resources/init.js';
import { assignValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/assign-valid.js';
import { isolationValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/isolation-valid.js';
import { nameValid } from '@/views/pages/process/flow/floweditor/element/components/element/base/name-valid.js';

export default {
  name: '定时节点',
  handler: 'timer',
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
    assignable: true //是否需要分配用户
  },
  oldSetting: {
    shape: 'L-rectangle:R-rectangle',
    icon: '#tsfont-timer'
  },
  validateMagnet({ editor, sourceCell }) {
    const allNextNodeIdList = editor.getAllNextNodeId(sourceCell, 'forward');
    //只能有一个后置节点
    if (allNextNodeIdList.length > 0) {
      ViewUI.Message.warning({ content: $t('message.process.timerhasonelink'), duration: 3, closable: true });
      return false;
    } else {
      return true;
    }
  }, //流程保存时校验数据
  valid({ node, graph, view }) {
    let validList = [];
    //校验孤岛节点
    validList.push(...isolationValid.valid({ node, graph, view }));
    //校验节点名称
    validList.push(...nameValid.valid({ node, graph, view }));
    //校验分配设置
    validList.push(...assignValid.valid({ node, graph, view }));
    //定时节点
    const nodeConfig = node.getData();
    const nodeData = nodeConfig.stepConfig || {};
    let validObj = {
      type: 'error',
      msg: $t('form.validate.required', { target: $t('term.process.circulationtime') }),
      href: '#timerAttributeUuid'
    };
    if (!nodeData.attributeUuid) {
      validObj.msg = $t('form.validate.required', { target: $t('term.process.circulationtime') });
      validList.push(validObj);
    } else if (nodeData.attributeUuid) {
      validObj.msg = $t('term.process.formupdateselecttimevalid');
      if (view.allFormitemList && view.allFormitemList.length > 0) {
        let attributeUuid = view.allFormitemList.find(f => f.uuid == nodeData.attributeUuid);
        !attributeUuid && (nodeData.attributeUuid = '') && validList.push(validObj);
      } else {
        nodeData.attributeUuid = '';
        validList.push(validObj);
      }
    }
    
    return validList;
  }
};
